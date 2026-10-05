import { describe, expect, it } from 'vitest'
import { toCss, toScss } from '@/tooling/stylesheet'
import { codegen, headerParts, toHtml } from './codegen'
import { COUNTDOWN_SOURCE, defaults, TICKET_URL, type HeaderConfig } from './schema'
import { styles } from './styles'

/** Defaults show only logo, search, cart and ticket: most rules are tested with the countdown and hours on too. */
const full: HeaderConfig = { ...defaults, showCountdown: true, countdownMobile: true, showHours: true }
const cfg = (o: Partial<HeaderConfig>): HeaderConfig => ({ ...full, ...o })
const css = (o: Partial<HeaderConfig> = {}) => toCss([styles(cfg(o))])
/** The collapsed header: one media block at the header's own breakpoint (no tablet step). */
const tablet = (s: string) => s.slice(s.indexOf('@media (max-width: 768px)'))
/** Declarations of a desktop rule. */
const rule = (s: string, sel: string) => s.slice(0, s.indexOf('@media')).match(new RegExp(`${sel.replace(/[.#]/g, '\\$&')} \\{([^}]*)\\}`))?.[1] ?? ''

describe('header markup', () => {
  it('renders only logo, search, cart and ticket by default', () => {
    const p = headerParts(defaults)
    expect([p.countdown, p.search, p.login, p.weather, p.hours, p.cart, Boolean(p.ticket)]).toEqual([false, true, null, false, null, true, true])
  })

  it('renders the top container items in order, only when shown', () => {
    const all = toHtml(cfg({ showSearch: true, showLogin: true, showWeather: true, showHours: true, showCart: true }))
    const order = ['searchBox', 'header-login', 'header-weather', 'header-hours', 'viewcart'].map((cls) => all.indexOf(`class="${cls}`))
    expect(order.every((i) => i > 0)).toBe(true)
    expect([...order].sort((a, b) => a - b)).toEqual(order)
    const none = toHtml(cfg({ showSearch: false, showLogin: false, showWeather: false, showHours: false, showCart: false }))
    expect(none).not.toMatch(/searchBox|header-login|header-weather|header-hours|viewcart/)
  })

  it('renders login and hours links only with a label and a URL', () => {
    expect(headerParts(cfg({ showLogin: true, loginUrl: '' })).login).toBeNull()
    expect(headerParts(cfg({ showHours: true, hoursLabel: ' ' })).hours).toBeNull()
    expect(headerParts(cfg({ showLogin: true })).login).toEqual({ label: 'Login', url: '/account/login' })
  })

  it('the ticket button only needs a label and always links to the default ticket page', () => {
    expect(headerParts(full).ticket).toEqual({ label: 'Buy Tickets', url: TICKET_URL })
    expect(toHtml(full)).toContain(`href="${TICKET_URL}"`)
    expect(headerParts(cfg({ ticketLabel: '' })).ticket).toBeNull()
    expect(toHtml(cfg({ ticketLabel: '' }))).not.toContain('customTicketButton')
  })

  it('countdown: two lines from Site settings (not widget content) and an optional plain-color icon', () => {
    const html = toHtml(full)
    expect(html).toMatch(/countdown-date">\$\{CountdownDate\}[\s\S]*countdown-event">\$\{CountdownEventName\}/)
    expect(html).toContain(COUNTDOWN_SOURCE)
    expect('countdownDate' in full).toBe(false) // not edited in the widget
    expect(html).toContain(`<span class="countdown-icon-glyph" style="mask-image: url('\${CountdownIcon}')"></span>`)
    expect(toHtml(cfg({ showCountdownIcon: false }))).not.toContain('countdown-icon')
    expect(toHtml(cfg({ showCountdown: false, countdownMobile: false }))).not.toContain('header-countdown')
    expect(toHtml(cfg({ showCountdown: false, countdownMobile: true }))).toContain('header-countdown') // mobile only
  })

  it('every element is in the markup when it is on for desktop or for mobile', () => {
    expect(headerParts(cfg({ showSearch: false, searchMobile: true })).search).toBe(true)
    expect(headerParts(cfg({ showCart: false, cartMobile: false })).cart).toBe(false)
    expect(headerParts(cfg({ showLogin: false, loginMobile: true })).login).toEqual({ label: 'Login', url: '/account/login' })
  })

  it('search: optional word, closed / open mode; hours pin icon optional; burger always there', () => {
    expect(toHtml(full)).not.toContain('searchBoxLabel')
    expect(toHtml(cfg({ showSearchWord: true }))).toContain('searchBoxLabel')
    expect(toHtml(cfg({ searchMode: 'open' }))).toContain('searchBox search-open')
    expect(toHtml(cfg({ showHoursIcon: false }))).not.toMatch(/header-hours"><svg/)
    expect(toHtml(full)).toContain('mobile-nav-toggle')
  })

  it('outputs data with asset paths and the widget ID in the script', () => {
    const { data, script } = codegen(cfg({ widgetId: 'siteHeader' }))
    const d = data as { Logo: string; Countdown: { Icon: string; Source: string }; TicketButton: { URL: string } }
    expect(d.Countdown.Source).toBe(COUNTDOWN_SOURCE)
    expect(d.Logo).toBe('/assets/logo/saffire-logo-blue.png')
    expect(d.Countdown.Icon).toBe('/assets/icons/calendar.svg')
    expect(d.TicketButton.URL).toBe(TICKET_URL)
    expect(script).toContain("const widgetName = 'siteHeader'")
    expect(toHtml(cfg({ widgetId: 'siteHeader' }))).toContain('id="siteHeader"')
  })
})

describe('header styles', () => {
  it('ticket placement moves the button between the top row and the navigation row', () => {
    expect(rule(css(), '.headerInnerContent')).toContain("grid-template-areas: 'logo countdown top ticket' 'logo nav nav nav';")
    expect(rule(css({ ticketPlacement: 'nav' }), '.headerInnerContent')).toContain("grid-template-areas: 'logo countdown top top' 'logo nav nav ticket';")
    expect(rule(css({ showCountdown: false }), '.headerInnerContent')).toContain("'logo top ticket' 'logo nav nav'")
  })

  it('collapses at the tablet breakpoint: burger always shown, menu hidden until opened, countdown at the bottom', () => {
    const t = tablet(css())
    expect(t).toMatch(/\.mobile-nav-toggle \{\s*display: grid;/)
    expect(t).toMatch(/\.nav \{\s*display: none;/)
    expect(t).toMatch(/\.nav\.is-open \{\s*display: block;/)
    expect(t).toContain("grid-template-areas: 'logo top ticket burger' 'nav nav nav nav' 'countdown countdown countdown countdown';")
    expect(tablet(css({ countdownMobile: false }))).toContain("grid-template-areas: 'logo top ticket burger' 'nav nav nav nav';")
  })

  it('desktop and mobile visibility are independent for every element', () => {
    // desktop on, mobile off → hidden in the collapsed header
    const t = tablet(css({ showLogin: true, loginMobile: false, cartMobile: true }))
    expect(t).toMatch(/\.searchBox \{\s*display: none;/)
    expect(t).toMatch(/\.header-login \{[^}]*display: none;/)
    expect(t).not.toMatch(/\.viewcart \{\s*display: none;/)
    // desktop off, mobile on → hidden on desktop, shown in the collapsed header
    const mobileOnly = css({ showWeather: false, weatherMobile: true, showCountdown: false, countdownMobile: true })
    expect(rule(mobileOnly, '.header-weather')).toContain('display: none;')
    expect(tablet(mobileOnly)).toMatch(/\.header-weather \{[^}]*display: inline-flex;/)
    expect(rule(mobileOnly, '.header-countdown')).toContain('display: none;')
    expect(tablet(mobileOnly)).toMatch(/\.header-countdown \{\s*display: flex;/)
    expect(rule(mobileOnly, '.headerInnerContent')).not.toContain('countdown') // no desktop column
  })

  it('fixed header: position fixed + a spacer that the script keeps at the header height', () => {
    expect(css()).toMatch(/#customHeader \{[^}]*position: fixed;/)
    expect(css()).toMatch(/#customHeader \+ \.header-spacer \{\s*display: block;/)
    expect(toHtml(full)).toContain('<div class="header-spacer" aria-hidden="true"></div>')
    expect(codegen(full).script).toContain('new ResizeObserver(sync).observe($header[0])')
    const normal = cfg({ fixed: false })
    expect(css({ fixed: false })).toMatch(/#customHeader \{[^}]*position: relative;/)
    expect(toHtml(normal)).not.toContain('header-spacer')
    expect(codegen(normal).script).not.toContain('ResizeObserver')
  })

  it('mobile ticket: next to the burger, or above it with the countdown lined up with the burger', () => {
    expect(tablet(css({ mobileTicket: 'above' }))).toContain(
      "grid-template-areas: 'logo top ticket ticket' 'countdown countdown countdown burger' 'nav nav nav nav';",
    )
    expect(tablet(css({ mobileTicket: 'above', countdownMobile: false }))).toContain(
      "grid-template-areas: 'logo top ticket ticket' 'logo top burger burger' 'nav nav nav nav';",
    )
    expect(tablet(css({ mobileTicket: 'above', ticketLabel: '' }))).toContain("'logo top burger' 'nav nav nav'") // no ticket → one row
  })

  it('countdown icon: one plain color, transparent background by default', () => {
    const s = css()
    expect(rule(s, '.countdown-icon-glyph')).toContain('background-color: var(--header-countdown-icon-color);')
    expect(rule(s, '.countdown-icon-glyph')).toContain('mask-size: contain;')
    expect(s).toContain('--header-countdown-icon-bg: #0000;')
    expect(rule(s, '.countdown-icon')).toContain('padding: 0;')
    expect(rule(css({ countdownIconBackground: '#0079c2' }), '.countdown-icon')).toContain('padding: 18%;')
  })

  it('search closed opens on hover; open is always visible', () => {
    const closed = css()
    expect(rule(closed, '.searchBoxInput')).toContain('width: 0;')
    expect(closed).toMatch(/:focus-within \.searchBoxInput \{\s*width: var\(--header-search-input-width\);/)
    expect(rule(css({ searchMode: 'open' }), '.searchBoxInput')).toContain('width: var(--header-search-input-width);')
  })

  it('hover colors for search word, hours and cart; ticket custom style overrides the default', () => {
    expect(css({ showSearchWord: true })).toMatch(/:focus-within \.searchBoxLabel \{\s*color: var\(--header-search-hover-color\);/)
    expect(css()).toMatch(/\.header-hours:focus-visible \{\s*color: var\(--header-hours-hover-color\);/)
    expect(css()).toMatch(/\.cartMenuLink:focus-visible \{\s*color: var\(--header-cart-hover-color\);/)
    expect(css()).not.toContain('--header-ticket-bg')
    expect(css({ ticketStyle: { ...defaults.ticketStyle, custom: true } })).toContain('#customTicketButton .button.alternative-btn {')
  })

  it('collapses at its own custom breakpoint: one media block, no tablet step', () => {
    const s = css({ breakpoint: 1024 })
    expect(s.match(/@media/g)).toHaveLength(1)
    expect(s).toContain('@media (max-width: 1024px) {')
    expect(toScss([styles(cfg({ breakpoint: 1024 }))])).toContain('@media (max-width: 1024px) {')
  })

  it('logo width and countdown typography change per viewport', () => {
    const s = css()
    expect(s).toContain('--header-logo-width-mobile: 110px;')
    expect(tablet(s)).toMatch(/\.header-logo \{\s*width: var\(--header-logo-width-mobile\);/)
    expect(toScss([styles(full)])).toContain('$header-bg: #fff;')
  })
})
