import { defineWidget } from '@/tooling/types'
import { codegen, isEmpty } from './codegen'
import { Preview } from './Preview'
import { defaults, schema } from './schema'
import { styles } from './styles'

export default defineWidget({
  name: 'Hot Buttons',
  status: 'stable',
  order: 20,
  summary: 'Big, bold shortcut tiles to the most important pages.',
  description: [
    'A row of big shortcut buttons, each with a title and one URL. The whole button is the link.',
    'Each button can show an optional icon (8 placeholder icons, or upload a PNG). "Show icons" hides them for every button at once.',
    'A button only renders when it has both a title and a URL. With no renderable button the widget is removed.',
    'The icon can sit left, right, above or below the title, and the content can be aligned left, center or right.',
    'Buttons per row, sizing, min width / height, padding, icon position and size, alignment and typography can differ per viewport (defaults: 2 per row on tablet, 1 on mobile).',
    '"Button sizing" works like Cards Grid: `Keep button size` gives every button the same width and fills full rows (a short last row is centered); `Stretch to fill` lets buttons grow into the empty space of their row.',
  ],
  specs: [
    'Markup root: `div.<widgetId>-container.custom-hot-buttons-container` > `#<widgetId>` with one `a.hot-button-item` per renderable item (`img.hot-button-icon` + `span.hot-button-title`).',
    'Shared helper (Preview, codegen, script): an item renders only with a non-empty Title and URL; the icon only when Show icons is on and the item has one. No renderable item → the script removes `.<widgetId>-container`.',
    'Script entry `createCustomHotButtons(widgetData)`; links use `updateLinksAttributes(URL, Title)` (external → `target="_blank"`, `rel`, accessible label).',
    'Icon position → `flex-direction` of `.hot-button-item` (left `row`, right `row-reverse`, top `column`, bottom `column-reverse`); alignment maps to `justify-content` in a row and `align-items` in a column.',
    'Sizing / per row / min width use the shared row model (`tooling/itemRow.ts`, same as Cards Grid). Hover / focus swap background and title color.',
    'Icons: built-in → `/assets/icons/<id>.svg`, PNG uploads → `/assets/icons/<file>.png`, none → `null` (resolved with `outputPath()` in Data, `previewUrl()` in the preview).',
    'Responsive: desktop 4 per row, tablet ≤ 768 two, mobile ≤ 480 one. Data: `ShowIcons`, `Items[] { Title, URL, Icon }`. Tests: `codegen.test.ts`. Spec: `docs/specs/cards--hot-buttons.md`.',
  ],
  previewHint: 'Hover a button to see its hover colors. Clicking shows where it would navigate.',
  defaults,
  schema,
  Preview,
  styles,
  codegen,
  isEmpty,
})
