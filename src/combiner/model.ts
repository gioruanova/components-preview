import { containerDefaults, type ContainerConfig } from '@/tooling/container'
import { categories } from '@/tooling/registry'
import type { RegisteredWidget } from '@/tooling/registry'
import type { Config } from '@/tooling/types'
import type { SectionHeading } from './sectionHeading'

/**
 * Layout builder (code name "combiner") layout: sections (each a container with 1–3 columns) holding component instances.
 * Everything here is pure and serialisable (it's saved to localStorage).
 */

export type Ratio2 = '1:1' | '2:1' | '1:2' | '3:1' | '1:3'
export type Ratio3 = '1:1:1' | '2:1:1' | '1:2:1' | '1:1:2'

export type SectionSettings = Omit<ContainerConfig, 'useContainer'> & {
  name: string
  columns: number
  ratio2: Ratio2
  ratio3: Ratio3
  /** Lateral gap: between columns side by side. */
  columnGap: number
  /** Vertical gap: between components in a column, and between columns once they stack. */
  rowGap: number
  align: 'stretch' | 'start' | 'center' | 'end'
  stackOnTablet: boolean
}

export type Item = { id: string; widget: string; config: Config }
export type Column = { id: string; items: Item[] }
/** `heading` (optional) is merged with defaults on read (`headingOf`); it renders above the columns wrapper. */
export type Section = { id: string; settings: SectionSettings; heading?: Partial<SectionHeading>; columns: Column[] }
export type Layout = { version: 1; sections: Section[] }

export const MAX_COLUMNS = 3

export const uid = () => Math.random().toString(36).slice(2, 10)

// ---------- widgets ----------

export const widgetKey = (w: RegisteredWidget) => `${w.categorySlug}/${w.slug}`

export function findWidgetByKey(key: string): RegisteredWidget | undefined {
  const [cat, slug] = key.split('/')
  return categories.find((c) => c.slug === cat)?.widgets.find((w) => w.slug === slug)
}

const allItems = (layout: Layout) => layout.sections.flatMap((s) => s.columns.flatMap((c) => c.items))

/** Widget IDs must be unique on a page (CSS is scoped by them): customCards, customCards2, … */
export function uniqueWidgetId(layout: Layout, base: string, reserved: Set<string> = new Set()): string {
  const used = new Set([...reserved, ...allItems(layout).map((i) => String(i.config.widgetId ?? ''))])
  if (!used.has(base)) return base
  let n = 2
  while (used.has(`${base}${n}`)) n++
  return `${base}${n}`
}

export function newItem(layout: Layout, widget: RegisteredWidget, overrides: Config = {}): Item {
  const config = { ...structuredClone(widget.defaults), ...overrides }
  if ('widgetId' in config) config.widgetId = uniqueWidgetId(layout, String(widget.defaults.widgetId))
  return { id: uid(), widget: widgetKey(widget), config }
}

// ---------- sections ----------

export const sectionDefaults = (name: string): SectionSettings => ({
  ...containerDefaults,
  containerWidth: 'boxed',
  containerMaxWidth: 1440,
  contentMaxWidth: 1200,
  containerPadding: 32,
  containerBgImage: '',
  name,
  columns: 1,
  ratio2: '1:1',
  ratio3: '1:1:1',
  columnGap: 24,
  rowGap: 24,
  align: 'stretch',
  stackOnTablet: true,
})

export function newSection(layout: Layout, settings: Partial<SectionSettings> = {}): Section {
  const s = { ...sectionDefaults(`Section ${layout.sections.length + 1}`), ...settings }
  return { id: uid(), settings: s, columns: Array.from({ length: s.columns }, () => ({ id: uid(), items: [] })) }
}

/** `fr` tracks for the section's columns, e.g. [2, 1]. */
export function columnFractions(s: SectionSettings): number[] {
  if (s.columns <= 1) return [1]
  return (s.columns === 2 ? s.ratio2 : s.ratio3).split(':').map(Number)
}

/** An item renders something (its widget exists and isn't "removed" via `isEmpty`). */
export function isItemRendered(item: Item): boolean {
  const widget = findWidgetByKey(item.widget)
  return !!widget && !widget.isEmpty?.(item.config)
}

/**
 * Columns that are actually rendered, with their `fr` share.
 * An empty column (no rendered items) is dropped, so the other columns take its space
 * (2 columns with one empty → the other is 100%; 2:1:1 with the last empty → 2:1).
 * When every column is empty, all of them are kept so the structure stays visible.
 */
export function renderedColumns(section: Section): { column: Column; index: number; fraction: number }[] {
  const fractions = columnFractions(section.settings)
  const all = section.columns.map((column, index) => ({ column, index, fraction: fractions[index] ?? 1 }))
  const filled = all.filter((c) => c.column.items.some(isItemRendered))
  return filled.length ? filled : all
}

// ---------- immutable operations ----------

const mapSection = (layout: Layout, id: string, fn: (s: Section) => Section): Layout => ({
  ...layout,
  sections: layout.sections.map((s) => (s.id === id ? fn(s) : s)),
})

export function addSection(layout: Layout, settings?: Partial<SectionSettings>): Layout {
  return { ...layout, sections: [...layout.sections, newSection(layout, settings)] }
}

export function removeSection(layout: Layout, id: string): Layout {
  return { ...layout, sections: layout.sections.filter((s) => s.id !== id) }
}

export function duplicateSection(layout: Layout, id: string): Layout {
  const index = layout.sections.findIndex((s) => s.id === id)
  if (index < 0) return layout
  const source = layout.sections[index]
  const reserved = new Set<string>() // IDs handed out to earlier copies in this section
  const copy: Section = {
    id: uid(),
    settings: { ...source.settings, name: `${source.settings.name} (copy)` },
    heading: source.heading && structuredClone(source.heading),
    columns: source.columns.map((col) => ({
      id: uid(),
      items: col.items.map((item) => {
        const config = structuredClone(item.config)
        if ('widgetId' in config) {
          const base = String(findWidgetByKey(item.widget)?.defaults.widgetId ?? config.widgetId)
          config.widgetId = uniqueWidgetId(layout, base, reserved)
          reserved.add(String(config.widgetId))
        }
        return { id: uid(), widget: item.widget, config }
      }),
    })),
  }
  const sections = [...layout.sections]
  sections.splice(index + 1, 0, copy)
  return { ...layout, sections }
}

export function moveSection(layout: Layout, from: number, to: number): Layout {
  const sections = [...layout.sections]
  const [moved] = sections.splice(from, 1)
  sections.splice(to, 0, moved)
  return { ...layout, sections }
}

export function updateSectionSettings(layout: Layout, id: string, patch: Partial<SectionSettings>): Layout {
  return mapSection(layout, id, (s) => {
    const settings = { ...s.settings, ...patch }
    return { ...s, settings, columns: resizeColumns(s.columns, settings.columns) }
  })
}

/** More columns → append empty ones. Fewer → move the removed columns' items into the last remaining one. */
export function resizeColumns(columns: Column[], count: number): Column[] {
  const n = Math.max(1, Math.min(MAX_COLUMNS, count))
  if (columns.length === n) return columns
  if (columns.length < n) return [...columns, ...Array.from({ length: n - columns.length }, () => ({ id: uid(), items: [] }))]
  const kept = columns.slice(0, n)
  const spill = columns.slice(n).flatMap((c) => c.items)
  const last = kept[n - 1]
  return [...kept.slice(0, -1), { ...last, items: [...last.items, ...spill] }]
}

export function addItem(layout: Layout, columnId: string, widget: RegisteredWidget): { layout: Layout; item: Item } {
  const item = newItem(layout, widget)
  return {
    item,
    layout: {
      ...layout,
      sections: layout.sections.map((s) => ({
        ...s,
        columns: s.columns.map((c) => (c.id === columnId ? { ...c, items: [...c.items, item] } : c)),
      })),
    },
  }
}

const mapColumns = (layout: Layout, fn: (c: Column) => Column): Layout => ({
  ...layout,
  sections: layout.sections.map((s) => ({ ...s, columns: s.columns.map(fn) })),
})

export function removeItem(layout: Layout, itemId: string): Layout {
  return mapColumns(layout, (c) => ({ ...c, items: c.items.filter((i) => i.id !== itemId) }))
}

export function duplicateItem(layout: Layout, itemId: string): Layout {
  const found = findItem(layout, itemId)
  if (!found) return layout
  const base = String(findWidgetByKey(found.item.widget)?.defaults.widgetId ?? found.item.config.widgetId)
  const config = structuredClone(found.item.config)
  if ('widgetId' in config) config.widgetId = uniqueWidgetId(layout, base)
  const copy: Item = { id: uid(), widget: found.item.widget, config }
  return mapColumns(layout, (c) => {
    if (c.id !== found.column.id) return c
    const items = [...c.items]
    items.splice(found.index + 1, 0, copy)
    return { ...c, items }
  })
}

export function updateItemConfig(layout: Layout, itemId: string, key: string, value: unknown): Layout {
  return mapColumns(layout, (c) => ({
    ...c,
    items: c.items.map((i) => (i.id === itemId ? { ...i, config: { ...i.config, [key]: value } } : i)),
  }))
}

/** Updates one setting of a section's heading (responsive keys like `headingFont@tablet` included; undefined resets). */
export function updateSectionHeading(layout: Layout, sectionId: string, key: string, value: unknown): Layout {
  return mapSection(layout, sectionId, (s) => ({ ...s, heading: { ...s.heading, [key]: value } }))
}

export function findItem(layout: Layout, itemId: string) {
  for (const section of layout.sections) {
    for (const column of section.columns) {
      const index = column.items.findIndex((i) => i.id === itemId)
      if (index >= 0) return { section, column, index, item: column.items[index] }
    }
  }
  return null
}

export function findColumn(layout: Layout, columnId: string) {
  for (const section of layout.sections) {
    const column = section.columns.find((c) => c.id === columnId)
    if (column) return { section, column }
  }
  return null
}

/** Moves an item to `toColumnId` at `toIndex` (clamped). Works within and across columns/sections. */
export function moveItem(layout: Layout, itemId: string, toColumnId: string, toIndex: number): Layout {
  const found = findItem(layout, itemId)
  if (!found || !findColumn(layout, toColumnId)) return layout
  const without = removeItem(layout, itemId)
  return mapColumns(without, (c) => {
    if (c.id !== toColumnId) return c
    const items = [...c.items]
    items.splice(Math.max(0, Math.min(toIndex, items.length)), 0, found.item)
    return { ...c, items }
  })
}

// ---------- example + persistence ----------

export function exampleLayout(): Layout {
  let layout: Layout = { version: 1, sections: [] }
  const seo = findWidgetByKey('text-blocks/seo-block')
  const cards = findWidgetByKey('cards/cards-grid')

  layout = addSection(layout, { name: 'Main Seo Block', containerWidth: 'full', containerBgImage: 'sample:waves', containerPadding: 56 })
  if (seo) layout = addItem(layout, layout.sections[0].columns[0].id, seo).layout

  layout = addSection(layout, { name: 'Highlights', columns: 2, ratio2: '1:2', align: 'center' })
  const [left, right] = layout.sections[1].columns
  layout = mapSection(layout, layout.sections[1].id, (s) => ({
    ...s,
    heading: { showHeading: true, heading: 'Highlights this summer', showDescription: true, description: 'Plan your visit and discover what is on.' },
  }))
  if (seo) {
    const r = addItem(layout, left.id, seo)
    layout = updateItemConfig(r.layout, r.item.id, 'titleLine1', 'Plan your visit')
    layout = updateItemConfig(layout, r.item.id, 'titleLine2', '')
  }
  if (cards) {
    const r = addItem(layout, right.id, cards)
    layout = updateItemConfig(r.layout, r.item.id, 'cardCount', 2)
    layout = updateItemConfig(layout, r.item.id, 'cardsPerRow', 2)
    layout = updateItemConfig(layout, r.item.id, 'cardSizing', 'stretch')
    layout = updateItemConfig(layout, r.item.id, 'limitWidth', false)
  }
  return layout
}

export const STORAGE_KEY = 'live-preview:combiner:v1'

/** Loads the saved layout, dropping components that no longer exist and filling in new config defaults. */
export function loadLayout(): Layout {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return exampleLayout()
    const saved = JSON.parse(raw) as Layout & { header?: Record<string, unknown> }
    if (saved?.version !== 1 || !Array.isArray(saved.sections)) return exampleLayout()
    // legacy: a layout-level heading (before headings moved into sections) becomes the first section's heading
    const legacy = saved.header && typeof saved.header === 'object' ? migrateLegacyHeader(saved.header) : undefined
    return {
      version: 1,
      sections: saved.sections.map((s, i) => {
        // legacy: one `gap` for both directions
        const { gap, ...savedSettings } = (s.settings ?? {}) as Partial<SectionSettings> & { gap?: number }
        const legacyGap = typeof gap === 'number' ? { columnGap: gap, rowGap: gap } : {}
        const settings = { ...sectionDefaults(s.settings?.name ?? 'Section'), ...legacyGap, ...savedSettings }
        const heading = s.heading && typeof s.heading === 'object' ? s.heading : i === 0 ? legacy : undefined
        return {
          id: s.id,
          settings,
          ...(heading ? { heading } : {}),
          columns: resizeColumns(
            (s.columns ?? []).map((c) => ({
              id: c.id,
              items: (c.items ?? []).flatMap((i) => {
                const widget = findWidgetByKey(i.widget)
                return widget ? [{ id: i.id, widget: i.widget, config: { ...structuredClone(widget.defaults), ...i.config } }] : []
              }),
            })),
            settings.columns,
          ),
        }
      }),
    }
  } catch {
    return exampleLayout()
  }
}

const HEADING_KEYS = /^(showHeading|heading|headingLevel|showDescription|description|alignment|headingFont|descriptionFont|maxWidth|gap)(@tablet|@mobile)?$/

/** Keeps only the settings a section heading understands (drops layout-only ones like background/padding). */
function migrateLegacyHeader(header: Record<string, unknown>): Partial<SectionHeading> | undefined {
  const kept = Object.fromEntries(Object.entries(header).filter(([k]) => HEADING_KEYS.test(k)))
  return Object.keys(kept).length ? (kept as Partial<SectionHeading>) : undefined
}

/** Returns false when the browser refused to save (quota / private mode). */
export function saveLayout(layout: Layout): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout))
    return true
  } catch {
    return false
  }
}
