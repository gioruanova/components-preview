import { defineWidget } from '@/tooling/types'
import { codegen } from './codegen'
import { Preview } from './Preview'
import { defaults, schema } from './schema'
import { styles } from './styles'

export default defineWidget({
  name: 'Cards Grid',
  status: 'stable',
  order: 10,
  summary: 'Grid of image cards with a title, description and up to two buttons ("Card Block" in Saffire).',
  description: [
    'Displays a grid of cards, each with a title and, optionally, an image, a description and up to two buttons (Button 1 and Button 2, each with its own label and URL per card).',
    'Image, description, each button and the overlay are shown or hidden for the whole widget at once; a card only shows what it has.',
    'The title tag (h2–h6 or p) is a widget option. The markup is the same on every screen size.',
    'Cards per row, card size, aspect ratio, min width, content position and typography can differ per viewport (defaults: 2 per row on tablet, 1 on mobile). "Card sizing" keeps the card size or stretches cards to fill the row; "Limit card width" stops them getting wider than the card width.',
    'A min width makes cards wrap to the next row instead of shrinking; an aspect ratio keeps the image proportions at any width.',
    'Card titles use a fluid size that follows the card width (container query units), so long titles shrink and wrap evenly instead of being cut.',
    'The content can be positioned top, center or bottom and left, center or right. Hover zooms the image and darkens the overlay.',
  ],
  specs: [
    'Markup (Saffire Card Block default template): `div#<widgetId>.cards-container` > one `.card-item` per item > `.image-container > img.card-image` · `.overlay` · `.card-content` > `<titleTag>.widget-title` · `p.widget-description` · `.buttons-container > a.button.button-1|2`.',
    'Script: `saffire.widgets.cardBlock(\'#<widgetId>\', function ($el, data, hasData) {…})` (the Saffire renderer fills the `{#Items}` block in the browser). A button renders only when shown and the card has its label and URL.',
    'Row model shared with Hot Buttons (`tooling/itemRow.ts`): “Stretch to fill” = `flex: 1 1 <basis>`; “Keep card size” = `flex: 0 1 <basis(k)>` with container queries on `#<widgetId>` (`container: cards-grid / inline-size`) adding one card per row when `k × min + (k − 1) × gap` fits, up to Cards per row.',
    'Limit card width → `max-width: $card-width` (cards stay centered); Circle shape forces 1:1 using the width; content position aligns the title, description and buttons.',
    'Title background on → card color behind the title and on the overlay; off → transparent title with text shadow and a dark overlay. Hover: image ×1.15, overlay darker.',
    'Responsive: desktop = Cards per row, tablet ≤ 768 max 2, mobile ≤ 480 one card; media overrides reuse the base selectors and re-set `flex` when the sizing changes.',
    'Data (Saffire shape): `{ HasData, Items[] { Source, Title, Description, ImageURL, ImageAlt, Button1Label, Button1URL, Button2Label, Button2URL } }`. Tests: `codegen.test.ts`. Spec: `docs/specs/cards--cards-grid.md`.',
  ],
  previewHint: 'Hover a card to zoom its image. Change the Title tag or the Show / hide switches in Widget configuration.',
  defaults,
  schema,
  Preview,
  styles,
  codegen,
  // Saffire markup has no wrapper of its own: the Spark widget container provides the spacing
  wrapperSpacing: false,
})
