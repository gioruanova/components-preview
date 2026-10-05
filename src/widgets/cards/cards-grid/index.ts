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
    'Cards per row, card size, aspect ratio, min width, content position and typography can differ per viewport (defaults: 2 per row on tablet, 1 on mobile). "Card sizing" keeps the card size or stretches cards to fill the row; "Limit card width" stops them getting wider than the card width.',
    'A min width makes cards wrap to the next row instead of shrinking; an aspect ratio keeps the image proportions at any width.',
    'Card titles use a fluid size that follows the card width (container query units), so long titles shrink and wrap evenly instead of being cut.',
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
