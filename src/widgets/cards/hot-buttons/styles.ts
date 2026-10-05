import { itemRow } from '@/tooling/itemRow'
import { widthDecls, widthVars } from '@/tooling/layout'
import { responsive, type ResponsiveValue, type Viewport } from '@/tooling/responsive'
import type { Decls, Rule, Sheet, SheetVar } from '@/tooling/stylesheet'
import { responsiveType } from '@/tooling/typography'
import type { HotButtonsConfig } from './schema'

const FLEX = { left: 'flex-start', center: 'center', right: 'flex-end' } as const
/** Icon position → flex-direction of the button (the icon comes first in the markup). */
const DIRECTION = { left: 'row', right: 'row-reverse', top: 'column', bottom: 'column-reverse' } as const

/** A px size as a variable, plus `-tablet` / `-mobile` variables only where it changes. */
function sizeVar(name: string, r: ResponsiveValue<number>) {
  const vars: SheetVar[] = [
    { name, value: `${r.desktop}px`, group: 'Layout' },
    ...(['tablet', 'mobile'] as const).flatMap((vp) => (r[vp] === undefined ? [] : [{ name: `${name}-${vp}`, value: `${r[vp]}px`, group: 'Layout' as const }])),
  ]
  /** The variable in effect at a viewport. */
  const at = (vp: Viewport) => (vp === 'mobile' && r.mobile !== undefined ? `$$${name}-mobile` : vp !== 'desktop' && r.tablet !== undefined ? `$$${name}-tablet` : `$$${name}`)
  return { vars, at, changed: (vp: 'tablet' | 'mobile') => r[vp] !== undefined }
}

export function styles(c: HotButtonsConfig): Sheet {
  const root = `#${c.widgetId}`
  const hover = '.hot-button-item:hover, .hot-button-item:focus-visible'

  // Responsive fields: desktop value + only what changes at tablet / mobile
  const perRowR = responsive(c, 'buttonsPerRow')
  const minR = responsive(c, 'buttonMinWidth')
  const posR = responsive(c, 'iconPosition')
  const alignR = responsive(c, 'contentAlign')
  const minHeight = sizeVar('hot-button-min-height', responsive(c, 'buttonMinHeight'))
  const padY = sizeVar('hot-button-padding-y', responsive(c, 'paddingY'))
  const padX = sizeVar('hot-button-padding-x', responsive(c, 'paddingX'))
  const iconSize = sizeVar('hot-button-icon-size', responsive(c, 'iconSize'))
  const iconGap = sizeVar('hot-button-icon-gap', responsive(c, 'iconGap'))
  const title = responsiveType('hot-button-title', responsive(c, 'titleFont'))

  // Buttons per row, min width and sizing: same row model as Cards Grid (tooling/itemRow)
  const row = itemRow({
    root,
    item: '.hot-button-item',
    name: 'hot-buttons',
    gap: c.gap,
    gapVar: 'hot-buttons-gap',
    minVar: 'hot-button-min-width',
    perRow: (vp) => Math.min(perRowR.at[vp], Math.max(1, c.buttonCount)),
    min: minR,
    sizing: responsive(c, 'buttonSizing'),
  })

  /** Icon position + alignment: a row aligns with justify-content, a column with align-items. */
  const layout = (vp: Viewport): Decls => {
    const column = posR.at[vp] === 'top' || posR.at[vp] === 'bottom'
    const a = FLEX[alignR.at[vp]]
    return {
      'flex-direction': DIRECTION[posR.at[vp]],
      'justify-content': column ? 'center' : a,
      'align-items': column ? a : 'center',
      'text-align': alignR.at[vp],
    }
  }

  /** Overrides for tablet / mobile: only declarations whose value changes at that viewport (same nesting as the base). */
  const at = (vp: 'tablet' | 'mobile'): Rule => {
    const layoutChanged = posR[vp] !== undefined || alignR[vp] !== undefined
    const padChanged = padY.changed(vp) || padX.changed(vp)
    return {
      sel: root,
      nest: [
        {
          sel: '.hot-button-item',
          decls: {
            ...row.itemOverride(vp),
            ...(layoutChanged ? layout(vp) : {}),
            gap: iconGap.changed(vp) ? iconGap.at(vp) : undefined,
            'min-height': minHeight.changed(vp) ? minHeight.at(vp) : undefined,
            padding: padChanged ? `${padY.at(vp)} ${padX.at(vp)}` : undefined,
          },
          nest: [
            { sel: '.hot-button-icon', decls: { width: iconSize.changed(vp) ? iconSize.at(vp) : undefined, height: iconSize.changed(vp) ? iconSize.at(vp) : undefined } },
            { sel: '.hot-button-title', decls: { ...title[vp].decls, ...title[vp].clamp } },
          ],
        },
      ],
    }
  }

  const minVars: SheetVar[] = [
    ...(minR.desktop ? [{ name: 'hot-button-min-width', value: `${minR.desktop}px`, group: 'Layout' as const }] : []),
    ...(['tablet', 'mobile'] as const).flatMap((vp) => (minR[vp] ? [{ name: `hot-button-min-width-${vp}`, value: `${minR[vp]}px`, group: 'Layout' as const }] : [])),
  ]

  return {
    scope: `.${c.widgetId}-container`,
    title: 'Hot Buttons',
    vars: [
      { name: 'hot-button-color', value: c.buttonColor, group: 'Colors' },
      { name: 'hot-button-hover-color', value: c.hoverColor, group: 'Colors' },
      { name: 'hot-button-hover-text-color', value: c.hoverTextColor, group: 'Colors' },
      { name: 'hot-button-border-color', value: c.borderColor, group: 'Colors' },
      ...title.vars,
      { name: 'hot-buttons-gap', value: `${c.gap}px`, group: 'Layout' },
      ...minVars,
      ...minHeight.vars,
      ...padY.vars,
      ...padX.vars,
      ...iconSize.vars,
      ...iconGap.vars,
      { name: 'hot-button-radius', value: `${c.borderRadius}px`, group: 'Layout' },
      { name: 'hot-button-border-width', value: `${c.borderWidth}px`, group: 'Layout' },
      ...widthVars(c, 'hot-buttons-max-width'),
    ],
    rules: [
      { sel: `.${c.widgetId}-container`, decls: { 'box-sizing': 'border-box', width: '100%' } }, // padding: shared widget spacing (tooling)
      {
        sel: root,
        decls: { 'box-sizing': 'border-box', ...row.rootDecls, ...widthDecls(c, 'hot-buttons-max-width'), margin: '0 auto' },
        nest: [
          {
            sel: '.hot-button-item',
            decls: {
              'box-sizing': 'border-box',
              display: 'flex',
              ...layout('desktop'),
              gap: iconGap.at('desktop'),
              ...row.itemDecls,
              'min-height': minHeight.at('desktop'),
              padding: `${padY.at('desktop')} ${padX.at('desktop')}`,
              'background-color': '$$hot-button-color',
              border: c.borderWidth ? '$$hot-button-border-width solid $$hot-button-border-color' : undefined,
              'border-radius': '$$hot-button-radius',
              'box-shadow': c.shadow ? '0 4px 12px rgba(0, 0, 0, 0.18)' : undefined,
              'text-decoration': 'none',
              transition: '0.3s',
            },
            nest: [
              {
                sel: '.hot-button-icon',
                decls: { display: 'block', 'flex-shrink': 0, width: iconSize.at('desktop'), height: iconSize.at('desktop'), 'object-fit': 'contain' },
              },
              { sel: '.hot-button-title', decls: { 'overflow-wrap': 'break-word', ...title.base.decls, ...title.base.clamp, transition: '0.3s' } },
            ],
          },
          {
            sel: hover,
            decls: { 'background-color': '$$hot-button-hover-color' },
            nest: [{ sel: '.hot-button-title', decls: { color: '$$hot-button-hover-text-color' } }],
          },
        ],
      },
      ...row.desktopQueries,
      { media: 'tablet', rules: [at('tablet'), ...row.mediaQueries('tablet')] },
      { media: 'mobile', rules: [at('mobile'), ...row.mediaQueries('mobile')] },
    ],
  }
}
