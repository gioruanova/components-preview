import { describe, expect, it } from 'vitest'
import { toCss, toScss } from '@/tooling/stylesheet'
import { format, lint, mediaOrphans, scssCssDiff, schemaVariations } from '@/tooling/testing/standardsKit'
import type { Config, Schema } from '@/tooling/types'
import { addSection, duplicateSection, exampleLayout, loadLayout, STORAGE_KEY, updateSectionHeading, type Layout } from './model'
import { headingDefaults, headingOf, headingSchema, headingSheet, isHeadingEmpty, type SectionHeading } from './sectionHeading'

const on = { ...headingDefaults, showHeading: true, showDescription: true }
const SEL = '#cs-test'

describe('section heading', () => {
  it('is optional per section: off by default, editable per section, copied on duplicate', () => {
    let l: Layout = addSection(addSection({ version: 1, sections: [] }), { name: 'B' })
    expect(isHeadingEmpty(headingOf(l.sections[0]))).toBe(true)
    l = updateSectionHeading(l, l.sections[1].id, 'showHeading', true)
    l = updateSectionHeading(l, l.sections[1].id, 'headingLevel', 'h3')
    expect(isHeadingEmpty(headingOf(l.sections[0]))).toBe(true) // other sections untouched
    expect(headingOf(l.sections[1])).toMatchObject({ showHeading: true, headingLevel: 'h3', heading: headingDefaults.heading })
    l = duplicateSection(l, l.sections[1].id)
    expect(headingOf(l.sections[2]).headingLevel).toBe('h3')
  })

  it('the example layout has a section heading', () => {
    expect(exampleLayout().sections.some((s) => !isHeadingEmpty(headingOf(s)))).toBe(true)
  })

  it('migrates a legacy layout-level heading to the first section', () => {
    const legacy = { version: 1, header: { showHeading: true, heading: 'Old title', paddingY: 40 }, sections: exampleLayout().sections.map((s) => ({ ...s, heading: undefined })) }
    const store = new Map([[STORAGE_KEY, JSON.stringify(legacy)]])
    const original = globalThis.localStorage
    Object.defineProperty(globalThis, 'localStorage', { value: { getItem: (k: string) => store.get(k) ?? null }, configurable: true })
    try {
      const l = loadLayout()
      expect(l.sections[0].heading).toEqual({ showHeading: true, heading: 'Old title' }) // layout-only keys dropped
      expect(l.sections[1].heading).toBeUndefined()
    } finally {
      Object.defineProperty(globalThis, 'localStorage', { value: original, configurable: true })
    }
  })

  it('is scoped to its section and exposes typography as variables (with per-viewport overrides)', () => {
    const css = toCss([headingSheet(SEL, on)])
    expect(css).toContain(`${SEL} .section-heading .section-heading-title {`)
    const scss = toScss([headingSheet(SEL, on)])
    expect(scss).toContain('$section-heading-title-font-size: 36px;')
    expect(scss).toContain('$section-heading-title-font-size-tablet: 31px;')
    expect(toCss([headingSheet(SEL, { ...on, alignment: 'right' })])).toContain('text-align: right;')
  })

  describe('output standards', () => {
    const cases = schemaVariations(headingSchema as unknown as Schema<Config>, on)
    it(`SCSS ≡ CSS, specificity, stylelint (${cases.length} variations)`, async () => {
      for (const { label, config } of cases) {
        const sheet = headingSheet(SEL, config as SectionHeading)
        const css = toCss([sheet])
        const scss = toScss([sheet])
        const diff = scssCssDiff(scss, css)
        expect(diff && { label, ...diff }).toBeNull()
        expect(mediaOrphans(css), label).toEqual([])
        expect(await lint(await format(scss, 'scss'), true), `${label} scss`).toEqual([])
        expect(await lint(await format(css, 'css'), false), `${label} css`).toEqual([])
      }
    }, 120_000)
  })
})
