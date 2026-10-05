/**
 * Test-only helpers to verify generated styles against `output-standards/` (imported by *.test.ts only,
 * never by the app). Used for widgets (tooling/standards.test.ts) and for any other generated sheet
 * (e.g. the Layout builder heading).
 */
import { fileURLToPath } from 'node:url'
import postcss, { type Root } from 'postcss'
import * as prettier from 'prettier'
import * as sass from 'sass'
import stylelint from 'stylelint'
import prettierConfig from '../../../output-standards/prettier.json'
import stylelintConfig from '../../../output-standards/stylelint.json'
import type { Config, FieldDef, LeafField, Schema } from '../types'

const ROOT = fileURLToPath(new URL('../../../', import.meta.url))

// ---------- config variations from a schema ----------

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
      return [
        { ...t, family: 'Playfair Display', size: Number(t.size) + 7, italic: true, clamp: !t.clamp, lines: 3, letterSpacing: 0.05, transform: 'uppercase' },
        { ...t, fluid: !t.fluid, minSize: 12 },
      ]
    }
    case 'buttonStyle':
      return [{ ...(v as object), custom: true, shadow: 'md', borderWidth: 2, background: '#f2692280' }]
    case 'image':
      return ['sample:dots', '']
    default:
      return []
  }
}

/** One variation per alternative value of every field, plus tablet/mobile overrides for responsive fields. */
export function schemaVariations(schema: Schema<Config>, base: Config, extra: { label: string; config: Config }[] = []) {
  const out = [{ label: 'defaults', config: base }, ...extra]
  for (const f of leaves([...schema.content, ...schema.widget, ...schema.styles] as FieldDef<Config>[])) {
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

// ---------- comparisons ----------

/** Rules as comparable lines: "<@media>|<selector>|<prop>: <value>" (custom properties removed). */
export function ruleLines(root: Root): string[] {
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

/** First difference between compiled SCSS and (var-resolved) CSS, or null when they produce the same rules. */
export function scssCssDiff(scss: string, css: string): { scss?: string; css?: string } | null {
  const a = ruleLines(compile(scss))
  const b = ruleLines(compile(resolveVars(css)))
  const i = a.findIndex((line, n) => line !== b[n])
  return i === -1 && a.length === b.length ? null : { scss: a[i], css: b[i] }
}

/** Selectors used inside @media that don't exist in the base rules (those overrides would lose on specificity). */
export function mediaOrphans(css: string): string[] {
  const root = postcss.parse(css)
  const norm = (s: string) => s.replace(/\s+/g, ' ')
  const base = new Set<string>()
  root.walkRules((r) => {
    if (r.parent?.type !== 'atrule') base.add(norm(r.selector))
  })
  const orphans: string[] = []
  root.walkAtRules('media', (m) => m.walkRules((r) => void (base.has(norm(r.selector)) || orphans.push(norm(r.selector)))))
  return orphans
}

/** Stylelint warnings for `code` under output-standards/stylelint.json. */
export const lint = async (code: string, scss: boolean) =>
  (await stylelint.lint({ code, config: stylelintConfig, configBasedir: ROOT, customSyntax: scss ? 'postcss-scss' : undefined })).results[0].warnings.map(
    (w) => `L${w.line} ${w.text}`,
  )

/** Prettier-format with output-standards/prettier.json. */
export const format = (code: string, parser: string) => prettier.format(code, { ...prettierConfig, parser } as prettier.Options)
export const isFormatted = (code: string, parser: string) => prettier.check(code, { ...prettierConfig, parser } as prettier.Options)
