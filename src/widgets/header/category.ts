import { PanelTop } from 'lucide-react'
import { defineCategory } from '@/tooling/types'

export default defineCategory({
  name: 'Header',
  description: 'Site headers: logo, navigation and calls to action.',
  icon: PanelTop,
  order: 0,
  headsUp: {
    quote: 'The sky’s the limit… the header, sadly, is not.',
    note: 'Every option here can be switched on, and every label is client-managed — so it can grow. Keep the header lean: a logo, a countdown, five top items and a ticket button that fit today can wrap, collapse or push the menu out tomorrow. Try long labels and check every viewport before to ensure verything fits accordingly.',
  },
})
