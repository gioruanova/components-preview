import { lines } from '@/tooling/codegen'
import type { WidgetCode } from '@/tooling/types'
import { newItem, type CardItem, type CardsConfig } from './schema'

/** The first `cardCount` items, padding with placeholders when the count grows past the stored items. */
export function visibleItems(c: CardsConfig): CardItem[] {
  return Array.from({ length: c.cardCount }, (_, i) => c.items[i] ?? newItem(i))
}

export type CardButton = { n: 1 | 2; label: string; url: string }

/**
 * Per-card rendering rules shared by the preview and the generated code (same as Saffire Card Block).
 * A button renders only when it's shown for the widget and the card has its label and URL.
 */
export function cardParts(item: CardItem, c: CardsConfig) {
  const image = c.showImage && item.Image ? item.Image : ''
  const description = c.showDescription && item.Description ? item.Description : ''
  const buttons = (
    [
      { n: 1, show: c.button1Show, label: item.Button1Label, url: item.Button1URL },
      { n: 2, show: c.button2Show, label: item.Button2Label, url: item.Button2URL },
    ] as const
  )
    .filter((b) => b.show && b.label.trim() && b.url.trim())
    .map(({ n, label, url }): CardButton => ({ n, label: label.trim(), url: url.trim() }))
  return { image, description, buttons }
}

/** Same shape as Saffire's GetWidgetModuleItemData for Card Block (own cards; event rows add DateRange / TimeRange). */
export function toData(c: CardsConfig) {
  const items = visibleItems(c)
  return {
    HasData: items.length > 0,
    Items: items.map((item) => ({
      Source: 'custom',
      Title: item.Title,
      Description: item.Description,
      ImageURL: item.Image,
      ImageAlt: '',
      Button1Label: item.Button1Label,
      Button1URL: item.Button1URL,
      Button2Label: item.Button2Label,
      Button2URL: item.Button2URL,
    })),
  }
}

/** Markup the Saffire default template renders (one card shown; the comment says how many repeat). */
export function toHtml(c: CardsConfig) {
  const t = c.titleTag
  const anyButton = c.button1Show || c.button2Show
  return lines(
    `<div id="${c.widgetId}" class="cards-container">`,
    `  <!-- .card-item repeats once per item ({#Items}, ${c.cardCount}); image, description and buttons only when the item has them -->`,
    '  <div class="card-item">',
    c.showImage && '    <div class="image-container"><img class="card-image" src="${ImageURL}" alt="${ImageAlt}" /></div>',
    c.showOverlay && '    <div class="overlay"></div>',
    '    <div class="card-content">',
    `      <${t} class="widget-title">\${Title}</${t}>`,
    c.showDescription && '      <p class="widget-description">${Description}</p>',
    anyButton && '      <div class="buttons-container">',
    c.button1Show && '        <a class="button button-1" href="${Button1URL}">${Button1Label}</a>',
    c.button2Show && '        <a class="button button-2" href="${Button2URL}">${Button2Label}</a>',
    anyButton && '      </div>',
    '    </div>',
    '  </div>',
    '</div>',
  )
}

/** The script call of the placement template (cardBlock.js + widgetHelpers.js are registered by the widget). */
export function toScript(c: CardsConfig) {
  return `$(function () {
  saffire.widgets.cardBlock('#${c.widgetId}', function ($el, data, hasData) {
    // DOM is ready: manipulate the cards here.
    // data = { HasData, Items: [{ Source, Title, Description, ImageURL, ImageAlt, Button1Label, Button1URL, Button2Label, Button2URL }] }
  });
});`
}

export function codegen(c: CardsConfig): WidgetCode {
  return { html: toHtml(c), script: toScript(c), data: toData(c) }
}
