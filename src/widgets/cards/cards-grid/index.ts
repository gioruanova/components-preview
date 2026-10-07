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
  specs: [
    'Markup root: `div.<widgetId>-container.custom-cards-container` > `#<widgetId>` with one `.card-widget-item` per item (image, title bar, hover overlay with description and buttons).',
    'Script entry `createCustomCards(widgetData)`: per item appends title, description (when `ShowDescription`) and `a.button.button-1|2` only when the button is shown, has a label and the item has `Button1URL` / `Button2URL`.',
    'Row model shared with Hot Buttons (`tooling/itemRow.ts`): “Stretch to fill” = `flex: 1 1 <basis>`; “Keep card size” = `flex: 0 1 <basis(k)>` with container queries on `#<widgetId>` (`container: cards-grid / inline-size`) adding one card per row when `k × min + (k − 1) × gap` fits, up to Cards per row.',
    'Limit card width → `max-width: $card-width` (cards stay centered); Circle shape forces 1:1 using the width; content position aligns the title and hover content.',
    'Hover: overlay slides from the top, image scales ×1.15, title bar turns transparent, description + buttons fade in (tap on touch devices). Title background off → transparent title with text shadow and a dark overlay.',
    'Responsive: desktop = Cards per row, tablet ≤ 768 max 2, mobile ≤ 480 one card; media overrides reuse the base selectors and re-set `flex` when the sizing changes.',
    'Data: `ShowDescription`, `Button1Show` / `Button1Label`, `Button2Show` / `Button2Label`, `Items[] { Title, Description, Image, Button1URL, Button2URL }` (missing URLs are `null`). Tests: `codegen.test.ts`. Spec: `docs/specs/cards--cards-grid.md`.',
  ],
  previewHint: 'Hover a card to see its description and buttons.',
  defaults,
  schema,
  Preview,
  styles,
  codegen,
})
