import { describe, expect, it } from 'vitest'
import { toCss } from '@/tooling/stylesheet'
import {
  addItem,
  addSection,
  columnFractions,
  duplicateSection,
  exampleLayout,
  findItem,
  findWidgetByKey,
  moveItem,
  moveSection,
  removeItem,
  renderedColumns,
  updateSectionSettings,
  type Layout,
} from './model'
import { sectionSheets } from './sections'

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
    const l = addSection(empty(), { columns: 3, ratio3: '1:2:1', gap: 16 })
    expect(columnFractions(l.sections[0].settings)).toEqual([1, 2, 1])
    const css = toCss(sectionSheets(l.sections[0]))
    expect(css).toContain('grid-template-columns: minmax(0, 1fr) minmax(0, 2fr) minmax(0, 1fr);')
    expect(css).toContain('@media (max-width: 480px)')
    expect(css).toContain(`#cs-${l.sections[0].id} {`)
  })

  it('drops empty columns so the others take the full width', () => {
    let l = addSection(empty(), { columns: 2, ratio2: '2:1' })
    const [a, b] = l.sections[0].columns
    // all empty → structure kept
    expect(renderedColumns(l.sections[0]).map((c) => c.index)).toEqual([0, 1])
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

  it('keeps the proportions of the remaining columns', () => {
    let l = addSection(empty(), { columns: 3, ratio3: '2:1:1' })
    const [a, , c] = l.sections[0].columns
    l = addItem(l, a.id, cards).layout
    l = addItem(l, c.id, cards).layout
    expect(toCss(sectionSheets(l.sections[0]))).toContain('grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);')
  })
})
