# Component spec — Cards Grid

## 1. Identity
- **Category:** NEW → name "Cards", slug `cards`, "Image-led card collections for events, offers and listings."
- **Component name:** Cards Grid
- **Component slug:** `cards-grid`
- **Status:** stable. Built in Saffire as **"Card Block"** (technical key `cardBlock`, client-rendered, rows can mix own cards and Events; POC branch `feature/components-standarization`). Framework: `docs/saffire-components.md`; Saffire contract: section 10.
- **Summary:** Grid of image cards with a title and hover-revealed description and buttons.
- **Order in category:** 10

## 2. Functional description
- Displays a grid of cards, each with a title and, optionally, an image, a description and up to two buttons (Button 1 and Button 2, each with its own label and URL per card).
- Image, description, each button and the overlay are shown or hidden for the whole widget at once; the title tag (h2–h6, p) is a widget option.
- A button only renders on a given card when that card has its label and URL.
- Cards per row applies on desktop; tablet shows at most 2 per row and mobile 1. "Card sizing": Keep card size (equal-width cards that fill full rows; a short last row is centered) or Stretch to fill (flex row, `flex: 1 1`). "Limit card width" adds `max-width: $card-width`.
- The content can be positioned top, center or bottom and left, center or right.
- Every part is always visible (same markup on every screen size); hover zooms the image and darkens the overlay.

## 3. Real markup
The Saffire Card Block default template: see section 10 (the simulator renders the same markup).

## 4. Script
`saffire.widgets.cardBlock('#{WidgetId}', function ($el, data, hasData) {…})` — see section 10.

## 5. Data
`{ HasData, Items: [{ Source, Title, Description, ImageURL, ImageAlt, Button1Label, Button1URL, Button2Label, Button2URL }] }` — see section 10.

## 6. Config options
| Section | Label | Key | Field type | Default | Options / range | Visible when |
|---|---|---|---|---|---|---|
| B | Title tag | titleTag | select | h3 | h2–h6, p | |
| B | Show / hide | showImage, showDescription, button1Show, button2Show, showOverlay | switches | all on | | |
| A | Cards | items | list (Title, Image, Description, Button 1 label / URL, Button 2 label / URL) | 4 POC items | count = cardCount | |
| B | Widget ID | widgetId | text | cardBlock | | |
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
- Base look: card color background, centered rounded title background (max 75%), shadow, overlay over the image; on hover the image zooms ×1.15 and the overlay gets darker. Buttons are outlined white pills.
- Title background on → the card color fills the title background and the overlay. Off → transparent title with a text shadow and a dark overlay.
- Card sizing "Stretch to fill" → `display: flex` + `flex: 1 1 <basis>` (cards grow into the leftover space of their row; a short last row gets wider cards).
- Card sizing "Keep card size" → `flex: 0 1 <basis(k)>` in the centered flex row: every card has the same width and full rows fill the full width of the grid (e.g. inside a Layout builder column); a short last row keeps that width and is centered. `k` (cards per row) comes from the grid width with container queries on `#<widgetId>` (`container: cards-grid / inline-size`): k cards fit when width ≥ k × min + (k − 1) × gap, at most N (Cards per row). Base `flex: 0 1 100%` (below 2 cards), then `@container cards-grid (min-width: <step>px)` for each extra card. Without a min width there are no queries: `flex: 0 1 <basis(N)>`. In a media block the base `flex` is re-set whenever the sizing (mode, per row, min width) changes, which resets the inherited queries, followed by only that viewport's own steps (those ≤ the breakpoint).
- A card capped by "Limit card width" stays centered in the row.
- "Limit card width" on → `max-width: $card-width` (also when stretching); off → no max-width (`none` in an override).
- Content position sets the alignment of the title, description and buttons inside the card.
- Circle shape forces a 1:1 card using the width.

## 8. Responsive behavior
- Desktop: `cardsPerRow`. Tablet (≤768): max 2. Mobile (≤480): 1.
- Same markup and visibility on every viewport.

## 9. Empty / removed state
Simulator: n/a. Saffire: no row with content → the container is removed and `<body>` gets `cardBlock-no-data`.

## 10. Saffire implementation (Card Block)
Default template (Spark → Add Widget, editable per placement). The server renders the container; the `{#Items}` block
(one card) is filled in the browser by `cardBlock.js` (`saffire.utils.renderComponent`):
```html
<div id="{WidgetId}" class="cards-container">
  {#Items}
  <div class="card-item">
    {#ShowImage}{#Image}<div class="image-container"><img class="card-image" src="{ImageURL}" alt="{ImageAlt}" /></div>{/Image}{/ShowImage}
    {#ShowOverlay}<div class="overlay"></div>{/ShowOverlay}
    <div class="card-content">
      <{TitleTag} class="widget-title">{Title}</{TitleTag}>
      {#ShowDescription}{#Description}<p class="widget-description">{Description}</p>{/Description}{/ShowDescription}
      <div class="buttons-container">
        {#ShowButton1}{#Button1}<a class="button" href="{Button1URL}" data-link-label="{Title} - {Button1Label}">{Button1Label}</a>{/Button1}{/ShowButton1}
        {#ShowButton2}{#Button2}<a class="button" href="{Button2URL}" data-link-label="{Title} - {Button2Label}">{Button2Label}</a>{/Button2}{/ShowButton2}
      </div>
    </div>
  </div>
  {/Items}
</div>

<script type="text/javascript">
$(function () {
  saffire.widgets.cardBlock('#{WidgetId}', function ($el, data, hasData) {
    // DOM is ready: manipulate the cards here. data = { HasData, Items: [...] }
  });
});
</script>
```
- Item tokens: `{Title}`, `{Description}`, `{ImageURL}`, `{ImageAlt}` (empty → title), `{Button1Label}` / `{Button1URL}`, `{Button2Label}` / `{Button2URL}`, `{Source}` (`custom` / `event`), `{DateRange}` / `{TimeRange}` (event rows), `{TitleTag}` (option), `{CardURL}` (first button URL, for a whole-card `<a class="card-item" href="{CardURL}">` with no other links inside).
- Sections: `{#Image}`, `{#Description}`, `{#Button1}` / `{#Button2}` (label and URL), plus the switches below.
- Same markup on every screen size; no resize logic and no styles shipped (sites style the classes in their theme).
- Data: `{ HasData, Items: [{ Source, Title, Description, ImageURL, ImageAlt, Button1Label, Button1URL, Button2Label, Button2URL[, DateRange, TimeRange] }] }`.

| Who / where | Label | Default | Rules |
|---|---|---|---|
| Client · Manage Items | Title | — | Required; max 60 (module, cap 255) |
| Client · Manage Items | Description | — | Optional; multiline, max 200 |
| Client · Manage Items | Image | — | Optional; asset library (Alt Text optional, "Use original image's metadata"); recommended 370 × 245 px |
| Client · Manage Items | Button 1 / Button 2 | — | Label (max 30) + URL; a label needs a URL |
| Client · tab | Rows | — | Each row picks "Item - {title}", "Event - {title} - {date}" or "Select (empty)"; up to Max Items |
| Spark user · Add Widget | Widget Id | `cardBlock` | Letters, numbers, `-`, `_`; invalid → `cardBlock-{placement id}` |
| Spark user · Add Widget | Title Tag | h3 | h2–h6 or p |
| Spark user · Add Widget | Show Image / Description / Button 1 / Button 2 / Overlay | all on | Sections `{#ShowImage}`, … `{#ShowOverlay}` |
| Spark user · Add Widget | Template | default template above | Per placement; "Reset to default template" |
| Admin · Module | Max Items | 8 | 1–12 |
| Admin · Module | Per field: Enabled, Required, Max Length / Label Max Length, Recommended Width / Height | | Disabled fields are hidden in the editor and not sent |

Event rows: same event list and rules as Event Feature rows (active, current calendar year, not expired, not private;
already selected events stay). Event → card: title, short description, first active photo (+ alt), Button 1 = event page,
Button 2 = purchase / register link (no add-to-cart; it links to the event page or the external / reserved seating URL).
