# Component spec — Right-aligned Menu Header

## 1. Identity
- **Category:** `header`
- **Component name:** Right-aligned Menu Header
- **Component slug:** `right-aligned-menu-header` (same slug as the former "coming soon" entry)
- **Status:** beta
- **Summary (one line):** Logo left; search, cart and a prominent Buy Tickets button on top, the menu tucked to the right edge below.
- **Order in category:** 20
- **Starter layout usage:** Mango, Banana, Peach, Grape, Lemon

## 2. Functional description
- Replicates the [startermango.saffire.com](https://startermango.saffire.com/) header: logo left (spanning both rows), a top container on the right, the main menu right-aligned below it.
- Optional countdown next to the logo, level with the top container (on mobile: at the bottom of the header): two lines (date, event name) and an optional plain-color icon. The countdown text is **not** edited in the widget: it comes from **Site settings → Countdown**.
- Top container, in this order: search box, login link, weather, hours & directions, cart. Every element (countdown included) has **independent** desktop and mobile visibility (desktop only, mobile only, both or none).
- Ticket button: label only, always links to the default ticket page. Placement: next to the top container or next to the navigation. Always visible on mobile.
- Navigation comes from the CMS (no options). Below its own **mobile breakpoint** (Styles, default 768px like mango) the header collapses and the menu moves behind the burger (always present on mobile). Headers have only **desktop and mobile** values (no tablet step; the preview offers Desktop / Mobile only).
- **Fixed header** option (default on): `position: fixed` — our platform needs fixed, not sticky. A `.header-spacer` right after the header takes its height (kept in sync by the script with a ResizeObserver) so the page content starts below it.
- On mobile the ticket button sits **next to the burger** or **above it** (then the countdown lines up with the burger).
- Built on the **shared header code** (`src/widgets/header/shared/`: config + option boxes, markup fragments, preview parts, element styles + collapsed grid), also used by the [Centered Menu Header](header--centered-menu-header.md). Defaults render only **logo, search, cart and ticket**.
- It differs from other widgets: no global container (`container: false`) and no shared wrapper spacing (`wrapperSpacing: false`) — a header is edge to edge.

## 3. Real markup (HTML template)
Based on the live mango header (`header.header > .headerInnerContent`, `.header-logo`, `.top-content`, `.searchBox`, `.viewcart .cartMenuLink`, `#customTicketButton .button.alternative-btn .btn-label`, `.mobile-nav-toggle`, `nav.nav#mainNavigation ul.groups li.group`). Additions: `.header-countdown`, `.header-login`, `.header-weather`, `.header-hours`.
Difference from mango: `#customTicketButton` and `.mobile-nav-toggle` are direct children of `.headerInnerContent` (grid items) instead of living inside `.top-content`, so the ticket can move to the navigation row and stay visible when the menu collapses.
```html
<header class="header ticket-top" id="customHeader">
  <span class="headerInnerContent">
    <a href="/" class="header-logo"><img src="${Logo}" alt="${OrganizationName}" /></a>
    <div class="header-countdown">
      <span class="countdown-icon"><span class="countdown-icon-glyph" style="mask-image: url('${CountdownIcon}')"></span></span>
      <!-- date + event name: Site settings → Countdown -->
      <span class="countdown-text">
        <span class="countdown-date">${CountdownDate}</span>
        <span class="countdown-event">${CountdownEventName}</span>
      </span>
    </div>
    <div class="top-content">
      <div class="searchBox search-closed">…</div>
      <a class="header-login" href="${LoginURL}">…</a>
      <div class="header-weather">…<span class="weather-temp">${Temperature}</span></div>
      <a class="header-hours" href="${HoursURL}">…</a>
      <div class="viewcart"><a class="cartMenuLink" href="/cart">…<span class="cart-count">${CartCount}</span></a></div>
    </div>
    <div id="customTicketButton"><a class="button alternative-btn" href="/p/tickets--deals"><span class="btn-label">${TicketLabel}</span></a></div>
    <div class="mobile-nav-toggle" role="button" aria-label="Toggle mobile menu">…</div>
    <nav class="nav" id="mainNavigation"><ul class="groups"><li class="group"><a href="${URL}">${Label}</a></li></ul></nav>
  </span>
</header>
```

## 3b. Real CSS (from the live site)
White header with `0 0 3px 3px rgba(158,158,158,.31)` shadow; inner max width 1200px; logo 160px; top container `gap: 20px`, right-aligned; search icon and cart in `#f0f0f0` 40px boxes (radius 5px); ticket button `linear-gradient(183deg, #ffa700 45%, #f26922 75%)`, white uppercase Poppins 16/700, radius 5px; nav links Poppins 14/700 `#313841`, capitalize, `padding: 9px 20px`. Tablet (≤768): search and cart hidden, ticket + burger visible, menu collapsed.

## 4. Script
`createCustomHeader(widgetData)`: the burger toggles `.nav.is-open` (+ `aria-expanded`); Enter in the search input goes to `/search?q=…`. Weather temperature and cart count are filled by the platform (samples in the preview: 72°F, 0).

## 5. Data
```json
{
  "Logo": "/assets/logo/placeholder.svg",
  "OrganizationName": "Your Organization Name Here",
  "Countdown": { "Source": "Site settings → Countdown", "Icon": "/assets/icons/calendar.svg" },
  "Search": { "Label": "Search", "ShowLabel": false, "Mode": "closed" },
  "Login": null,
  "Weather": false,
  "HoursDirections": { "Label": "Hours & Directions", "URL": "/p/hours--directions", "ShowIcon": true },
  "Cart": true,
  "TicketButton": { "Label": "Buy Tickets", "URL": "/p/tickets--deals", "Placement": "top" }
}
```

## 6. Config options
| Section | Label | Key | Field type | Default | Options / range | Visible when | Notes |
|---|---|---|---|---|---|---|---|
| A | Logo | logo | image (`library: 'logo'`) | Saffire blue logo (`src/assets/saffire-loog-blue.png` → `/assets/logo/saffire-logo-blue.png`) | PNG / JPG uploads | | PNG keeps transparency |
| A | Organization name | organizationName | text | Your Organization Name Here | | | logo alt text |
| A | Search label | searchLabel | text (`maxLength: 12`) | Search | | showSearch | word + placeholder |
| A | Login label / URL | loginLabel / loginUrl | text | Login / /account/login | | showLogin | link tip |
| A | Hours & Directions label / URL | hoursLabel / hoursUrl | text | Hours & Directions / /p/hours--directions | | showHours | link tip |
| A | Ticket button label | ticketLabel | text | Buy Tickets | | | URL always `/p/tickets--deals` (note in tip) |
| B | Widget ID | widgetId | text | `customHeader` | | | |
| B | Countdown · desktop / · mobile / icon | showCountdown / countdownMobile / showCountdownIcon | switches | on / on / on | | | text from Site settings → Countdown (tip) |
| B | Search box · desktop / · mobile / word / input | showSearch / searchMobile / showSearchWord / searchMode | switches + segmented | on / off / off / closed | closed (opens on hover) · always open | | desktop and mobile independent |
| B | Login link · desktop / · mobile | showLogin / loginMobile | switches | off / off | | | |
| B | Weather · desktop / · mobile | showWeather / weatherMobile | switches | off / off | | | |
| B | Hours & Directions · desktop / · mobile / pin icon | showHours / hoursMobile / showHoursIcon | switches | on / off / on | | | |
| B | Cart · desktop / · mobile | showCart / cartMobile | switches | on / off | | | |
| B | Fixed header | fixed | switch | on | | | position: fixed + spacer |
| B | Ticket placement | ticketPlacement | segmented | top | Next to top container · Next to navigation | | critical option |
| B | Ticket on mobile | mobileTicket | segmented | beside | Next to burger · Above burger | ticket label | above: countdown next to the burger |
| C | Header width / background / shadow | widthMode, maxWidth / headerBackground / headerShadow | segmented + slider / color / switch | Max 1200 / #fff / on | | | |
| C | Mobile breakpoint | breakpoint | slider | 768 | 480–1440 px | | collapse point (one media block) |
| C | Logo width | logoWidth | slider | 160 | 60–320 px | | responsive · mobile 110 |
| C | Countdown date / event name | dateFont / eventFont | typography | 13/700 #0079c2 uppercase · 16/700 #313841 | | showCountdown | responsive · event mobile 14 |
| C | Countdown icon / size / color / background | countdownIcon / countdownIconSize / countdownIconColor / countdownIconBackground | image (`library: 'icon'`) / slider / color / color | calendar / 32 / #0079c2 / transparent | 16–72 px | showCountdownIcon | painted in one plain color (CSS mask, works for PNG too) |
| C | Search colors | searchIconBackground, searchIconColor, searchHoverBackground, searchInputBackground, searchInputBorder | color | #f0f0f0, #313841, #e2e6ea, #fff, #d0d5db | | showSearch | |
| C | Search text / hover | searchFont / searchHoverColor | typography / color | 14/400 #313841 / #0079c2 | | showSearch | responsive |
| C | Login text | loginFont | typography | 14/600 #313841 | | showLogin | responsive |
| C | Weather text | weatherFont | typography | 14/600 #313841 | | showWeather | responsive |
| C | Hours text / hover | hoursFont / hoursHoverColor | typography / color | 14/600 #313841 / #0079c2 | | showHours | responsive |
| C | Cart text / background / hover | cartFont / cartBackground / cartHoverColor | typography / color | 14/400 #000 / #f0f0f0 / #0079c2 | | showCart | responsive |
| C | Ticket button · custom style | ticketStyle | buttonStyle | off (mango orange gradient) | | | text, hover and button styles |
| C | Burger color | burgerColor | color | #313841 | | | always shown on mobile |

## 7. Rendering rules
- Top container items render in the fixed order search → login → weather → hours → cart, each only when shown.
- Login and Hours & Directions links render only with a label and a URL.
- The ticket button renders when it has a label; its URL is always `/p/tickets--deals`.
- An element is in the markup when it's on for desktop **or** mobile; CSS hides it on the viewport where it's off (base `display: none` and/or a tablet override).
- Countdown: date and event name are two separate lines with their own styles, filled from Site settings → Countdown (`${CountdownDate}`, `${CountdownEventName}`). The icon is a mask painted in `countdownIconColor`; padding only when the icon background isn't transparent.
- Search: the word renders only when "Show the search word" is on; closed = input width 0, opening on hover / focus; open = input always visible.
- Hours pin icon optional. The burger is always there on mobile.
- Ticket placement switches the grid areas: top = `'logo countdown top ticket' 'logo nav nav nav'`; nav = `'logo countdown top top' 'logo nav nav ticket'` (countdown / ticket columns are dropped when not rendered).
- Collapsed header (`@media (max-width: <breakpoint>px)`), ticket next to the burger: `'logo top ticket burger' 'nav nav nav nav' 'countdown …'` — the countdown sits at the very bottom. Ticket above the burger: `'logo top ticket ticket' 'countdown countdown countdown burger' 'nav nav nav nav'` (without countdown: `'logo top burger burger'`). The burger is always `justify-self: end`. The menu is hidden until `.nav.is-open`, then listed vertically.
- Fixed: `#header { position: fixed; top: 0; left: 0; z-index: 1000 }` + `<div class="header-spacer">` after it (height = header height via script).

## 8. Responsive behavior
- Desktop: full layout above the breakpoint.
- Mobile (≤ breakpoint, default 768): collapsed header; smaller logo and event name (responsive defaults). No tablet step.

## 9. Empty / removed state
n/a — the header is always rendered.

## 10. Out of scope / open questions
- Countdown as a real "N days until" counter (now date + event name from Site settings).
- Real weather / cart data and the CMS menu (samples in the preview).
- Navigation styles (no options requested yet); the general message banner above the header.
- Exact ticket page URL per site (`/p/tickets--deals` from mango).
