import { defineWidget } from '@/tooling/types'
import { codegen } from './codegen'
import { Preview } from './Preview'
import { defaults, schema } from './schema'
import { styles } from './styles'

export default defineWidget({
  name: 'Right-aligned Menu Header',
  status: 'beta',
  order: 20,
  summary: 'Logo left; search, cart and a prominent Buy Tickets button on top, the menu tucked to the right edge below.',
  description: [
    'Replicates the startermango.saffire.com header: logo on the left (spanning both rows), a top container on the right and the main menu right-aligned below it.',
    'An optional countdown sits next to the logo, level with the top container (on mobile: at the bottom of the header). Its two lines (date + event name) come from Site settings → Countdown, not from this widget; the optional icon is shown in one plain color.',
    'The top container shows, in this order: search box, login link, weather, hours & directions and cart. Every element has independent desktop and mobile visibility.',
    'The ticket button only needs a label: it always links to the site’s default ticket page. It can sit next to the top container or next to the navigation, and stays visible on mobile.',
    'The navigation comes from the CMS (sample items here, no options). Below its own mobile breakpoint (Styles, default 768px) the header collapses: the menu moves behind the burger button. Headers have only desktop and mobile values, no tablet step.',
    'Search can be closed (icon only, opens on hover) or always open, with or without the search word.',
  ],
  previewHint: 'Hover the search icon to open it. Switch to Tablet or Mobile and use the burger to open the menu.',
  container: false,
  wrapperSpacing: false,
  viewports: ['desktop', 'mobile'], // headers: desktop + mobile only (own breakpoint, no tablet step)
  starterLayouts: ['mango', 'banana', 'peach', 'grape', 'lemon'],
  defaults,
  schema,
  Preview,
  styles,
  codegen,
})
