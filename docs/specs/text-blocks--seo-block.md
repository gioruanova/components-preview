# Component spec — SEO Block

## 1. Identity
- **Category:** Text Blocks, slug `text-blocks`, "Text-led blocks that give a page a crawlable heading, a supporting description and calls to action."
- **Component name:** SEO Block — shown in Spark as **"Seo Widget"** (`saf_widgets.name`). Technical name `seoBlock` (JS namespace, CSS class `seoBlock-no-data`, default ids, `seoBlock.js` / `seoBlock.ascx`).
- **Component slug:** `seo-block`
- **Status:** beta (POC "components standardization", branch `feature/components-standarization`)
- **Summary:** Crawlable heading, divider, paragraphs and up to two buttons, rendered server-side.
- **Order in category:** 10

## 2. Functional description
- Renders one or more **items**. Each item has a title (one or two lines), an optional divider, description paragraphs and up to two buttons.
- Rendered **on the server** from a template, so the heading is in the page HTML (SEO). A JS callback runs once the DOM is ready.
- Three roles, three places:

| Who | Where (Spark) | What |
|---|---|---|
| Admin | Widgets → Seo Widget → Data Sources → Add / Edit (+ Create / Edit Module) | Data source and its **SEO Block Module**: tab name, display rank, Max Items, which fields exist, required fields, limits, number of buttons |
| Spark user | Widgets → Add / Edit Widget → "Seo Widget" | Data source, **Widget Id**, **Title Heading**, Show / hide toggles, **HTML template** (code editor) |
| Client | Homepage Features → module tab | **Items** (Manage Items) and which item fills each **row** |

## 3. Real markup (default template, editable per placement)
```html
<div class="seoBlock-container">
  <div id="{WidgetId}">
  {#Items}
    {#ShowTitle}{TitleTagStart} class="seo-title"{TitleAriaLabelAttribute}>
      {#ShowBothTitleLines}<span>{TitleLine1}</span>
      <span>{TitleLine2}</span>{/ShowBothTitleLines}
      {#ShowSingleTitleLine}{TitleText}{/ShowSingleTitleLine}
    {TitleTagEnd}{/ShowTitle}
    {#ShowDivider}<span class="seo-divider"></span>{/ShowDivider}
    {#ShowDescription}<div class="seo-description">
      {Description}
    </div>{/ShowDescription}
    {#ShowButtons}<div class="buttons-container">
      {#ShowButton1}<a class="button" {Button1Attributes}>{Button1Label}</a>{/ShowButton1}
      {#ShowButton2}<a class="button" {Button2Attributes}>{Button2Label}</a>{/ShowButton2}
    </div>{/ShowButtons}
  {/Items}
  </div>
</div>

<script type="text/javascript">
$(function () {
  saffire.widgets.seoBlock('#{WidgetId}', function ($el, data) {
    // DOM is ready: manipulate the block here. data = { widgetId, hasData, options, items }
  });
});
</script>
```
Rendered example (two lines, h1):
```html
<div class="seoBlock-container">
  <div id="seoBlock">
    <h1 class="seo-title" aria-label="Search Engine Optimized Title"><span>Search Engine</span><span>Optimized Title</span></h1>
    <span class="seo-divider"></span>
    <div class="seo-description"><p>…</p><p>…</p></div>
    <div class="buttons-container"><a class="button" href="/learn-more" aria-label="Learn More">Learn More</a></div>
  </div>
</div>
```
In the simulator the buttons get `button button-N` so the per-button styles apply. To use them in Saffire, add `button-1` / `button-2` to the template.

### Template tokens
| Token | Value |
|---|---|
| `{WidgetId}` | Widget Id option, or `seoBlock-{placement id}` |
| `{TitleLine1}` / `{TitleLine2}` | Title lines (HTML-encoded) |
| `{TitleText}` | The only title line shown (use inside `{#ShowSingleTitleLine}`) |
| `{TitleTag}` | `h1`…`h6` for this item |
| `{TitleTagStart}` / `{TitleTagEnd}` | `<h1` / `</h1>` (lets the code editor accept a dynamic heading) |
| `{TitleAriaLabelAttribute}` | ` aria-label="Line 1 Line 2"` only with two lines, empty otherwise |
| `{TitleAriaLabel}` | Title text only |
| `{Description}` | One `<p>` per paragraph (built by the server) |
| `{ButtonNLabel}` / `{ButtonNURL}` | Label / normalized URL |
| `{ButtonNAttributes}` | `href` + `target` / `rel` + `aria-label` / `aria-disabled` (built by the server) |
| `{ItemIndex}` | 1, 2, 3… |
| Standard widget tokens | `{ExternalSiteBaseURL}`, `{WidgetModuleDataItemID}`, `{ServicePath}`, … |

Sections `{#Name}…{/Name}`: `Items` (list), `ShowTitle`, `ShowBothTitleLines`, `ShowSingleTitleLine`, `ShowTitleLine1|2`, `ShowDivider`, `ShowDescription`, `ShowButtons`, `ShowButton1|2`, `IsFirstItem`, `HasData`. A section can't be nested inside another section with the same name.

## 4. Script
- `seoBlock.js` and `widgetHelpers.js` are registered by the widget (the widget JavaScript field stays empty).
- `saffire.widgets.seoBlock(selector, callback)` or `saffire.widgets.seoBlock(selector, { seoBlockLoaded, fetchData, currentWidgetModuleItemID, scriptPath })`.
- Callback: `($el, data)`. `data` is read from `<script type="application/json" data-component-data="{WidgetId}">`, rendered by the server next to the block. There is no extra request; `fetchData: true` adds the raw DTO as `data.raw`.
- Helpers on `saffire.utils`: `updateLinksAttributes(url, label, $el?)`, `isLocalUrl(url)`, `getLinkType(url)`, `missingWidget(name)`.

## 5. Data (`data` in the callback)
```json
{
  "widgetId": "seoBlock",
  "hasData": true,
  "options": { "WidgetId": "seoBlock", "TitleHeading": "h1", "ShowTitleLine1": "True", "ShowTitleLine2": "True", "ShowDivider": "True", "ShowDescription": "True", "ShowButton1": "True", "ShowButton2": "True" },
  "items": [
    { "titleLine1": "Search Engine", "titleLine2": "Optimized Title", "titleTag": "h1", "paragraphs": ["…", "…"],
      "button1": { "label": "Learn More", "url": "/learn-more" }, "button2": { "label": "Explore", "url": "https://tickets.partner.com/join" } }
  ]
}
```
Fields disabled in the module come as `null` (labels) / `""` (URLs). Placement show / hide is in `options`, not applied to `items`.

## 6. Config options
### A · Content (client — Homepage Features → module tab)
| Label | Key | Field type | Rules |
|---|---|---|---|
| Items (Manage Items) | items | list (count: rows with an item selected) | Created in "Manage Items"; each tab row picks one (dropdown) or "Select (empty)" |
| Title Line 1 | TitleLine1 | text | Required by default; max length = module "Title 1 Max Length" |
| Title Line 2 | TitleLine2 | text | Optional by default; max length = module "Title 2 Max Length" |
| Description · paragraphs | Description | textarea (one paragraph per line) | Spark: "+ Add paragraph", Move up / down, Remove; plain text; up to "Paragraphs Limit", each up to "Paragraph Max Length" |
| Button N Label | ButtonNLabel | text | If set, the URL is required; max length = module "Button N Label Max Length" |
| Button N URL | ButtonNURL | text | No protocol → current protocol added; `/path` kept; `javascript:` / `data:` / `mailto:` rejected |

Every field shows a "xxx left" counter in Spark.

### B · Widget configuration
Placement options (Spark → Add / Edit Widget → Component Options):

| Label | Key | Field type | Default | Rules |
|---|---|---|---|---|
| Widget Id | widgetId | text | (empty → `seoBlock-{placement id}`) | `^[A-Za-z][\w-]*$`, otherwise the fallback is used |
| Title Heading | headingLevel | select | h1 | h1–h6; first item uses it, next items one level lower (capped at h6) |
| Show Title Line 1 / 2 · Divider · Description · Button 1 / 2 | showTitleLine1, showTitleLine2, showDivider, showDescription, button1Show, button2Show | switches | all on | Checkbox + text, one per row |

SEO Block Module (admin — Data Sources → Create / Edit Module, generic module editor):

| Label | Key (simulator) | Default | Rules |
|---|---|---|---|
| Name | — | — | Required; tab name in Homepage Features |
| Display Rank | — | last | Order of the tab |
| Max Items | maxItems | 1 | 1–12; rows the tab allows = items shown |
| (Rows with an item selected) | itemCount | 1 | Simulator only: 0 = empty widget |
| Title Line 1 / 2 → Enabled · Required · Max Length | titleLine1Enabled, titleLine2Enabled | on / on · on / off · 255 / 255 | Required ⇒ enabled; disabled fields are hidden in the editor and not rendered |
| Description → Enabled · Required · Max Length · Limit | descriptionEnabled, paragraphLimit | on · off · 1000 · 5 | Required ⇒ at least one paragraph |
| Button 1 / 2 → Enabled · Required · Label Max Length | buttonCount | on · off · 50 | The simulator's "Number of buttons" = how many are enabled |

Data source (admin): Configurator `Saffire.Events.BLL.Website.Widgets.ComponentWidgetConfigurator, Saffire`, Cache Key `Component_seoBlock` and Source Module Class Type "Seo Widget Module" are pre-filled.

### C · Styles (simulator)
| Label | Key | Field type | Default | Notes |
|---|---|---|---|---|
| Content alignment | alignment | segmented | left | responsive |
| Title line 1 / 2 · Description | titleFont, title2Font, descriptionFont | typography | Poppins 36/700, 36/400, 19/400 | responsive · tablet 31, mobile 27 titles |
| Width | widthMode / maxWidth | segmented + slider | Max width 920 | 480–1530 px / 100% |
| Padding vertical / horizontal | paddingY / paddingX | slider | 50 / 50 | responsive · tablet 40/24, mobile 32/16 |
| Background color · Border radius · Border width / color | backgroundColor, borderRadius, borderWidth, borderColor | color / slider | #eeeeee · 8 · 0 · #0079c2 | |
| Divider color | dividerColor | color | #0f294a | divider on |
| Stack buttons | buttonsStack | switch | off | responsive · mobile on |
| Default button color · Button 1 / 2 custom style | buttonColor, button1Style, button2Style | color / buttonStyle | #0079c2 · off (Button 2 preset orange) | |

No wrapper spacing of its own (`wrapperSpacing: false`): the Spark widget container provides it.

## 7. Rendering rules
- Items shown: the tab rows with a selected item, in row order, up to Max Items. Empty rows are skipped.
- A title line renders when the module enables it, the placement shows it and it has text.
- Two lines: `<span>` per line + `aria-label`. One line: text straight in the heading, no span, no `aria-label`. No line: no heading.
- Heading: Title Heading for the first item; next items one level lower (h1 → h2), capped at h6.
- Divider: placement "Show Divider" only (it renders even without a title).
- Description: module enabled + placement shown + at least one paragraph; one `<p>` per paragraph (line breaks inside a paragraph → `<br />`), up to the Paragraphs Limit.
- Button N: N ≤ Number of Buttons, placement shown, label set (Spark guarantees the URL). The buttons container is omitted when no button renders.
- Links: same domain as the site or the current page (ignoring protocol and `www.`) = local (`aria-label`); otherwise `target="_blank" rel="noopener noreferrer"` + "(opens in a new tab)". No URL → `aria-disabled="true"` and no `href`.
- All values are HTML-encoded. Template markup is trusted (Spark admins only).

## 8. What cannot be modified
- The client can't change limits, enabled fields, number of buttons, the heading, the Widget Id or the template.
- The Spark user can't change the module (admin) or the content (client).
- Max lengths are enforced in the editor and on save; the client can't exceed them.
- The template is per placement: editing it never affects other placements or other widgets. "Reset to default template" restores it.
- The module id is stored in `SAF_MODULE_COMPONENT_DATA_SOURCES`, never in `SAF_WIDGET_DATA_SOURCES.sourceModuleID` (that column is read as an Event Feature module by existing code).

## 9. Responsive behavior
- Tablet: smaller padding, titles 31px. Mobile: titles 27px, buttons stack at natural width following the alignment.

## 10. Empty / removed state
- No row with a selected item (or no module / data source): nothing is rendered and `<body>` gets `seoBlock-no-data`. The callback still runs with `hasData: false`.

## 11. Saffire implementation (reference)
- Framework shared with Hot Buttons and Card Block: `docs/saffire-components.md` (same template model; SEO Block is the server-rendered one).
- Tables: `SAF_MODULE_SEOBLOCK` (module + per-field settings), `SAF_MODULE_SEOBLOCK_ITEMS`, `SAF_MODULE_SEOBLOCK_PARAGRAPHS`, `SAF_MODULE_SEOBLOCK_SLOTS` (rows), `SAF_MODULE_COMPONENT_DATA_SOURCES` (data source → module), `SAF_MODULE_WIDGET_ITEM_OPTIONS` (placement options).
- Scripts: `Builds/ComponentsStandarization/Release Script.sql` (tables + the "Seo Widget" row, which is the feature gate; idempotent), `Rollback seoBlock.sql`.
- Code: `SeoBlockComponentDefinition` (fields, template, options, tokens) on the generic framework (`ComponentBLL`, `ComponentStore`, `ComponentWidgetConfigurator`, generic Spark screens), `ComponentWidgetDisplayControl` (server render + JSON data + scripts), `WidgetTemplateRenderer`, `WidgetLinkHelper`.
- Cache: under the widget cache (`{W}`); saving an item, a row, the module or the placement clears the affected keys.
