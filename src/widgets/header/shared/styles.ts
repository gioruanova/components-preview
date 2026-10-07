import { customButtonStyles } from '@/tooling/buttons'
import { sizeVar, widthVars } from '@/tooling/layout'
import { responsive } from '@/tooling/responsive'
import type { Decls, Rule, SheetVar } from '@/tooling/stylesheet'
import { responsiveType } from '@/tooling/typography'
import type { HeaderBaseConfig } from './config'
import { headerParts, type HeaderParts } from './markup'

/** #rrggbb00 / #rgb0 / 'transparent' */
const isTransparent = (v: string) => /^transparent$|^#([0-9a-f]{3}0|[0-9a-f]{6}00)$/i.test(v.trim())
export const quote = (rows: string[][]) => rows.map((r) => `'${r.join(' ')}'`).join(' ')

/** What differs between header layouts in the shared element styles. */
export type HeaderLook = {
  ticket: { background: string; hoverBackground: string; radius: string; padding: string }
  nav: { color: string; hoverColor: string; transform: string; padding: string }
}

/**
 * Collapsed grid (below the breakpoint), shared by every header. `nav`: the menu is a grid item (right-aligned) or lives
 * in its own bar below (centered). Ticket next to the burger: one row (+ menu) + countdown at the very bottom.
 * Ticket above the burger: the countdown lines up with the burger.
 */
export function collapsedAreas(c: HeaderBaseConfig, p: HeaderParts, navRow: boolean): Decls {
  const countdown = p.countdown && c.countdownMobile
  const withNav = navRow && p.nav
  // no navigation = no burger: "above the burger" falls back to one row
  if (p.ticket && p.nav && c.mobileTicket === 'above') {
    // the ticket spans two columns and the burger only the last one, so the countdown can use the space left of the burger
    const rows = [
      ['logo', 'top', 'ticket', 'ticket'],
      countdown ? ['countdown', 'countdown', 'countdown', 'burger'] : ['logo', 'top', 'burger', 'burger'],
      ...(withNav ? [['nav', 'nav', 'nav', 'nav']] : []),
    ]
    return { 'grid-template-columns': 'auto 1fr auto auto', 'grid-template-areas': quote(rows) }
  }
  const cols = ['logo', 'top', ...(p.ticket ? ['ticket'] : []), ...(p.nav ? ['burger'] : [])]
  const rows = [cols, ...(withNav ? [cols.map(() => 'nav')] : []), ...(countdown ? [cols.map(() => 'countdown')] : [])]
  return { 'grid-template-columns': cols.map((a) => (a === 'top' ? '1fr' : 'auto')).join(' '), 'grid-template-areas': quote(rows) }
}

/** Element styles, variables and mobile overrides shared by every header layout. */
export function headerElementStyles(c: HeaderBaseConfig, look: HeaderLook) {
  const p = headerParts(c)
  const date = responsiveType('header-date', responsive(c, 'dateFont'))
  const event = responsiveType('header-event', responsive(c, 'eventFont'))
  const search = responsiveType('header-search', responsive(c, 'searchFont'))
  const login = responsiveType('header-login', responsive(c, 'loginFont'))
  const weather = responsiveType('header-weather', responsive(c, 'weatherFont'))
  const hours = responsiveType('header-hours', responsive(c, 'hoursFont'))
  const cart = responsiveType('header-cart', responsive(c, 'cartFont'))
  const logoWidth = sizeVar('header-logo-width', responsive(c, 'logoWidth'))
  const ticket = customButtonStyles('header-ticket', '#customTicketButton .button.alternative-btn', c.ticketStyle)
  const text = (t: { decls: Decls; clamp: Decls }) => ({ ...t.decls, ...t.clamp })
  const linkBase: Decls = { display: 'inline-flex', 'align-items': 'center', gap: '6px', 'text-decoration': 'none', transition: 'color 0.3s' }

  const vars: SheetVar[] = [
    { name: 'header-bg', value: c.headerBackground, group: 'Colors' },
    ...(p.nav
      ? [
          { name: 'header-burger-color', value: c.burgerColor, group: 'Colors' as const },
          { name: 'header-nav-color', value: look.nav.color, group: 'Colors' as const },
          { name: 'header-nav-hover-color', value: look.nav.hoverColor, group: 'Colors' as const },
        ]
      : []),
    ...(p.ticket
      ? [
          { name: 'header-ticket-default-bg', value: look.ticket.background, group: 'Colors' as const },
          { name: 'header-ticket-default-hover-bg', value: look.ticket.hoverBackground, group: 'Colors' as const },
        ]
      : []),
    ...(p.countdown && p.countdownIcon
      ? [
          { name: 'header-countdown-icon-color', value: c.countdownIconColor, group: 'Colors' as const },
          { name: 'header-countdown-icon-bg', value: c.countdownIconBackground, group: 'Colors' as const },
        ]
      : []),
    ...(p.search
      ? [
          { name: 'header-search-icon-bg', value: c.searchIconBackground, group: 'Colors' as const },
          { name: 'header-search-icon-color', value: c.searchIconColor, group: 'Colors' as const },
          { name: 'header-search-hover-bg', value: c.searchHoverBackground, group: 'Colors' as const },
          { name: 'header-search-input-bg', value: c.searchInputBackground, group: 'Colors' as const },
          { name: 'header-search-input-border', value: c.searchInputBorder, group: 'Colors' as const },
          { name: 'header-search-hover-color', value: c.searchHoverColor, group: 'Colors' as const },
        ]
      : []),
    ...(p.hours ? [{ name: 'header-hours-hover-color', value: c.hoursHoverColor, group: 'Colors' as const }] : []),
    ...(p.cart
      ? [
          { name: 'header-cart-bg', value: c.cartBackground, group: 'Colors' as const },
          { name: 'header-cart-hover-color', value: c.cartHoverColor, group: 'Colors' as const },
        ]
      : []),
    ...(p.countdown ? [...date.vars, ...event.vars] : []),
    ...(p.search ? search.vars : []),
    ...(p.login ? login.vars : []),
    ...(p.weather ? weather.vars : []),
    ...(p.hours ? hours.vars : []),
    ...(p.cart ? cart.vars : []),
    ...widthVars(c, 'header-max-width'),
    ...logoWidth.vars,
    ...(p.countdown && p.countdownIcon ? [{ name: 'header-countdown-icon-size', value: `${c.countdownIconSize}px`, group: 'Layout' as const }] : []),
    { name: 'header-search-input-width', value: '180px', group: 'Layout' },
    ...(p.ticket ? ticket.vars : []),
  ]

  /** Root decls: background, shadow and the fixed behavior. */
  const root: Decls = {
    'box-sizing': 'border-box',
    display: 'block',
    width: '100%',
    // fixed (not sticky): our platform needs position: fixed; the spacer after the header keeps the content below it
    position: c.fixed ? 'fixed' : 'relative',
    top: c.fixed ? 0 : undefined,
    left: c.fixed ? 0 : undefined,
    'z-index': c.fixed ? 1000 : undefined,
    'background-color': '$$header-bg',
    'box-shadow': c.headerShadow ? '0 0 3px 3px rgba(158, 158, 158, 0.31)' : undefined,
  }

  // grid-area names are used by every grid that places these elements (desktop grids and the collapsed grid)
  const elements: Rule[] = [
    ...(c.fixed ? [{ sel: '& + .header-spacer', decls: { display: 'block' } }] : []),
    { sel: '.header-logo', decls: { 'grid-area': 'logo', display: 'block', width: logoWidth.at('desktop'), 'align-self': 'center' } },
    { sel: '.header-logo img', decls: { display: 'block', width: '100%', height: 'auto' } },
    ...(p.countdown
      ? [
          { sel: '.header-countdown', decls: { 'grid-area': 'countdown', display: c.showCountdown ? 'flex' : 'none', 'align-items': 'center', gap: '10px', 'min-width': 0 } },
          ...(p.countdownIcon
            ? [
                {
                  sel: '.countdown-icon',
                  decls: {
                    'box-sizing': 'border-box',
                    display: 'grid',
                    'flex-shrink': 0,
                    'place-items': 'center',
                    width: '$$header-countdown-icon-size',
                    height: '$$header-countdown-icon-size',
                    // a transparent background needs no inner space; a colored one frames the icon
                    padding: isTransparent(c.countdownIconBackground) ? 0 : '18%',
                    'border-radius': '50%',
                    'background-color': '$$header-countdown-icon-bg',
                  },
                },
                // the icon is a mask painted in one plain color (mask-image comes from the markup)
                {
                  sel: '.countdown-icon-glyph',
                  decls: {
                    display: 'block',
                    width: '100%',
                    height: '100%',
                    'background-color': '$$header-countdown-icon-color',
                    'mask-position': 'center',
                    'mask-repeat': 'no-repeat',
                    'mask-size': 'contain',
                  },
                },
              ]
            : []),
          { sel: '.countdown-text', decls: { display: 'flex', 'flex-direction': 'column', 'min-width': 0 } },
          { sel: '.countdown-date', decls: text(date.base) },
          { sel: '.countdown-event', decls: text(event.base) },
        ]
      : []),
    { sel: '.top-content', decls: { 'grid-area': 'top', display: 'flex', 'flex-wrap': 'wrap', 'justify-content': 'flex-end', 'align-items': 'center', gap: '20px', 'min-width': 0 } },
    { sel: '.header-icon', decls: { display: 'block', 'flex-shrink': 0, width: '20px', height: '20px' } },
    ...(p.search
      ? [
          { sel: '.searchBox', decls: { display: c.showSearch ? 'flex' : 'none', 'align-items': 'center', gap: '8px' } },
          {
            sel: '.searchBoxClicker',
            decls: {
              display: 'grid',
              'place-items': 'center',
              width: '40px',
              height: '40px',
              padding: 0,
              border: 0,
              'border-radius': '5px',
              'background-color': '$$header-search-icon-bg',
              color: '$$header-search-icon-color',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
            },
          },
          // closed: the input opens on hover / focus; open: always visible. It sits left of the icon.
          { sel: '.searchBoxInput', decls: { order: -1, width: c.searchMode === 'closed' ? 0 : '$$header-search-input-width', overflow: 'hidden', transition: 'width 0.3s' } },
          {
            sel: '.searchBoxInput input',
            decls: {
              'box-sizing': 'border-box',
              width: '$$header-search-input-width',
              height: '40px',
              padding: '0 12px',
              border: '1px solid $$header-search-input-border',
              'border-radius': '5px',
              'background-color': '$$header-search-input-bg',
              ...search.base.decls,
            },
          },
          ...(c.showSearchWord ? [{ sel: '.searchBoxLabel', decls: { ...search.base.decls, transition: 'color 0.3s' } }] : []),
          {
            sel: '.searchBox:hover, .searchBox:focus-within',
            nest: [
              { sel: '.searchBoxClicker', decls: { 'background-color': '$$header-search-hover-bg' } },
              ...(c.searchMode === 'closed' ? [{ sel: '.searchBoxInput', decls: { width: '$$header-search-input-width' } }] : []),
              ...(c.showSearchWord ? [{ sel: '.searchBoxLabel', decls: { color: '$$header-search-hover-color' } }] : []),
            ],
          },
        ]
      : []),
    ...(p.login ? [{ sel: '.header-login', decls: { ...linkBase, display: c.showLogin ? 'inline-flex' : 'none', ...text(login.base) } }] : []),
    ...(p.weather
      ? [{ sel: '.header-weather', decls: { display: c.showWeather ? 'inline-flex' : 'none', 'align-items': 'center', gap: '6px', ...text(weather.base) } }]
      : []),
    ...(p.hours
      ? [
          { sel: '.header-hours', decls: { ...linkBase, display: c.showHours ? 'inline-flex' : 'none', ...text(hours.base) } },
          { sel: '.header-hours:hover, .header-hours:focus-visible', decls: { color: '$$header-hours-hover-color' } },
        ]
      : []),
    ...(p.cart
      ? [
          { sel: '.viewcart', decls: { display: c.showCart ? 'flex' : 'none' } },
          {
            sel: '.cartMenuLink',
            decls: { ...linkBase, height: '40px', padding: '0 12px', 'border-radius': '5px', 'background-color': '$$header-cart-bg', ...text(cart.base) },
          },
          { sel: '.cartMenuLink:hover, .cartMenuLink:focus-visible', decls: { color: '$$header-cart-hover-color' } },
        ]
      : []),
    ...(p.ticket
      ? [
          { sel: '#customTicketButton', decls: { 'grid-area': 'ticket', display: 'flex', 'place-self': 'center end' } },
          {
            sel: '#customTicketButton .button',
            decls: {
              display: 'inline-block',
              padding: look.ticket.padding,
              'border-radius': look.ticket.radius,
              background: '$$header-ticket-default-bg',
              color: '#ffffff',
              'font-family': 'Poppins, sans-serif',
              'font-size': '16px',
              'font-weight': 700,
              'line-height': 1,
              'text-transform': 'uppercase',
              'text-decoration': 'none',
              'white-space': 'nowrap',
              transition: '0.3s',
            },
            nest: [{ sel: '&:hover, &:focus-visible', decls: { background: '$$header-ticket-default-hover-bg' } }],
          },
          ...(ticket.rule ? [ticket.rule] : []),
        ]
      : []),
    // burger: hidden on desktop, always shown (at the right edge) in the collapsed header — only with the navigation
    ...(p.nav
      ? [
          {
            sel: '.mobile-nav-toggle',
            decls: {
              'grid-area': 'burger',
              display: 'none',
              'place-items': 'center',
              'justify-self': 'end',
              width: '40px',
              height: '40px',
              color: '$$header-burger-color',
              cursor: 'pointer',
            },
          },
          { sel: '.mobile-nav-toggle .header-icon', decls: { width: '28px', height: '28px' } },
          { sel: '.nav.is-open', decls: { display: 'flex' } },
          { sel: '.groups', decls: { display: 'flex', 'flex-wrap': 'wrap', margin: 0, padding: 0, 'list-style': 'none' } },
          {
            sel: '.group a',
            decls: {
              display: 'block',
              padding: look.nav.padding,
              color: '$$header-nav-color',
              'font-family': 'Poppins, sans-serif',
              'font-size': '14px',
              'font-weight': 700,
              'line-height': 1.5,
              'text-transform': look.nav.transform,
              'text-decoration': 'none',
              transition: 'color 0.3s',
            },
          },
          { sel: '.group a:hover, .group a:focus-visible', decls: { color: '$$header-nav-hover-color' } },
        ]
      : []),
  ]

  /** Mobile overrides of the elements (no tablet step: mobile values are compared with desktop). */
  const vp = 'mobile' as const
  /** Desktop and mobile visibility are independent: re-set `display` only when it differs from desktop. */
  const vis = (desktop: boolean, mobile: boolean, display: string): Decls => ({ display: desktop !== mobile ? (mobile ? display : 'none') : undefined })
  const mobile: Rule[] = [
    { sel: '.header-logo', decls: { width: logoWidth.changed(vp) ? logoWidth.at(vp) : undefined } },
    ...(p.countdown
      ? [
          { sel: '.header-countdown', decls: vis(c.showCountdown, c.countdownMobile, 'flex') },
          { sel: '.countdown-date', decls: { ...date[vp].decls, ...date[vp].clamp } },
          { sel: '.countdown-event', decls: { ...event[vp].decls, ...event[vp].clamp } },
        ]
      : []),
    ...(p.search
      ? [
          { sel: '.searchBox', decls: vis(c.showSearch, c.searchMobile, 'flex') },
          { sel: '.searchBoxInput input', decls: { ...search[vp].decls } },
          ...(c.showSearchWord ? [{ sel: '.searchBoxLabel', decls: { ...search[vp].decls } }] : []),
        ]
      : []),
    ...(p.login ? [{ sel: '.header-login', decls: { ...vis(c.showLogin, c.loginMobile, 'inline-flex'), ...login[vp].decls } }] : []),
    ...(p.weather ? [{ sel: '.header-weather', decls: { ...vis(c.showWeather, c.weatherMobile, 'inline-flex'), ...weather[vp].decls } }] : []),
    ...(p.hours ? [{ sel: '.header-hours', decls: { ...vis(c.showHours, c.hoursMobile, 'inline-flex'), ...hours[vp].decls } }] : []),
    ...(p.cart ? [{ sel: '.viewcart', decls: vis(c.showCart, c.cartMobile, 'flex') }, { sel: '.cartMenuLink', decls: { ...cart[vp].decls } }] : []),
    // Burger (always on mobile with the navigation): the menu is hidden until opened (.is-open), then listed vertically
    ...(p.nav
      ? [
          { sel: '.mobile-nav-toggle', decls: { display: 'grid' } },
          { sel: '.nav', decls: { display: 'none' } },
          { sel: '.nav.is-open', decls: { display: 'block' } },
          { sel: '.groups', decls: { 'flex-direction': 'column' } },
          { sel: '.group a', decls: { padding: '12px 0' } },
        ]
      : []),
  ]

  return { p, vars, root, elements, mobile }
}
