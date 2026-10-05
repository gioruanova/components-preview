/**
 * Output guarantees, for EVERY registered widget and many config variations (generated from its schema):
 *  1. The CSS output is exactly the CSS the live preview uses (only asset URLs differ).
 *  2. Every @media override targets a base selector (same specificity → it actually wins).
 *  3. The SCSS output, compiled with Sass, produces exactly the same rules as the CSS output.
 *  4. Every tab is Prettier-formatted (output-standards/prettier.json); SCSS/CSS pass output-standards/stylelint.json.
 *
 * New widgets are covered automatically. Helpers: tooling/testing/standardsKit.ts.
 */
import { describe, expect, it } from 'vitest'
import { formatFiles, PARSERS } from './formatCode'
import { outputFiles, previewCss } from './output'
import type { CodeTabId } from './outputProfile'
import { categories, type RegisteredWidget } from './registry'
import { isFormatted, lint, mediaOrphans, scssCssDiff, schemaVariations } from './testing/standardsKit'
import type { Config } from './types'

const widgets = categories.flatMap((c) => c.widgets)

const variations = (w: RegisteredWidget) =>
  schemaVariations(w.schema, w.defaults, [
    { label: 'container boxed', config: { ...w.defaults, useContainer: true, containerWidth: 'boxed', containerBgImage: 'sample:waves' } as Config },
    { label: 'container full', config: { ...w.defaults, useContainer: true, containerWidth: 'full', 'containerPadding@tablet': 30 } as Config },
  ])

const stripUrls = (css: string) => css.replace(/url\('[^']*'\)/g, "url('…')")
const tab = (w: RegisteredWidget, config: Config, id: CodeTabId) => outputFiles(w, config).find((f) => f.id === id)!.code

describe.each(widgets.map((w) => [w.path, w] as const))('%s output', (_path, w) => {
  const cases = variations(w)

  it(`has variations to check (${cases.length})`, () => expect(cases.length).toBeGreaterThan(5))

  it('CSS output = live preview CSS (except asset URLs)', () => {
    for (const { label, config } of cases) expect(stripUrls(tab(w, config, 'css')), label).toBe(stripUrls(previewCss(w, config)))
  })

  it('every @media override targets a selector that exists in the base rules (same specificity → it wins)', () => {
    for (const { label, config } of cases) expect(mediaOrphans(tab(w, config, 'css')), label).toEqual([])
  })

  it('SCSS compiles (Sass) to exactly the same rules as the CSS output', () => {
    for (const { label, config } of cases) {
      const diff = scssCssDiff(tab(w, config, 'scss'), tab(w, config, 'css'))
      expect(diff && { label, ...diff }).toBeNull()
    }
  })

  it('every tab formats with output-standards/prettier.json; SCSS and CSS then pass stylelint and still match', async () => {
    for (const { label, config } of cases) {
      // what the Output code panel shows/copies: the same Prettier step (see tooling/formatCode.ts)
      const shown = await formatFiles(outputFiles(w, config))
      for (const f of shown) {
        expect(await isFormatted(f.code, PARSERS[f.id as CodeTabId]), `${label} ${f.id} prettier`).toBe(true)
        if (f.id === 'scss' || f.id === 'css') expect(await lint(f.code, f.id === 'scss'), `${label} ${f.id}`).toEqual([])
      }
      const diff = scssCssDiff(shown.find((f) => f.id === 'scss')!.code, shown.find((f) => f.id === 'css')!.code)
      expect(diff && { label, formatted: true, ...diff }).toBeNull()
    }
  }, 180_000)
})
