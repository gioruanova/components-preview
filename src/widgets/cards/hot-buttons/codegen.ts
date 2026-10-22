import { outputPath } from '@/tooling/assets'
import { lines } from '@/tooling/codegen'
import type { WidgetCode } from '@/tooling/types'
import { newItem, type HotButtonItem, type HotButtonsConfig } from './schema'

/** The first `buttonCount` items, padding with placeholders when the count grows past the stored items. */
export function visibleItems(c: HotButtonsConfig): HotButtonItem[] {
  return Array.from({ length: c.buttonCount }, (_, i) => c.items[i] ?? newItem(i))
}

/** A button renders when it has a label (required in Spark). Without a URL it renders but is not clickable (void-link). */
export const isRendered = (item: HotButtonItem) => Boolean(item.Title.trim())

export const hasLink = (item: HotButtonItem) => Boolean(item.URL.trim())

export const renderedItems = (c: HotButtonsConfig) => visibleItems(c).filter(isRendered)

/** The item's icon reference, or '' when icons are hidden or the item has none. */
export const iconOf = (item: HotButtonItem, c: HotButtonsConfig) => (c.showIcons && item.Icon ? item.Icon : '')

export const isEmpty = (c: HotButtonsConfig) => renderedItems(c).length === 0

/** Same shape as Saffire's GetWidgetModuleItemData for Hot Buttons. IconAlt empty → the label is used. */
export function toData(c: HotButtonsConfig) {
  const items = renderedItems(c)
  return {
    HasData: items.length > 0,
    Items: items.map((item) => ({ Source: 'custom', Title: item.Title, URL: item.URL, IconURL: (item.Icon && outputPath(item.Icon)) || '', IconAlt: '' })),
  }
}

/** Markup the Saffire default template renders (one button shown; the comment says how many repeat). */
export function toHtml(c: HotButtonsConfig) {
  if (isEmpty(c)) return '<!-- No button: the container is removed and "hotButtons-no-data" is added to <body> -->'
  return lines(
    `<div id="${c.widgetId}" class="hot-buttons">`,
    `  <!-- a.hot-button repeats once per item ({#Items}, ${renderedItems(c).length}); without a URL: no href + class "void-link" -->`,
    '  <a class="hot-button" href="${URL}">',
    '    <div class="card-content">',
    c.showIcons && '      <div class="icon-wrapper"><img class="hot-button-icon" src="${IconURL}" alt="${IconAlt}" /></div>',
    '      <span class="widget-title">${Title}</span>',
    '    </div>',
    '  </a>',
    '</div>',
  )
}

/** The script call of the placement template (hotButtons.js + widgetHelpers.js are registered by the widget). */
export function toScript(c: HotButtonsConfig) {
  return `$(function () {
  saffire.widgets.hotButtons('#${c.widgetId}', function ($el, data, hasData) {
    // DOM is ready: manipulate the buttons here.
    // data = { HasData, Items: [{ Source, Title, URL, IconURL, IconAlt }] }
  });
});`
}

export function codegen(c: HotButtonsConfig): WidgetCode {
  return { html: toHtml(c), script: toScript(c), data: toData(c) }
}
