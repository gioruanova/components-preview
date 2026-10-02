import type { Schema } from '@/tooling/types'

export type SeoBlockConfig = {
  widgetId: string
  siteBaseUrl: string
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
  backgroundColor: string
  textColor: string
  borderRadius: number
  borderWidth: number
  borderColor: string
}

export const defaults: SeoBlockConfig = {
  widgetId: 'customSeoBlock',
  siteBaseUrl: 'https://example.com',
  showTitle: true,
  titleLine1: 'Join thousands of members',
  titleLine2: 'today',
  headingLevel: 'h1',
  showDivider: true,
  showDescription: true,
  description: 'Get access to exclusive events, discounts, and community perks.',
  button1Show: true,
  button1Url: 'https://example.com/learn-more',
  button1Label: 'Learn More',
  button2Show: true,
  button2Url: 'https://tickets.partner.com/join',
  button2Label: 'Explore',
  backgroundColor: '#f0f0f0',
  textColor: '#222222',
  borderRadius: 16,
  borderWidth: 0,
  borderColor: '#007bc7',
}

const heading = (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const).map((h) => ({ value: h, label: h.toUpperCase() }))

export const schema: Schema<SeoBlockConfig> = {
  content: [
    { type: 'switch', key: 'showTitle', label: 'Title', hint: 'Both lines render inside the heading' },
    { type: 'text', key: 'titleLine1', label: 'Title line 1', visibleWhen: (c) => c.showTitle },
    { type: 'text', key: 'titleLine2', label: 'Title line 2', placeholder: 'Optional', visibleWhen: (c) => c.showTitle },
    { type: 'switchText', key: 'description', toggleKey: 'showDescription', label: 'Description', multiline: true },
    {
      type: 'group',
      label: 'Button 1',
      fields: [
        { type: 'switch', key: 'button1Show', label: 'Show button' },
        { type: 'text', key: 'button1Label', label: 'Label', visibleWhen: (c) => c.button1Show },
        { type: 'text', key: 'button1Url', label: 'URL', visibleWhen: (c) => c.button1Show },
      ],
    },
    {
      type: 'group',
      label: 'Button 2',
      fields: [
        { type: 'switch', key: 'button2Show', label: 'Show button' },
        { type: 'text', key: 'button2Label', label: 'Label', visibleWhen: (c) => c.button2Show },
        { type: 'text', key: 'button2Url', label: 'URL', visibleWhen: (c) => c.button2Show },
      ],
    },
  ],
  widget: [
    { type: 'text', key: 'widgetId', label: 'Widget ID' },
    { type: 'select', key: 'headingLevel', label: 'Heading level', options: heading, help: 'Pick the level that fits the page outline' },
    { type: 'switch', key: 'showDivider', label: 'Title divider', hint: 'Line under the title', visibleWhen: (c) => c.showTitle },
    {
      type: 'text',
      key: 'siteBaseUrl',
      label: 'Site base URL',
      help: 'Button URLs on other domains open in a new tab',
    },
  ],
  styles: [
    { type: 'color', key: 'backgroundColor', label: 'Background color' },
    { type: 'color', key: 'textColor', label: 'Text color' },
    { type: 'slider', key: 'borderRadius', label: 'Border radius', min: 0, max: 48, unit: 'px' },
    { type: 'slider', key: 'borderWidth', label: 'Border width', min: 0, max: 12, unit: 'px', help: 'Border style: solid' },
    { type: 'color', key: 'borderColor', label: 'Border color', visibleWhen: (c) => c.borderWidth > 0 },
  ],
}
