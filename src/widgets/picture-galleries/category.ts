import { Images } from 'lucide-react'
import { defineCategory } from '@/tooling/types'

export default defineCategory({
  name: 'Pictures Gallery',
  description: 'Photo grids and lightbox galleries.',
  icon: Images,
  order: 80,
  upcoming: [
    { name: 'Grid Gallery', summary: 'Photo grid with a lightbox to browse the pictures full size.' },
    { name: 'Footer Gallery', summary: 'Compact strip of photos shown above or inside the footer.' },
  ],
})
