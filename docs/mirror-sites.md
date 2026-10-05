# Mirror sites (Saffire starter layouts)

The six Saffire starter sites are the **reference for every component** in this tool: their markup and class names, behavior (what shows, when, on which viewport) and visual defaults. Before defining or changing a component, check how it exists on these sites (skill: `/mirror-sites`).

| Starter | URL | Font | Header layout | Notes |
|---|---|---|---|---|
| **Mango** | https://startermango.saffire.com/ | Poppins | Right-aligned menu (`.header-logo` · `.top-content` · `nav`) | Orange gradient ticket button in the top bar; grey search / cart boxes |
| **Banana** | https://starterbanana.saffire.com/ | Poppins | Right-aligned menu (same structure as mango) | Countdown banner (`siteInfoBannerWidget`), signup |
| **Grape** | https://startergrape.saffire.com/ | **Montserrat** | Right-aligned menu (same structure as mango) | Cards, SEO block, signup |
| **Cherry** | https://startercherry.saffire.com/ | Poppins | **Centered** (`.top-header` left / center / right + `.bottom-header` menu bar) | Countdown left, logo centered, weather (`weatherBugWidget`), flat square ticket, blue menu bar |
| **Peach** | https://starterpeach.saffire.com/ | Poppins | Right-aligned variant: `.top-content` (search, cart) + `.bottom-content` (menu + ticket inline) | Ticket-shaped CTA next to the menu |
| **Lemon** | https://starterlemon.saffire.com/ | Poppins | Right-aligned menu (same structure as mango) | Countdown banner, cards, SEO block, signup |

The same list lives in code in `src/tooling/starterLayouts.ts` (`STARTER_LAYOUTS`: name, URL, pill colors). Components point to the sites they come from with `starterLayouts: [...]`, which shows the **Starter layout usage** pills (linking to the site).

## Shared conventions seen on every site
- Widgets are `#custom<Name>` blocks inside a `.<widgetId>-container` style wrapper (e.g. `customCards`, `customSeoBlock`, `customSignup`, `customTicketButton`); platform widgets use `#<name>Widget` (`siteInfoBannerWidget` = countdown, `weatherBugWidget`).
- Header: `header.header > .headerInnerContent`, `.header-logo`, `.searchBox`, `.viewcart .cartMenuLink`, `#customTicketButton`, `.mobile-nav-toggle`, `nav.nav#mainNavigation ul.groups li.group`. Fixed header (`position: fixed`), collapses at the tablet width (≈768px) on the mango family.
- Ticket button links to the site's ticket page (`/p/tickets--deals`).
- Brand defaults: `#0079c2` blue, text `#313841`, Poppins (Grape: Montserrat).
- Countdown text (dates + event name / days until) comes from the site settings, not from the header.

## Components already mirrored
| Component | Built from | Starter layout usage |
|---|---|---|
| Header → Right-aligned Menu Header | Mango | Mango, Banana, Peach, Grape, Lemon |
| Header → Centered Menu Header | Cherry | Cherry |
| Cards → Cards Grid, Text Blocks → SEO Block | live widgets (`customCards`, `customSeoBlock` on Grape / Lemon / Peach) | — |

## Seen on the sites, not built yet (candidates)
- `customSignup` (all sites) → Utils → Signup.
- Countdown banner (`siteInfoBannerWidget`) as its own component.
- Weather widget (`weatherBugWidget`, Cherry).
- Hero / upcoming events feed (Cherry home), map with "Main office" card (Cherry mobile).
