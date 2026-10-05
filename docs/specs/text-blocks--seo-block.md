# Component spec — SEO Block

## 1. Identity
- **Category:** NEW → name "Text Blocks", slug `text-blocks`, "Text-led blocks that give a page a crawlable heading, a supporting description and calls to action."
- **Component name:** SEO Block
- **Component slug:** `seo-block`
- **Status:** stable
- **Summary:** Heading, divider, description and up to two call-to-action buttons.
- **Order in category:** 10

## 2. Functional description
- Displays a two-line title, an optional divider under the title, an optional description, and up to two optional buttons — each independently shown or hidden.
- The heading level (`h1`–`h6`) is configurable so the block fits the page outline.
- Each button has its own URL and label.
- If both buttons are hidden, the buttons container itself is omitted.
- External button URLs get `target="_blank"`, `rel="noopener noreferrer"` and an accessible "opens in a new tab" label.
- If the widget has no data at all, it's removed from the page entirely.

## 3. Real markup
```html
<div class="customSeoBlock-signup-container">
  <div id="customSeoBlock">
      <h1 class="seo-title">${Title}</h1>
      <span class="seo-divider"></span>
      <div class="seo-description">${Description}</div>
      <div class="buttons-container">
          <a href="${Button1URL}" class="button">${Button1Label}</a>
          <a href="${Button2URL}" class="button">${Button2Label}</a>
      </div>
  </div>
</div>
```

## 4. Script
`createCustomSeo(widgetData)` — builds title (+ divider inside heading), description, and the buttons container only if a button is shown. Uses `updateLinksAttributes(url, title)`.

## 5. Data
```json
{
  "ShowTitle": true, "TitleLine1": "Search Engine", "TitleLine2": "Optimized Title", "HeadingLevel": "h1",
  "ShowDivider": true, "ShowDescription": true, "Description": "Use this box for explaining who you are, where you are, what you do, and how to contact you. This text will greatly improve your visibility on Google and Bing, the top 2 search engines worldwide. Avoid adding dates to this text - the search engines will.",
  "Button1Show": true, "Button1URL": "https://example.com/learn-more", "Button1Label": "Learn More",
  "Button2Show": true, "Button2URL": "https://tickets.partner.com/join", "Button2Label": "Explore"
}
```

## 6. Config options
| Section | Label | Key | Field type | Default | Options / range | Visible when |
|---|---|---|---|---|---|---|
| A | Title line 1 | titleLine1 | text | Join thousands of members | | showTitle |
| A | Title line 2 | titleLine2 | text | today | | showTitle |
| A | Description | description | textarea | Get access to… | | showDescription |
| A | Button 1 / 2 | buttonNLabel, buttonNUrl | group(text, text + URL tip) | | | buttonNShow |
| B | Show / hide | showTitle, showDivider, showDescription, button1Show, button2Show | switches | all on | | |
| B | Widget ID | widgetId | text | customSeoBlock | | |
| B | Heading level | headingLevel | select | h1 | h1–h6 | |
| C | Content alignment | alignment | segmented | left | left / center / right | |
| C | Title line 1 | titleFont | typography | Poppins 36 / 700 / 1.2 / #313841 / capitalize | | |
| C | Title line 2 | title2Font | typography | Poppins 36 / 400 / 1.2 / #313841 / capitalize | | |
| C | Description | descriptionFont | typography | Poppins 19 / 400 / 1.6 / #313841 | | |
| C | Width | widthMode / maxWidth | segmented + slider | Max width 920 | Max width (480–1530 px) / 100% | |
| C | Background color | backgroundColor | color | #eeeeee | | |
| C | Border radius | borderRadius | slider | 8 | 0–48 px | |
| C | Border width | borderWidth | slider | 0 | 0–12 px (solid) | |
| C | Border color | borderColor | color | #0079c2 | | borderWidth > 0 |
| C | Divider color | dividerColor | color | #0f294a | | title + divider on |
| C | Default button color | buttonColor | color | #0079c2 (gradient to #11325d) | | any button on |
| C | Button 1 / 2 · custom style | button1Style / button2Style | buttonStyle | off (Button 2 preset orange) | | that button on |

| C | Padding vertical / horizontal | paddingY / paddingX | slider | 50 / 50 | 0–120 px | | responsive · tablet 40/24, mobile 32/16 |
| C | Stack buttons | buttonsStack | switch | off | | any button on | responsive · mobile on |

Responsive (per viewport): alignment, title line 1/2 and description typography (tablet 31px, mobile 27px titles), padding, stack buttons.

Container options are added automatically. The outer wrapper's padding is the shared widget spacing (`20px 15px`), dropped when a container or Layout builder section already provides spacing (see docs/reference.md → Container).

## 7. Rendering rules
- Both title lines render inside the heading; line 2 in `<span class="seo-title-line2">`.
- Divider renders inside the heading, only with the title.
- A button renders only when shown **and** it has a URL and a label. The URL field explains this in a tooltip.
- Buttons container omitted when no button renders.
- Clamp (typography) applies per title line and on the description.

- Alignment drives `text-align`, flex alignment of the title/buttons, and the block's position (margin).
- Base styles come from the existing widget: gray box `#eee` with 8px radius, 6px navy divider (max 290px), gradient pill buttons.

## 8. Responsive behavior
- Tablet: smaller padding, title × 0.85. Mobile: title × 0.75, buttons stack at natural width, following the alignment.

## 9. Empty / removed state
Title, description, button 1 and button 2 all off.
