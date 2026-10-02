import type { Schema } from '@/tooling/types'

export type CardItem = {
  Title: string
  Description: string
  Image: string
  URL: string
  PurchaseURL: string
}

export type CardsConfig = {
  widgetId: string
  showDescription: boolean
  showMoreButton: boolean
  showBuyNowButton: boolean
  cardCount: number
  items: CardItem[]
  cardsPerRow: number
  shape: 'square' | 'circle'
  borderRadius: number
  cardWidth: number
  cardHeight: number
  borderWidth: number
  borderColor: string
  titleBackground: boolean
  cardColor: string
}

export const MAX_CARDS = 12

export const newItem = (i: number): CardItem => ({
  Title: `Card ${i + 1}`,
  Description: '',
  Image: `https://picsum.photos/seed/saffire${i + 1}/600/400`,
  URL: '',
  PurchaseURL: '',
})

export const defaults: CardsConfig = {
  widgetId: 'customCards',
  showDescription: true,
  showMoreButton: true,
  showBuyNowButton: false,
  cardCount: 4,
  items: [
    {
      Title: 'Summer Concert Series',
      Description: 'Live music every Friday night on the main lawn.',
      Image: 'https://picsum.photos/seed/concert/600/400',
      URL: 'https://example.com/concerts',
      PurchaseURL: 'https://example.com/concerts/tickets',
    },
    {
      Title: 'Family Fun Day',
      Description: 'Games, food trucks, and activities for all ages.',
      Image: 'https://picsum.photos/seed/familyday/600/400',
      URL: 'https://example.com/family-fun-day',
      PurchaseURL: '',
    },
    {
      Title: 'VIP Tailgate Experience',
      Description: '',
      Image: 'https://picsum.photos/seed/tailgate/600/400',
      URL: '',
      PurchaseURL: 'https://example.com/vip-tailgate',
    },
    {
      Title: 'Kids Zone',
      Description: 'Face painting, bounce houses, and a petting zoo.',
      Image: 'https://picsum.photos/seed/kidszone/600/400',
      URL: 'https://example.com/kids-zone',
      PurchaseURL: '',
    },
  ],
  cardsPerRow: 4,
  shape: 'square',
  borderRadius: 10,
  cardWidth: 280,
  cardHeight: 320,
  borderWidth: 0,
  borderColor: '#ffffff',
  titleBackground: false,
  cardColor: '#007bc7',
}

export const schema: Schema<CardsConfig> = {
  content: [
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
        { key: 'URL', label: '"More" URL', type: 'text', placeholder: 'No URL → no More button' },
        { key: 'PurchaseURL', label: '"Buy now" URL', type: 'text', placeholder: 'No URL → no Buy now button' },
      ],
    },
  ],
  widget: [
    { type: 'text', key: 'widgetId', label: 'Widget ID' },
    { type: 'stepper', key: 'cardCount', label: 'Number of cards', min: 1, max: MAX_CARDS },
    { type: 'stepper', key: 'cardsPerRow', label: 'Cards per row', min: 1, max: 6, help: 'Tablet caps at 2, mobile at 1' },
    { type: 'switch', key: 'showDescription', label: 'Description', hint: 'Show on every card' },
    { type: 'switch', key: 'showMoreButton', label: 'More button', hint: 'Show when a card has a URL' },
    { type: 'switch', key: 'showBuyNowButton', label: 'Buy now button', hint: 'Show when a card has a purchase URL' },
  ],
  styles: [
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
    { type: 'slider', key: 'cardWidth', label: 'Card width', min: 160, max: 420, step: 10, unit: 'px', help: 'Maximum width; cards shrink to fit the row' },
    {
      type: 'slider',
      key: 'cardHeight',
      label: 'Card height',
      min: 160,
      max: 520,
      step: 10,
      unit: 'px',
      visibleWhen: (c) => c.shape === 'square',
    },
    { type: 'slider', key: 'borderWidth', label: 'Border width', min: 0, max: 12, unit: 'px', help: 'Border style: solid' },
    { type: 'color', key: 'borderColor', label: 'Border color', visibleWhen: (c) => c.borderWidth > 0 },
    { type: 'switch', key: 'titleBackground', label: 'Title background', hint: 'Card color fills the title bar and overlay' },
    { type: 'color', key: 'cardColor', label: 'Card color' },
  ],
}
