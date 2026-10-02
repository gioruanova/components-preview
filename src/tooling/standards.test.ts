/**
 * Output guarantees, for EVERY registered widget and many config variations (generated from its schema):
 *  1. The CSS output is exactly the CSS the live preview uses (only asset URLs differ).
 *  2. The SCSS output, compiled with Sass, produces exactly the same rules as the CSS output.
 *  3. SCSS and CSS pass `output-standards/stylelint.json` and are formatted with `output-standards/prettier.json`.
 *
 * New widgets are covered automatically.
 */
import { describe, expect, it } from 'vitest'
import { fileURLToPath } from 'node:url'
import postcss, { type Root } from 'postcss'
import * as prettier from 'prettier'
import * as sass from 'sass'
import stylelint from 'stylelint'
import prettierConfig from '../../output-standards/prettier.json'
import stylelintConfig from '../../output-standards/stylelint.json'
import { formatFiles, PARSERS } from './formatCode'
import type { CodeTabId } from './outputProfile'
import { outputFiles, previewCss } from './output'
import { categories, type RegisteredWidget } from './registry'
import type { Config, FieldDef, LeafField } from './types'

const ROOT = fileURLToPath(new URL('../../', import.meta.url))
const widgets = categories.flatMap((c) => c.widgets)

// ---------- config variations from the schema ----------

const leaves = (fields: FieldDef<Config>[]): LeafField<Config>[] =>
  fields.flatMap((f) => (f.type === 'group' ? leaves(f.fields as FieldDef<Config>[]) : [f]))

/** Alternative values for a field, used to build variations. */
function alternatives(f: LeafField<Config>, v: unknown): unknown[] {
  switch (f.type) {
    case 'switch':
      return [!v]
    case 'segmented':
    case 'select':
      return f.options.map((o) => o.value).filter((o) => o !== v)
    case 'slider':
    case 'stepper':
      return [f.min, f.max]
    case 'color':
      return ['#12345680', '#00000000']
    case 'typography': {
      const t = v as Record<string, unknown>
      return [{ ...t, family: 'Playfair Display', size: Number(t.size) + 7, italic: true, clamp: !t.clamp, lines: 3, letterSpacing: 0.05, transform: 'uppercase' }]
    }
    case 'buttonStyle':
      return [{ ...(v as object), custom: true, shadow: 'md', borderWidth: 2, background: '#f2692280' }]
    case 'image':
      return ['sample:dots', '']
    default:
      return []
  }
}

function variations(w: RegisteredWidget): { label: string; config: Config }[] {
  const base = w.defaults
  const out = [
    { label: 'defaults', config: base },
    { label: 'container boxed', config: { ...base, useContainer: true, containerWidth: 'boxed', containerBgImage: 'sample:waves' } },
    { label: 'container full', config: { ...base, useContainer: true, containerWidth: 'full', 'containerPadding@tablet': 30 } },
  ]
  for (const f of leaves([...w.schema.content, ...w.schema.widget, ...w.schema.styles])) {
    const alts = alternatives(f, base[f.key])
    alts.forEach((alt, i) => out.push({ label: `${f.key}=${i}`, config: { ...base, [f.key]: alt } }))
    if (f.responsive && alts.length) {
      out.push({ label: `${f.key}@tablet`, config: { ...base, [`${f.key}@tablet`]: alts[0] } })
      out.push({ label: `${f.key}@mobile`, config: { ...base, [`${f.key}@mobile`]: alts.at(-1) } })
      out.push({ label: `${f.key}@tablet+mobile=desktop`, config: { ...base, [`${f.key}@tablet`]: alts[0], [`${f.key}@mobile`]: base[f.key] } })
    }
  }
  return out
}

// ---------- normalisation ----------

/** Rules as comparable lines: "<@media>|<selector>|<prop>: <value>" (custom properties removed). */
function ruleLines(root: Root): string[] {
  const lines: string[] = []
  root.walkDecls((d) => {
    if (d.prop.startsWith('--')) return
    const rule = d.parent as postcss.Rule
    const media = rule.parent?.type === 'atrule' ? (rule.parent as postcss.AtRule).params : ''
    const sel = rule.selector.replace(/\s+/g, ' ').replace(/\s*,\s*/g, ', ')
    lines.push(`${media}|${sel}|${d.prop}: ${d.value.replace(/\s+/g, ' ')}`)
  })
  return lines
}

/** CSS with every var(--x) replaced by its declared value (so it can be compared with compiled SCSS). */
function resolveVars(css: string): string {
  const root = postcss.parse(css)
  const vars = new Map<string, string>()
  root.walkDecls((d) => {
    if (d.prop.startsWith('--')) vars.set(d.prop, d.value) // (returning false would stop postcss' walk)
  })
  let out = css
  for (let i = 0; i < 5 && /var\(--/.test(out); i++) out = out.replace(/var\((--[a-z0-9-]+)\)/gi, (m, n: string) => vars.get(n) ?? m)
  return out
}

const compile = (code: string) => postcss.parse(sass.compileString(code, { style: 'expanded' }).css)
const stripUrls = (css: string) => css.replace(/url\('[^']*'\)/g, "url('…')")

const lint = async (code: string, scss: boolean) =>
  (await stylelint.lint({ code, config: stylelintConfig, configBasedir: ROOT, customSyntax: scss ? 'postcss-scss' : undefined })).results[0].warnings.map(
    (w) => `L${w.line} ${w.text}`,
  )

// ---------- tests ----------

describe.each(widgets.map((w) => [w.path, w] as const))('%s output', (_path, w) => {
  const cases = variations(w)

  it(`has variations to check (${cases.length})`, () => expect(cases.length).toBeGreaterThan(5))

  it('CSS output = live preview CSS (except asset URLs)', () => {
    for (const { label, config } of cases) {
      const css = outputFiles(w, config).find((f) => f.id === 'css')!.code
      expect(stripUrls(css), label).toBe(stripUrls(previewCss(w, config)))
    }
  })

  it('every @media override targets a selector that exists in the base rules (same specificity → it wins)', () => {
    for (const { label, config } of cases) {
      const root = postcss.parse(outputFiles(w, config).find((f) => f.id === 'css')!.code)
      const norm = (s: string) => s.replace(/\s+/g, ' ')
      const base = new Set<string>()
      root.walkRules((r) => {
        if (r.parent?.type !== 'atrule') base.add(norm(r.selector))
      })
      const orphans: string[] = []
      root.walkAtRules('media', (m) => m.walkRules((r) => void (base.has(norm(r.selector)) || orphans.push(norm(r.selector)))))
      expect(orphans, label).toEqual([])
    }
  })

  it('SCSS compiles (Sass) to exactly the same rules as the CSS output', () => {
    for (const { label, config } of cases) {
      const files = outputFiles(w, config)
      const scss = files.find((f) => f.id === 'scss')!.code
      const css = files.find((f) => f.id === 'css')!.code
      const a = ruleLines(compile(scss))
      const b = ruleLines(compile(resolveVars(css)))
      const i = a.findIndex((line, n) => line !== b[n])
      expect(i === -1 && a.length === b.length ? null : { label, scss: a[i], css: b[i] }).toBeNull()
    }
  })

  it('every tab formats with output-standards/prettier.json; SCSS and CSS then pass stylelint and still match', async () => {
    for (const { label, config } of cases) {
      // what the Output code panel shows/copies: the same Prettier step (see tooling/formatCode.ts)
      const shown = await formatFiles(outputFiles(w, config))
      for (const f of shown) {
        expect(await prettier.check(f.code, { ...prettierConfig, parser: PARSERS[f.id as CodeTabId] } as prettier.Options), `${label} ${f.id} prettier`).toBe(true)
        if (f.id === 'scss' || f.id === 'css') expect(await lint(f.code, f.id === 'scss'), `${label} ${f.id}`).toEqual([])
      }
      const scss = shown.find((f) => f.id === 'scss')!.code
      const css = shown.find((f) => f.id === 'css')!.code
      expect(ruleLines(compile(scss)), `${label} formatted`).toEqual(ruleLines(compile(resolveVars(css))))
    }
  }, 180_000)
})
