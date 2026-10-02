import type { Decls, SheetVar } from './stylesheet'

export type Typography = {
  family: string
  size: number
  weight: number
  lineHeight: number
  letterSpacing: number
  color: string
  transform: 'none' | 'uppercase' | 'capitalize' | 'lowercase'
  italic: boolean
  /** Truncate with an ellipsis after `lines` lines. */
  clamp: boolean
  lines: number
  /** Fluid size: font-size scales with the viewport (or the widget's container) between `minSize` and `size`. */
  fluid?: boolean
  minSize?: number
}

/**
 * How fluid sizes scale. `vw` = viewport width (default, reference 1280px).
 * `cqi` = the nearest CSS container (the element needs `container-type: inline-size`), reference = its design width.
 */
export type FluidOptions = { unit?: 'vw' | 'cqi'; ref?: number }

const round2 = (n: number) => Math.round(n * 100) / 100

/** `clamp(min, <size/ref × 100><unit>, max)` using the given size / min variable references. */
function fluidSize(t: Typography, sizeRef: string, minRef: string, opts: FluidOptions = {}) {
  const unit = opts.unit ?? 'vw'
  const ref = opts.ref ?? 1280
  return `clamp(${minRef}, ${round2((t.size / ref) * 100)}${unit}, ${sizeRef})`
}

/** Fonts available in the preview (loaded into the iframe from @fontsource). */
export const FONTS = [
  { value: 'Poppins', stack: "'Poppins', sans-serif" },
  { value: 'Open Sans', stack: "'Open Sans', sans-serif" },
  { value: 'Montserrat', stack: "'Montserrat', sans-serif" },
  { value: 'Inter', stack: "'Inter', sans-serif" },
  { value: 'Playfair Display', stack: "'Playfair Display', serif" },
  { value: 'System UI', stack: 'system-ui, sans-serif' },
] as const

export const WEIGHTS = [300, 400, 500, 600, 700, 800]

/** Shown under every font picker and as a comment in the SCSS/CSS output. */
export const FONT_NOTE =
  'Testing fonts only. The real project font is chosen by the client and lives in the site theme under its own variable name — map these font-family values to it.'

/**
 * Font stacks are stored in variables, so family names are quoted (an unquoted name in a `$var`/custom
 * property is read as a keyword by stylelint's value-keyword-case). Literal `font-family` declarations in
 * widget styles use unquoted single-word names instead (font-family-name-quotes).
 */
export const fontStack = (family: string) => FONTS.find((f) => f.value === family)?.stack ?? `'${family}', sans-serif`

export function typography(overrides: Partial<Typography> = {}): Typography {
  return {
    family: 'Poppins',
    size: 16,
    weight: 400,
    lineHeight: 1.5,
    letterSpacing: 0,
    color: '#313841',
    transform: 'none',
    italic: false,
    clamp: false,
    lines: 2,
    ...overrides,
  }
}

/**
 * Variables + declarations (+ optional line clamp) for a text element. Family, size, weight and color become
 * variables (`<prefix>-font-family`, …); the rest are emitted as plain values.
 */
export function typeStyles(prefix: string, t: Typography, opts?: FluidOptions): { vars: SheetVar[]; decls: Decls; clamp: Decls } {
  return {
    vars: [
      { name: `${prefix}-font-family`, value: fontStack(t.family), group: 'Typography' },
      { name: `${prefix}-font-size`, value: `${t.size}px`, group: 'Typography' },
      ...(t.fluid ? [{ name: `${prefix}-font-size-min`, value: `${t.minSize ?? 14}px`, group: 'Typography' as const }] : []),
      { name: `${prefix}-font-weight`, value: t.weight, group: 'Typography' },
      { name: `${prefix}-color`, value: t.color, group: 'Colors' },
    ],
    decls: {
      'font-family': `$$${prefix}-font-family`,
      'font-size': t.fluid ? fluidSize(t, `$$${prefix}-font-size`, `$$${prefix}-font-size-min`, opts) : `$$${prefix}-font-size`,
      'font-weight': `$$${prefix}-font-weight`,
      color: `$$${prefix}-color`,
      'line-height': t.lineHeight,
      'letter-spacing': t.letterSpacing ? `${t.letterSpacing}em` : undefined,
      'text-transform': t.transform !== 'none' ? t.transform : undefined,
      'font-style': t.italic ? 'italic' : undefined,
    },
    // Kept separate so a widget can put the clamp on an inner element (e.g. one title line).
    clamp: t.clamp
      ? { display: '-webkit-box', '-webkit-line-clamp': t.lines, '-webkit-box-orient': 'vertical', overflow: 'hidden' }
      : {},
  }
}

/**
 * Per-viewport typography override: only what differs from `prev` (the inherited value).
 * Family / size / weight / color become `<prefix>-<prop>-<vp>` variables; the rest are plain values.
 * Returns empty vars/decls when `next` is undefined (no change at that viewport).
 */
export function typeOverride(
  prefix: string,
  prev: Typography,
  next: Typography | undefined,
  vp: 'tablet' | 'mobile',
  opts?: FluidOptions,
): { vars: SheetVar[]; decls: Decls; clamp: Decls } {
  if (!next) return { vars: [], decls: {}, clamp: {} }
  const vars: SheetVar[] = []
  const decls: Decls = {}
  const clamp: Decls = {}
  const asVar = (prop: string, value: string | number, group: SheetVar['group'], cssProp: string) => {
    vars.push({ name: `${prefix}-${prop}-${vp}`, value, group })
    decls[cssProp] = `$$${prefix}-${prop}-${vp}`
  }
  if (next.family !== prev.family) asVar('font-family', fontStack(next.family), 'Typography', 'font-family')
  const sizeChanged = next.size !== prev.size || Boolean(next.fluid) !== Boolean(prev.fluid) || (next.fluid && next.minSize !== prev.minSize)
  if (sizeChanged) {
    const size = `$$${prefix}-font-size-${vp}`
    vars.push({ name: `${prefix}-font-size-${vp}`, value: `${next.size}px`, group: 'Typography' })
    if (next.fluid) {
      vars.push({ name: `${prefix}-font-size-min-${vp}`, value: `${next.minSize ?? 14}px`, group: 'Typography' })
      decls['font-size'] = fluidSize(next, size, `$$${prefix}-font-size-min-${vp}`, opts)
    } else {
      decls['font-size'] = size
    }
  }
  if (next.weight !== prev.weight) asVar('font-weight', next.weight, 'Typography', 'font-weight')
  if (next.color !== prev.color) asVar('color', next.color, 'Colors', 'color')
  if (next.lineHeight !== prev.lineHeight) decls['line-height'] = next.lineHeight
  if (next.letterSpacing !== prev.letterSpacing) decls['letter-spacing'] = next.letterSpacing ? `${next.letterSpacing}em` : 'normal'
  if (next.transform !== prev.transform) decls['text-transform'] = next.transform
  if (next.italic !== prev.italic) decls['font-style'] = next.italic ? 'italic' : 'normal'
  if (next.clamp !== prev.clamp || (next.clamp && next.lines !== prev.lines)) {
    Object.assign(
      clamp,
      next.clamp
        ? { display: '-webkit-box', '-webkit-line-clamp': next.lines, '-webkit-box-orient': 'vertical', overflow: 'hidden' }
        : { display: 'block', '-webkit-line-clamp': 'unset', overflow: 'visible' },
    )
  }
  return { vars, decls, clamp }
}

/** Typography for a whole responsive field: base styles + tablet/mobile overrides (only what changes). */
export function responsiveType(
  prefix: string,
  r: { desktop: Typography; tablet?: Typography; mobile?: Typography; at: Record<'desktop' | 'tablet' | 'mobile', Typography> },
  opts?: FluidOptions,
) {
  const base = typeStyles(prefix, r.desktop, opts)
  const tablet = typeOverride(prefix, r.at.desktop, r.tablet, 'tablet', opts)
  const mobile = typeOverride(prefix, r.at.tablet, r.mobile, 'mobile', opts)
  return { base, tablet, mobile, vars: [...base.vars, ...tablet.vars, ...mobile.vars] }
}

/** Scaled font size for smaller breakpoints, e.g. `calc($$title-font-size * 0.8)`. */
export const scaledSize = (prefix: string, factor: number) => `calc($$${prefix}-font-size * ${factor})`
