import { PanelTop } from 'lucide-react'
import { defineCategory } from '@/tooling/types'

export default defineCategory({
  name: 'Header',
  description: 'Site headers: logo, navigation and calls to action.',
  icon: PanelTop,
  order: 0,
  upcoming: [
    {
      name: 'Centered Menu Header',
      summary: 'Logo left; the menu and the Buy Tickets button share one row through the middle of the header, search and cart above.',
      starterLayouts: ['cherry'],
    },
    {
      name: 'Right-aligned Menu Header',
      summary: 'Logo left; search, cart and a prominent Buy Tickets button on top, the menu tucked to the right edge below.',
      starterLayouts: ['mango', 'banana', 'peach', 'grape', 'lemon'],
    },
  ],
})
