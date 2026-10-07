import { defineWidget } from '@/tooling/types'
import { codegen } from './codegen'
import { Preview } from './Preview'
import { defaults, schema } from './schema'
import { styles } from './styles'

export default defineWidget({
  name: 'Right-aligned Menu Header',
  status: 'beta',
  order: 20,
  summary: 'Logo left; search, cart and a prominent Buy Tickets button on top, the menu tucked to the right edge below.',
  description: [
    'Replicates the startermango.saffire.com header: logo on the left (spanning both rows), a top container on the right and the main menu right-aligned below it.',
    'An optional countdown sits next to the logo, level with the top container (on mobile: at the bottom of the header). Its two lines (date + event name) come from Site settings → Countdown, not from this widget; the optional icon is shown in one plain color.',
    'The top container shows, in this order: search box, login link, weather, hours & directions and cart. Every element has independent desktop and mobile visibility.',
    'The ticket button links to the site’s default ticket page, or to a custom URL (optionally in a new tab). It can sit next to the top container or next to the navigation, and stays visible on mobile.',
    'The navigation comes from the CMS (sample items here, no options). Below its own mobile breakpoint (Styles, default 768px) the header collapses: the menu moves behind the burger button. Headers have only desktop and mobile values, no tablet step.',
    'Search can be closed (icon only, opens on hover) or always open, with or without the search word.',
  ],
  specs: [
    'Markup root: `header.header.ticket-<top|nav>#<widgetId>` > `span.headerInnerContent` (CSS grid). Logo, countdown, `.top-content`, `#customTicketButton`, `.mobile-nav-toggle` and `nav.nav` are all direct grid items (unlike mango, so the ticket can move rows and stay visible on mobile).',
    'Desktop grid areas: ticket top = `\'logo countdown top ticket\' \'logo nav nav nav\'`; ticket next to navigation = `\'logo countdown top top\' \'logo nav nav ticket\'`. Countdown / ticket columns are dropped when not rendered; without navigation the grid is a single row.',
    'Collapsed grid (shared `collapsedAreas`): ticket next to the burger = `\'logo top ticket burger\' \'nav nav nav nav\' \'countdown …\'`; above the burger = `\'logo top ticket ticket\' \'countdown countdown countdown burger\' \'nav nav nav nav\'`.',
    'Shared header code: `src/widgets/header/shared/` (`config.ts` options + defaults, `markup.ts` HTML fragments + `headerParts()`, `parts.tsx` preview parts, `styles.ts` element styles + `collapsedAreas()`). Preview, HTML and Data all read the same `headerParts(c)`, so every rendering rule lives in one place.',
    'Elements are rendered when they are on for desktop or mobile; the other viewport hides them with `display: none` (base rule or the collapsed `@media` override). Desktop / mobile visibility never changes the markup between viewports.',
    'One `@media (max-width: <breakpoint>px)` block (Styles → Mobile breakpoint, default 768): headers have no tablet step. Mobile values only emit an override when they differ from desktop.',
    'Ticket: `#customTicketButton .button.alternative-btn`. Default `href="/p/tickets--deals"`; with Use custom URL `href="${TicketURL}"` (renders only with label + URL). Open in a new tab adds `target="_blank" rel="noopener noreferrer"` and an `aria-label` ending in "(opens in a new tab)"; external URLs get the same through `updateLinksAttributes`.',
    'Show navigation off removes `nav#mainNavigation`, `.mobile-nav-toggle`, the burger handler in the script and every menu / burger rule and variable.',
    'Search: `.searchBox.search-closed|search-open`; `${SearchLabel}` = word next to the icon (+ icon button label), `${SearchPlaceholder}` = input placeholder + label. Enter submits to `/search?q=…`.',
    'Platform values (not widget content): `${OrganizationName}` (logo alt, Site settings → Organization name), `${CountdownDate}` / `${CountdownEventName}` (Site settings → Countdown), the menu items (CMS), `${Temperature}` and `${CartCount}`.',
    'Fixed: `position: fixed` (not sticky) + `<div class="header-spacer">` right after the header; a `ResizeObserver` in the script keeps the spacer at the header height (it changes with the viewport and the open menu).',
    'Script entry `createCustomHeader(widgetData)` with `widgetName` = Widget ID: burger toggle (`.nav.is-open`, `aria-expanded`), spacer sync, search submit.',
    'CSS variables are prefixed `--header-*` (SCSS `$header-*`); the ticket custom style uses `customButtonStyles(\'header-ticket\', …)`.',
    'Data: `Layout: \'right-aligned\'`, `TicketPlacement`, plus the shared keys (`Search`, `Login`, `HoursDirections`, `TicketButton { Label, URL, CustomURL, NewTab, MobilePlacement }`, `Navigation`, `Fixed`…).',
    'Tests: `codegen.test.ts` (markup, grid areas, visibility, ticket, navigation, data). Spec: `docs/specs/header--right-aligned-menu-header.md`.',
  ],
  previewHint: 'Hover the search icon to open it. Switch to Tablet or Mobile and use the burger to open the menu.',
  container: false,
  wrapperSpacing: false,
  viewports: ['desktop', 'mobile'], // headers: desktop + mobile only (own breakpoint, no tablet step)
  starterLayouts: ['mango', 'banana', 'peach', 'grape', 'lemon'],
  defaults,
  schema,
  Preview,
  styles,
  codegen,
})
