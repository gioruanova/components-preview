import { CalendarDays } from 'lucide-react'
import { defineCategory } from '@/tooling/types'

export default defineCategory({
  name: 'Event Feeds',
  description: 'Lists and calendars of upcoming events pulled from the ticketing platform.',
  icon: CalendarDays,
  order: 30,
})
