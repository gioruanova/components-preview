import { defineWidget } from '@/tooling/types'
import { codegen } from './codegen'
import { Preview } from './Preview'
import { defaults, schema } from './schema'
import { styles } from './styles'

export default defineWidget({
  name: 'Cards Grid',
  status: 'stable',
  order: 10,
  summary: 'Grid of image cards with a title and hover-revealed description and buttons.',
  description: [
    'Displays a grid of cards, each with a title and, optionally, a description and up to two buttons (Button 1 and Button 2, each with its own label).',
    'The description and each button are shown or hidden for the whole widget at once — not per card.',
    "A button only renders on a given card when that card has the button's URL (and the button has a label).",
    'A card with no description and no buttons is rendered as non-interactive (no hover state, no link).',
    'Cards per row applies on desktop; tablet shows at most 2 per row and mobile 1. With "Fit space" on, cards grow to fill the row.',
    'The title (and on hover the description and buttons) can be positioned top, center or bottom and left, center or right.',
    'Hovering (or tapping on touch devices) reveals the description and buttons on every viewport, mobile included.',
  ],
  previewHint: 'Hover a card to see its description and buttons.',
  defaults,
  schema,
  Preview,
  styles,
  codegen,
})
