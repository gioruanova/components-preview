import { widthDecls, widthVars } from '@/tooling/layout'
import { customButtonStyles } from '@/tooling/buttons'
import type { Rule, Sheet } from '@/tooling/stylesheet'
import { scaledSize, typeStyles } from '@/tooling/typography'
import type { SeoBlockConfig } from './schema'

const FLEX = { left: 'flex-start', center: 'center', right: 'flex-end' } as const
const MARGIN = { left: '0 auto 0 0', center: '0 auto', right: '0 0 0 auto' } as const

export function styles(c: SeoBlockConfig): Sheet {
  const title = typeStyles('seo-title', c.titleFont)
  const title2 = typeStyles('seo-title-line2', c.title2Font)
  const desc = typeStyles('seo-description', c.descriptionFont)
  // Per-button overrides (only when "custom style" is on); `.button.button-N` beats the default `.button`
  const b1 = customButtonStyles('seo-button-1', '.button.button-1', c.button1Style)
  const b2 = customButtonStyles('seo-button-2', '.button.button-2', c.button2Style)
  const custom = [b1.rule, b2.rule].filter((r): r is Rule => r !== null)

  return {
    scope: `.${c.widgetId}-signup-container`,
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
      { sel: `.${c.widgetId}-signup-container`, decls: { 'box-sizing': 'border-box', display: 'flex', padding: '20px 15px' } },
      {
        sel: `#${c.widgetId}`,
        decls: {
          'box-sizing': 'border-box',
          display: 'flex',
          'flex-direction': 'column',
          'align-items': FLEX[c.alignment],
          'text-align': c.alignment,
          gap: '20px',
          ...widthDecls(c, 'seo-max-width'),
          margin: c.widthMode === 'full' ? 0 : MARGIN[c.alignment],
          padding: '50px',
          'background-color': '$$seo-bg-color',
          'border-radius': '$$seo-radius',
          border: c.borderWidth ? '$$seo-border-width solid $$seo-border-color' : undefined,
        },
        nest: [
          { sel: '.seo-title', decls: { display: 'flex', 'flex-direction': 'column', 'align-items': FLEX[c.alignment], margin: 0, ...title.decls } },
          // Clamp goes on each line, so the divider inside the heading is never cut off
          { sel: '.seo-title-line1', decls: { display: 'block', ...title.clamp } },
          { sel: '.seo-title-line2', decls: { display: 'block', ...title2.decls, ...title2.clamp } },
          {
            sel: '.seo-divider',
            decls: { display: 'block', width: '100%', 'max-width': '290px', height: '6px', 'margin-top': '15px', 'background-color': '$$seo-divider-color' },
          },
          { sel: '.seo-description', decls: { 'max-width': '620px', margin: 0, ...desc.decls, ...desc.clamp } },
          { sel: '.buttons-container', decls: { display: 'flex', 'flex-wrap': 'wrap', 'justify-content': FLEX[c.alignment], gap: '10px' } },
          {
            sel: '.button',
            decls: {
              display: 'inline-block',
              'box-sizing': 'border-box',
              padding: '16px 23px 14px',
              'border-radius': '40px',
              background: 'linear-gradient(142deg, $$seo-button-color 60%, #11325d 100%) 0% center / 290% auto',
              color: '#ffffff',
              'font-family': "'Poppins', sans-serif",
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
      {
        media: 'tablet',
        rules: [
          {
            sel: `#${c.widgetId}`,
            decls: { padding: '40px 24px' },
            nest: [
              { sel: '.seo-title', decls: { 'font-size': scaledSize('seo-title', 0.85) } },
              { sel: '.seo-title-line2', decls: { 'font-size': scaledSize('seo-title-line2', 0.85) } },
            ],
          },
        ],
      },
      {
        media: 'mobile',
        rules: [
          {
            sel: `#${c.widgetId}`,
            decls: { padding: '32px 16px' },
            nest: [
              { sel: '.seo-title', decls: { 'font-size': scaledSize('seo-title', 0.75) } },
              { sel: '.seo-title-line2', decls: { 'font-size': scaledSize('seo-title-line2', 0.75) } },
              // Stack buttons at their natural width, following the content alignment
              { sel: '.buttons-container', decls: { 'flex-direction': 'column', 'align-items': FLEX[c.alignment] } },
            ],
          },
        ],
      },
    ],
  }
}
