# Component spec — Hot Buttons

## 1. Identity
- **Category:** `cards`
- **Component name:** Hot Buttons
- **Component slug:** `hot-buttons` (same slug as the former "coming soon" entry)
- **Status:** beta (first iteration, no live Saffire widget to mirror yet)
- **Summary (one line):** Big, bold shortcut tiles to the most important pages.
- **Order in category:** 20

## 2. Functional description
- A row of big shortcut buttons. Each button has a title and one URL, and the **whole button is the link**.
- Each button can show an optional icon next to its title (built-in placeholder icons or an uploaded PNG). Icons can be hidden for the whole widget at once.
- A button only renders when it has both a title and a URL. With no renderable button the widget is removed.
- The icon can sit left, right, above or below the title (per viewport).
- Buttons per row, sizing, min width / height, padding, icon position and size, alignment and typography can differ per viewport (defaults: 2 per row on tablet, 1 on mobile).
- "Button sizing" works like Cards Grid: Keep button size (equal widths, full rows fill the width, a short last row is centered) or Stretch to fill.

## 3. Real markup (HTML template)
No live widget yet — markup follows the Cards Grid conventions.
```html
<div class="customHotButtons-container custom-hot-buttons-container">
  <div id="customHotButtons">
    <a href="${URL}" class="hot-button-item">
      <img class="hot-button-icon" src="${Icon}" alt="" />
      <span class="hot-button-title">${Title}</span>
    </a>
  </div>
</div>
```

## 3b. Real CSS
n/a — defaults follow the Saffire brand (`#0079c2`, Poppins) and Cards Grid.

## 4. Script
`createCustomHotButtons(widgetData)` — renders one `.hot-button-item` per item that has a `Title` and a `URL`; the icon `<img>` only when `ShowIcons` and the item has an `Icon`. Links get `updateLinksAttributes(URL, Title)`. No renderable item → the widget is removed from the page.

## 5. Data
```json
{
  "ShowIcons": true,
  "Items": [
    { "Title": "Buy tickets", "URL": "https://example.com/tickets", "Icon": "/assets/icons/ticket.svg" },
    { "Title": "Events", "URL": "https://example.com/events", "Icon": "/assets/icons/calendar.svg" },
    { "Title": "Plan your visit", "URL": "https://example.com/visit", "Icon": "/assets/icons/map-pin.svg" },
    { "Title": "Shop", "URL": "https://example.com/shop", "Icon": "/assets/icons/bag.svg" }
  ]
}
```
`Icon` is the exported asset path: built-in icons → `/assets/icons/<id>.svg`, PNG uploads → `/assets/icons/<file-name>.png`, none → `null`.

## 6. Config options
| Section | Label | Key | Field type | Default | Options / range | Visible when | Notes |
|---|---|---|---|---|---|---|---|
| A | Buttons (Title, URL, Icon) | items | list (text, text, image · icon library) | 4 items (see Data) | | | Icon: none / 8 placeholder icons / PNG uploads only. URL tip |
| B | Widget ID | widgetId | text | `customHotButtons` | | | |
| B | Number of buttons | buttonCount | stepper | 4 | 1–12 | | |
| B | Buttons per row | buttonsPerRow | stepper | 4 | 1–6 | | responsive · tablet 2, mobile 1 |
| B | Show / hide → Show icons | showIcons | switch | on | | | |
| C | Grid → Width | widthMode / maxWidth | segmented + slider | Max width 1200 | 480–1920 | | |
| C | Grid → Gap | gap | slider | 20 | 0–60 px | | |
| C | Button → Button sizing | buttonSizing | segmented | fixed | fixed ("Keep button size") / stretch ("Stretch to fill") | | responsive |
| C | Button → Min width | buttonMinWidth | slider | 200 | 0–480 px | | responsive; 0 = none |
| C | Button → Min height | buttonMinHeight | slider | 90 | 40–300 px | | responsive |
| C | Button → Padding vertical / horizontal | paddingY / paddingX | slider | 20 / 24 | 0–80 px | | responsive |
| C | Button → Border radius | borderRadius | slider | 10 | 0–60 px | | |
| C | Button → Background / Hover background | buttonColor / hoverColor | color | `#0079c2` / `#11325d` | | | |
| C | Button → Hover text color | hoverTextColor | color | `#ffffff` | | | |
| C | Button → Border width / color | borderWidth / borderColor | slider + color | 0 / `#0079c2` | 0–12 px | borderWidth > 0 (color) | |
| C | Button → Shadow | shadow | switch | on | | | |
| C | Content → Icon position | iconPosition | segmented | left | left / right / top / bottom | showIcons | responsive |
| C | Content → Icon size | iconSize | slider | 40 | 16–120 px | showIcons | responsive |
| C | Content → Icon gap | iconGap | slider | 14 | 0–40 px | showIcons | responsive |
| C | Content → Alignment | contentAlign | segmented | center | left / center / right | | responsive |
| C | Typography → Title | titleFont | typography | Poppins 18 / 700 / 1.3 / `#ffffff` / uppercase | | | responsive |

## 7. Rendering rules
- A button renders only when its item has a non-empty Title **and** URL (shared helper for preview, codegen and script).
- Buttons added with "Number of buttons" start with a placeholder title and URL (`https://example.com/button-N`) so they render immediately.
- The whole button is the `<a>` (`href` = URL, external links get `target/rel/aria-label` via `linkAttributes` / `updateLinksAttributes`).
- The icon renders only when "Show icons" is on and the item has an icon; built-in icons and PNG uploads resolve to preview URLs in the simulator and to `/assets/icons/…` paths in the Data.
- Icon position → `flex-direction` of `.hot-button-item`: left `row`, right `row-reverse`, top `column`, bottom `column-reverse`. Alignment maps to `justify-content` in a row and `align-items` in a column.
- Button sizing / per row / min width: shared row model (`tooling/itemRow`), same as Cards Grid ("Keep" = `flex: 0 1` + container queries, "Stretch" = `flex: 1 1`).
- Hover / focus: background → hover background, title → hover text color.

## 8. Responsive behavior
- Desktop (1280): 4 per row.
- Tablet (≤768): 2 per row.
- Mobile (≤480): 1 per row.
- Everything marked responsive above can be changed per viewport.

## 9. Empty / removed state
No button with both a title and a URL → "Component empty/removed" (`isEmpty`), the script removes the widget.

## 10. Out of scope / open questions
- Real Saffire markup/CSS for hot buttons (adopt when available).
- Final brand icon set (placeholders are white line icons for coloured buttons).
- Icon recolouring (PNG icons keep their own colours).
