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
- Cards per row applies on desktop; tablet shows at most 2 per row and mobile 1. With "Fit space" on, cards grow to fill the row.
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
| B | Fit space | fitSpace | switch | off | | |
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

Container options are added automatically.

## 7. Rendering rules
- Base look from the existing widget: card color background, centered rounded title bar (max 75%), shadow; on hover the overlay slides down from the top, the image zooms ×1.15, the title bar turns transparent and the description and buttons fade in. Buttons are outlined white pills.
- Title background on → the card color fills the title bar and the hover overlay. Off → transparent title with a text shadow and a dark overlay.
- Fit space on → cards grow (`flex: 1 1`) and ignore the card width, so fewer cards fill the row.
- Content position sets the alignment of the title and the hover content inside the card.
- Circle shape forces a 1:1 card using the width.

## 8. Responsive behavior
- Desktop: `cardsPerRow`. Tablet (≤768): max 2. Mobile (≤480): 1.
- The hover reveal is the same on every viewport (tap on touch devices).

## 9. Empty / removed state
n/a
