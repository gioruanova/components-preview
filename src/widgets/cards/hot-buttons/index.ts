import { defineWidget } from '@/tooling/types'
import { codegen, isEmpty } from './codegen'
import { Preview } from './Preview'
import { defaults, schema } from './schema'
import { styles } from './styles'

export default defineWidget({
  name: 'Hot Buttons',
  status: 'stable',
  order: 20,
  summary: 'Big, bold shortcut buttons to the most important pages ("Hot Buttons" in Saffire).',
  description: [
    'A row of big shortcut buttons ("Hot Buttons" in Saffire), each with a label and one URL. The whole button is the link.',
    'Each button can show an optional icon (8 placeholder icons, or upload a PNG). "Show icons" hides them for every button at once.',
    'A button renders when it has a label; without a URL it shows but is not clickable. With no button the widget is removed.',
    'The icon can sit left, right, above or below the label, and the content can be aligned left, center or right.',
    'Buttons per row, sizing, min width / height, padding, icon position and size, alignment and typography can differ per viewport (defaults: 2 per row on tablet, 1 on mobile).',
    '"Button sizing" works like Cards Grid: `Keep button size` gives every button the same width and fills full rows (a short last row is centered); `Stretch to fill` lets buttons grow into the empty space of their row.',
  ],
  specs: [
    'Markup (Saffire Hot Buttons default template): `div#<widgetId>.hot-buttons` > one `a.hot-button` per item > `.card-content` > `.icon-wrapper > img.hot-button-icon` + `span.widget-title`. No URL → no `href` + `void-link`.',
    "Script: `saffire.widgets.hotButtons('#<widgetId>', function ($el, data, hasData) {…})` (the Saffire renderer fills the `{#Items}` block in the browser and applies `updateLinksAttributes` to every link). Icon alt empty → the label.",
    'Icon position → `flex-direction` of `.card-content` (left `row`, right `row-reverse`, top `column`, bottom `column-reverse`); alignment maps to `justify-content` in a row and `align-items` in a column.',
    'Sizing / per row / min width use the shared row model (`tooling/itemRow.ts`, same as Cards Grid). Hover / focus (not on `void-link`) swap background and title color.',
    'Icons: built-in → `/assets/icons/<id>.svg`, PNG uploads → `/assets/icons/<file>.png` (resolved with `outputPath()` in Data, `previewUrl()` in the preview).',
    'Responsive: desktop 4 per row, tablet ≤ 768 two, mobile ≤ 480 one. Data (Saffire shape): `{ HasData, Items[] { Source, Title, URL, IconURL, IconAlt } }`. Tests: `codegen.test.ts`. Spec: `docs/specs/cards--hot-buttons.md`.',
  ],
  previewHint: 'Hover a button to see its hover colors. Clicking shows where it would navigate.',
  defaults,
  schema,
  Preview,
  styles,
  codegen,
  isEmpty,
  // Saffire markup has no wrapper of its own: the Spark widget container provides the spacing
  wrapperSpacing: false,
})
