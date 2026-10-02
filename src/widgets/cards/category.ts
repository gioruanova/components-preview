import { LayoutGrid } from 'lucide-react'
import { defineCategory } from '@/tooling/types'

export default defineCategory({
  name: 'Cards',
  description: 'Image-led card collections for events, offers and listings.',
  icon: LayoutGrid,
  order: 2,
  upcoming: [{ name: 'Hot Buttons', summary: 'Big, bold shortcut tiles to the most important pages.' }],
})
