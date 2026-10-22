# Component spec — Hot Buttons

## 1. Identity
- **Category:** `cards`
- **Component name:** Hot Buttons
- **Component slug:** `hot-buttons` (same slug as the former "coming soon" entry)
- **Status:** beta. Built in Saffire as **"Hot Buttons"** (technical key `hotButtons`, client-rendered; POC branch `feature/components-standarization`). Framework: `docs/saffire-components.md`.
- **Summary (one line):** Big, bold shortcut tiles to the most important pages.
- **Order in category:** 20

## 2. Functional description
- A row of big shortcut buttons. Each button has a title and one URL, and the **whole button is the link**.
- Each button can show an optional icon next to its title (built-in placeholder icons or an uploaded PNG). Icons can be hidden for the whole widget at once.
- A button renders when it has a label; without a URL it shows but is not clickable (`void-link`). With no button the widget is removed.
- The icon can sit left, right, above or below the title (per viewport).
- Buttons per row, sizing, min width / height, padding, icon position and size, alignment and typography can differ per viewport (defaults: 2 per row on tablet, 1 on mobile).
- "Button sizing" works like Cards Grid: Keep button size (equal widths, full rows fill the width, a short last row is centered) or Stretch to fill.

## 3. Real markup (Saffire)
Default template (Spark → Add Widget, editable per placement). The server renders the container; the `{#Items}` block
(one button) is filled in the browser:
```html
<div id="{WidgetId}" class="hot-buttons">
  {#Items}
  <a class="hot-button" href="{URL}" data-link-label="{Title}">
    <div class="card-content">
      {#ShowIcons}{#Icon}<div class="icon-wrapper"><img class="hot-button-icon" src="{IconURL}" alt="{IconAlt}" /></div>{/Icon}{/ShowIcons}
      <span class="widget-title">{Title}</span>
    </div>
  </a>
  {/Items}
</div>

<script type="text/javascript">
$(function () {
  saffire.widgets.hotButtons('#{WidgetId}', function ($el, data, hasData) {
    // DOM is ready: manipulate the buttons here. data = { HasData, Items: [...] }
  });
});
</script>
```
Item tokens: `{Title}` (Button Label), `{URL}` (Button URL), `{IconURL}`, `{IconAlt}`, `{Source}`. Sections: `{#URL}`, `{#Icon}` (has an icon), `{#ShowIcons}` (option).

## 3b. Real CSS
None shipped: sites style `.hot-buttons`, `.hot-button`, `.card-content`, `.icon-wrapper`, `.hot-button-icon`, `.widget-title` in their theme. The simulator styles below are a design reference.

## 4. Script
`hotButtons.js` + `widgetHelpers.js` are registered by the widget. The template calls `saffire.widgets.hotButtons('#{WidgetId}', function ($el, data, hasData) {…})`; the shared renderer (`saffire.utils.renderComponent`) reads the config the server left in place of `{#Items}`, loads the data, renders one button per item there, applies `updateLinksAttributes` to every link, then runs the function (also with `hasData: false`) and triggers `componentLoaded` on the container. No item → the container is removed and `<body>` gets `hotButtons-no-data`.

## 5. Data
```json
{
  "HasData": true,
  "Items": [
    { "Source": "custom", "Title": "Buy tickets", "URL": "https://example.com/tickets", "IconURL": "https://…/ticket.png", "IconAlt": "" },
    { "Source": "custom", "Title": "Events", "URL": "/events", "IconURL": "", "IconAlt": "" }
  ]
}
```
`IconURL` / `IconAlt` come from the asset library. Empty alt → the button label is used. Fields disabled in the module are not sent.

## 6. Config options
| Section | Label | Key | Field type | Default | Options / range | Visible when | Notes |
|---|---|---|---|---|---|---|---|
| A | Buttons (Title, URL, Icon) | items | list (text, text, image · icon library) | 4 items (see Data) | | | Icon: none / 8 placeholder icons / PNG uploads only. URL tip |
| B | Widget ID | widgetId | text | `hotButtons` | | | |
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

### 6b. Saffire configuration
| Who / where | Label | Default | Rules |
|---|---|---|---|
| Client · Manage Items | Button Label | — | Required; max 40 (module, cap 100) |
| Client · Manage Items | Button URL | — | Optional; no protocol → current protocol added; `javascript:` / `data:` rejected |
| Client · Manage Items | Icon | — | Optional; asset library (Alt Text optional, "Use original image's metadata"); recommended 30 × 30 px |
| Client · tab | Rows | — | Each row picks an item or "Select (empty)"; up to Max Items |
| Spark user · Add Widget | Widget Id | `hotButtons` | Letters, numbers, `-`, `_`; invalid → `hotButtons-{placement id}` |
| Spark user · Add Widget | Show Icons | on | Section `{#ShowIcons}` |
| Spark user · Add Widget | Template | default template above | Per placement; "Reset to default template" |
| Admin · Module | Max Items | 4 | 1–12 |
| Admin · Module | Button Label / Button URL / Icon → Enabled, Required, Max Length, Recommended Width / Height | on/on/40 · on/off · on/off/30/30 | Disabled fields are hidden in the editor and not sent |

## 7. Rendering rules
- A button renders when its item has a label (shared helper for preview and codegen); without a URL it has no `href` and gets `void-link`.
- Buttons added with "Number of buttons" start with a placeholder title and URL (`https://example.com/button-N`) so they render immediately.
- The whole button is the `<a>` (`href` = URL, external links get `target/rel/aria-label` via `linkAttributes` / `updateLinksAttributes`).
- The icon renders only when "Show icons" is on and the item has an icon; built-in icons and PNG uploads resolve to preview URLs in the simulator and to `/assets/icons/…` paths in the Data.
- Icon position → `flex-direction` of `.card-content`: left `row`, right `row-reverse`, top `column`, bottom `column-reverse`. Alignment maps to `justify-content` in a row and `align-items` in a column.
- Button sizing / per row / min width: shared row model (`tooling/itemRow`), same as Cards Grid ("Keep" = `flex: 0 1` + container queries, "Stretch" = `flex: 1 1`).
- Hover / focus: background → hover background, title → hover text color.

## 8. Responsive behavior
- Desktop (1280): 4 per row.
- Tablet (≤768): 2 per row.
- Mobile (≤480): 1 per row.
- Everything marked responsive above can be changed per viewport.

## 9. Empty / removed state
No button with a label → "Component empty/removed" (`isEmpty`); in Saffire the container is removed and `<body>` gets `hotButtons-no-data`.

## 10. Out of scope / open questions
- Final brand icon set (placeholders are white line icons for coloured buttons).
- Icon recolouring (PNG icons keep their own colours).
