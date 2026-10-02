import { defineWidget } from '@/tooling/types'
import { codegen } from './codegen'
import { Preview } from './Preview'
import { defaults, schema } from './schema'
import styles from './styles.css?inline'

export default defineWidget({
  name: 'Cards Grid',
  status: 'stable',
  order: 10,
  summary: 'Grid of image cards with a title and hover-revealed description and buttons.',
  description: [
    'Displays a grid of cards, each with a title and, optionally, a description and up to two buttons ("More" and "Buy now").',
    'The description and each button are shown or hidden for the whole widget at once — not per card.',
    'A button only renders on a given card when that card actually has the matching URL.',
    'A card with no description and no buttons is rendered as non-interactive (no hover state, no link).',
    'Cards per row applies on desktop; tablet shows at most 2 per row and mobile 1.',
    'On mobile, the hover-reveal description/buttons are hidden entirely — only the title shows.',
  ],
  previewHint: 'Hover a card to see its description and buttons. Switch to Mobile to see them hidden.',
  defaults,
  schema,
  Preview,
  styles,
  codegen,
})
