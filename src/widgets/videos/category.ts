import { Clapperboard } from 'lucide-react'
import { defineCategory } from '@/tooling/types'

export default defineCategory({
  name: 'Videos',
  description: 'Embedded and background videos with optional overlays.',
  icon: Clapperboard,
  order: 20,
})
