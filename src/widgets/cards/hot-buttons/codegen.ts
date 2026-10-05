import { outputPath } from '@/tooling/assets'
import { lines } from '@/tooling/codegen'
import type { WidgetCode } from '@/tooling/types'
import { newItem, type HotButtonItem, type HotButtonsConfig } from './schema'

/** The first `buttonCount` items, padding with placeholders when the count grows past the stored items. */
export function visibleItems(c: HotButtonsConfig): HotButtonItem[] {
  return Array.from({ length: c.buttonCount }, (_, i) => c.items[i] ?? newItem(i))
}

/** A button renders only when it has both a title and a URL (shared by preview, codegen and script). */
export const isRendered = (item: HotButtonItem) => Boolean(item.Title.trim() && item.URL.trim())

export const renderedItems = (c: HotButtonsConfig) => visibleItems(c).filter(isRendered)

/** The item's icon reference, or '' when icons are hidden or the item has none. */
export const iconOf = (item: HotButtonItem, c: HotButtonsConfig) => (c.showIcons && item.Icon ? item.Icon : '')

export const isEmpty = (c: HotButtonsConfig) => renderedItems(c).length === 0

export function toData(c: HotButtonsConfig) {
  return {
    ShowIcons: c.showIcons,
    Items: visibleItems(c).map((item) => ({ Title: item.Title, URL: item.URL || null, Icon: (item.Icon && outputPath(item.Icon)) || null })),
  }
}

export function toHtml(c: HotButtonsConfig) {
  if (isEmpty(c)) return '<!-- Widget has no data: it is removed from the page -->'
  return lines(
    `<div class="${c.widgetId}-container custom-hot-buttons-container">`,
    `  <div id="${c.widgetId}">`,
    `    <!-- .hot-button-item repeats once per item with a title and a URL (${renderedItems(c).length}); icon only when the item has one -->`,
    '    <a href="${URL}" class="hot-button-item">',
    c.showIcons && '      <img class="hot-button-icon" src="${Icon}" alt="" />',
    '      <span class="hot-button-title">${Title}</span>',
    '    </a>',
    '  </div>',
    '</div>',
  )
}

export function toScript(c: HotButtonsConfig) {
  return `function createCustomHotButtons(widgetData) {
  const widgetName = '${c.widgetId}';
  const $widget = $(\`#\${widgetName}\`);
  const widgetOpts = typeof ${c.widgetId}Opts === 'undefined' ? null : ${c.widgetId}Opts;
  const { ShowIcons, Items } = widgetData;

  // A button renders only when it has both a title and a URL
  const items = (Items || []).filter(({ Title, URL }) => Title && URL);
  if (!items.length) {
    $widget.closest('.${c.widgetId}-container').remove();
    return;
  }

  $widget.html(
    items
      .map(({ Title, URL, Icon }) => {
        const icon = ShowIcons && Icon ? \`<img class="hot-button-icon" src="\${Icon}" alt="" />\` : '';
        return \`<a href="\${URL}" class="hot-button-item" \${updateLinksAttributes(URL, Title)}>\${icon}<span class="hot-button-title">\${Title}</span></a>\`;
      })
      .join(''),
  );
}`
}

export function codegen(c: HotButtonsConfig): WidgetCode {
  return { html: toHtml(c), script: toScript(c), data: toData(c) }
}
