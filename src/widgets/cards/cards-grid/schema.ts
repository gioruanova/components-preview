import type { Schema } from '@/tooling/types'
import { buttonStyle, type ButtonStyle } from '@/tooling/buttons'
import { widthFields, type WidthConfig } from '@/tooling/layout'
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
export const defaults: CardsConfig = {
  widgetId: 'customCards',
  showDescription: true,
  button1Show: true,
  button1Label: 'More',
  button2Show: false,
  button2Label: 'Buy now',
  cardCount: 4,
  items: [
    {
      Title: 'Summer Concert Series',
      Description: 'Live music every Friday night on the main lawn.',
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
  borderWidth: 0,
  borderColor: '#0079c2',
  titleBackground: true,
  cardColor: '#0079c2',
  contentVertical: 'center',
  contentHorizontal: 'center',
  titleFont: typography({ size: 28, weight: 700, lineHeight: 1.5, color: '#ffffff', transform: 'capitalize', clamp: true, lines: 2 }),
  descriptionFont: typography({ size: 15, weight: 400, lineHeight: 1.4, color: '#ffffff', clamp: true, lines: 3 }),
  button1Style: buttonStyle({ background: '#0079c2', hoverBackground: '#ffffff', hoverColor: '#0079c2', borderWidth: 1, borderColor: '#ffffff', radius: 40, paddingX: 20, paddingY: 11, font: typography({ size: 14, weight: 700, lineHeight: 1, color: '#ffffff', transform: 'uppercase' }) }),
  button2Style: buttonStyle({ background: '#0079c2', hoverBackground: '#ffffff', hoverColor: '#0079c2', borderWidth: 1, borderColor: '#ffffff', radius: 40, paddingX: 20, paddingY: 11, font: typography({ size: 14, weight: 700, lineHeight: 1, color: '#ffffff', transform: 'uppercase' }) }),
}

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
    { type: 'stepper', key: 'cardsPerRow', label: 'Cards per row', min: 1, max: 6, help: 'Tablet caps at 2, mobile at 1' },
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
          label: 'Card width',
          min: 160,
          max: 520,
          step: 10,
          unit: 'px',
          help: 'Maximum width (ignored when Fit space is on)',
        },
        { type: 'slider', key: 'cardHeight', label: 'Card height', min: 160, max: 520, step: 5, unit: 'px', visibleWhen: (c) => c.shape === 'square' },
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
        { type: 'typography', key: 'titleFont', label: 'Title' },
        { type: 'typography', key: 'descriptionFont', label: 'Description' },
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
