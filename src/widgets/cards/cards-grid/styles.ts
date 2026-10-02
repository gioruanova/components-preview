import { customButtonStyles } from '@/tooling/buttons'
import { widthDecls, widthVars } from '@/tooling/layout'
import type { Rule, Sheet } from '@/tooling/stylesheet'
import { scaledSize, typeStyles } from '@/tooling/typography'
import type { CardsConfig } from './schema'

const V = { top: 'flex-start', center: 'center', bottom: 'flex-end' } as const
const H = { left: 'flex-start', center: 'center', right: 'flex-end' } as const

/** flex-basis for N cards per row with the shared gap. */
const basis = (n: number) => (n <= 1 ? '100%' : `calc((100% - ${n - 1} * $$cards-gap) / ${n})`)

export function styles(c: CardsConfig): Sheet {
  const title = typeStyles('card-title', c.titleFont)
  const desc = typeStyles('card-description', c.descriptionFont)
  const circle = c.shape === 'circle'
  const perRow = Math.min(c.cardsPerRow, c.cardCount)
  const item = (n: number): Rule => ({ sel: '.card-widget-item', decls: { flex: `${c.fitSpace ? '1 1' : '0 1'} ${basis(n)}` } })
  const hover = '.card-widget-item:not(.void-link):hover, .card-widget-item:not(.void-link):focus-within'
  // Per-button overrides (only when "custom style" is on); `.button.button-N` beats the default `.button`
  const b1 = customButtonStyles('card-button-1', '.button.button-1', c.button1Style)
  const b2 = customButtonStyles('card-button-2', '.button.button-2', c.button2Style)
  const customButtons = [b1.rule, b2.rule].filter((r): r is Rule => r !== null)

  return {
    scope: `.${c.widgetId}-container`,
    title: 'Cards',
    vars: [
      { name: 'card-color', value: c.cardColor, group: 'Colors' },
      { name: 'card-border-color', value: c.borderColor, group: 'Colors' },
      ...title.vars,
      ...desc.vars,
      { name: 'card-width', value: `${c.cardWidth}px`, group: 'Layout' },
      { name: 'card-height', value: `${c.cardHeight}px`, group: 'Layout' },
      { name: 'card-radius', value: circle ? '50%' : `${c.borderRadius}px`, group: 'Layout' },
      { name: 'card-border-width', value: `${c.borderWidth}px`, group: 'Layout' },
      { name: 'cards-gap', value: '20px', group: 'Layout' },
      ...widthVars(c, 'cards-max-width'),
      ...b1.vars,
      ...b2.vars,
    ],
    rules: [
      { sel: `.${c.widgetId}-container`, decls: { 'box-sizing': 'border-box', width: '100%', padding: '30px 15px 15px' } },
      {
        sel: `#${c.widgetId}`,
        decls: {
          'box-sizing': 'border-box',
          display: 'flex',
          'flex-wrap': 'wrap',
          'justify-content': 'center',
          gap: '$$cards-gap',
          ...widthDecls(c, 'cards-max-width'),
          margin: '0 auto',
        },
        nest: [
          {
            sel: '.card-widget-item',
            decls: {
              'box-sizing': 'border-box',
              position: 'relative',
              display: 'flex',
              overflow: 'hidden',
              flex: `${c.fitSpace ? '1 1' : '0 1'} ${basis(perRow)}`,
              'max-width': c.fitSpace ? undefined : '$$card-width',
              height: circle ? 'auto' : '$$card-height',
              'aspect-ratio': circle ? 1 : undefined,
              'background-color': '$$card-color',
              border: c.borderWidth ? '$$card-border-width solid $$card-border-color' : undefined,
              'border-radius': '$$card-radius',
              'box-shadow': '0 0 9px rgba(50, 50, 50, 0.6)',
              'text-decoration': 'none',
            },
            nest: [
              {
                sel: '.image-container',
                decls: {
                  position: 'absolute',
                  inset: 0,
                  'background-size': 'cover',
                  'background-position': 'center',
                  'background-repeat': 'no-repeat',
                  transform: 'scale(1)',
                  transition: '0.3s',
                },
              },
              {
                sel: '.overlay',
                decls: {
                  position: 'absolute',
                  left: 0,
                  bottom: '100%',
                  'z-index': 1,
                  width: '100%',
                  height: '100%',
                  'background-color': c.titleBackground ? '$$card-color' : 'rgba(0, 0, 0, 0.7)',
                  opacity: 0.94,
                  transition: '0.3s',
                },
              },
              {
                sel: '.card-content',
                decls: {
                  'box-sizing': 'border-box',
                  position: 'absolute',
                  inset: 0,
                  'z-index': 2,
                  display: 'flex',
                  'flex-direction': 'column',
                  'justify-content': V[c.contentVertical],
                  'align-items': H[c.contentHorizontal],
                  gap: 0,
                  padding: circle ? '14%' : '16px',
                  'text-align': c.contentHorizontal,
                  transition: '0.3s',
                },
              },
              {
                sel: '.widget-title-wrapper',
                decls: {
                  'box-sizing': 'border-box',
                  display: 'flex',
                  'justify-content': H[c.contentHorizontal],
                  width: '100%',
                  'max-width': c.contentHorizontal === 'center' ? '75%' : '90%',
                  padding: c.titleBackground ? '13px 16px' : '0',
                  'border-radius': '8px',
                  'background-color': c.titleBackground ? '$$card-color' : 'transparent',
                  transition: '0.3s',
                },
              },
              {
                sel: '.widget-title',
                decls: {
                  margin: 0,
                  ...title.decls,
                  ...title.clamp,
                  'text-shadow': c.titleBackground ? undefined : '0 1px 3px rgba(0, 0, 0, 0.6)',
                },
              },
              {
                sel: '.hover-content',
                decls: {
                  display: 'flex',
                  'flex-direction': 'column',
                  'align-items': H[c.contentHorizontal],
                  gap: '10px',
                  width: '100%',
                  'max-height': 0,
                  opacity: 0,
                  overflow: 'hidden',
                  transition: '0.3s',
                },
              },
              {
                sel: '.widget-description',
                decls: { margin: 0, ...desc.decls, ...desc.clamp },
              },
              { sel: '.cards-buttons-container', decls: { display: 'flex', 'flex-wrap': 'wrap', 'justify-content': H[c.contentHorizontal], gap: '10px' } },
              {
                sel: '.button',
                decls: {
                  display: 'inline-block',
                  padding: '12px 20px 9px',
                  'border-radius': '40px',
                  border: '1px solid #ffffff',
                  background: 'transparent',
                  color: '#ffffff',
                  'font-family': "'Poppins', sans-serif",
                  'font-size': '14px',
                  'font-weight': 700,
                  'line-height': 1,
                  'text-transform': 'uppercase',
                  'text-decoration': 'none',
                  transition: '0.3s',
                },
                nest: [{ sel: '&:hover, &:focus-visible', decls: { background: '#ffffff', color: '$$card-color' } }],
              },
              ...customButtons,
            ],
          },
          // Hover / focus reveal — same on every viewport. Non-interactive cards (.void-link) don't react.
          {
            sel: hover,
            nest: [
              { sel: '.overlay', decls: { bottom: 0 } },
              { sel: '.image-container', decls: { transform: 'scale(1.15)' } },
              { sel: '.card-content', decls: { gap: '10px' } },
              { sel: '.widget-title-wrapper', decls: { 'background-color': 'transparent', padding: '0' } },
              { sel: '.hover-content', decls: { 'max-height': '320px', opacity: 1 } },
            ],
          },
        ],
      },
      {
        media: 'tablet',
        rules: [{ sel: `#${c.widgetId}`, nest: [item(Math.min(perRow, 2)), { sel: '.widget-title', decls: { 'font-size': scaledSize('card-title', 0.85) } }] }],
      },
      {
        media: 'mobile',
        rules: [{ sel: `#${c.widgetId}`, nest: [item(1), { sel: '.widget-title', decls: { 'font-size': scaledSize('card-title', 0.8) } }] }],
      },
    ],
  }
}
