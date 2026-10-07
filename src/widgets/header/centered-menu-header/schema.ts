import { buttonStyle } from '@/tooling/buttons'
import { withOverrides } from '@/tooling/responsive'
import { typography } from '@/tooling/typography'
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
  navField,
  navShown,
  text,
  ticketFields,
  type HeaderBaseConfig,
} from '../shared/config'

export { COUNTDOWN_SOURCE, ORGANIZATION_SOURCE, TICKET_URL } from '../shared/config'

export type CenteredHeaderConfig = HeaderBaseConfig & {
  /** The full-width menu bar under the top row. */
  navBackground: string
  navColor: string
  navHoverColor: string
}

// Structure and look follow startercherry.saffire.com: countdown | logo | top items + ticket, then a full-width blue menu bar.
export const defaults: CenteredHeaderConfig = withOverrides<CenteredHeaderConfig>(
  {
    ...baseDefaults,
    widgetId: 'customCenteredHeader',
    // the countdown fills the left side (as on cherry)
    showCountdown: true,
    countdownMobile: true,
    mobileTicket: 'above',
    maxWidth: 1250,
    dateFont: text({ size: 22, weight: 700, lineHeight: 1.1, color: '#181818', transform: 'uppercase' }),
    eventFont: text({ size: 14, weight: 500, color: '#181818' }),
    countdownIconSize: 24,
    countdownIconColor: '#313841',
    searchIconBackground: '#00000000',
    searchHoverBackground: '#f0f0f0',
    cartFont: text({ size: 14, weight: 500, color: '#181818' }),
    cartBackground: '#00000000',
    ticketStyle: buttonStyle({
      background: '#f26922',
      hoverBackground: '#d4561a',
      hoverColor: '#ffffff',
      radius: 0,
      paddingX: 20,
      paddingY: 12,
      font: typography({ size: 16, weight: 700, lineHeight: 1, color: '#ffffff', transform: 'uppercase' }),
    }),
    navBackground: '#0659d4',
    navColor: '#ffffff',
    navHoverColor: '#cfe3ff',
  },
  {
    'logoWidth@mobile': 120,
    'dateFont@mobile': text({ size: 16, weight: 700, lineHeight: 1.1, color: '#181818', transform: 'uppercase' }),
    'eventFont@mobile': text({ size: 12, weight: 500, color: '#181818' }),
  },
)

export const schema: Schema<CenteredHeaderConfig> = {
  // Content = only what the client edits. Show/hide toggles live in Widget configuration.
  content: as<CenteredHeaderConfig>(contentFields),
  widget: [
    { type: 'text', key: 'widgetId', label: 'Widget ID' },
    ...as<CenteredHeaderConfig>(fixedField),
    ...as<CenteredHeaderConfig>(navField),
    ...as<CenteredHeaderConfig>(elementBoxes('Left of the logo')),
    {
      type: 'group',
      label: 'Ticket button',
      fields: asLeaf<CenteredHeaderConfig>([...ticketFields, mobileTicketField]),
    },
  ],
  styles: [
    ...as<CenteredHeaderConfig>(headerStyleGroup),
    ...as<CenteredHeaderConfig>(elementStyleGroups),
    {
      type: 'group',
      label: 'Navigation bar',
      visibleWhen: navShown,
      fields: [
        { type: 'color', key: 'navBackground', label: 'Bar background', help: 'Full-width bar under the top row' },
        { type: 'color', key: 'navColor', label: 'Link color', solid: true },
        { type: 'color', key: 'navHoverColor', label: 'Link hover color', solid: true },
        ...asLeaf<CenteredHeaderConfig>(burgerField),
      ],
    },
  ],
}
