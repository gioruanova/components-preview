# Saffire component framework (built components)

How a component of this tool is built in Saffire (branch `feature/components-standarization`, local POC). The specs in
`docs/specs/` describe each component; this page describes what they all share. Built so far: **SEO Block** (server),
**Hot Buttons** and **Card Block** (= Cards Grid) (client).

## 1. Who configures what
| Who | Where (Spark) | What |
|---|---|---|
| Admin | Widgets → *component* → Data Sources → Add / Edit (+ Create / Edit Module) | Data source and its **module**: name (= tab name), display rank, Max Items, and per field: Enabled, Required, Max Length / Limit / Label Max Length, Recommended Width / Height (images) |
| Spark user | Widgets → Add / Edit Widget → *component* | Data source, **options** (Widget Id, switches, selects) and the **template** (code editor, pre-filled with the default, "Reset to default template") |
| Client | Homepage Features → module tab | **Items** (Manage Items) and which item fills each **row** (rows can also pick an Event in Card Block) |

The tab note reads "Note: Only the top {Max Items} features will be displayed on your homepage." plus, per image field,
"{Field} sizes: Width: {n}px. Height: {n}px.".

## 2. Two kinds of components
Both use the **same template model** (Spark → Add Widget, editable per placement, "Reset to default template"):
container + `{#Items}…{/Items}` (markup of one item, repeated per item) + a `<script>` with the component call and
your function. They differ in **who fills the items**:

| | Server-rendered (SEO Block) | Client-rendered (Hot Buttons, Card Block) |
|---|---|---|
| When | Content must be in the page HTML (main heading, SEO) | Everything else (default, like cardWidget) |
| Server renders | The whole template, items included (`WidgetTemplateRenderer`) | The container part only; the `{#Items}` block is replaced by `<script type="application/json" data-component-items="{WidgetId}">` (item template + options) |
| Items | Already in the HTML | Built in the browser (`saffire.utils.renderComponent`, `widgetHelpers.js`) and put where `{#Items}` was |
| Data | Read on the server; JSON for the callback next to the block (`data-component-data`) | `WidgetService.GetWidgetModuleItemData` from the browser (same service as cardWidget) |
| Script call | `saffire.widgets.seoBlock('#{WidgetId}', function ($el, data) {…})` | `saffire.widgets.<key>('#{WidgetId}', function ($el, data, hasData) {…})` — keep it: it loads the items |

The server work for a client component is the same kind as cardWidget's (write the placement template with its
tokens; options are cached); it never builds the content.

## 3. Template syntax (both kinds)
- `{Token}` → HTML-encoded value. Tokens ending in `URL` only keep `http(s)://` or site-relative URLs.
- `{#Name}…{/Name}` → kept when the section is true, removed when false. Values are inserted in one pass, so content
  that contains `{…}` is never expanded.
- Container tokens: `{WidgetId}`, `{WidgetModuleItemID}`, standard widget tokens, `{#Option}` sections.
- Inside `{#Items}` (client components): one token per field and a section per value that is not empty:

| Field type | Tokens | Section |
|---|---|---|
| Text / Multiline / URL | `{Key}` | `{#Key}` = has a value |
| Link | `{KeyLabel}`, `{KeyURL}` | `{#Key}` = has label **and** URL |
| Image / Icon (asset library) | `{KeyURL}`, `{KeyAlt}` | `{#Key}` = has an image |
| Every boolean option | — | `{#OptionKey}` = switch on (e.g. `{#ShowIcons}`) |
| Every item | `{Source}` (`custom` / `event`) | |

- Alt text: the item alt (filled from the image metadata when "Use original image's metadata" is checked); with that
  option on and no alt saved, the asset's current alt; empty → the item `{Title}`.
- Links: every `<a href>` follows the widget link rules (`updateLinksAttributes`): empty URL → no `href` + `void-link`
  + `aria-disabled`; external → `target="_blank" rel="noopener noreferrer"` + "(opens in a new tab)".
  `data-link-label` sets the accessible label (default: the link text).
- No styles are shipped with the components: sites style the classes in their theme.

## 4. Options (Add Widget → Component Options)
Stored per placement in `SAF_MODULE_WIDGET_ITEM_OPTIONS`. Every component has **Widget Id** (letters, numbers, `-`, `_`,
starting with a letter; empty / invalid → `{key}-{placement id}`). Switches are checkboxes; selects are dropdowns.
Client components receive them as a JS object with camelCase keys (`ShowIcons` → `showIcons`).

## 5. Data shape (client components)
```json
{ "HasData": true, "Items": [ { "Source": "custom", "Title": "…", "URL": "…", "IconURL": "…", "IconAlt": "…" } ] }
```
Items = the tab rows with content, in row order, up to Max Items. Fields disabled in the module are not sent.
No item → the container is removed and `<body>` gets `{key}-no-data`.

## 6. Saffire code (one set for every component)
| Piece | What it is |
|---|---|
| `ComponentWidgetDefinition` | Identity (key, name), fields, tables, data source, Homepage Features tab, feature gate |
| `ConfigurableComponentDefinition` | Adds the Add Widget template + options |
| `ServerComponentDefinition` / `ClientComponentDefinition` | Server render model / client options + token help generated from the fields |
| `ComponentWidgetRegistry` | The list of components (one line per component) |
| `ComponentFieldDefinition` | A field: key, label, type (Text, Multiline, Url, Link, Image, Icon, List), limits |
| `IComponentItemSource` (`EventItemSource`) | Other content for rows (Events today; businesses / auto feeds later) |
| `ComponentStore`, `ComponentBLL` | Generic data access and rules (validation, URL normalization, asset library, cache) |
| `ComponentWidgetConfigurator` | Builds the data for every component (data source configurator) |
| Spark screens | `manageComponentModule` (tab), `manageComponentItems`, `addEditComponentItem`, `addEditComponentModule` |
| `ComponentWidgetDisplayControl` / `ComponentClientDisplayControl` | Public site: full server render / container part + items config |

A new component = its tables + 3 entities + a definition class + `{key}.ascx` + `{key}.js` + a rollback script
(skill `saf-new-component` in CompBuilder).

## 7. Database and feature gate
- Shared tables: `SAF_MODULE_WIDGET_ITEM_OPTIONS` (placement options) and `SAF_MODULE_COMPONENT_DATA_SOURCES`
  (data source → module; never stored in `SAF_WIDGET_DATA_SOURCES.sourceModuleID`, which existing code reads).
- Per component: `SAF_MODULE_{KEY}` (module + per-field settings), `_ITEMS`, `_SLOTS` (tab rows: `itemID` or
  `sourceKey` + `sourceID`), plus list tables (e.g. SEO paragraphs).
- `Builds/ComponentsStandarization/Release Script.sql`: idempotent, only creates. It inserts each component's
  `saf_widgets` row only when its tables exist: **the widget row is the feature gate** (no row = nothing shows).
- `Rollback {key}.sql` per component (development only).
- New data sources are pre-filled: configurator `Saffire.Events.BLL.Website.Widgets.ComponentWidgetConfigurator, Saffire`,
  cache key `Component_{key}`, module type "{Component} Module".
- Cache: under the widget cache (`{W}`); saving an item, a row, the module or the placement clears it.
