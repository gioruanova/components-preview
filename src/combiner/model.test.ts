import { describe, expect, it, vi } from 'vitest'
import { toCss } from '@/tooling/stylesheet'
import {
  addItem,
  addSection,
  columnFractions,
  duplicateSection,
  exampleLayout,
  findItem,
  findWidgetByKey,
  isHeaderWidget,
  isItemRendered,
  setSimulateEmpty,
  removeSiteHeader,
  setSiteHeader,
  updateItemConfig,
  moveItem,
  moveSection,
  loadLayout,
  removeItem,
  renderedColumns,
  STORAGE_KEY,
  updateSectionSettings,
  type Layout,
  type SectionSettings,
} from './model'
import { isSectionRendered, sectionSheets } from './sections'

const empty = (): Layout => ({ version: 1, sections: [] })
const cards = findWidgetByKey('cards/cards-grid')!
const seo = findWidgetByKey('text-blocks/seo-block')!

describe('combiner model', () => {
  it('builds a valid example layout from registered components', () => {
    const l = exampleLayout()
    expect(l.sections.length).toBeGreaterThan(0)
    expect(l.sections.flatMap((s) => s.columns.flatMap((c) => c.items)).length).toBeGreaterThan(0)
  })

  it('gives every instance a unique widget ID', () => {
    let l = addSection(empty())
    const col = l.sections[0].columns[0].id
    l = addItem(l, col, cards).layout
    l = addItem(l, col, cards).layout
    l = addItem(l, col, seo).layout
    expect(l.sections[0].columns[0].items.map((i) => i.config.widgetId)).toEqual(['customCards', 'customCards2', 'customSeoBlock'])
    l = duplicateSection(l, l.sections[0].id)
    expect(l.sections[1].columns[0].items.map((i) => i.config.widgetId)).toEqual(['customCards3', 'customCards4', 'customSeoBlock2'])
  })

  it('keeps components when the column count shrinks', () => {
    let l = addSection(empty(), { columns: 3 })
    const [a, b, c] = l.sections[0].columns
    l = addItem(l, a.id, seo).layout
    l = addItem(l, b.id, cards).layout
    l = addItem(l, c.id, cards).layout
    l = updateSectionSettings(l, l.sections[0].id, { columns: 1 })
    expect(l.sections[0].columns).toHaveLength(1)
    expect(l.sections[0].columns[0].items).toHaveLength(3)
    l = updateSectionSettings(l, l.sections[0].id, { columns: 2 })
    expect(l.sections[0].columns[1].items).toHaveLength(0)
  })

  it('moves components across columns and sections, and reorders sections', () => {
    let l = addSection(addSection(empty(), { name: 'A' }), { name: 'B', columns: 2 })
    const r = addItem(l, l.sections[0].columns[0].id, cards)
    l = moveItem(r.layout, r.item.id, l.sections[1].columns[1].id, 0)
    expect(findItem(l, r.item.id)?.section.settings.name).toBe('B')
    expect(l.sections[0].columns[0].items).toHaveLength(0)
    l = moveSection(l, 1, 0)
    expect(l.sections.map((s) => s.settings.name)).toEqual(['B', 'A'])
    expect(removeItem(l, r.item.id).sections[0].columns[1].items).toHaveLength(0)
  })

  it('turns proportions into grid tracks that stack on small screens', () => {
    let l = addSection(empty(), { columns: 3, ratio3: '1:2:1', columnGap: 16 })
    for (const col of l.sections[0].columns) l = addItem(l, col.id, cards).layout // empty columns aren't rendered
    expect(columnFractions(l.sections[0].settings)).toEqual([1, 2, 1])
    const css = toCss(sectionSheets(l.sections[0]))
    expect(css).toContain('grid-template-columns: minmax(0, 1fr) minmax(0, 2fr) minmax(0, 1fr);')
    expect(css).toContain('@media (max-width: 480px)')
    expect(css).toContain(`#cs-${l.sections[0].id} {`)
  })

  it('has separate lateral and vertical gaps, per viewport', () => {
    const l = addSection(empty(), { columns: 2, columnGap: 40, rowGap: 12, 'rowGap@mobile': 8 } as Partial<SectionSettings>)
    const css = toCss(sectionSheets(l.sections[0]))
    expect(css).toMatch(/\.combiner-columns \{[^}]*column-gap: 40px;/)
    expect(css).toMatch(/\.combiner-columns \{[^}]*row-gap: 12px;/)
    expect(css).toMatch(/\.combiner-column \{[^}]*gap: 12px;/)
    const mobile = css.slice(css.lastIndexOf('@media (max-width: 480px)')) // the grid's block (the container has its own)
    expect(mobile).toMatch(/\.combiner-columns \{[^}]*row-gap: 8px;/)
    expect(mobile).toMatch(/\.combiner-column \{[^}]*gap: 8px;/)
    expect(mobile).not.toContain('column-gap')
  })

  it('migrates a saved single gap to both gaps', () => {
    const l = addSection(empty())
    const legacy = { ...l, sections: l.sections.map((s) => ({ ...s, settings: { ...s.settings, columnGap: undefined, rowGap: undefined, gap: 32 } })) }
    const store = new Map([[STORAGE_KEY, JSON.stringify(legacy)]])
    vi.stubGlobal('localStorage', { getItem: (k: string) => store.get(k) ?? null })
    const loaded = loadLayout().sections[0].settings
    vi.unstubAllGlobals()
    expect([loaded.columnGap, loaded.rowGap]).toEqual([32, 32])
    expect('gap' in loaded).toBe(false)
  })

  it('has a header slot that only accepts Header components', () => {
    const header = findWidgetByKey('header/right-aligned-menu-header')!
    let l = setSiteHeader(empty(), header).layout
    expect(l.siteHeader?.widget).toBe('header/right-aligned-menu-header')
    expect(isHeaderWidget('header/right-aligned-menu-header')).toBe(true)
    expect(isHeaderWidget('cards/cards-grid')).toBe(false)
    expect(() => setSiteHeader(empty(), cards)).toThrow()
    l = updateItemConfig(l, l.siteHeader!.id, 'ticketLabel', 'Tickets')
    expect(l.siteHeader?.config.ticketLabel).toBe('Tickets')
    expect(removeSiteHeader(l).siteHeader).toBeUndefined()
    expect(exampleLayout().siteHeader?.widget).toBe('header/right-aligned-menu-header')
  })

  it('drops empty columns so the others take the full width', () => {
    let l = addSection(empty(), { columns: 2, ratio2: '2:1' })
    const [a, b] = l.sections[0].columns
    // all empty → no column, and the section is removed (no heading)
    expect(renderedColumns(l.sections[0])).toEqual([])
    expect(isSectionRendered(l.sections[0])).toBe(false)
    l = addItem(l, b.id, cards).layout
    expect(renderedColumns(l.sections[0]).map((c) => c.index)).toEqual([1])
    expect(toCss(sectionSheets(l.sections[0]))).toContain('grid-template-columns: minmax(0, 1fr);')
    // a column holding only "removed" (isEmpty) widgets still counts as empty
    const withSeo = addItem(l, a.id, seo)
    const hide = { showTitle: false, showDescription: false, button1Show: false, button2Show: false }
    const removed: Layout = {
      ...withSeo.layout,
      sections: withSeo.layout.sections.map((s) => ({
        ...s,
        columns: s.columns.map((c) => ({ ...c, items: c.items.map((i) => (i.id === withSeo.item.id ? { ...i, config: { ...i.config, ...hide } } : i)) })),
      })),
    }
    expect(seo.isEmpty?.(removed.sections[0].columns[0].items[0].config)).toBe(true)
    expect(renderedColumns(removed.sections[0]).map((c) => c.index)).toEqual([1])
    // once it has content, both columns are back with their proportions
    l = addItem(l, a.id, seo).layout
    expect(renderedColumns(l.sections[0]).map((c) => c.fraction)).toEqual([2, 1])
  })

  it('removes a section with empty columns even when it has a heading', () => {
    const l = addSection(empty(), { columns: 2 })
    const withHeading = { ...l.sections[0], heading: { showHeading: true, heading: 'Coming up' } }
    expect(isSectionRendered(withHeading)).toBe(false)
  })

  it('"Simulated empty widgets" treats every component of the section as empty', () => {
    let l = addSection(empty(), { columns: 2 })
    const [a, b] = l.sections[0].columns
    l = addItem(l, a.id, cards).layout
    l = addItem(l, b.id, seo).layout
    expect(renderedColumns(l.sections[0])).toHaveLength(2)
    l = setSimulateEmpty(l, l.sections[0].id, true)
    expect(isItemRendered(l.sections[0].columns[0].items[0], l.sections[0])).toBe(false)
    expect(renderedColumns(l.sections[0])).toEqual([])
    expect(isSectionRendered(l.sections[0])).toBe(false)
    expect(l.sections[0].columns[0].items).toHaveLength(1) // components are kept, only hidden
    l = setSimulateEmpty(l, l.sections[0].id, false)
    expect(renderedColumns(l.sections[0])).toHaveLength(2)
  })

  it('keeps the proportions of the remaining columns', () => {
    let l = addSection(empty(), { columns: 3, ratio3: '2:1:1' })
    const [a, , c] = l.sections[0].columns
    l = addItem(l, a.id, cards).layout
    l = addItem(l, c.id, cards).layout
    expect(toCss(sectionSheets(l.sections[0]))).toContain('grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);')
  })
})
