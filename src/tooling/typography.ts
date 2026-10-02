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
export function typeStyles(prefix: string, t: Typography): { vars: SheetVar[]; decls: Decls; clamp: Decls } {
  return {
    vars: [
      { name: `${prefix}-font-family`, value: fontStack(t.family), group: 'Typography' },
      { name: `${prefix}-font-size`, value: `${t.size}px`, group: 'Typography' },
      { name: `${prefix}-font-weight`, value: t.weight, group: 'Typography' },
      { name: `${prefix}-color`, value: t.color, group: 'Colors' },
    ],
    decls: {
      'font-family': `$$${prefix}-font-family`,
      'font-size': `$$${prefix}-font-size`,
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

/** Scaled font size for smaller breakpoints, e.g. `calc($$title-font-size * 0.8)`. */
export const scaledSize = (prefix: string, factor: number) => `calc($$${prefix}-font-size * ${factor})`
