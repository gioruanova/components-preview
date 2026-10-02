import recessGroups from 'stylelint-config-recess-order/groups'
import { profile } from './outputProfile'
import { FONT_NOTE } from './typography'

/**
 * Tiny style model shared by the preview and the SCSS / CSS outputs, so what you
 * see is exactly what gets exported.
 *
 * - Reference a variable inside any value with `$$name` (e.g. `'1px solid $$border-color'`).
 *   SCSS renders `$name`; CSS renders `var(--name)` with the variable declared on `scope`.
 * - Nested selectors may use `&` (SCSS-style); otherwise they're descendants.
 * - Output follows `output-standards/` (stylelint-config-standard-scss + recess order, Prettier):
 *   declarations are sorted in recess order, colors are normalised (short hex, modern rgb()),
 *   and blank lines / selector lists are laid out the way the linters expect.
 */

export type Decls = Record<string, string | number | false | null | undefined>
export type Rule = { sel: string; decls?: Decls; nest?: Rule[] }
export type Breakpoint = 'tablet' | 'mobile'
export type MediaBlock = { media: Breakpoint; rules: Rule[] }
export type VarGroup = 'Colors' | 'Typography' | 'Layout'
export type SheetVar = { name: string; value: string | number; group: VarGroup }

export type Sheet = {
  /** Selector the CSS custom properties are declared on (the widget root). */
  scope: string
  /** Optional heading comment. */
  title?: string
  vars: SheetVar[]
  rules: (Rule | MediaBlock)[]
}

// Naming + breakpoints come from the output profile (single place to adopt a new nomenclature)
const BREAKPOINTS: Record<Breakpoint, number> = profile.breakpoints

const VAR_REF = /\$\$([a-z0-9-]+)/gi
const isMedia = (r: Rule | MediaBlock): r is MediaBlock => 'media' in r
const name = (n: string) => profile.varName(n)

// ---------- value normalisation (stylelint-config-standard) ----------

/** #ffffff → #fff, #ffffffff → #ffff (color-hex-length: short), lower-case. */
function shortHex(v: string) {
  return v.replace(/#([0-9a-f]{6}|[0-9a-f]{8})\b/gi, (_, hex: string) => {
    const h = hex.toLowerCase()
    const pairs = h.match(/../g)!
    return pairs.every((p) => p[0] === p[1]) ? `#${pairs.map((p) => p[0]).join('')}` : `#${h}`
  })
}

/** rgba(0, 0, 0, 0.7) → rgb(0 0 0 / 70%) (color-function-notation: modern, alpha-value-notation: percentage). */
function modernRgb(v: string) {
  return v.replace(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+%?)\s*)?\)/gi, (_, r, g, b, a?: string) => {
    if (a === undefined) return `rgb(${r} ${g} ${b})`
    const pct = a.endsWith('%') ? a : `${Math.round(parseFloat(a) * 1000) / 10}%`
    return `rgb(${r} ${g} ${b} / ${pct})`
  })
}

/** url("x") → url('x') (Prettier singleQuote). */
const singleQuoteUrl = (v: string) => v.replace(/url\("([^"]*)"\)/g, "url('$1')")

const normalise = (v: string | number) => (typeof v === 'number' ? String(v) : singleQuoteUrl(modernRgb(shortHex(v))))

/** `0px` → `0` (length-zero-no-unit). Skipped inside calc(), where a unitless 0 would change the meaning. */
const zeroLengths = (v: string) => (v.includes('calc(') ? v : v.replace(/(^|[\s,(])0(?:px|em|rem|vh|vw|pt)(?=[\s,)]|$)/g, '$10'))

/** Box shorthands: `50px 50px` → `50px`, `0 auto 0 auto` → `0 auto` (shorthand-property-no-redundant-values). */
const BOX_SHORTHANDS = new Set(['margin', 'padding', 'inset', 'border-width', 'border-style', 'border-color', 'scroll-margin', 'scroll-padding'])
function collapseShorthand(prop: string, value: string) {
  if (!BOX_SHORTHANDS.has(prop) || /[(,]/.test(value)) return value
  const v = value.trim().split(/\s+/)
  if (v.length === 4 && v[3] === v[1]) v.pop()
  if (v.length === 3 && v[2] === v[0]) v.pop()
  if (v.length === 2 && v[1] === v[0]) v.pop()
  return v.join(' ')
}

const toScssValue = (v: string | number) => normalise(v).replace(VAR_REF, (_, n: string) => `$${name(n)}`)
const toCssValue = (v: string | number) => normalise(v).replace(VAR_REF, (_, n: string) => `var(--${name(n)})`)

// ---------- declaration order (stylelint-config-recess-order) ----------

const ORDER = new Map<string, number>()
recessGroups.forEach((g: { properties: string[] }) => g.properties.forEach((p) => ORDER.has(p) || ORDER.set(p, ORDER.size)))
const rank = (prop: string) => ORDER.get(prop) ?? Number.MAX_SAFE_INTEGER

const present = (v: Decls[string]): v is string | number => v !== false && v !== null && v !== undefined && v !== ''

/** flex-direction + flex-wrap → flex-flow (declaration-block-no-redundant-longhand-properties). */
function mergeLonghands(decls: Decls): Decls {
  const { 'flex-direction': dir, 'flex-wrap': wrap, ...rest } = decls
  if (present(dir) && present(wrap)) return { ...rest, 'flex-flow': `${dir} ${wrap}` }
  return decls
}

function declLines(decls: Decls | undefined, fmt: (v: string | number) => string, indent: string) {
  return Object.entries(mergeLonghands(decls ?? {}))
    .filter((e): e is [string, string | number] => present(e[1]))
    .map(([k, v], i) => ({ k, v, i }))
    .sort((a, b) => rank(a.k) - rank(b.k) || a.i - b.i) // stable for unknown/custom properties
    .map(({ k, v }) => `${indent}${k}: ${collapseShorthand(k, zeroLengths(fmt(v)))};`)
}

/** Combines parent and child selector lists (handles commas and `&`). */
export function joinSelectors(parent: string, child: string): string {
  const parents = parent.split(',').map((s) => s.trim())
  const children = child.split(',').map((s) => s.trim())
  return parents
    .flatMap((p) => children.map((c) => (c.includes('&') ? c.replaceAll('&', p) : `${p} ${c}`)))
    .join(', ')
}

/** One selector per line for lists (Prettier style). */
const selectorList = (sel: string, indent: string) =>
  sel
    .split(',')
    .map((s) => s.trim())
    .join(`,\n${indent}`)

function flatten(rules: Rule[], parent = ''): { sel: string; decls?: Decls }[] {
  return rules.flatMap((r) => {
    const sel = parent ? joinSelectors(parent, r.sel) : r.sel
    return [{ sel, decls: r.decls }, ...flatten(r.nest ?? [], sel)]
  })
}

const block = (sel: string, body: string[], indent: string) => `${indent}${selectorList(sel, indent)} {\n${body.join('\n')}\n${indent}}`

// ---------- CSS ----------

function cssRules(rules: Rule[], indent = ''): string[] {
  return flatten(rules)
    .map(({ sel, decls }) => {
      const body = declLines(decls, toCssValue, `${indent}  `)
      return body.length ? block(sel, body, indent) : ''
    })
    .filter(Boolean)
}

export function toCss(sheets: Sheet[]): string {
  return sheets
    .map((sheet) => {
      const out: string[] = []
      if (sheet.title) out.push(`/* ${sheet.title} */`)
      if (sheet.vars.some((v) => v.name.includes('font-family'))) out.push(`/* ${FONT_NOTE} */`)
      if (sheet.vars.length) {
        out.push(block(sheet.scope, sheet.vars.map((v) => `  --${name(v.name)}: ${toCssValue(v.value)};`), ''))
      }
      for (const r of sheet.rules) {
        if (isMedia(r)) {
          const inner = cssRules(r.rules, '  ')
          if (inner.length) out.push(`@media (max-width: ${BREAKPOINTS[r.media]}px) {\n${inner.join('\n\n')}\n}`)
        } else {
          out.push(...cssRules([r]))
        }
      }
      return out.join('\n\n')
    })
    .filter(Boolean)
    .join('\n\n')
}

// ---------- SCSS ----------

function scssRule(rule: Rule, indent: string): string {
  const decls = declLines(rule.decls, toScssValue, `${indent}  `)
  const nested = (rule.nest ?? []).map((n) => scssRule(n, `${indent}  `)).filter(Boolean)
  if (!decls.length && !nested.length) return ''
  // blank line before every nested rule except the first thing in the block (rule-empty-line-before)
  const body = [...decls, ...nested.map((n, i) => (i === 0 && !decls.length ? n : `\n${n}`))]
  return block(rule.sel, body, indent)
}

export function toScss(sheets: Sheet[]): string {
  const sections: string[] = []

  sections.push(['// Breakpoints', ...Object.entries(BREAKPOINTS).map(([k, v]) => `$bp-${k}: ${v}px;`)].join('\n'))

  for (const sheet of sheets) {
    const groups = new Map<VarGroup, SheetVar[]>()
    for (const v of sheet.vars) groups.set(v.group, [...(groups.get(v.group) ?? []), v])
    for (const [group, vars] of groups) {
      const note = vars.some((v) => v.name.includes('font-family')) ? [`// ${FONT_NOTE}`] : []
      sections.push([`// ${sheet.title ?? sheet.scope} — ${group}`, ...note, ...vars.map((v) => `$${name(v.name)}: ${toScssValue(v.value)};`)].join('\n'))
    }
  }

  for (const sheet of sheets) {
    const rules: string[] = []
    for (const r of sheet.rules) {
      if (isMedia(r)) {
        const inner = r.rules.map((x) => scssRule(x, '  ')).filter(Boolean)
        if (inner.length) rules.push(`@media (max-width: $bp-${r.media}) {\n${inner.join('\n\n')}\n}`)
      } else {
        const s = scssRule(r, '')
        if (s) rules.push(s)
      }
    }
    if (rules.length) sections.push(`// ${sheet.title ?? sheet.scope}\n${rules.join('\n\n')}`)
  }

  // blank line between sections (comments, variable groups, rules, @media)
  return sections.join('\n\n')
}
