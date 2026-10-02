import { lines } from '@/tooling/codegen'
import type { WidgetCode } from '@/tooling/types'
import { newItem, type CardItem, type CardsConfig } from './schema'

/** The first `cardCount` items, padding with placeholders when the count grows past the stored items. */
export function visibleItems(c: CardsConfig): CardItem[] {
  return Array.from({ length: c.cardCount }, (_, i) => c.items[i] ?? newItem(i))
}

export type CardButton = { n: 1 | 2; label: string; url: string }

/**
 * Per-card rendering rules shared by the preview and the generated code.
 * A button renders only when it's enabled for the widget, has a label, and the card has its URL.
 */
export function cardParts(item: CardItem, c: CardsConfig) {
  const description = c.showDescription && item.Description ? item.Description : ''
  const buttons = (
    [
      { n: 1, show: c.button1Show, label: c.button1Label, url: item.Button1URL },
      { n: 2, show: c.button2Show, label: c.button2Label, url: item.Button2URL },
    ] as const
  )
    .filter((b) => b.show && b.label.trim() && b.url.trim())
    .map(({ n, label, url }): CardButton => ({ n, label, url }))
  return { description, buttons, interactive: Boolean(description || buttons.length) }
}

export function toData(c: CardsConfig) {
  return {
    ShowDescription: c.showDescription,
    Button1Show: c.button1Show,
    Button1Label: c.button1Label,
    Button2Show: c.button2Show,
    Button2Label: c.button2Label,
    Items: visibleItems(c).map((item) => ({
      ...item,
      Button1URL: item.Button1URL || null,
      Button2URL: item.Button2URL || null,
    })),
  }
}

export function toHtml(c: CardsConfig) {
  const anyButton = c.button1Show || c.button2Show
  return lines(
    `<div class="${c.widgetId}-container custom-cards-container">`,
    `  <div id="${c.widgetId}">`,
    `    <!-- .card-widget-item repeats once per item (${c.cardCount}); buttons only when the item has the URL -->`,
    '    <a class="card-widget-item">',
    "      <div class=\"image-container\" style=\"background-image: url('${Image}')\"></div>",
    '      <div class="overlay"></div>',
    '      <div class="card-content">',
    '        <div class="widget-title-wrapper">',
    '          <h3 class="widget-title">${Title}</h3>',
    '        </div>',
    (c.showDescription || anyButton) && '        <div class="hover-content">',
    c.showDescription && '          <p class="widget-description">${Description}</p>',
    anyButton && '          <div class="cards-buttons-container">',
    c.button1Show && '            <a href="${Button1URL}" class="button button-1">${Button1Label}</a>',
    c.button2Show && '            <a href="${Button2URL}" class="button button-2">${Button2Label}</a>',
    anyButton && '          </div>',
    (c.showDescription || anyButton) && '        </div>',
    '      </div>',
    '    </a>',
    '  </div>',
    '</div>',
  )
}

export function toScript(c: CardsConfig) {
  return `function createCustomCards(widgetData) {
  const widgetName = '${c.widgetId}';
  const $widget = $(\`#\${widgetName}\`);
  const widgetOpts = typeof ${c.widgetId}Opts === 'undefined' ? null : ${c.widgetId}Opts;
  const { ShowDescription, Button1Show, Button1Label, Button2Show, Button2Label, Items } = widgetData;

  $widget.find('.card-widget-item').each(function (x) {
    const { Title, Description, Button1URL, Button2URL } = Items[x];
    const $cardItem = $(this);

    // A button renders only when enabled, labelled, and the card has its URL
    const description = ShowDescription && Description ? \`<p class="widget-description">\${Description}</p>\` : '';
    const button1 = Button1Show && Button1Label && Button1URL ? \`<a href="\${Button1URL}" class="button button-1">\${Button1Label}</a>\` : '';
    const button2 = Button2Show && Button2Label && Button2URL ? \`<a href="\${Button2URL}" class="button button-2">\${Button2Label}</a>\` : '';

    // A card with no description and no buttons is non-interactive
    if (!description && !button1 && !button2) {
      $cardItem.addClass('void-link').removeAttr('href');
    }

    $cardItem.append(\`
      <div class="card-content">
        <div class="widget-title-wrapper"><h3 class="widget-title">\${Title}</h3></div>
        <div class="hover-content">
          \${description}
          <div class="cards-buttons-container">\${button1}\${button2}</div>
        </div>
      </div>
    \`);
  });
}`
}

export function codegen(c: CardsConfig): WidgetCode {
  return { html: toHtml(c), script: toScript(c), data: toData(c) }
}
