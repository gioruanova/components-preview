import { lines } from '@/tooling/codegen'
import type { WidgetCode } from '@/tooling/types'
import {
  baseData,
  burgerHtml,
  countdownHtml,
  headerClass,
  headerParts,
  headerScript,
  logoHtml,
  navHtml,
  spacerHtml,
  ticketHtml,
  topContentHtml,
} from '../shared/markup'
import type { HeaderConfig } from './schema'

export { headerParts, ICONS, NAV_ITEMS, SAMPLE } from '../shared/markup'

export const toData = (c: HeaderConfig) => ({ ...baseData(c), Layout: 'right-aligned', TicketPlacement: c.ticketPlacement })

/** startermango structure: everything is a grid item of `.headerInnerContent` (logo spans both rows, menu on the second). */
export function toHtml(c: HeaderConfig) {
  const p = headerParts(c)
  return lines(
    `<header class="${headerClass(c, `ticket-${c.ticketPlacement}`)}" id="${c.widgetId}">`,
    '  <span class="headerInnerContent">',
    ...logoHtml(4),
    ...countdownHtml(p, 4),
    ...topContentHtml(c, p, 4),
    ...ticketHtml(p, 4),
    ...burgerHtml(4),
    ...navHtml(4),
    '  </span>',
    '</header>',
    ...spacerHtml(c),
  )
}

export const toScript = (c: HeaderConfig) => headerScript(c)

export function codegen(c: HeaderConfig): WidgetCode {
  return { html: toHtml(c), script: toScript(c), data: toData(c) }
}
