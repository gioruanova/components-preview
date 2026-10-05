import { defineWidget } from '@/tooling/types'
import { codegen } from './codegen'
import { Preview } from './Preview'
import { defaults, schema } from './schema'
import { styles } from './styles'

export default defineWidget({
  name: 'Centered Menu Header',
  status: 'beta',
  order: 10,
  summary: 'Logo in the middle, countdown on the left, top items and ticket on the right, and a full-width menu bar below.',
  description: [
    'Replicates the startercherry.saffire.com header: a three-zone top row (countdown | logo | top items + ticket) and a full-width menu bar with centered links.',
    'The logo always stays centered, whatever the side zones hold.',
    'Same elements and options as the Right-aligned Menu Header (shared code): countdown from Site settings → Countdown, search, login, weather, hours & directions and cart, each with independent desktop and mobile visibility.',
    'The ticket button only needs a label and always links to the default ticket page. On mobile it sits next to the burger or above it.',
    'Below its own mobile breakpoint (Styles, default 768px) the header collapses: the zones merge into one row and the menu bar opens from the burger. Headers have only desktop and mobile values.',
  ],
  previewHint: 'Hover the search icon to open it. Switch to Mobile and use the burger to open the menu.',
  container: false,
  wrapperSpacing: false,
  viewports: ['desktop', 'mobile'],
  starterLayouts: ['cherry'],
  defaults,
  schema,
  Preview,
  styles,
  codegen,
})
