import { customButtonStyles } from '@/tooling/buttons'
import { widthDecls, widthVars } from '@/tooling/layout'
import { responsive, type Viewport } from '@/tooling/responsive'
import type { Decls, Rule, Sheet } from '@/tooling/stylesheet'
import { responsiveType } from '@/tooling/typography'
import { widgetIdOf } from './codegen'
import type { SeoBlockConfig } from './schema'

const FLEX = { left: 'flex-start', center: 'center', right: 'flex-end' } as const
const MARGIN = { left: '0 auto 0 0', center: '0 auto', right: '0 0 0 auto' } as const

export function styles(c: SeoBlockConfig): Sheet {
  const root = `#${widgetIdOf(c)}`

  // Responsive fields: desktop value + only what changes at tablet / mobile
  const align = responsive(c, 'alignment')
  const padY = responsive(c, 'paddingY')
  const padX = responsive(c, 'paddingX')
  const stack = responsive(c, 'buttonsStack')
  const title = responsiveType('seo-title', responsive(c, 'titleFont'))
  const title2 = responsiveType('seo-title-line2', responsive(c, 'title2Font'))
  const desc = responsiveType('seo-description', responsive(c, 'descriptionFont'))

  // Per-button overrides (only when "custom style" is on); `.button.button-N` beats the default `.button`
  const b1 = customButtonStyles('seo-button-1', '.button.button-1', c.button1Style)
  const b2 = customButtonStyles('seo-button-2', '.button.button-2', c.button2Style)
  const custom = [b1.rule, b2.rule].filter((r): r is Rule => r !== null)

  /** Rules for one viewport. Desktop gets every value; tablet/mobile only the ones that change (undefined = dropped). */
  const at = (vp: Viewport): Rule => {
    const d = vp === 'desktop'
    const a = d ? align.desktop : align[vp]
    const paddingChanged = d || padY[vp] !== undefined || padX[vp] !== undefined
    const s = d ? stack.desktop : stack[vp]
    const effAlign = align.at[vp]
    const effStack = stack.at[vp]
    const t = d ? title.base : title[vp]
    const t2 = d ? title2.base : title2[vp]
    const ds = d ? desc.base : desc[vp]

    // Stacked buttons keep their natural width and follow the alignment (align-items); in a row, justify-content.
    const stackChanged = !d && s !== undefined
    let buttonsAlign: string | undefined
    if (effStack && (d || stackChanged || a !== undefined)) buttonsAlign = FLEX[effAlign]
    else if (!effStack && stackChanged) buttonsAlign = 'normal'
    const buttons: Decls = {
      'justify-content': a && FLEX[a],
      'flex-direction': d ? (s ? 'column' : undefined) : stackChanged ? (s ? 'column' : 'row') : undefined,
      'align-items': buttonsAlign,
    }

    return {
      sel: root,
      decls: {
        'text-align': a,
        'align-items': a && FLEX[a],
        margin: a && c.widthMode !== 'full' ? MARGIN[a] : undefined,
        padding: paddingChanged ? `${padY.at[vp]}px ${padX.at[vp]}px` : undefined,
      },
      nest: [
        // Title line 1 typography is on the heading (a single line renders as plain text inside it)
        { sel: '.seo-title', decls: { 'align-items': a && FLEX[a], ...t.decls } },
        // Clamp goes on each line span when the title has two lines
        { sel: '.seo-title > span:first-child', decls: { ...t.clamp } },
        { sel: '.seo-title > span + span', decls: { ...t2.decls, ...t2.clamp } },
        { sel: '.seo-description', decls: { ...ds.decls, ...ds.clamp } },
        { sel: '.buttons-container', decls: buttons },
      ],
    }
  }

  const desktop = at('desktop')
  const nested = (sel: string) => desktop.nest!.find((r) => 'sel' in r && r.sel === sel)!.decls

  return {
    // The real markup has no wrapper of its own: the Spark widget container provides the spacing (wrapperSpacing: false)
    scope: root,
    title: 'SEO Block',
    vars: [
      { name: 'seo-bg-color', value: c.backgroundColor, group: 'Colors' },
      { name: 'seo-border-color', value: c.borderColor, group: 'Colors' },
      { name: 'seo-divider-color', value: c.dividerColor, group: 'Colors' },
      { name: 'seo-button-color', value: c.buttonColor, group: 'Colors' },
      ...title.vars,
      ...title2.vars,
      ...desc.vars,
      ...widthVars(c, 'seo-max-width'),
      { name: 'seo-radius', value: `${c.borderRadius}px`, group: 'Layout' },
      { name: 'seo-border-width', value: `${c.borderWidth}px`, group: 'Layout' },
      ...b1.vars,
      ...b2.vars,
    ],
    rules: [
      {
        sel: root,
        decls: {
          'box-sizing': 'border-box',
          display: 'flex',
          'flex-direction': 'column',
          gap: '20px', // the items' parts are siblings inside #{WidgetId} (no item wrapper in the Saffire markup)
          ...widthDecls(c, 'seo-max-width'),
          margin: c.widthMode === 'full' ? 0 : undefined,
          ...desktop.decls,
          'background-color': '$$seo-bg-color',
          'border-radius': '$$seo-radius',
          border: c.borderWidth ? '$$seo-border-width solid $$seo-border-color' : undefined,
        },
        nest: [
          { sel: '.seo-title', decls: { display: 'flex', 'flex-direction': 'column', margin: 0, ...nested('.seo-title') } },
          // Both line rules always exist in the base CSS, so tablet / mobile overrides (clamp, line 2 type) apply
          { sel: '.seo-title > span:first-child', decls: { display: 'block', ...nested('.seo-title > span:first-child') } },
          { sel: '.seo-title > span + span', decls: { display: 'block', ...nested('.seo-title > span + span') } },
          {
            sel: '.seo-divider',
            decls: { display: 'block', width: '100%', 'max-width': '290px', height: '6px', 'background-color': '$$seo-divider-color' },
          },
          { sel: '.seo-description', decls: { 'max-width': '620px', margin: 0, ...nested('.seo-description') } },
          // One <p> per paragraph
          { sel: '.seo-description p', decls: { margin: '0 0 0.75em' } },
          { sel: '.seo-description p:last-child', decls: { 'margin-bottom': 0 } },
          { sel: '.buttons-container', decls: { display: 'flex', 'flex-wrap': 'wrap', gap: '10px', ...nested('.buttons-container') } },
          {
            sel: '.button',
            decls: {
              display: 'inline-block',
              'box-sizing': 'border-box',
              padding: '16px 23px 14px',
              'border-radius': '40px',
              background: 'linear-gradient(142deg, $$seo-button-color 60%, #11325d 100%) 0% center / 290% auto',
              color: '#ffffff',
              'font-family': 'Poppins, sans-serif',
              'font-size': '16px',
              'font-weight': 700,
              'line-height': 1,
              'text-transform': 'uppercase',
              'text-decoration': 'none',
              transition: '0.3s',
            },
            nest: [{ sel: '&:hover, &:focus-visible', decls: { 'background-position': '100% center' } }],
          },
          ...custom,
        ],
      },
      { media: 'tablet', rules: [at('tablet')] },
      { media: 'mobile', rules: [at('mobile')] },
    ],
  }
}
