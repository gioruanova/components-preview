import { buttonStyle, type ButtonStyle } from '@/tooling/buttons'
import { widthFields, type WidthConfig } from '@/tooling/layout'
import { typography, type Typography } from '@/tooling/typography'
import type { Config, FieldDef, GroupField, LeafField } from '@/tooling/types'

/**
 * Shared by every header layout (right-aligned, centered…): config, defaults and the option boxes.
 * Each header adds its own layout options and decides where the elements go.
 */

/** The ticket button always links to the site's default ticket page (not editable). */
export const TICKET_URL = '/p/tickets--deals'

/** Where the countdown text comes from (not edited in the header). */
export const COUNTDOWN_SOURCE = 'Site settings → Countdown'

export type HeaderBaseConfig = WidthConfig & {
  widgetId: string
  // A · Content (client edits)
  logo: string
  organizationName: string
  searchLabel: string
  loginLabel: string
  loginUrl: string
  hoursLabel: string
  hoursUrl: string
  ticketLabel: string
  // B · Widget configuration — every element has independent desktop / mobile visibility
  /** fixed = `position: fixed` (the platform needs fixed, not sticky) + a spacer so content starts below it. */
  fixed: boolean
  showCountdown: boolean
  countdownMobile: boolean
  showCountdownIcon: boolean
  showSearch: boolean
  searchMobile: boolean
  showSearchWord: boolean
  /** closed = icon only, the input opens on hover / focus; open = input always visible. */
  searchMode: 'closed' | 'open'
  showLogin: boolean
  loginMobile: boolean
  showWeather: boolean
  weatherMobile: boolean
  showHours: boolean
  hoursMobile: boolean
  showHoursIcon: boolean
  showCart: boolean
  cartMobile: boolean
  /** Collapsed header: ticket next to the burger, or above it (the countdown then lines up with the burger). */
  mobileTicket: 'beside' | 'above'
  // C · Styles
  /** Below this width (px) the header collapses (burger, mobile values). No tablet step for headers. */
  breakpoint: number
  headerBackground: string
  headerShadow: boolean
  logoWidth: number
  dateFont: Typography
  eventFont: Typography
  countdownIcon: string
  countdownIconSize: number
  countdownIconColor: string
  countdownIconBackground: string
  searchIconBackground: string
  searchIconColor: string
  searchHoverBackground: string
  searchInputBackground: string
  searchInputBorder: string
  searchFont: Typography
  searchHoverColor: string
  loginFont: Typography
  weatherFont: Typography
  hoursFont: Typography
  hoursHoverColor: string
  cartFont: Typography
  cartBackground: string
  cartHoverColor: string
  ticketStyle: ButtonStyle
  burgerColor: string
}

export const text = (o: Partial<Typography>) => typography({ size: 14, weight: 600, lineHeight: 1.3, color: '#313841', ...o })

/** Visible on desktop or on mobile (the element is in the markup; CSS hides it where it's off). */
export const shown = (c: HeaderBaseConfig, desktop: keyof HeaderBaseConfig, mobile: keyof HeaderBaseConfig) => Boolean(c[desktop] || c[mobile])

/** Defaults shared by every header: logo, search, cart and ticket on; everything else off. */
export const baseDefaults: HeaderBaseConfig = {
  widgetId: 'customHeader',
  logo: 'logo:saffire',
  organizationName: 'Your Organization Name Here',
  searchLabel: 'Search',
  loginLabel: 'Login',
  loginUrl: '/account/login',
  hoursLabel: 'Hours & Directions',
  hoursUrl: '/p/hours--directions',
  ticketLabel: 'Buy Tickets',
  fixed: true,
  showCountdown: false,
  countdownMobile: false,
  showCountdownIcon: true,
  showSearch: true,
  searchMobile: false,
  showSearchWord: false,
  searchMode: 'closed',
  showLogin: false,
  loginMobile: false,
  showWeather: false,
  weatherMobile: false,
  showHours: false,
  hoursMobile: false,
  showHoursIcon: true,
  showCart: true,
  cartMobile: false,
  mobileTicket: 'beside',
  widthMode: 'max',
  maxWidth: 1200,
  breakpoint: 768,
  headerBackground: '#ffffff',
  headerShadow: true,
  logoWidth: 160,
  dateFont: text({ size: 13, weight: 700, color: '#0079c2', transform: 'uppercase', letterSpacing: 0.05 }),
  eventFont: text({ size: 16, weight: 700 }),
  countdownIcon: 'icon:calendar',
  countdownIconSize: 32,
  countdownIconColor: '#0079c2',
  countdownIconBackground: '#00000000',
  searchIconBackground: '#f0f0f0',
  searchIconColor: '#313841',
  searchHoverBackground: '#e2e6ea',
  searchInputBackground: '#ffffff',
  searchInputBorder: '#d0d5db',
  searchFont: text({ weight: 400 }),
  searchHoverColor: '#0079c2',
  loginFont: text({}),
  weatherFont: text({}),
  hoursFont: text({}),
  hoursHoverColor: '#0079c2',
  cartFont: text({ weight: 400, color: '#000000' }),
  cartBackground: '#f0f0f0',
  cartHoverColor: '#0079c2',
  ticketStyle: buttonStyle({
    background: '#f26922',
    hoverBackground: '#d4561a',
    hoverColor: '#ffffff',
    radius: 5,
    paddingX: 18,
    paddingY: 14,
    font: typography({ size: 16, weight: 700, lineHeight: 1, color: '#ffffff', transform: 'uppercase' }),
  }),
  burgerColor: '#313841',
}

// ---------- option boxes (typed for the base config; a header casts them to its own config) ----------

type F = FieldDef<HeaderBaseConfig>
type L = LeafField<HeaderBaseConfig>

const COLLAPSED = 'Below the mobile breakpoint (collapsed header, menu behind the burger)'
/** Independent desktop / mobile switches for one element (inside its own box). */
const visibility = (desktop: keyof HeaderBaseConfig, mobile: keyof HeaderBaseConfig, mobileHint = COLLAPSED): L[] => [
  { type: 'switch', key: desktop, label: 'Show on desktop' },
  { type: 'switch', key: mobile, label: 'Show on mobile', hint: mobileHint },
]
const LINK_TIP = 'The link renders only when it is shown and has both a label and a URL.'

export const contentFields: F[] = [
  {
    type: 'group',
    label: 'Logo',
    fields: [
      { type: 'image', key: 'logo', label: 'Logo', library: 'logo', tip: 'PNG or JPG. PNG keeps transparency.' },
      { type: 'text', key: 'organizationName', label: 'Organization name', tip: 'Used as the logo’s alternative text.' },
    ],
  },
  {
    type: 'text',
    key: 'searchLabel',
    label: 'Search label',
    maxLength: 12,
    tip: 'Short word (max 12 characters): shown next to the icon and as the input placeholder.',
    visibleWhen: (c) => shown(c, 'showSearch', 'searchMobile'),
  },
  { type: 'text', key: 'loginLabel', label: 'Login label', tip: LINK_TIP, visibleWhen: (c) => shown(c, 'showLogin', 'loginMobile') },
  { type: 'text', key: 'loginUrl', label: 'Login URL', tip: LINK_TIP, visibleWhen: (c) => shown(c, 'showLogin', 'loginMobile') },
  { type: 'text', key: 'hoursLabel', label: 'Hours & Directions label', tip: LINK_TIP, visibleWhen: (c) => shown(c, 'showHours', 'hoursMobile') },
  { type: 'text', key: 'hoursUrl', label: 'Hours & Directions URL', tip: LINK_TIP, visibleWhen: (c) => shown(c, 'showHours', 'hoursMobile') },
  {
    type: 'text',
    key: 'ticketLabel',
    label: 'Ticket button label',
    tip: `The button always links to the site's default ticket page (${TICKET_URL}). Empty label = no button.`,
  },
]

export const fixedField: F = {
  type: 'switch',
  key: 'fixed',
  label: 'Fixed header',
  hint: 'Stays on top while the page scrolls',
  tip: 'Uses position: fixed (our platform needs fixed, not sticky). A spacer right after the header keeps the page content from sliding under it.',
}

/** Countdown + one box per top element, in their order on the site. `countdownHint`: where it sits on desktop. */
export const elementBoxes = (countdownHint: string): F[] => [
  {
    type: 'group',
    label: 'Countdown',
    fields: [
      { type: 'switch', key: 'showCountdown', label: 'Show on desktop', hint: countdownHint },
      { type: 'switch', key: 'countdownMobile', label: 'Show on mobile', hint: 'At the bottom of the collapsed header (or next to the burger when the ticket is above it)' },
      {
        type: 'switch',
        key: 'showCountdownIcon',
        label: 'Show icon',
        visibleWhen: (c) => shown(c, 'showCountdown', 'countdownMobile'),
        tip: `The date and the event name are not edited here: they come from ${COUNTDOWN_SOURCE}.`,
      },
    ],
  },
  {
    type: 'group',
    label: 'Top container 1 · Search box',
    fields: [
      ...visibility('showSearch', 'searchMobile'),
      { type: 'switch', key: 'showSearchWord', label: 'Show the search word', visibleWhen: (c) => shown(c, 'showSearch', 'searchMobile') },
      {
        type: 'segmented',
        key: 'searchMode',
        label: 'Search input',
        visibleWhen: (c) => shown(c, 'showSearch', 'searchMobile'),
        options: [
          { value: 'closed', label: 'Closed (opens on hover)' },
          { value: 'open', label: 'Always open' },
        ],
      },
    ],
  },
  { type: 'group', label: 'Top container 2 · Login link', fields: visibility('showLogin', 'loginMobile') },
  { type: 'group', label: 'Top container 3 · Weather', fields: visibility('showWeather', 'weatherMobile') },
  {
    type: 'group',
    label: 'Top container 4 · Hours & Directions',
    fields: [
      ...visibility('showHours', 'hoursMobile'),
      { type: 'switch', key: 'showHoursIcon', label: 'Show pin icon', visibleWhen: (c) => shown(c, 'showHours', 'hoursMobile') },
    ],
  },
  { type: 'group', label: 'Top container 5 · Cart', fields: visibility('showCart', 'cartMobile') },
]

export const mobileTicketField: L = {
  type: 'segmented',
  key: 'mobileTicket',
  label: 'On mobile',
  options: [
    { value: 'beside', label: 'Next to burger' },
    { value: 'above', label: 'Above burger' },
  ],
  help: 'Above: the ticket sits over the burger and the countdown lines up with the burger.',
  visibleWhen: (c) => Boolean(c.ticketLabel.trim()),
}

/** Styles → Header (width, breakpoint, background, shadow, logo width). */
export const headerStyleGroup: GroupField<HeaderBaseConfig> = {
  type: 'group',
  label: 'Header',
  fields: [
    ...widthFields<HeaderBaseConfig>({ min: 960, max: 1920 }),
    {
      type: 'slider',
      key: 'breakpoint',
      label: 'Mobile breakpoint',
      min: 480,
      max: 1440,
      step: 1,
      unit: 'px',
      tip: 'Below this width the header collapses: burger menu and the mobile values. Headers have no tablet step — pick the width where everything still fits.',
    },
    { type: 'color', key: 'headerBackground', label: 'Background' },
    { type: 'switch', key: 'headerShadow', label: 'Shadow', hint: 'Soft shadow under the header' },
    { type: 'slider', key: 'logoWidth', label: 'Logo width', min: 60, max: 320, step: 5, unit: 'px', responsive: true },
  ],
}

/** Styles for every element (countdown, top items, ticket). */
export const elementStyleGroups: F[] = [
  {
    type: 'group',
    label: 'Countdown',
    visibleWhen: (c) => shown(c, 'showCountdown', 'countdownMobile'),
    fields: [
      { type: 'typography', key: 'dateFont', label: 'Date', responsive: true },
      { type: 'typography', key: 'eventFont', label: 'Event name', responsive: true },
      { type: 'image', key: 'countdownIcon', label: 'Icon', library: 'icon', tip: 'Shown in one plain color (below). PNG uploads use their shape.', visibleWhen: (c) => c.showCountdownIcon },
      { type: 'slider', key: 'countdownIconSize', label: 'Icon size', min: 16, max: 72, step: 2, unit: 'px', visibleWhen: (c) => c.showCountdownIcon },
      { type: 'color', key: 'countdownIconColor', label: 'Icon color', solid: true, visibleWhen: (c) => c.showCountdownIcon },
      { type: 'color', key: 'countdownIconBackground', label: 'Icon background', help: 'Transparent by default', visibleWhen: (c) => c.showCountdownIcon },
    ],
  },
  {
    type: 'group',
    label: 'Search box',
    visibleWhen: (c) => shown(c, 'showSearch', 'searchMobile'),
    fields: [
      { type: 'color', key: 'searchIconBackground', label: 'Icon background' },
      { type: 'color', key: 'searchIconColor', label: 'Icon color', solid: true },
      { type: 'color', key: 'searchHoverBackground', label: 'Icon hover background' },
      { type: 'color', key: 'searchInputBackground', label: 'Input background' },
      { type: 'color', key: 'searchInputBorder', label: 'Input border' },
      { type: 'typography', key: 'searchFont', label: 'Text', responsive: true },
      { type: 'color', key: 'searchHoverColor', label: 'Text hover color', solid: true },
    ],
  },
  { type: 'group', label: 'Login link', visibleWhen: (c) => shown(c, 'showLogin', 'loginMobile'), fields: [{ type: 'typography', key: 'loginFont', label: 'Text', responsive: true }] },
  { type: 'group', label: 'Weather', visibleWhen: (c) => shown(c, 'showWeather', 'weatherMobile'), fields: [{ type: 'typography', key: 'weatherFont', label: 'Text', responsive: true }] },
  {
    type: 'group',
    label: 'Hours & Directions',
    visibleWhen: (c) => shown(c, 'showHours', 'hoursMobile'),
    fields: [
      { type: 'typography', key: 'hoursFont', label: 'Text', responsive: true },
      { type: 'color', key: 'hoursHoverColor', label: 'Hover color', solid: true },
    ],
  },
  {
    type: 'group',
    label: 'Cart',
    visibleWhen: (c) => shown(c, 'showCart', 'cartMobile'),
    fields: [
      { type: 'typography', key: 'cartFont', label: 'Text', responsive: true },
      { type: 'color', key: 'cartBackground', label: 'Background' },
      { type: 'color', key: 'cartHoverColor', label: 'Hover color', solid: true },
    ],
  },
  { type: 'group', label: 'Ticket button', fields: [{ type: 'buttonStyle', key: 'ticketStyle', label: 'Ticket button · custom style' }] },
]

export const burgerField: L = { type: 'color', key: 'burgerColor', label: 'Burger color (mobile)', solid: true }

/** Reuse the shared (base-typed) fields in a header's own schema. */
export const as = <C extends Config>(fields: F | F[]) => (Array.isArray(fields) ? fields : [fields]) as unknown as FieldDef<C>[]
/** Same, for fields placed inside a group. */
export const asLeaf = <C extends Config>(fields: L | L[]) => (Array.isArray(fields) ? fields : [fields]) as unknown as LeafField<C>[]
