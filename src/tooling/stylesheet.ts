/**
 * Tiny style model shared by the preview and the SCSS / CSS outputs, so what you
 * see is exactly what gets exported.
 *
 * - Reference a variable inside any value with `$$name` (e.g. `'1px solid $$border-color'`).
 *   SCSS renders `$name`; CSS renders `var(--name)` with the variable declared on `scope`.
 * - Nested selectors may use `&` (SCSS-style); otherwise they're descendants.
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

export const BREAKPOINTS: Record<Breakpoint, number> = { tablet: 768, mobile: 480 }

const VAR_REF = /\$\$([a-z0-9-]+)/gi
const isMedia = (r: Rule | MediaBlock): r is MediaBlock => 'media' in r

const toScssValue = (v: string | number) => String(v).replace(VAR_REF, '$$$1')
const toCssValue = (v: string | number) => String(v).replace(VAR_REF, 'var(--$1)')

function declLines(decls: Decls | undefined, fmt: (v: string | number) => string, indent: string) {
  return Object.entries(decls ?? {})
    .filter((e): e is [string, string | number] => e[1] !== false && e[1] !== null && e[1] !== undefined && e[1] !== '')
    .map(([k, v]) => `${indent}${k}: ${fmt(v)};`)
}

/** Combines parent and child selector lists (handles commas and `&`). */
export function joinSelectors(parent: string, child: string): string {
  const parents = parent.split(',').map((s) => s.trim())
  const children = child.split(',').map((s) => s.trim())
  return parents
    .flatMap((p) => children.map((c) => (c.includes('&') ? c.replaceAll('&', p) : `${p} ${c}`)))
    .join(', ')
}

function flatten(rules: Rule[], parent = ''): { sel: string; decls?: Decls }[] {
  return rules.flatMap((r) => {
    const sel = parent ? joinSelectors(parent, r.sel) : r.sel
    return [{ sel, decls: r.decls }, ...flatten(r.nest ?? [], sel)]
  })
}

// ---------- CSS ----------

function cssRules(rules: Rule[], indent = ''): string[] {
  return flatten(rules)
    .map(({ sel, decls }) => {
      const body = declLines(decls, toCssValue, `${indent}  `)
      return body.length ? `${indent}${sel} {\n${body.join('\n')}\n${indent}}` : ''
    })
    .filter(Boolean)
}

export function toCss(sheets: Sheet[]): string {
  return sheets
    .map((sheet) => {
      const out: string[] = []
      if (sheet.title) out.push(`/* ${sheet.title} */`)
      if (sheet.vars.length) {
        out.push(`${sheet.scope} {\n${sheet.vars.map((v) => `  --${v.name}: ${toCssValue(v.value)};`).join('\n')}\n}`)
      }
      for (const r of sheet.rules) {
        if (isMedia(r)) {
          const inner = cssRules(r.rules, '  ')
          if (inner.length) out.push(`@media (max-width: ${BREAKPOINTS[r.media]}px) {\n${inner.join('\n')}\n}`)
        } else {
          out.push(...cssRules([r]))
        }
      }
      return out.join('\n\n')
    })
    .join('\n\n')
}

// ---------- SCSS ----------

function scssRule(rule: Rule, indent: string): string {
  const body = [
    ...declLines(rule.decls, toScssValue, `${indent}  `),
    ...(rule.nest ?? []).map((n) => scssRule(n, `${indent}  `)),
  ]
  return body.length ? `${indent}${rule.sel} {\n${body.join('\n')}\n${indent}}` : ''
}

export function toScss(sheets: Sheet[]): string {
  const out: string[] = []

  out.push(
    '// Breakpoints',
    ...Object.entries(BREAKPOINTS).map(([k, v]) => `$bp-${k}: ${v}px;`),
  )

  for (const sheet of sheets) {
    const groups = new Map<VarGroup, SheetVar[]>()
    for (const v of sheet.vars) groups.set(v.group, [...(groups.get(v.group) ?? []), v])
    if (groups.size) {
      out.push('', `// ${sheet.title ?? sheet.scope} — variables`)
      for (const [group, vars] of groups) {
        out.push(`// ${group}`, ...vars.map((v) => `$${v.name}: ${toScssValue(v.value)};`))
      }
    }
  }

  for (const sheet of sheets) {
    out.push('', `// ${sheet.title ?? sheet.scope}`)
    for (const r of sheet.rules) {
      if (isMedia(r)) {
        const inner = r.rules.map((x) => scssRule(x, '  ')).filter(Boolean)
        if (inner.length) out.push(`@media (max-width: $bp-${r.media}) {\n${inner.join('\n')}\n}`)
      } else {
        const s = scssRule(r, '')
        if (s) out.push(s)
      }
    }
  }

  return out.join('\n')
}
