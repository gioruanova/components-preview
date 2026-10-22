import type { Schema } from '@/tooling/types'
import { buttonStyle, type ButtonStyle } from '@/tooling/buttons'
import { widthFields, type WidthConfig } from '@/tooling/layout'
import { withOverrides } from '@/tooling/responsive'
import { typography, type Typography } from '@/tooling/typography'

export type Alignment = 'left' | 'center' | 'right'
export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

/**
 * One content item, as the client edits it in Homepage Features (SEO module tab → Manage Items).
 * `Description` holds the paragraphs: one per line (each renders as its own `<p>`).
 */
export type SeoBlockItem = {
  TitleLine1: string
  TitleLine2: string
  Description: string
  Button1Label: string
  Button1URL: string
  Button2Label: string
  Button2URL: string
}

export type SeoBlockConfig = WidthConfig & {
  // A · Content (client, Homepage Features)
  items: SeoBlockItem[]
  // B · Widget placement options (Spark → Add / Edit Widget → Component Options)
  widgetId: string
  headingLevel: HeadingLevel
  showTitleLine1: boolean
  showTitleLine2: boolean
  showDivider: boolean
  showDescription: boolean
  button1Show: boolean
  button2Show: boolean
  // B · SEO Block Module (admin, Widgets → Seo Widget → Data Sources → Create / Edit Module). Always 1 item.
  itemCount: number
  titleLine1Enabled: boolean
  titleLine2Enabled: boolean
  descriptionEnabled: boolean
  paragraphLimit: number
  buttonCount: '0' | '1' | '2'
  // C · Styles
  alignment: Alignment
  titleFont: Typography
  title2Font: Typography
  descriptionFont: Typography
  paddingY: number
  paddingX: number
  buttonsStack: boolean
  backgroundColor: string
  borderRadius: number
  borderWidth: number
  borderColor: string
  dividerColor: string
  buttonColor: string
  button1Style: ButtonStyle
  button2Style: ButtonStyle
}

/** The block always shows one item (maxItemsCap 1 in Saffire): one heading per placement. */
export const MAX_ITEMS = 1

export const newItem = (i: number): SeoBlockItem => ({
  TitleLine1: i === 0 ? 'Search Engine' : `Item ${i + 1} title`,
  TitleLine2: i === 0 ? 'Optimized Title' : '',
  Description:
    i === 0
      ? 'Use this box for explaining who you are, where you are, what you do, and how to contact you.\nThis text will greatly improve your visibility on Google and Bing. Avoid adding dates to this text - the search engines will.'
      : 'Supporting paragraph for this item.',
  Button1Label: i === 0 ? 'Learn More' : '',
  Button1URL: i === 0 ? '/learn-more' : '',
  Button2Label: i === 0 ? 'Explore' : '',
  Button2URL: i === 0 ? 'https://tickets.partner.com/join' : '',
})

// Base styles follow the existing Saffire widget (saffire-docs-poc).
// Tablet / mobile values are explicit, editable defaults (see the viewport icons on each responsive field).
export const defaults: SeoBlockConfig = withOverrides<SeoBlockConfig>({
  items: [newItem(0)],
  widgetId: 'seoBlock',
  headingLevel: 'h1',
  showTitleLine1: true,
  showTitleLine2: true,
  showDivider: true,
  showDescription: true,
  button1Show: true,
  button2Show: true,
  itemCount: 1,
  titleLine1Enabled: true,
  titleLine2Enabled: true,
  descriptionEnabled: true,
  paragraphLimit: 5,
  buttonCount: '2',
  alignment: 'left',
  titleFont: typography({ size: 36, weight: 700, lineHeight: 1.2, transform: 'capitalize' }),
  title2Font: typography({ size: 36, weight: 400, lineHeight: 1.2, transform: 'capitalize' }),
  descriptionFont: typography({ size: 19, weight: 400, lineHeight: 1.6 }),
  widthMode: 'max',
  maxWidth: 920,
  backgroundColor: '#eeeeee',
  borderRadius: 8,
  borderWidth: 0,
  borderColor: '#0079c2',
  dividerColor: '#0f294a',
  buttonColor: '#0079c2',
  button1Style: buttonStyle(),
  button2Style: buttonStyle({ background: '#f26922', hoverBackground: '#c4521a' }),
  paddingY: 50,
  paddingX: 50,
  buttonsStack: false,
}, {
  'paddingY@tablet': 40,
  'paddingX@tablet': 24,
  'paddingY@mobile': 32,
  'paddingX@mobile': 16,
  'titleFont@tablet': typography({ size: 31, weight: 700, lineHeight: 1.2, transform: 'capitalize' }),
  'title2Font@tablet': typography({ size: 31, weight: 400, lineHeight: 1.2, transform: 'capitalize' }),
  'titleFont@mobile': typography({ size: 27, weight: 700, lineHeight: 1.2, transform: 'capitalize' }),
  'title2Font@mobile': typography({ size: 27, weight: 400, lineHeight: 1.2, transform: 'capitalize' }),
  'buttonsStack@mobile': true,
})

const LABEL_TIP = 'If a label is set, its URL is required (Spark does not save the item otherwise). Max length comes from the SEO Block module (default 50).'
const URL_TIP =
  'Without a protocol, the current one (http:// or https://) is added to what is typed. "/path" is kept as a site link. javascript:, data:, mailto: are rejected. Same domain (any protocol, with or without www) = local link; other domains open in a new tab.'

const heading = (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const).map((h) => ({ value: h, label: h.toUpperCase() }))

export const schema: Schema<SeoBlockConfig> = {
  // Content = only what the client edits (Homepage Features → SEO module tab). Toggles and limits live in B.
  content: [
    {
      type: 'list',
      key: 'items',
      label: 'Item (Manage Items)',
      countKey: 'itemCount',
      tip: 'The client creates items in "Manage Items" and picks one in the tab row (dropdown, or "Select (empty)"). The block always shows one item.',
      itemLabel: () => 'Row 1 · item',
      newItem,
      itemFields: [
        { key: 'TitleLine1', label: 'Title Line 1', type: 'text', tip: 'Required by default (module setting). Max length: module "Title 1 Max Length" (default 255).' },
        { key: 'TitleLine2', label: 'Title Line 2', type: 'text', placeholder: 'Optional', tip: 'Optional by default. Max length: module "Title 2 Max Length" (default 255).' },
        {
          key: 'Description',
          label: 'Description · paragraphs',
          type: 'textarea',
          tip: 'One paragraph per line here (Spark: "+ Add paragraph", reorder, remove). Plain text only. Limited by the module "Paragraphs Limit" and "Paragraph Max Length".',
        },
        { key: 'Button1Label', label: 'Button 1 Label', type: 'text', tip: LABEL_TIP },
        { key: 'Button1URL', label: 'Button 1 URL', type: 'text', tip: URL_TIP },
        { key: 'Button2Label', label: 'Button 2 Label', type: 'text', tip: LABEL_TIP },
        { key: 'Button2URL', label: 'Button 2 URL', type: 'text', tip: URL_TIP },
      ],
    },
  ],
  widget: [
    {
      type: 'text',
      key: 'widgetId',
      label: 'Widget Id',
      tip: 'Placement option. Letters, numbers, - and _, starting with a letter. Empty or invalid → seoBlock-{placement id}. Used for the root id and the JS selector.',
    },
    {
      type: 'select',
      key: 'headingLevel',
      label: 'Title Heading',
      options: heading,
      help: 'Heading tag of the title (the block has one item, so one heading)',
    },
    {
      type: 'group',
      label: 'Show / hide (placement options)',
      fields: [
        { type: 'switch', key: 'showTitleLine1', label: 'Show Title Line 1' },
        { type: 'switch', key: 'showTitleLine2', label: 'Show Title Line 2' },
        { type: 'switch', key: 'showDivider', label: 'Show Divider' },
        { type: 'switch', key: 'showDescription', label: 'Show Description' },
        { type: 'switch', key: 'button1Show', label: 'Show Button 1' },
        { type: 'switch', key: 'button2Show', label: 'Show Button 2' },
      ],
    },
    {
      type: 'group',
      label: 'SEO Block Module (admin · data source)',
      fields: [
        { type: 'stepper', key: 'itemCount', label: 'Row with an item selected', min: 0, max: MAX_ITEMS, tip: 'Simulates the tab row: 0 = no item selected → the widget renders nothing. The module has no Max Items (always 1).' },
        { type: 'switch', key: 'titleLine1Enabled', label: 'Title Line 1 enabled', hint: 'Disabled = not editable and not rendered' },
        { type: 'switch', key: 'titleLine2Enabled', label: 'Title Line 2 enabled' },
        { type: 'switch', key: 'descriptionEnabled', label: 'Description enabled' },
        { type: 'stepper', key: 'paragraphLimit', label: 'Paragraphs Limit', min: 1, max: 20, visibleWhen: (c) => c.descriptionEnabled },
        {
          type: 'segmented',
          key: 'buttonCount',
          label: 'Number of Buttons',
          options: [
            { value: '0', label: 'None' },
            { value: '1', label: '1' },
            { value: '2', label: '2' },
          ],
        },
      ],
    },
  ],
  styles: [
    {
      type: 'segmented',
      key: 'alignment',
      label: 'Content alignment',
      responsive: true,
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
      ],
    },
    {
      type: 'group',
      label: 'Typography',
      fields: [
        { type: 'typography', key: 'titleFont', label: 'Title line 1', responsive: true },
        { type: 'typography', key: 'title2Font', label: 'Title line 2', responsive: true },
        { type: 'typography', key: 'descriptionFont', label: 'Description', responsive: true },
      ],
    },
    {
      type: 'group',
      label: 'Block',
      fields: [
        ...widthFields<SeoBlockConfig>({ min: 480, max: 1530 }),
        { type: 'slider', key: 'paddingY', label: 'Padding vertical', min: 0, max: 120, step: 2, unit: 'px', responsive: true },
        { type: 'slider', key: 'paddingX', label: 'Padding horizontal', min: 0, max: 120, step: 2, unit: 'px', responsive: true },
        { type: 'color', key: 'backgroundColor', label: 'Background color' },
        { type: 'slider', key: 'borderRadius', label: 'Border radius', min: 0, max: 48, unit: 'px' },
        { type: 'slider', key: 'borderWidth', label: 'Border width', min: 0, max: 12, unit: 'px', help: 'Border style: solid' },
        { type: 'color', key: 'borderColor', label: 'Border color', visibleWhen: (c) => c.borderWidth > 0 },
      ],
    },
    { type: 'color', key: 'dividerColor', label: 'Divider color', visibleWhen: (c) => c.showDivider },
    {
      type: 'group',
      label: 'Buttons',
      visibleWhen: (c) => c.buttonCount !== '0' && (c.button1Show || c.button2Show),
      fields: [
        { type: 'switch', key: 'buttonsStack', label: 'Stack buttons', hint: 'One under the other, at natural width', responsive: true },
        { type: 'color', key: 'buttonColor', label: 'Default button color', help: 'Used by buttons without a custom style' },
        { type: 'buttonStyle', key: 'button1Style', label: 'Button 1 · custom style', visibleWhen: (c) => c.button1Show },
        { type: 'buttonStyle', key: 'button2Style', label: 'Button 2 · custom style', visibleWhen: (c) => c.button2Show && c.buttonCount === '2' },
      ],
    },
  ],
}
