# Component spec — SEO Block

## 1. Identity
- **Category:** NEW → name "SEO Block", slug `seo-block`, "Text-led blocks that give a page a crawlable heading, a supporting description and calls to action."
- **Component name:** SEO Block
- **Component slug:** `seo-block-default`
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
  "ShowTitle": true, "TitleLine1": "Join thousands of members", "TitleLine2": "today", "HeadingLevel": "h1",
  "ShowDivider": true, "ShowDescription": true, "Description": "Get access to exclusive events, discounts, and community perks.",
  "Button1Show": true, "Button1URL": "https://example.com/learn-more", "Button1Label": "Learn More",
  "Button2Show": true, "Button2URL": "https://tickets.partner.com/join", "Button2Label": "Explore"
}
```

## 6. Config options
| Section | Label | Key | Field type | Default | Options / range | Visible when |
|---|---|---|---|---|---|---|
| A | Title | showTitle | switch | on | | |
| A | Title line 1 | titleLine1 | text | Join thousands of members | | showTitle |
| A | Title line 2 | titleLine2 | text | today | | showTitle |
| A | Description | description / showDescription | switchText | on | multiline | |
| A | Button 1 / 2 | buttonNShow, buttonNLabel, buttonNUrl | group(switch, text, text) | on | | label/url when shown |
| B | Widget ID | widgetId | text | customSeoBlock | | |
| B | Heading level | headingLevel | select | h1 | h1–h6 | |
| B | Title divider | showDivider | switch | on | | showTitle |
| B | Site base URL | siteBaseUrl | text | https://example.com | | |
| C | Background color | backgroundColor | color | #f0f0f0 | | |
| C | Text color | textColor | color | #222222 | | |
| C | Border radius | borderRadius | slider | 16 | 0–48 px | |
| C | Border width | borderWidth | slider | 0 | 0–12 px (solid) | |
| C | Border color | borderColor | color | #007bc7 | | borderWidth > 0 |

## 7. Rendering rules
- Both title lines render inside the heading; line 2 in `<span class="seo-title-line2">`.
- Divider renders inside the heading, only with the title.
- Buttons container omitted when both buttons are hidden.

## 8. Responsive behavior
- Tablet: smaller padding and title. Mobile: buttons stack full width.

## 9. Empty / removed state
Title, description, button 1 and button 2 all off.
