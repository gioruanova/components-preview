# Component spec — Centered Menu Header

## 1. Identity
- **Category:** `header`
- **Component name:** Centered Menu Header
- **Component slug:** `centered-menu-header` (replaces the former "coming soon" entry)
- **Status:** beta
- **Summary (one line):** Logo in the middle, countdown on the left, top items and ticket on the right, and a full-width menu bar below.
- **Order in category:** 10
- **Starter layout usage:** Cherry

## 2. Functional description
- Replicates the [startercherry.saffire.com](https://startercherry.saffire.com/) header: a three-zone top row (countdown | logo | top items + ticket) and a full-width menu bar with centered links.
- Built on the **shared header code** (`src/widgets/header/shared/`): the same elements, options, markup fragments and element styles as the [Right-aligned Menu Header](header--right-aligned-menu-header.md). Only the layout (structure, grid, menu bar) is specific.
- Countdown text from **Site settings → Countdown**; search, login, weather, hours & directions and cart with independent desktop / mobile visibility; ticket button (default ticket page, or a custom URL that can open in a new tab); fixed option; own mobile breakpoint (desktop + mobile only).

## 3. Real markup (HTML template)
Follows cherry (`.top-header` > `.top-header-left / -center / -right`, `.bottom-header` > `nav`). Element markup is shared with the right-aligned header.
```html
<header class="header header-centered header-fixed" id="customCenteredHeader">
  <span class="headerInnerContent">
    <div class="top-header">
      <div class="top-header-left"><!-- .header-countdown --></div>
      <div class="top-header-center"><!-- .header-logo --></div>
      <div class="top-header-right"><!-- .top-content + #customTicketButton --></div>
      <div class="mobile-nav-toggle" role="button">…</div>
    </div>
    <div class="bottom-header"><nav class="nav" id="mainNavigation">…</nav></div>
  </span>
</header>
<div class="header-spacer" aria-hidden="true"></div>
```

## 3b. Real CSS (from the live site)
White top row (max 1250px, 3 equal side columns, logo centered); countdown: calendar icon, dates Poppins 24/700 uppercase `#181818`, "days until" line 14/500; search / weather / cart as plain icons; ticket button flat `#f26922`, square corners, white uppercase 16/700; menu bar full width `#0659d4`, white uppercase links. Mobile: logo, then countdown icon + burger (no ticket on cherry).

## 4. Script / 5. Data
Shared with the right-aligned header (`headerScript`, `baseData`) + `"Layout": "centered"`.

## 6. Config options
Same as the right-aligned header (shared boxes), except:
| Section | Label | Key | Field type | Default | Notes |
|---|---|---|---|---|---|
| B | Ticket button → Label / Use custom URL / URL / Open in a new tab | ticketLabel / ticketCustomUrl / ticketUrl / ticketNewTab | text / switch / text / switch | Buy Tickets / off / (empty) / off | | URL + new tab: ticketCustomUrl | shared with the right-aligned header |
| B | Navigation → Show navigation | showNav | switch | on | | | off: no menu bar (`.bottom-header`) and no burger; Styles → Navigation bar hidden |
| B | Ticket button → On mobile | mobileTicket | segmented | above | no desktop placement option (always top right) |
| C | Navigation bar → Bar background | navBackground | color | `#0659d4` | full-width bar |
| C | Navigation bar → Link color / hover | navColor / navHoverColor | color | `#ffffff` / `#cfe3ff` | |
| — | Defaults | | | countdown on (desktop + mobile), search, cart, ticket; max width 1250; dates 22/700, event 14/500 `#181818`; transparent search / cart boxes; flat square ticket | |

## 7. Rendering rules
- Desktop: `.top-header { grid-template-columns: 1fr auto 1fr }` keeps the logo centered; left zone = countdown, right zone = top items + ticket (flex, right-aligned).
- Menu bar: `.bottom-header` full width (`$header-nav-bg`), `nav` centered within the header max width.
- Collapsed (`@media (max-width: <breakpoint>px)`): the zones get `display: contents` and the top row uses the **shared collapsed grid** (no menu row — the menu lives in the bar): ticket above the burger = `'logo top ticket ticket' 'countdown countdown countdown burger'`; next to it = `'logo top ticket burger' 'countdown …'`. The bar opens from the burger (`.nav.is-open`, vertical list).
- All element rules (visibility, ticket URL / custom URL / new tab, countdown icon, search modes, hover colors…) are the shared ones.

## 8. Responsive behavior
- Desktop: three zones + menu bar.
- Mobile (≤ breakpoint, default 768): collapsed grid; smaller logo / countdown text (responsive defaults).

## 9. Empty / removed state
n/a.

## 10. Out of scope / open questions
- Countdown "N days until" counter (cherry shows "269 days Until Your Event"; here: date + event name from Site settings).
- Ticket icon inside the button (cherry), weather "Area Weather" label.
