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
import type { CenteredHeaderConfig } from './schema'

export const toData = (c: CenteredHeaderConfig) => ({ ...baseData(c), Layout: 'centered' })

/** startercherry structure: a three-zone top row (countdown | logo | top items + ticket) and a full-width menu bar. */
export function toHtml(c: CenteredHeaderConfig) {
  const p = headerParts(c)
  return lines(
    `<header class="${headerClass(c, 'header-centered')}" id="${c.widgetId}">`,
    '  <span class="headerInnerContent">',
    '    <div class="top-header">',
    '      <div class="top-header-left">',
    ...countdownHtml(p, 8),
    '      </div>',
    '      <div class="top-header-center">',
    ...logoHtml(8),
    '      </div>',
    '      <div class="top-header-right">',
    ...topContentHtml(c, p, 8),
    ...ticketHtml(p, 8),
    '      </div>',
    ...burgerHtml(p, 6),
    '    </div>',
    p.nav && '    <div class="bottom-header">',
    ...navHtml(p, 6),
    p.nav && '    </div>',
    '  </span>',
    '</header>',
    ...spacerHtml(c),
  )
}

export const toScript = (c: CenteredHeaderConfig) => headerScript(c)

export function codegen(c: CenteredHeaderConfig): WidgetCode {
  return { html: toHtml(c), script: toScript(c), data: toData(c) }
}
