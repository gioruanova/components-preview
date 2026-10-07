import { defineWidget } from '@/tooling/types'
import { codegen } from './codegen'
import { Preview } from './Preview'
import { defaults, schema } from './schema'
import { styles } from './styles'

export default defineWidget({
  name: 'Centered Menu Header',
  status: 'beta',
  order: 10,
  summary: 'Logo in the middle, countdown on the left, top items and ticket on the right, and a full-width menu bar below.',
  description: [
    'Replicates the startercherry.saffire.com header: a three-zone top row (countdown | logo | top items + ticket) and a full-width menu bar with centered links.',
    'The logo always stays centered, whatever the side zones hold.',
    'Same elements and options as the Right-aligned Menu Header (shared code): countdown from Site settings → Countdown, search, login, weather, hours & directions and cart, each with independent desktop and mobile visibility.',
    'The ticket button links to the default ticket page, or to a custom URL (optionally in a new tab). On mobile it sits next to the burger or above it.',
    'Below its own mobile breakpoint (Styles, default 768px) the header collapses: the zones merge into one row and the menu bar opens from the burger. Headers have only desktop and mobile values.',
  ],
  specs: [
    'Markup root: `header.header.header-centered#<widgetId>` > `span.headerInnerContent` > `.top-header` (3 zones: `.top-header-left` countdown · `.top-header-center` logo · `.top-header-right` top items + ticket, then the burger) and `.bottom-header` (full-width menu bar with `nav.nav`).',
    'Desktop: `.top-header { grid-template-columns: 1fr auto 1fr }` keeps the logo centered whatever the side zones hold; zones are flex rows (left / center / right).',
    'Collapsed: the zones get `display: contents`, so their children join the shared collapsed grid on `.top-header` (no menu row: the menu lives in `.bottom-header` and opens from the burger). Default mobile ticket: above the burger.',
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
    'Own variables: `--header-nav-bg` (bar), nav link color / hover. Navigation off also removes `.bottom-header` and these variables.',
    'Data: `Layout: \'centered\'` plus the shared header keys. Tests: `codegen.test.ts`. Spec: `docs/specs/header--centered-menu-header.md`.',
  ],
  previewHint: 'Hover the search icon to open it. Switch to Mobile and use the burger to open the menu.',
  container: false,
  wrapperSpacing: false,
  viewports: ['desktop', 'mobile'],
  starterLayouts: ['cherry'],
  defaults,
  schema,
  Preview,
  styles,
  codegen,
})
