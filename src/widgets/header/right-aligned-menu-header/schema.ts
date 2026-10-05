import { withOverrides } from '@/tooling/responsive'
import type { Schema } from '@/tooling/types'
import {
  as,
  asLeaf,
  baseDefaults,
  burgerField,
  contentFields,
  elementBoxes,
  elementStyleGroups,
  fixedField,
  headerStyleGroup,
  mobileTicketField,
  text,
  type HeaderBaseConfig,
} from '../shared/config'

export { COUNTDOWN_SOURCE, TICKET_URL } from '../shared/config'

export type HeaderConfig = HeaderBaseConfig & {
  /** Next to the top container (top row) or next to the navigation (second row). */
  ticketPlacement: 'top' | 'nav'
}

// Structure and look follow startermango.saffire.com (white header, grey search / cart boxes, orange ticket button).
export const defaults: HeaderConfig = withOverrides<HeaderConfig>(
  { ...baseDefaults, ticketPlacement: 'top' },
  {
    'logoWidth@mobile': 110,
    'eventFont@mobile': text({ size: 14, weight: 700 }),
  },
)

export const schema: Schema<HeaderConfig> = {
  // Content = only what the client edits. Show/hide toggles live in Widget configuration.
  content: as<HeaderConfig>(contentFields),
  widget: [
    { type: 'text', key: 'widgetId', label: 'Widget ID' },
    ...as<HeaderConfig>(fixedField),
    ...as<HeaderConfig>(elementBoxes('Next to the logo, level with the top container')),
    {
      type: 'group',
      label: 'Ticket button',
      fields: [
        {
          type: 'segmented',
          key: 'ticketPlacement',
          label: 'Placement',
          options: [
            { value: 'top', label: 'Next to top container' },
            { value: 'nav', label: 'Next to navigation' },
          ],
          help: 'The button stays visible on mobile in both cases.',
        },
        ...asLeaf<HeaderConfig>(mobileTicketField),
      ],
    },
  ],
  styles: [
    ...as<HeaderConfig>(headerStyleGroup),
    ...as<HeaderConfig>(elementStyleGroups),
    { type: 'group', label: 'Navigation', fields: asLeaf<HeaderConfig>(burgerField) },
  ],
}
