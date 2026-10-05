import type { ResponsiveValue, Viewport } from './responsive'
import type { Decls, SheetVar } from './stylesheet'
import type { Config, LeafField } from './types'

/** Standard "Max width / 100%" option for a widget's own block. Add `widthMode` + `maxWidth` to the config. */
export type WidthConfig = { widthMode: 'max' | 'full'; maxWidth: number }

export function widthFields<C extends Config & WidthConfig>(range: { min: number; max: number } = { min: 320, max: 1920 }): LeafField<C>[] {
  return [
    {
      type: 'segmented',
      key: 'widthMode' as Extract<keyof C, string>,
      label: 'Width',
      options: [
        { value: 'max', label: 'Max width' },
        { value: 'full', label: '100%' },
      ],
    },
    {
      type: 'slider',
      key: 'maxWidth' as Extract<keyof C, string>,
      label: 'Max width',
      min: range.min,
      max: range.max,
      step: 10,
      unit: 'px',
      visibleWhen: (c) => c.widthMode === 'max',
    },
  ]
}

/** Width declarations for the block; `varName` is the max-width variable (only used in "max" mode). */
export function widthDecls(c: WidthConfig, varName: string): Decls {
  return { width: '100%', 'max-width': c.widthMode === 'full' ? 'none' : `$$${varName}` }
}

export function widthVars(c: WidthConfig, varName: string) {
  return c.widthMode === 'full' ? [] : [{ name: varName, value: `${c.maxWidth}px`, group: 'Layout' as const }]
}

/** A px size as a variable, plus `-tablet` / `-mobile` variables only where it changes. */
export function sizeVar(name: string, r: ResponsiveValue<number>) {
  const vars: SheetVar[] = [
    { name, value: `${r.desktop}px`, group: 'Layout' },
    ...(['tablet', 'mobile'] as const).flatMap((vp) => (r[vp] === undefined ? [] : [{ name: `${name}-${vp}`, value: `${r[vp]}px`, group: 'Layout' as const }])),
  ]
  /** The variable in effect at a viewport. */
  const at = (vp: Viewport) => (vp === 'mobile' && r.mobile !== undefined ? `$$${name}-mobile` : vp !== 'desktop' && r.tablet !== undefined ? `$$${name}-tablet` : `$$${name}`)
  return { vars, at, changed: (vp: 'tablet' | 'mobile') => r[vp] !== undefined }
}
