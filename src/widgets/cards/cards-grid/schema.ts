import type { Schema } from '@/tooling/types'
import { buttonStyle, type ButtonStyle } from '@/tooling/buttons'
import { widthFields, type WidthConfig } from '@/tooling/layout'
import { withOverrides } from '@/tooling/responsive'
import { typography, type Typography } from '@/tooling/typography'

export type CardItem = {
  Title: string
  Description: string
  Image: string
  Button1URL: string
  Button2URL: string
}

export type CardsConfig = WidthConfig & {
  widgetId: string
  showDescription: boolean
  button1Show: boolean
  button1Label: string
  button2Show: boolean
  button2Label: string
  cardCount: number
  items: CardItem[]
  cardsPerRow: number
  fitSpace: boolean
  shape: 'square' | 'circle'
  borderRadius: number
  cardWidth: number
  cardHeight: number
  /** 0 = none. Cards wrap to the next row instead of shrinking below it. */
  cardMinWidth: number
  /** 'auto' = use cardHeight; otherwise the image keeps this ratio at any width. */
  aspectRatio: 'auto' | '1 / 1' | '4 / 3' | '3 / 2' | '16 / 9' | '3 / 4'
  borderWidth: number
  borderColor: string
  titleBackground: boolean
  cardColor: string
  contentVertical: 'top' | 'center' | 'bottom'
  contentHorizontal: 'left' | 'center' | 'right'
  titleFont: Typography
  descriptionFont: Typography
  button1Style: ButtonStyle
  button2Style: ButtonStyle
}

export const MAX_CARDS = 12

export const newItem = (i: number): CardItem => ({
  Title: `Card ${i + 1}`,
  Description: '',
  Image: `https://picsum.photos/seed/saffire${i + 1}/600/400`,
  Button1URL: '',
  Button2URL: '',
})

// Base styles follow the existing Saffire widget (saffire-docs-poc).
// Tablet / mobile values are explicit, editable defaults (see the viewport icons on each responsive field).
export const defaults: CardsConfig = withOverrides<CardsConfig>({
  widgetId: 'customCards',
  showDescription: true,
  button1Show: true,
  button1Label: 'More',
  button2Show: false,
  button2Label: 'Buy now',
  cardCount: 4,
  items: [
    {
      Title: 'Card Title',
      Description: 'Here is a spot for a short description. Keep it brief 1-4 scentences max. Here is a spot for a short description. Keep it brief 1-4 scentences max. Here is a spot for a short description.',
      Image: 'https://picsum.photos/seed/concert/600/400',
      Button1URL: 'https://example.com/concerts',
      Button2URL: 'https://example.com/concerts/tickets',
    },
    {
      Title: 'Family Fun Day',
      Description: 'Games, food trucks, and activities for all ages.',
      Image: 'https://picsum.photos/seed/familyday/600/400',
      Button1URL: 'https://example.com/family-fun-day',
      Button2URL: '',
    },
    {
      Title: 'VIP Tailgate Experience',
      Description: '',
      Image: 'https://picsum.photos/seed/tailgate/600/400',
      Button1URL: '',
      Button2URL: 'https://example.com/vip-tailgate',
    },
    {
      Title: 'Kids Zone',
      Description: 'Face painting, bounce houses, and a petting zoo.',
      Image: 'https://picsum.photos/seed/kidszone/600/400',
      Button1URL: 'https://example.com/kids-zone',
      Button2URL: '',
    },
  ],
  cardsPerRow: 4,
  fitSpace: false,
  widthMode: 'max',
  maxWidth: 1530,
  shape: 'square',
  borderRadius: 10,
  cardWidth: 370,
  cardHeight: 245,
  cardMinWidth: 260,
  aspectRatio: 'auto',
  borderWidth: 0,
  borderColor: '#0079c2',
  titleBackground: true,
  cardColor: '#0079c2',
  contentVertical: 'center',
  contentHorizontal: 'center',
  titleFont: typography({ size: 28, weight: 700, lineHeight: 1.5, color: '#ffffff', transform: 'capitalize', clamp: true, lines: 2, fluid: true, minSize: 18 }),
  descriptionFont: typography({ size: 15, weight: 400, lineHeight: 1.4, color: '#ffffff', clamp: true, lines: 3 }),
  button1Style: buttonStyle({ background: '#0079c2', hoverBackground: '#ffffff', hoverColor: '#0079c2', borderWidth: 1, borderColor: '#ffffff', radius: 40, paddingX: 20, paddingY: 11, font: typography({ size: 14, weight: 700, lineHeight: 1, color: '#ffffff', transform: 'uppercase' }) }),
  button2Style: buttonStyle({ background: '#0079c2', hoverBackground: '#ffffff', hoverColor: '#0079c2', borderWidth: 1, borderColor: '#ffffff', radius: 40, paddingX: 20, paddingY: 11, font: typography({ size: 14, weight: 700, lineHeight: 1, color: '#ffffff', transform: 'uppercase' }) }),
}, {
  'cardsPerRow@tablet': 2,
  'cardsPerRow@mobile': 1,
  'titleFont@tablet': typography({ size: 24, weight: 700, lineHeight: 1.5, color: '#ffffff', transform: 'capitalize', clamp: true, lines: 2, fluid: true, minSize: 18 }),
  'titleFont@mobile': typography({ size: 22, weight: 700, lineHeight: 1.5, color: '#ffffff', transform: 'capitalize', clamp: true, lines: 2, fluid: true, minSize: 18 }),
})

const URL_TIP = "Each card's button renders only when the card has that button's URL (and the button has a label)."

export const schema: Schema<CardsConfig> = {
  // Content = only what the client edits. Show/hide toggles live in Widget configuration.
  content: [
    { type: 'text', key: 'button1Label', label: 'Button 1 label', tip: URL_TIP, visibleWhen: (c) => c.button1Show },
    { type: 'text', key: 'button2Label', label: 'Button 2 label', tip: URL_TIP, visibleWhen: (c) => c.button2Show },
    {
      type: 'list',
      key: 'items',
      label: 'Cards',
      countKey: 'cardCount',
      itemLabel: (i) => `Card ${i + 1}`,
      newItem,
      itemFields: [
        { key: 'Title', label: 'Title', type: 'text' },
        { key: 'Image', label: 'Image URL', type: 'text' },
        { key: 'Description', label: 'Description', type: 'textarea' },
        { key: 'Button1URL', label: 'Button 1 URL', type: 'text', tip: URL_TIP },
        { key: 'Button2URL', label: 'Button 2 URL', type: 'text', tip: URL_TIP },
      ],
    },
  ],
  widget: [
    { type: 'text', key: 'widgetId', label: 'Widget ID' },
    { type: 'stepper', key: 'cardCount', label: 'Number of cards', min: 1, max: MAX_CARDS },
    { type: 'stepper', key: 'cardsPerRow', label: 'Cards per row', min: 1, max: 6, responsive: true },
    { type: 'switch', key: 'fitSpace', label: 'Fit space', hint: 'Cards grow to fill the row when there are fewer of them' },
    {
      type: 'group',
      label: 'Show / hide',
      fields: [
        { type: 'switch', key: 'showDescription', label: 'Show description', hint: 'On every card' },
        { type: 'switch', key: 'button1Show', label: 'Show button 1', hint: 'On cards that have a Button 1 URL' },
        { type: 'switch', key: 'button2Show', label: 'Show button 2', hint: 'On cards that have a Button 2 URL' },
      ],
    },
  ],
  styles: [
    { type: 'group', label: 'Grid', fields: widthFields<CardsConfig>({ min: 480, max: 1920 }) },
    {
      type: 'group',
      label: 'Card',
      fields: [
        {
          type: 'segmented',
          key: 'shape',
          label: 'Shape',
          options: [
            { value: 'square', label: 'Square' },
            { value: 'circle', label: 'Circle' },
          ],
        },
        { type: 'slider', key: 'borderRadius', label: 'Border radius', min: 0, max: 40, unit: 'px', visibleWhen: (c) => c.shape === 'square' },
        {
          type: 'slider',
          key: 'cardWidth',
          responsive: true,
          label: 'Card width',
          min: 160,
          max: 520,
          step: 10,
          unit: 'px',
          help: 'Maximum width (ignored when Fit space is on)',
        },
        {
          type: 'select',
          key: 'aspectRatio',
          label: 'Aspect ratio',
          responsive: true,
          visibleWhen: (c) => c.shape === 'square',
          tip: 'Keeps the image proportions at any card width. Auto uses the card height instead.',
          options: [
            { value: 'auto', label: 'Auto (use card height)' },
            { value: '1 / 1', label: '1 : 1 (square)' },
            { value: '4 / 3', label: '4 : 3' },
            { value: '3 / 2', label: '3 : 2' },
            { value: '16 / 9', label: '16 : 9' },
            { value: '3 / 4', label: '3 : 4 (portrait)' },
          ],
        },
        { type: 'slider', key: 'cardHeight', label: 'Card height', min: 160, max: 520, step: 5, unit: 'px', responsive: true, visibleWhen: (c) => c.shape === 'square' && c.aspectRatio === 'auto' },
        {
          type: 'slider',
          key: 'cardMinWidth',
          label: 'Card min width',
          min: 0,
          max: 480,
          step: 10,
          unit: 'px',
          responsive: true,
          tip: 'Cards never get narrower than this: they wrap to the next row instead. 0 = no minimum.',
        },
        { type: 'color', key: 'cardColor', label: 'Card color', help: 'Title background and hover overlay' },
        { type: 'slider', key: 'borderWidth', label: 'Border width', min: 0, max: 12, unit: 'px', help: 'Border style: solid' },
        { type: 'color', key: 'borderColor', label: 'Border color', visibleWhen: (c) => c.borderWidth > 0 },
      ],
    },
    {
      type: 'group',
      label: 'Content',
      fields: [
        { type: 'switch', key: 'titleBackground', label: 'Add title background', hint: 'Card color behind the title' },
        {
          type: 'segmented',
          key: 'contentVertical',
          responsive: true,
          label: 'Vertical position',
          options: [
            { value: 'top', label: 'Top' },
            { value: 'center', label: 'Center' },
            { value: 'bottom', label: 'Bottom' },
          ],
        },
        {
          type: 'segmented',
          key: 'contentHorizontal',
          responsive: true,
          label: 'Horizontal position',
          options: [
            { value: 'left', label: 'Left' },
            { value: 'center', label: 'Center' },
            { value: 'right', label: 'Right' },
          ],
        },
      ],
    },
    {
      type: 'group',
      label: 'Typography',
      fields: [
        { type: 'typography', key: 'titleFont', label: 'Title', responsive: true },
        { type: 'typography', key: 'descriptionFont', label: 'Description', responsive: true },
      ],
    },
    {
      type: 'group',
      label: 'Buttons',
      visibleWhen: (c) => c.button1Show || c.button2Show,
      fields: [
        { type: 'buttonStyle', key: 'button1Style', label: 'Button 1 · custom style', visibleWhen: (c) => c.button1Show },
        { type: 'buttonStyle', key: 'button2Style', label: 'Button 2 · custom style', visibleWhen: (c) => c.button2Show },
      ],
    },
  ],
}
