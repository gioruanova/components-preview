# Component spec — Cards Grid

## 1. Identity
- **Category:** NEW → name "Cards", slug `cards`, "Image-led card collections for events, offers and listings."
- **Component name:** Cards Grid
- **Component slug:** `cards-grid`
- **Status:** stable
- **Summary:** Grid of image cards with a title and hover-revealed description and buttons.
- **Order in category:** 10

## 2. Functional description
- Displays a grid of cards, each with a title and, optionally, a description and up to two buttons ("More" and "Buy now").
- The description and each button are shown or hidden for the whole widget at once — not per card.
- A button only renders on a given card when that card actually has the matching URL.
- A card with no description and no buttons is rendered as non-interactive (no hover state, no link).
- Cards per row applies on desktop; tablet shows at most 2 per row and mobile 1.
- On mobile, the hover-reveal description/buttons are hidden entirely — only the title shows.

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
`createCustomCards(widgetData)` — per `.card-widget-item`, appends title, description and the More / Buy now buttons when the item has `URL` / `PurchaseURL`.

## 5. Data
```json
{
  "ShowDescription": true, "ShowMoreButton": true, "ShowBuyNowButton": false,
  "Items": [{ "Title": "Summer Concert Series", "Description": "…", "Image": "https://picsum.photos/seed/concert/600/400", "URL": "…", "PurchaseURL": "…" }]
}
```

## 6. Config options
| Section | Label | Key | Field type | Default | Options / range | Visible when |
|---|---|---|---|---|---|---|
| A | Cards | items | list (Title, Image, Description, URL, PurchaseURL) | 4 POC items | count = cardCount | |
| B | Widget ID | widgetId | text | customCards | | |
| B | Number of cards | cardCount | stepper | 4 | 1–12 | |
| B | Cards per row | cardsPerRow | stepper | 4 | 1–6 | |
| B | Description | showDescription | switch | on | | |
| B | More button | showMoreButton | switch | on | | |
| B | Buy now button | showBuyNowButton | switch | off | | |
| C | Shape | shape | segmented | square | square / circle | |
| C | Border radius | borderRadius | slider | 10 | 0–40 px | shape = square |
| C | Card width | cardWidth | slider | 280 | 160–420 px | |
| C | Card height | cardHeight | slider | 320 | 160–520 px | shape = square |
| C | Border width | borderWidth | slider | 0 | 0–12 px (solid) | |
| C | Border color | borderColor | color | #ffffff | | borderWidth > 0 |
| C | Title background | titleBackground | switch | off | | |
| C | Card color | cardColor | color | #007bc7 | | |

## 7. Rendering rules
- Title background on → card color fills the title bar and tints the overlay (stronger on hover).
- Card color is also used for the "Buy now" button.
- Circle shape forces a 1:1 card using the width.

## 8. Responsive behavior
- Desktop: `cardsPerRow`. Tablet (≤768): max 2. Mobile (≤480): 1, hover content hidden.

## 9. Empty / removed state
n/a
