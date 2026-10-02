import { Wrench } from 'lucide-react'
import { defineCategory } from '@/tooling/types'

export default defineCategory({
  name: 'Utils',
  description: 'Supporting building blocks used across pages.',
  icon: Wrench,
  order: 90,
  upcoming: [
    { name: 'Backgrounds', summary: 'Decorative section backgrounds: colors, images and patterns.' },
    { name: 'Pop ups', summary: 'Modal announcements and promos with display rules.' },
    { name: 'Signup', summary: 'Newsletter and account sign-up forms.' },
  ],
})
