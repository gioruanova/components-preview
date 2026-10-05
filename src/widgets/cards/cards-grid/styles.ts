import { customButtonStyles } from '@/tooling/buttons'
import { widthDecls, widthVars } from '@/tooling/layout'
import { profile } from '@/tooling/outputProfile'
import { responsive, type Viewport } from '@/tooling/responsive'
import type { ContainerBlock, Rule, Sheet, SheetVar } from '@/tooling/stylesheet'
import { responsiveType } from '@/tooling/typography'
import type { CardsConfig } from './schema'

const V = { top: 'flex-start', center: 'center', bottom: 'flex-end' } as const
const H = { left: 'flex-start', center: 'center', right: 'flex-end' } as const

const GAP = 20
/** Container name of the grid: "Keep card size" picks the cards per row from its width. */
const GRID = 'cards-grid'

/** flex-basis for N cards per row with the shared gap. */
const basis = (n: number) => (n <= 1 ? '100%' : `calc((100% - ${n - 1} * $$cards-gap) / ${n})`)

export function styles(c: CardsConfig): Sheet {
  const circle = c.shape === 'circle'
  const hover = '.card-widget-item:not(.void-link):hover, .card-widget-item:not(.void-link):focus-within'

  // Responsive fields: desktop value + only what changes at tablet / mobile
  const perRowR = responsive(c, 'cardsPerRow')
  const perRow = (vp: Viewport) => Math.min(perRowR.at[vp], c.cardCount)
  const widthR = responsive(c, 'cardWidth')
  const heightR = responsive(c, 'cardHeight')
  const vertR = responsive(c, 'contentVertical')
  const horR = responsive(c, 'contentHorizontal')
  const minR = responsive(c, 'cardMinWidth')
  const arR = responsive(c, 'aspectRatio')
  const sizingR = responsive(c, 'cardSizing')
  const limitR = responsive(c, 'limitWidth')
  // the variable in effect at a viewport (overrides only exist where the value changes)
  const varAt = (r: { tablet?: unknown; mobile?: unknown }, name: string, vp: Viewport) =>
    vp === 'mobile' && r.mobile !== undefined ? `$$${name}-mobile` : vp !== 'desktop' && r.tablet !== undefined ? `$$${name}-tablet` : `$$${name}`
  const widthVarAt = (vp: Viewport) => varAt(widthR, 'card-width', vp)
  // Card sizing (both are a centered, wrapping flex row):
  // - 'stretch': cards grow into their row's leftover space (flex: 1 1), so a short last row gets wider cards.
  // - 'fixed': every card has the same width (flex: 0 1) and full rows fill the grid. The cards per row come from the
  //   grid width (container queries): k cards fit when width >= k * min + (k - 1) * gap, at most N. A short last row
  //   keeps the same card width and is centered.
  const fixed = (vp: Viewport) => sizingR.at[vp] === 'fixed'
  /** Cards per row for a grid width (fixed mode). */
  const fit = (vp: Viewport, width: number) => {
    const n = perRow(vp)
    const m = minR.at[vp]
    if (!m) return n
    return Math.max(1, Math.min(n, Math.floor((width + GAP) / (m + GAP))))
  }
  /** Grid widths at which one more card fits (fixed mode with a min width). */
  const steps = (vp: Viewport) => {
    const m = minR.at[vp]
    if (!fixed(vp) || !m) return []
    return Array.from({ length: perRow(vp) - 1 }, (_, i) => (i + 2) * m + (i + 1) * GAP)
  }
  // flex below the first step (stretch: always)
  const flex = (vp: Viewport) => (fixed(vp) ? `0 1 ${basis(fit(vp, 0))}` : `1 1 ${basis(perRow(vp))}`)
  const flexAt = (vp: Viewport, width: number) => (fixed(vp) ? `0 1 ${basis(fit(vp, width))}` : `1 1 ${basis(perRow(vp))}`)
  const cardRule = (decls: Rule['decls']): Rule => ({ sel: `#${c.widgetId}`, nest: [{ sel: '.card-widget-item', decls }] })
  const sizingKey = (vp: Viewport) => JSON.stringify([sizingR.at[vp], perRow(vp), minR.at[vp]])
  /**
   * Container queries of a viewport. In a media block the card's base `flex` comes later than every inherited query, so it
   * resets them; only this viewport's own steps follow (the grid is never wider than the viewport).
   */
  const queries = (vp: Viewport): ContainerBlock[] =>
    steps(vp)
      .filter((w) => vp === 'desktop' || w <= profile.breakpoints[vp])
      .map((w) => ({ container: GRID, minWidth: w, rules: [cardRule({ flex: flexAt(vp, w) })] }))
  // Fluid text scales with the CARD width (container query units), so long titles shrink instead of being cut
  const fluid = { unit: 'cqi', ref: widthR.desktop } as const
  const title = responsiveType('card-title', responsive(c, 'titleFont'), fluid)
  const desc = responsiveType('card-description', responsive(c, 'descriptionFont'), fluid)

  // Per-button overrides (only when "custom style" is on); `.button.button-N` beats the default `.button`
  const b1 = customButtonStyles('card-button-1', '.button.button-1', c.button1Style)
  const b2 = customButtonStyles('card-button-2', '.button.button-2', c.button2Style)
  const customButtons = [b1.rule, b2.rule].filter((r): r is Rule => r !== null)

  // Per-viewport size variables (only when they change)
  const sizeVars: SheetVar[] = []
  for (const vp of ['tablet', 'mobile'] as const) {
    if (widthR[vp] !== undefined) sizeVars.push({ name: `card-width-${vp}`, value: `${widthR[vp]}px`, group: 'Layout' })
    if (heightR[vp] !== undefined) sizeVars.push({ name: `card-height-${vp}`, value: `${heightR[vp]}px`, group: 'Layout' })
    if (minR[vp]) sizeVars.push({ name: `card-min-width-${vp}`, value: `${minR[vp]}px`, group: 'Layout' })
  }

  /** Overrides for tablet / mobile: only declarations whose value changes at that viewport. */
  const at = (vp: 'tablet' | 'mobile'): Rule => {
    const prev: Viewport = vp === 'tablet' ? 'desktop' : 'tablet'
    const h = horR[vp]
    const v = vertR[vp]
    const ar = arR[vp]
    const square = !circle
    // height: an aspect ratio wins; switching back to 'auto' restores the (effective) card height
    let height: string | undefined
    if (square && ar !== undefined) height = ar === 'auto' ? `${heightR.at[vp]}px` : 'auto'
    else if (square && heightR[vp] !== undefined && arR.at[vp] === 'auto') height = `$$card-height-${vp}`
    const min = minR[vp]
    const limit = limitR.at[vp]
    let maxWidth: string | undefined
    if (limit && (limitR[vp] !== undefined || widthR[vp] !== undefined)) maxWidth = widthVarAt(vp)
    else if (!limit && limitR[vp] !== undefined) maxWidth = 'none'
    const sizingChanged = sizingKey(vp) !== sizingKey(prev)
    return {
      sel: `#${c.widgetId}`,
      nest: [
        {
          sel: '.card-widget-item',
          decls: {
            // always re-set when the sizing changes: it also resets the inherited @container steps
            flex: sizingChanged ? flex(vp) : undefined,
            'max-width': maxWidth,
            height,
            'aspect-ratio': square && ar !== undefined ? ar : undefined,
            'min-width': min === undefined ? undefined : min ? `$$card-min-width-${vp}` : 0,
          },
          // Same nesting as the base rules → same specificity, so the media override wins
          nest: [
            { sel: '.card-content', decls: { 'justify-content': v && V[v], 'align-items': h && H[h], 'text-align': h } },
            { sel: '.widget-title-wrapper', decls: { 'justify-content': h && H[h], 'max-width': h && (h === 'center' ? '75%' : '90%') } },
            { sel: '.widget-title', decls: { ...title[vp].decls, ...title[vp].clamp } },
            { sel: '.hover-content', decls: { 'align-items': h && H[h] } },
            { sel: '.widget-description', decls: { ...desc[vp].decls, ...desc[vp].clamp } },
            { sel: '.cards-buttons-container', decls: { 'justify-content': h && H[h] } },
          ],
        },
      ],
    }
  }

  const h = horR.desktop
  const queried = (['desktop', 'tablet', 'mobile'] as const).some((vp) => steps(vp).length > 0)
  return {
    scope: `.${c.widgetId}-container`,
    title: 'Cards',
    vars: [
      { name: 'card-color', value: c.cardColor, group: 'Colors' },
      { name: 'card-border-color', value: c.borderColor, group: 'Colors' },
      ...title.vars,
      ...desc.vars,
      { name: 'card-width', value: `${widthR.desktop}px`, group: 'Layout' },
      { name: 'card-height', value: `${heightR.desktop}px`, group: 'Layout' },
      ...(minR.desktop ? [{ name: 'card-min-width', value: `${minR.desktop}px`, group: 'Layout' as const }] : []),
      ...sizeVars,
      { name: 'card-radius', value: circle ? '50%' : `${c.borderRadius}px`, group: 'Layout' },
      { name: 'card-border-width', value: `${c.borderWidth}px`, group: 'Layout' },
      { name: 'cards-gap', value: `${GAP}px`, group: 'Layout' },
      ...widthVars(c, 'cards-max-width'),
      ...b1.vars,
      ...b2.vars,
    ],
    rules: [
      { sel: `.${c.widgetId}-container`, decls: { 'box-sizing': 'border-box', width: '100%' } }, // padding: shared widget spacing (tooling)
      {
        sel: `#${c.widgetId}`,
        decls: {
          'box-sizing': 'border-box',
          display: 'flex',
          'flex-wrap': 'wrap',
          'justify-content': 'center',
          gap: '$$cards-gap',
          // "Keep card size" picks the cards per row from this width (@container below)
          'container-type': queried ? 'inline-size' : undefined,
          'container-name': queried ? GRID : undefined,
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
              flex: flex('desktop'),
              'min-width': minR.desktop ? '$$card-min-width' : undefined,
              'max-width': limitR.desktop ? '$$card-width' : undefined,
              height: circle || arR.desktop !== 'auto' ? 'auto' : '$$card-height',
              'aspect-ratio': circle ? 1 : arR.desktop !== 'auto' ? arR.desktop : undefined,
              'container-type': 'inline-size', // enables cqi units for fluid text
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
                  'justify-content': V[vertR.desktop],
                  'align-items': H[h],
                  gap: 0,
                  padding: circle ? '14%' : '16px',
                  'text-align': h,
                  transition: '0.3s',
                },
              },
              {
                sel: '.widget-title-wrapper',
                decls: {
                  'box-sizing': 'border-box',
                  display: 'flex',
                  'justify-content': H[h],
                  width: '100%',
                  'max-width': h === 'center' ? '75%' : '90%',
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
                  ...title.base.decls,
                  ...title.base.clamp,
                  // natural line breaks instead of awkward cuts
                  'overflow-wrap': 'break-word',
                  'text-wrap': 'balance',
                  'text-shadow': c.titleBackground ? undefined : '0 1px 3px rgba(0, 0, 0, 0.6)',
                },
              },
              {
                sel: '.hover-content',
                decls: {
                  display: 'flex',
                  'flex-direction': 'column',
                  'align-items': H[h],
                  gap: '10px',
                  width: '100%',
                  'max-height': 0,
                  opacity: 0,
                  overflow: 'hidden',
                  transition: '0.3s',
                },
              },
              { sel: '.widget-description', decls: { margin: 0, ...desc.base.decls, ...desc.base.clamp } },
              { sel: '.cards-buttons-container', decls: { display: 'flex', 'flex-wrap': 'wrap', 'justify-content': H[h], gap: '10px' } },
              {
                sel: '.button',
                decls: {
                  display: 'inline-block',
                  padding: '12px 20px 9px',
                  'border-radius': '40px',
                  border: '1px solid #ffffff',
                  background: 'transparent',
                  color: '#ffffff',
                  'font-family': 'Poppins, sans-serif',
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
      ...queries('desktop'),
      { media: 'tablet', rules: [at('tablet'), ...(sizingKey('tablet') !== sizingKey('desktop') ? queries('tablet') : [])] },
      { media: 'mobile', rules: [at('mobile'), ...(sizingKey('mobile') !== sizingKey('tablet') ? queries('mobile') : [])] },
    ],
  }
}
