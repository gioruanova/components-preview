import { outputPath } from '@/tooling/assets'
import { COUNTDOWN_SOURCE, hasTicket, ORGANIZATION_SOURCE, shown, ticketHref, type HeaderBaseConfig } from './config'

/** The site's main menu comes from the CMS: fixed sample items here (no options). */
export const NAV_ITEMS = [
  { label: 'About', url: '/p/about' },
  { label: 'Events', url: '/events' },
  { label: 'Get Involved', url: '/p/getinvolved' },
  { label: 'Facilities', url: '/p/rentals' },
] as const

/** Dynamic values filled by the platform (organization name, countdown text: Site settings); the preview shows these samples. */
export const SAMPLE = { organizationName: 'Your Organization Name Here', temperature: '72°F', cartCount: 0, countdownDate: 'Dec 1 – Mar 1, 2027', countdownEvent: 'Only 120 Days Until Your Amazing Event' }

const link = (show: boolean, label: string, url: string) => (show && label.trim() && url.trim() ? { label, url } : null)

/**
 * Which parts are in the markup, shared by the preview and the generated code (top container in this order).
 * An element is rendered when it's on for desktop OR mobile; the CSS hides it on the viewport where it's off.
 */
export function headerParts(c: HeaderBaseConfig) {
  const countdown = shown(c, 'showCountdown', 'countdownMobile')
  return {
    countdown,
    countdownIcon: countdown && c.showCountdownIcon ? c.countdownIcon : '',
    search: shown(c, 'showSearch', 'searchMobile'),
    login: link(shown(c, 'showLogin', 'loginMobile'), c.loginLabel, c.loginUrl),
    weather: shown(c, 'showWeather', 'weatherMobile'),
    hours: link(shown(c, 'showHours', 'hoursMobile'), c.hoursLabel, c.hoursUrl),
    cart: shown(c, 'showCart', 'cartMobile'),
    nav: c.showNav,
    ticket: hasTicket(c) ? { label: c.ticketLabel, url: ticketHref(c), custom: c.ticketCustomUrl, newTab: c.ticketCustomUrl && c.ticketNewTab } : null,
  }
}
export type HeaderParts = ReturnType<typeof headerParts>

/** Inline SVG icons (use currentColor, so they follow the text / hover colors). */
export const ICONS = {
  search: '<svg class="header-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="m20 20-4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  user: '<svg class="header-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M4 21a8 8 0 0 1 16 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  weather: '<svg class="header-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="9" r="3.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9 2v2M2 9h2M4 4l1.5 1.5M14 4l-1.5 1.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M8 20h9a4 4 0 0 0 0-8 5 5 0 0 0-9.5 1.5A3.3 3.3 0 0 0 8 20Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
  pin: '<svg class="header-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="10" r="2.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  cart: '<svg class="header-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 8H6.2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9" cy="20" r="1.5" fill="currentColor"/><circle cx="17" cy="20" r="1.5" fill="currentColor"/></svg>',
  burger: '<svg class="header-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>',
} as const

// ---------- HTML fragments (each header arranges them in its own structure) ----------

const indent = (n: number, rows: (string | false | null | undefined)[]) => rows.filter((r): r is string => typeof r === 'string').map((r) => ' '.repeat(n) + r)

/** The alt text `${OrganizationName}` is filled by the platform (Site settings → Organization name). */
export const logoHtml = (n: number) => indent(n, ['<a href="/" class="header-logo"><img src="${Logo}" alt="${OrganizationName}" /></a>'])

export const countdownHtml = (p: HeaderParts, n: number) =>
  p.countdown
    ? indent(n, [
        '<div class="header-countdown">',
        p.countdownIcon && '  <span class="countdown-icon"><span class="countdown-icon-glyph" style="mask-image: url(\'${CountdownIcon}\')"></span></span>',
        `  <!-- date + event name: ${COUNTDOWN_SOURCE} -->`,
        '  <span class="countdown-text">',
        '    <span class="countdown-date">${CountdownDate}</span>',
        '    <span class="countdown-event">${CountdownEventName}</span>',
        '  </span>',
        '</div>',
      ])
    : []

/** `.top-content` with the enabled items, in their fixed order. */
export const topContentHtml = (c: HeaderBaseConfig, p: HeaderParts, n: number) =>
  indent(n, [
    '<div class="top-content">',
    p.search && `  <div class="searchBox search-${c.searchMode}">`,
    p.search && `    <button class="searchBoxClicker" type="button" aria-label="\${SearchLabel}">${ICONS.search}</button>`,
    p.search && '    <div class="searchBoxInput"><input type="text" placeholder="${SearchPlaceholder}" aria-label="${SearchPlaceholder}" /></div>',
    p.search && c.showSearchWord && '    <span class="searchBoxLabel">${SearchLabel}</span>',
    p.search && '  </div>',
    p.login && `  <a class="header-login" href="\${LoginURL}">${ICONS.user}<span>\${LoginLabel}</span></a>`,
    p.weather && `  <div class="header-weather">${ICONS.weather}<span class="weather-temp">\${Temperature}</span></div>`,
    p.hours && `  <a class="header-hours" href="\${HoursURL}">${c.showHoursIcon ? ICONS.pin : ''}<span>\${HoursLabel}</span></a>`,
    p.cart && `  <div class="viewcart"><a class="cartMenuLink" href="/cart">${ICONS.cart}<span class="cart-count">\${CartCount}</span></a></div>`,
    '</div>',
  ])

/** Default page = fixed href; custom URL = `${TicketURL}`. "Open in a new tab" adds target / rel / accessible label. */
export const ticketHtml = (p: HeaderParts, n: number) => {
  if (!p.ticket) return []
  const href = p.ticket.custom ? '${TicketURL}' : p.ticket.url
  const newTab = p.ticket.newTab ? ' target="_blank" rel="noopener noreferrer" aria-label="${TicketLabel} (opens in a new tab)"' : ''
  return indent(n, ['<div id="customTicketButton">', `  <a class="button alternative-btn" href="${href}"${newTab}><span class="btn-label">\${TicketLabel}</span></a>`, '</div>'])
}

export const burgerHtml = (p: HeaderParts, n: number) =>
  !p.nav ? [] : indent(n, [`<div class="mobile-nav-toggle" role="button" tabindex="0" aria-label="Toggle mobile menu" aria-expanded="false">${ICONS.burger}</div>`])

export const navHtml = (p: HeaderParts, n: number) =>
  !p.nav
    ? []
    : indent(n, [
    '<nav class="nav" id="mainNavigation">',
    '  <ul class="groups">',
    '    <!-- one li.group per menu item (from the CMS) -->',
    '    <li class="group"><a href="${URL}">${Label}</a></li>',
    '  </ul>',
    '</nav>',
  ])

export const spacerHtml = (c: HeaderBaseConfig) =>
  c.fixed ? ['<!-- fixed header: the spacer takes its height so the page content starts below it -->', '<div class="header-spacer" aria-hidden="true"></div>'] : []

export const headerClass = (c: HeaderBaseConfig, extra: string) => `header ${extra}${c.fixed ? ' header-fixed' : ''}`

/** Data shared by every header (+ layout-specific keys). */
export function baseData(c: HeaderBaseConfig) {
  const p = headerParts(c)
  return {
    Logo: (c.logo && outputPath(c.logo)) || null,
    // the logo's alt text comes from the site settings, not from this widget
    OrganizationName: { Source: ORGANIZATION_SOURCE },
    // date + event name come from the site settings, not from this widget
    Countdown: p.countdown ? { Source: COUNTDOWN_SOURCE, Icon: (p.countdownIcon && outputPath(p.countdownIcon)) || null } : null,
    Search: p.search ? { Label: c.searchLabel, ShowLabel: c.showSearchWord, Placeholder: c.searchPlaceholder, Mode: c.searchMode } : null,
    Login: p.login && { Label: p.login.label, URL: p.login.url },
    Weather: p.weather,
    HoursDirections: p.hours && { Label: p.hours.label, URL: p.hours.url, ShowIcon: c.showHoursIcon },
    Cart: p.cart,
    TicketButton: p.ticket && { Label: p.ticket.label, URL: p.ticket.url, CustomURL: p.ticket.custom, NewTab: p.ticket.newTab, MobilePlacement: c.mobileTicket },
    Navigation: p.nav,
    Fixed: c.fixed,
  }
}

/** Burger toggle (with the navigation), fixed-header spacer and search submit — the same for every header. */
export function headerScript(c: HeaderBaseConfig) {
  return `function createCustomHeader(widgetData) {
  const widgetName = '${c.widgetId}';
  const $header = $(\`#\${widgetName}\`);

${c.showNav ? `  // Mobile menu: the burger opens / closes the navigation
  $header.find('.mobile-nav-toggle').on('click keydown', function (e) {
    if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    const open = $header.find('.nav').toggleClass('is-open').hasClass('is-open');
    $(this).attr('aria-expanded', open);
  });

` : ''}${c.fixed ? `  // Fixed header: the spacer after it always matches its height (it changes with the viewport / open menu)
  const $spacer = $header.next('.header-spacer');
  const sync = () => $spacer.height($header.outerHeight());
  new ResizeObserver(sync).observe($header[0]);
  sync();

` : ''}  // Search: submit the input to the site search
  $header.find('.searchBoxInput input').on('keydown', function (e) {
    if (e.key === 'Enter' && this.value.trim()) window.location.href = \`/search?q=\${encodeURIComponent(this.value.trim())}\`;
  });
}`
}
