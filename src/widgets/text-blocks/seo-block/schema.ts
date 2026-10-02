import type { Schema } from '@/tooling/types'
import { buttonStyle, type ButtonStyle } from '@/tooling/buttons'
import { widthFields, type WidthConfig } from '@/tooling/layout'
import { typography, type Typography } from '@/tooling/typography'

export type Alignment = 'left' | 'center' | 'right'

export type SeoBlockConfig = WidthConfig & {
  widgetId: string
  showTitle: boolean
  titleLine1: string
  titleLine2: string
  headingLevel: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  showDivider: boolean
  showDescription: boolean
  description: string
  button1Show: boolean
  button1Url: string
  button1Label: string
  button2Show: boolean
  button2Url: string
  button2Label: string
  alignment: Alignment
  titleFont: Typography
  title2Font: Typography
  descriptionFont: Typography
  backgroundColor: string
  borderRadius: number
  borderWidth: number
  borderColor: string
  dividerColor: string
  buttonColor: string
  button1Style: ButtonStyle
  button2Style: ButtonStyle
}

// Base styles follow the existing Saffire widget (saffire-docs-poc).
export const defaults: SeoBlockConfig = {
  widgetId: 'customSeoBlock',
  showTitle: true,
  titleLine1: 'Join thousands of members',
  titleLine2: 'today',
  headingLevel: 'h1',
  showDivider: true,
  showDescription: true,
  description: 'Get access to exclusive events, discounts, and community perks.',
  button1Show: true,
  button1Url: '/learn-more',
  button1Label: 'Learn More',
  button2Show: true,
  button2Url: 'https://tickets.partner.com/join',
  button2Label: 'Explore',
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
}

const URL_TIP = "Without a URL (and a label) the button won't be rendered."

const heading = (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const).map((h) => ({ value: h, label: h.toUpperCase() }))

export const schema: Schema<SeoBlockConfig> = {
  // Content = only what the client edits. Show/hide toggles live in Widget configuration.
  content: [
    { type: 'text', key: 'titleLine1', label: 'Title line 1', visibleWhen: (c) => c.showTitle },
    { type: 'text', key: 'titleLine2', label: 'Title line 2', placeholder: 'Optional', visibleWhen: (c) => c.showTitle },
    { type: 'textarea', key: 'description', label: 'Description', visibleWhen: (c) => c.showDescription },
    {
      type: 'group',
      label: 'Button 1',
      visibleWhen: (c) => c.button1Show,
      fields: [
        { type: 'text', key: 'button1Label', label: 'Label' },
        { type: 'text', key: 'button1Url', label: 'URL', tip: URL_TIP },
      ],
    },
    {
      type: 'group',
      label: 'Button 2',
      visibleWhen: (c) => c.button2Show,
      fields: [
        { type: 'text', key: 'button2Label', label: 'Label' },
        { type: 'text', key: 'button2Url', label: 'URL', tip: URL_TIP },
      ],
    },
  ],
  widget: [
    { type: 'text', key: 'widgetId', label: 'Widget ID' },
    {
      type: 'group',
      label: 'Show / hide',
      fields: [
        { type: 'switch', key: 'showTitle', label: 'Show title', hint: 'Both lines render inside the heading' },
        { type: 'switch', key: 'showDivider', label: 'Show title divider', hint: 'Line under the title', visibleWhen: (c) => c.showTitle },
        { type: 'switch', key: 'showDescription', label: 'Show description' },
        { type: 'switch', key: 'button1Show', label: 'Show button 1' },
        { type: 'switch', key: 'button2Show', label: 'Show button 2' },
      ],
    },
    { type: 'select', key: 'headingLevel', label: 'Heading level', options: heading, help: 'Pick the level that fits the page outline' },
  ],
  styles: [
    {
      type: 'segmented',
      key: 'alignment',
      label: 'Content alignment',
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
        { type: 'typography', key: 'titleFont', label: 'Title line 1' },
        { type: 'typography', key: 'title2Font', label: 'Title line 2' },
        { type: 'typography', key: 'descriptionFont', label: 'Description' },
      ],
    },
    {
      type: 'group',
      label: 'Block',
      fields: [
        ...widthFields<SeoBlockConfig>({ min: 480, max: 1530 }),
        { type: 'color', key: 'backgroundColor', label: 'Background color' },
        { type: 'slider', key: 'borderRadius', label: 'Border radius', min: 0, max: 48, unit: 'px' },
        { type: 'slider', key: 'borderWidth', label: 'Border width', min: 0, max: 12, unit: 'px', help: 'Border style: solid' },
        { type: 'color', key: 'borderColor', label: 'Border color', visibleWhen: (c) => c.borderWidth > 0 },
      ],
    },
    { type: 'color', key: 'dividerColor', label: 'Divider color', visibleWhen: (c) => c.showTitle && c.showDivider },
    {
      type: 'group',
      label: 'Buttons',
      visibleWhen: (c) => c.button1Show || c.button2Show,
      fields: [
        { type: 'color', key: 'buttonColor', label: 'Default button color', help: 'Used by buttons without a custom style' },
        { type: 'buttonStyle', key: 'button1Style', label: 'Button 1 · custom style', visibleWhen: (c) => c.button1Show },
        { type: 'buttonStyle', key: 'button2Style', label: 'Button 2 · custom style', visibleWhen: (c) => c.button2Show },
      ],
    },
  ],
}
