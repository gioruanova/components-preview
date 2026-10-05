# Component spec — Cards Grid

## 1. Identity
- **Category:** NEW → name "Cards", slug `cards`, "Image-led card collections for events, offers and listings."
- **Component name:** Cards Grid
- **Component slug:** `cards-grid`
- **Status:** stable
- **Summary:** Grid of image cards with a title and hover-revealed description and buttons.
- **Order in category:** 10

## 2. Functional description
- Displays a grid of cards, each with a title and, optionally, a description and up to two buttons (Button 1 and Button 2, each with its own label).
- The description and each button are shown or hidden for the whole widget at once — not per card.
- A button only renders on a given card when that card actually has the matching URL.
- A card with no description and no buttons is rendered as non-interactive (no hover state, no link).
- Cards per row applies on desktop; tablet shows at most 2 per row and mobile 1. "Card sizing": Keep card size (equal-width cards that fill full rows; a short last row is centered) or Stretch to fill (flex row, `flex: 1 1`). "Limit card width" adds `max-width: $card-width`.
- The title (and on hover the description and buttons) can be positioned top, center or bottom and left, center or right.
- Hovering (or tapping on touch devices) reveals the description and buttons on every viewport, mobile included.

## 3. Real markup
```html
<div class="custom-cards-container">
  <div id="customCards">
    <a class="card-widget-item">
      <div class="image-container" style="background-image: url('${Image}')"></div>
      <div class="overlay"></div>
      <div class="card-content">
        <div class="widget-title-wrapper"><h3 class="widget-title">${Title}</h3></div>
        <div class="hover-content">
          <p class="widget-description">${Description}</p>
          <div class="cards-buttons-container"><a href="${URL}" class="button">More</a></div>
        </div>
      </div>
    </a>
  </div>
</div>
```

## 4. Script
`createCustomCards(widgetData)` — per `.card-widget-item`, appends title, description and Button 1 / Button 2 when the item has `Button1URL` / `Button2URL` and the button has a label.

## 5. Data
```json
{
  "ShowDescription": true, "ShowMoreButton": true, "ShowBuyNowButton": false,
  "Items": [{ "Title": "Summer Concert Series", "Description": "…", "Image": "https://picsum.photos/seed/concert/600/400", "Button1URL": "…", "Button2URL": "…" }]
}
```

## 6. Config options
| Section | Label | Key | Field type | Default | Options / range | Visible when |
|---|---|---|---|---|---|---|
| A | Button 1 / 2 label | buttonNLabel | text + URL tip | "More" / "Buy now" | | buttonNShow |
| B | Show / hide | showDescription, button1Show, button2Show | switches | on / on / off | | |
| A | Cards | items | list (Title, Image, Description, Button1URL, Button2URL + URL tips) | 4 POC items | count = cardCount | |
| B | Widget ID | widgetId | text | customCards | | |
| B | Number of cards | cardCount | stepper | 4 | 1–12 | |
| B | Cards per row | cardsPerRow | stepper | 4 | 1–6 | |
| C | Card sizing | cardSizing | segmented | fixed | fixed ("Keep card size", equal widths, cards per row from the grid width) / stretch ("Stretch to fill", flex 1 1) | | responsive |
| C | Limit card width | limitWidth | switch | on | | | responsive · max-width: card width |
| C | Grid width | widthMode / maxWidth | segmented + slider | Max width 1530 | Max width / 100% | |
| C | Shape | shape | segmented | square | square / circle | |
| C | Border radius | borderRadius | slider | 10 | 0–40 px | shape = square |
| C | Card width | cardWidth | slider | 370 | 160–520 px (max width) | |
| C | Card height | cardHeight | slider | 245 | 160–520 px | shape = square |
| C | Card color | cardColor | color | #0079c2 | | |
| C | Border width | borderWidth | slider | 0 | 0–12 px (solid) | |
| C | Border color | borderColor | color | #0079c2 | | borderWidth > 0 |
| C | Add title background | titleBackground | switch | on | | |
| C | Vertical position | contentVertical | segmented | center | top / center / bottom | |
| C | Horizontal position | contentHorizontal | segmented | center | left / center / right | |
| C | Title | titleFont | typography | Poppins 28 / 700 / 1.5 / #fff / capitalize, clamp 2 | | |
| C | Button 1 / 2 · custom style | button1Style / button2Style | buttonStyle | off (outlined white preset) | | that button on |
| C | Description | descriptionFont | typography | Poppins 15 / 400 / 1.4 / #fff, clamp 3 | | |

| C | Card min width | cardMinWidth | slider | 260 | 0–480 px (0 = none) | | responsive · cards wrap instead of shrinking |
| C | Aspect ratio | aspectRatio | select | auto | auto / 1:1 / 4:3 / 3:2 / 16:9 / 3:4 | square | responsive · auto uses card height |

Responsive (per viewport): cards per row (tablet 2, mobile 1), card width, min width, height, aspect ratio, content position, title (fluid, cqi; tablet 24px, mobile 22px) and description typography.

Container options are added automatically. The outer wrapper's padding is the shared widget spacing (`20px 15px`), dropped when a container or Layout builder section already provides spacing (see docs/reference.md → Container).

## 7. Rendering rules
- Base look from the existing widget: card color background, centered rounded title bar (max 75%), shadow; on hover the overlay slides down from the top, the image zooms ×1.15, the title bar turns transparent and the description and buttons fade in. Buttons are outlined white pills.
- Title background on → the card color fills the title bar and the hover overlay. Off → transparent title with a text shadow and a dark overlay.
- Card sizing "Stretch to fill" → `display: flex` + `flex: 1 1 <basis>` (cards grow into the leftover space of their row; a short last row gets wider cards).
- Card sizing "Keep card size" → `flex: 0 1 <basis(k)>` in the centered flex row: every card has the same width and full rows fill the full width of the grid (e.g. inside a Layout builder column); a short last row keeps that width and is centered. `k` (cards per row) comes from the grid width with container queries on `#<widgetId>` (`container: cards-grid / inline-size`): k cards fit when width ≥ k × min + (k − 1) × gap, at most N (Cards per row). Base `flex: 0 1 100%` (below 2 cards), then `@container cards-grid (min-width: <step>px)` for each extra card. Without a min width there are no queries: `flex: 0 1 <basis(N)>`. In a media block the base `flex` is re-set whenever the sizing (mode, per row, min width) changes, which resets the inherited queries, followed by only that viewport's own steps (those ≤ the breakpoint).
- A card capped by "Limit card width" stays centered in the row.
- "Limit card width" on → `max-width: $card-width` (also when stretching); off → no max-width (`none` in an override).
- Content position sets the alignment of the title and the hover content inside the card.
- Circle shape forces a 1:1 card using the width.

## 8. Responsive behavior
- Desktop: `cardsPerRow`. Tablet (≤768): max 2. Mobile (≤480): 1.
- The hover reveal is the same on every viewport (tap on touch devices).

## 9. Empty / removed state
n/a
