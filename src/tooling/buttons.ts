import type { Rule, SheetVar } from './stylesheet'
import { typeStyles, typography, type Typography } from './typography'

/**
 * Optional custom style for a single button. When `custom` is off the widget's default
 * button styles apply; when on, these values override them (only for that button).
 */
export type ButtonStyle = {
  custom: boolean
  background: string
  hoverBackground: string
  hoverColor: string
  radius: number
  borderWidth: number
  borderColor: string
  shadow: 'none' | 'sm' | 'md' | 'lg'
  paddingX: number
  paddingY: number
  font: Typography
}

export const SHADOWS: Record<ButtonStyle['shadow'], string | undefined> = {
  none: undefined,
  sm: '0 1px 3px rgba(0, 0, 0, 0.2)',
  md: '0 4px 12px rgba(0, 0, 0, 0.22)',
  lg: '0 10px 28px rgba(0, 0, 0, 0.28)',
}

export function buttonStyle(overrides: Partial<ButtonStyle> = {}): ButtonStyle {
  return {
    custom: false,
    background: '#0079c2',
    hoverBackground: '#11325d',
    hoverColor: '#ffffff',
    radius: 40,
    borderWidth: 0,
    borderColor: '#ffffff',
    shadow: 'none',
    paddingX: 23,
    paddingY: 15,
    font: typography({ size: 16, weight: 700, lineHeight: 1, color: '#ffffff', transform: 'uppercase' }),
    ...overrides,
  }
}

/**
 * Variables + rule for one custom button. `selector` must be more specific than the widget's
 * default `.button` rule (e.g. `.button.button-1`) so the custom values win.
 */
export function customButtonStyles(prefix: string, selector: string, b: ButtonStyle): { vars: SheetVar[]; rule: Rule | null } {
  if (!b.custom) return { vars: [], rule: null }
  const font = typeStyles(prefix, { ...b.font, clamp: false })
  return {
    vars: [
      { name: `${prefix}-bg`, value: b.background, group: 'Colors' },
      { name: `${prefix}-hover-bg`, value: b.hoverBackground, group: 'Colors' },
      { name: `${prefix}-hover-color`, value: b.hoverColor, group: 'Colors' },
      ...(b.borderWidth ? [{ name: `${prefix}-border-color`, value: b.borderColor, group: 'Colors' as const }] : []),
      ...font.vars,
      { name: `${prefix}-radius`, value: `${b.radius}px`, group: 'Layout' },
    ],
    rule: {
      sel: selector,
      decls: {
        background: '$$' + `${prefix}-bg`,
        ...font.decls,
        'border-radius': `$$${prefix}-radius`,
        border: b.borderWidth ? `${b.borderWidth}px solid $$${prefix}-border-color` : 'none',
        'box-shadow': SHADOWS[b.shadow] ?? 'none',
        padding: `${b.paddingY}px ${b.paddingX}px`,
        transition: '0.3s',
      },
      nest: [{ sel: '&:hover, &:focus-visible', decls: { background: `$$${prefix}-hover-bg`, color: `$$${prefix}-hover-color` } }],
    },
  }
}
