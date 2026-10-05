import { describe, expect, it } from 'vitest'
import { toCss, toScss } from '@/tooling/stylesheet'
import { headerParts } from '../shared/markup'
import { codegen, toHtml } from './codegen'
import { defaults, TICKET_URL, type CenteredHeaderConfig } from './schema'
import { styles } from './styles'

const cfg = (o: Partial<CenteredHeaderConfig> = {}): CenteredHeaderConfig => ({ ...defaults, ...o })
const css = (o: Partial<CenteredHeaderConfig> = {}) => toCss([styles(cfg(o))])
const mobile = (s: string) => s.slice(s.indexOf('@media (max-width: 768px)'))
const rule = (s: string, sel: string) => s.slice(0, s.indexOf('@media')).match(new RegExp(`${sel.replace(/[.#]/g, '\\$&')} \\{([^}]*)\\}`))?.[1] ?? ''

describe('centered header markup (startercherry)', () => {
  it('three zones: countdown left, logo center, top items + ticket right; menu in its own bar', () => {
    const html = toHtml(defaults)
    expect(html).toMatch(/top-header-left">\s*<div class="header-countdown">/)
    expect(html).toMatch(/top-header-center">\s*<a href="\/" class="header-logo">/)
    expect(html).toMatch(/top-header-right">\s*<div class="top-content">[\s\S]*customTicketButton[\s\S]*<\/div>\s*<div class="mobile-nav-toggle"/)
    expect(html).toMatch(/<div class="bottom-header">\s*<nav class="nav"/)
  })

  it('defaults: logo, countdown, search, cart and ticket (the countdown fills the left side, as on cherry)', () => {
    const p = headerParts(defaults)
    expect([p.countdown, p.search, p.login, p.weather, p.hours, p.cart, Boolean(p.ticket)]).toEqual([true, true, null, false, null, true, true])
  })

  it('shares the element rules with the right-aligned header (ticket URL, visibility, data)', () => {
    expect(toHtml(defaults)).toContain(`href="${TICKET_URL}"`)
    expect(toHtml(cfg({ showCountdown: false, countdownMobile: false }))).not.toContain('header-countdown')
    const { data, script } = codegen(cfg({ widgetId: 'siteHeader' }))
    expect((data as { Layout: string }).Layout).toBe('centered')
    expect(script).toContain("const widgetName = 'siteHeader'")
  })
})

describe('centered header styles', () => {
  it('keeps the logo centered with 1fr | auto | 1fr zones and a full-width menu bar', () => {
    const s = css()
    expect(rule(s, '.top-header')).toContain('grid-template-columns: 1fr auto 1fr;')
    expect(rule(s, '.bottom-header')).toContain('background-color: var(--header-nav-bg);')
    expect(s).toContain('--header-nav-bg: #0659d4;')
    expect(rule(s, '.nav')).toContain('justify-content: center;')
  })

  it('collapses at its own breakpoint: zones dissolve into the shared mobile grid (ticket above the burger by default)', () => {
    const m = mobile(css())
    expect(m).toMatch(/\.top-header-left \{\s*display: contents;/)
    expect(m).toContain("grid-template-areas: 'logo top ticket ticket' 'countdown countdown countdown burger';")
    expect(mobile(css({ mobileTicket: 'beside' }))).toContain("grid-template-areas: 'logo top ticket burger' 'countdown countdown countdown countdown';")
    expect(m).toMatch(/\.nav \{\s*display: none;/)
    expect(css({ breakpoint: 1024 })).toContain('@media (max-width: 1024px) {')
  })

  it('fixed by default and outputs SCSS', () => {
    expect(css()).toMatch(/#customCenteredHeader \{[^}]*position: fixed;/)
    expect(toScss([styles(defaults)])).toContain('$header-nav-bg: #0659d4;')
  })
})
