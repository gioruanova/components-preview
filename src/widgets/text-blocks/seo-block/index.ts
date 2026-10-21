import { defineWidget } from '@/tooling/types'
import { codegen, isEmpty } from './codegen'
import { Preview } from './Preview'
import { defaults, schema } from './schema'
import { styles } from './styles'

export default defineWidget({
  name: 'SEO Block',
  status: 'beta',
  order: 10,
  summary: 'Crawlable heading, divider, paragraphs and up to two buttons, rendered server-side ("Seo Widget" in Spark).',
  description: [
    'Shows one or more items, each with a title (one or two lines), an optional divider, description paragraphs and up to two buttons. It is rendered on the server, so the heading is in the page HTML for search engines.',
    'Three roles set it up. Admin (Widgets → Seo Widget → Data Sources): creates the data source and its SEO Block module (tab name, Max Items, which fields exist, limits, number of buttons). Spark user (Add / Edit Widget): picks the data source, the Widget Id, the Title Heading and what to show / hide, and can edit the HTML template. Client (Homepage Features → module tab): writes the items and picks which item goes in each row.',
    'The client edits only content: title lines, paragraphs, button labels and URLs. Field limits, which fields exist and the number of buttons come from the module and cannot be changed by the client.',
    'Each tab row has a dropdown with the module items or "Select (empty)". The widget shows the selected items in row order, up to Max Items. With no item selected the widget renders nothing.',
    'Title with two lines: one `<span>` per line plus an `aria-label` with the full title. With one line: the text goes straight into the heading, no span, no `aria-label`.',
    'The Title Heading (`h1`–`h6`) applies to the first item; next items use one level lower, so a page never gets two `h1`.',
    'Buttons: a label requires a URL (the item is not saved otherwise). URLs without a protocol get the current one (`http://` or `https://`); `/path` stays a site link; `javascript:`, `data:` and `mailto:` are rejected. Links to the same domain (any protocol, with or without `www`) are local; other domains open in a new tab with "(opens in a new tab)" in their accessible name.',
    'Every content field shows a "xxx left" character counter in Spark, from the module limits.',
  ],
  specs: [
    'Root: `div#{WidgetId}.seo-block` > `.seo-block-item` (one per row with a selected item) > `.seo-title` (heading from `{TitleTagStart}` / `{TitleTagEnd}`) · `span.title-divider` · `.seo-description` with one `<p>` per paragraph · `.buttons-container` with `a.button`.',
    'Widget Id (placement option): letters, numbers, `-` and `_`, starting with a letter. Empty or invalid → `seoBlock-{placement id}`. It is the root `id`, the JS selector and the `data` key. Technical name `seoBlock` (JS, CSS, `seoBlock-no-data`); display name "Seo Widget" (Spark only).',
    'Template: editable per placement in Spark (Ace editor), pre-filled with the default; "Reset to default template" restores it. Never shared between placements. Tokens are HTML-encoded; `{Description}`, `{ButtonNAttributes}`, `{TitleAriaLabelAttribute}` and `{TitleTagStart|End}` are built by the server. Sections `{#Name}…{/Name}`; `{#Items}…{/Items}` repeats per item.',
    'Sections: `ShowTitle`, `ShowBothTitleLines`, `ShowSingleTitleLine`, `ShowTitleLine1|2`, `ShowDivider`, `ShowDescription`, `ShowButtons`, `ShowButton1|2`, `IsFirstItem`, `HasData`. A title line / description / button renders only when the module enables it, the placement shows it and it has content.',
    'Script: the widget registers `widgetHelpers.js` + `seoBlock.js` itself (the widget JavaScript field stays empty). The template runs `saffire.widgets.seoBlock(\'#{WidgetId}\', function ($el, data) {…})` once the DOM is ready. `data` = `{ widgetId, hasData, options, items }`, read from `<script type="application/json" data-component-data="{WidgetId}">` (no extra request; `fetchData: true` adds the raw DTO as `data.raw`).',
    'Empty: no row with a selected item → nothing is rendered and `<body>` gets `seoBlock-no-data` (same contract as `missingWidget`).',
    'Data model (Saffire DB): `SAF_MODULE_SEOBLOCK` (module + limits) · `SAF_MODULE_SEOBLOCK_ITEMS` · `SAF_MODULE_SEOBLOCK_PARAGRAPHS` · `SAF_MODULE_SEOBLOCK_SLOTS` (tab rows) · `SAF_MODULE_COMPONENT_DATA_SOURCES` (data source → module; the module id is never stored in `sourceModuleID`) · `SAF_MODULE_WIDGET_ITEM_OPTIONS` (placement options). Configurator `SeoBlockWidgetConfigurator`, cache key `SeoBlock`.',
    'Cache: content, placement and template are cached under the widget cache (`{W}`). Saving an item, a row, the module or the placement clears the affected keys.',
    'Styles: alignment drives `text-align`, flex alignment of items / title / buttons and the block margin. Title line 1 typography is on the heading, line 2 on `.seo-title > span + span`. Buttons use `customButtonStyles` for `.button.button-N`: the default template uses `class="button"`, so add `button-1` / `button-2` in the template to use per-button styles.',
    'Wrapped by the global container unless “Uses container” is off; no wrapper spacing of its own. Tests: `codegen.test.ts`. Spec: `docs/specs/text-blocks--seo-block.md`.',
  ],
  previewHint: 'Set "Rows with an item selected" to 0 to simulate the empty widget. Raise Max Items and the rows to see several items (h1 → h2).',
  defaults,
  schema,
  Preview,
  styles,
  codegen,
  isEmpty,
  wrapperSpacing: false,
})
