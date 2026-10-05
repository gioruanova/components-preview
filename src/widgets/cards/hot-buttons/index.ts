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
  previewHint: 'Hover a button to see its hover colors. Clicking shows where it would navigate.',
  defaults,
  schema,
  Preview,
  styles,
  codegen,
  isEmpty,
})
