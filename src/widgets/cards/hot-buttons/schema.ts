import type { Schema } from '@/tooling/types'
import { widthFields, type WidthConfig } from '@/tooling/layout'
import { withOverrides } from '@/tooling/responsive'
import { typography, type Typography } from '@/tooling/typography'

export type HotButtonItem = {
  Title: string
  URL: string
  /** Image reference (tooling/assets): '' | 'icon:<id>' | 'upload:<id>' (PNG). */
  Icon: string
}

export type HotButtonsConfig = WidthConfig & {
  widgetId: string
  showIcons: boolean
  buttonCount: number
  items: HotButtonItem[]
  buttonsPerRow: number
  gap: number
  /** Same model as Cards Grid: 'fixed' = equal widths, full rows fill the row; 'stretch' = grow into the row's leftover space. */
  buttonSizing: 'fixed' | 'stretch'
  /** 0 = none. Buttons wrap to the next row instead of shrinking below it. */
  buttonMinWidth: number
  buttonMinHeight: number
  paddingY: number
  paddingX: number
  borderRadius: number
  buttonColor: string
  hoverColor: string
  hoverTextColor: string
  borderWidth: number
  borderColor: string
  shadow: boolean
  iconPosition: 'left' | 'right' | 'top' | 'bottom'
  iconSize: number
  iconGap: number
  contentAlign: 'left' | 'center' | 'right'
  titleFont: Typography
}

export const MAX_BUTTONS = 12

const ICONS = ['ticket', 'calendar', 'map-pin', 'star', 'info', 'bag', 'phone', 'user']

// New buttons get a placeholder URL so they render right away (a button needs a title and a URL)
export const newItem = (i: number): HotButtonItem => ({ Title: `Button ${i + 1}`, URL: `https://example.com/button-${i + 1}`, Icon: `icon:${ICONS[i % ICONS.length]}` })

// Saffire brand defaults (#0079c2, Poppins). Tablet / mobile values are explicit, editable defaults.
export const defaults: HotButtonsConfig = withOverrides<HotButtonsConfig>({
  widgetId: 'customHotButtons',
  showIcons: true,
  buttonCount: 4,
  items: [
    { Title: 'Buy tickets', URL: 'https://example.com/tickets', Icon: 'icon:ticket' },
    { Title: 'Events', URL: 'https://example.com/events', Icon: 'icon:calendar' },
    { Title: 'Plan your visit', URL: 'https://example.com/visit', Icon: 'icon:map-pin' },
    { Title: 'Shop', URL: 'https://example.com/shop', Icon: 'icon:bag' },
  ],
  buttonsPerRow: 4,
  gap: 20,
  buttonSizing: 'fixed',
  buttonMinWidth: 200,
  buttonMinHeight: 90,
  paddingY: 20,
  paddingX: 24,
  borderRadius: 10,
  buttonColor: '#0079c2',
  hoverColor: '#11325d',
  hoverTextColor: '#ffffff',
  borderWidth: 0,
  borderColor: '#0079c2',
  shadow: true,
  iconPosition: 'left',
  iconSize: 40,
  iconGap: 14,
  contentAlign: 'center',
  widthMode: 'max',
  maxWidth: 1200,
  titleFont: typography({ size: 18, weight: 700, lineHeight: 1.3, color: '#ffffff', transform: 'uppercase' }),
}, {
  'buttonsPerRow@tablet': 2,
  'buttonsPerRow@mobile': 1,
})

const URL_TIP = 'A button renders only when it has both a title and a URL. The whole button is the link.'

export const schema: Schema<HotButtonsConfig> = {
  // Content = only what the client edits. Show/hide toggles live in Widget configuration.
  content: [
    {
      type: 'list',
      key: 'items',
      label: 'Buttons',
      countKey: 'buttonCount',
      itemLabel: (i) => `Button ${i + 1}`,
      newItem,
      itemFields: [
        { key: 'Title', label: 'Title', type: 'text', tip: URL_TIP },
        { key: 'URL', label: 'URL', type: 'text', tip: URL_TIP },
        { key: 'Icon', label: 'Icon', type: 'image', library: 'icon', tip: 'Optional. Pick a placeholder icon or upload a PNG. Hidden for every button when "Show icons" is off.' },
      ],
    },
  ],
  widget: [
    { type: 'text', key: 'widgetId', label: 'Widget ID' },
    { type: 'stepper', key: 'buttonCount', label: 'Number of buttons', min: 1, max: MAX_BUTTONS },
    { type: 'stepper', key: 'buttonsPerRow', label: 'Buttons per row', min: 1, max: 6, responsive: true },
    {
      type: 'group',
      label: 'Show / hide',
      fields: [{ type: 'switch', key: 'showIcons', label: 'Show icons', hint: 'On buttons that have an icon' }],
    },
  ],
  styles: [
    {
      type: 'group',
      label: 'Grid',
      fields: [...widthFields<HotButtonsConfig>({ min: 480, max: 1920 }), { type: 'slider', key: 'gap', label: 'Gap', min: 0, max: 60, step: 2, unit: 'px', help: 'Between buttons' }],
    },
    {
      type: 'group',
      label: 'Button',
      fields: [
        {
          type: 'segmented',
          key: 'buttonSizing',
          label: 'Button sizing',
          responsive: true,
          options: [
            { value: 'fixed', label: 'Keep button size' },
            { value: 'stretch', label: 'Stretch to fill' },
          ],
          help: 'Keep: every button has the same width and full rows fill the full width; a short last row is centered. Stretch: buttons grow into the empty space of their own row.',
        },
        {
          type: 'slider',
          key: 'buttonMinWidth',
          label: 'Min width',
          min: 0,
          max: 480,
          step: 10,
          unit: 'px',
          responsive: true,
          tip: 'Buttons never get narrower than this: they wrap to the next row instead. 0 = no minimum.',
        },
        { type: 'slider', key: 'buttonMinHeight', label: 'Min height', min: 40, max: 300, step: 5, unit: 'px', responsive: true },
        { type: 'slider', key: 'paddingY', label: 'Padding vertical', min: 0, max: 80, step: 2, unit: 'px', responsive: true },
        { type: 'slider', key: 'paddingX', label: 'Padding horizontal', min: 0, max: 80, step: 2, unit: 'px', responsive: true },
        { type: 'slider', key: 'borderRadius', label: 'Border radius', min: 0, max: 60, unit: 'px' },
        { type: 'color', key: 'buttonColor', label: 'Background' },
        { type: 'color', key: 'hoverColor', label: 'Hover background' },
        { type: 'color', key: 'hoverTextColor', label: 'Hover text color', solid: true },
        { type: 'slider', key: 'borderWidth', label: 'Border width', min: 0, max: 12, unit: 'px', help: 'Border style: solid' },
        { type: 'color', key: 'borderColor', label: 'Border color', visibleWhen: (c) => c.borderWidth > 0 },
        { type: 'switch', key: 'shadow', label: 'Shadow', hint: 'Soft drop shadow' },
      ],
    },
    {
      type: 'group',
      label: 'Content',
      fields: [
        {
          type: 'segmented',
          key: 'iconPosition',
          label: 'Icon position',
          responsive: true,
          visibleWhen: (c) => c.showIcons,
          options: [
            { value: 'left', label: 'Left' },
            { value: 'right', label: 'Right' },
            { value: 'top', label: 'Top' },
            { value: 'bottom', label: 'Bottom' },
          ],
        },
        { type: 'slider', key: 'iconSize', label: 'Icon size', min: 16, max: 120, step: 2, unit: 'px', responsive: true, visibleWhen: (c) => c.showIcons },
        { type: 'slider', key: 'iconGap', label: 'Icon gap', min: 0, max: 40, unit: 'px', responsive: true, visibleWhen: (c) => c.showIcons, help: 'Space between icon and title' },
        {
          type: 'segmented',
          key: 'contentAlign',
          label: 'Alignment',
          responsive: true,
          options: [
            { value: 'left', label: 'Left' },
            { value: 'center', label: 'Center' },
            { value: 'right', label: 'Right' },
          ],
        },
      ],
    },
    { type: 'group', label: 'Typography', fields: [{ type: 'typography', key: 'titleFont', label: 'Title', responsive: true }] },
  ],
}
