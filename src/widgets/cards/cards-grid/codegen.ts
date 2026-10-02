import { json, lines } from '@/tooling/codegen'
import type { CodeFile } from '@/tooling/types'
import { newItem, type CardItem, type CardsConfig } from './schema'

/** The first `cardCount` items, padding with placeholders when the count grows past the stored items. */
export function visibleItems(c: CardsConfig): CardItem[] {
  return Array.from({ length: c.cardCount }, (_, i) => c.items[i] ?? newItem(i))
}

/** Per-card rendering rules shared by the preview and the generated code. */
export function cardParts(item: CardItem, c: CardsConfig) {
  const description = c.showDescription && item.Description ? item.Description : ''
  const more = c.showMoreButton && item.URL ? item.URL : ''
  const buyNow = c.showBuyNowButton && item.PurchaseURL ? item.PurchaseURL : ''
  return { description, more, buyNow, interactive: Boolean(description || more || buyNow) }
}

export function toData(c: CardsConfig) {
  return {
    ShowDescription: c.showDescription,
    ShowMoreButton: c.showMoreButton,
    ShowBuyNowButton: c.showBuyNowButton,
    Items: visibleItems(c).map((item) => ({
      ...item,
      URL: item.URL || null,
      PurchaseURL: item.PurchaseURL || null,
    })),
  }
}

export function toHtml(c: CardsConfig) {
  const anyButton = c.showMoreButton || c.showBuyNowButton
  return lines(
    `<div class="${c.widgetId}-container custom-cards-container">`,
    `  <div id="${c.widgetId}">`,
    `    <!-- .card-widget-item repeats once per item (${c.cardCount}) -->`,
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
    c.showMoreButton && '            <a href="${URL}" class="button">More</a>',
    c.showBuyNowButton && '            <a href="${PurchaseURL}" class="button">Buy now</a>',
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
  const { ShowDescription, ShowMoreButton, ShowBuyNowButton, Items } = widgetData;

  $widget.find('.card-widget-item').each(function (x) {
    const { Title, Description, URL, PurchaseURL } = Items[x];
    const $cardItem = $(this);

    // Buttons only render when the card has the matching URL
    const description = ShowDescription && Description ? \`<p class="widget-description">\${Description}</p>\` : '';
    const moreBtn = ShowMoreButton && URL ? \`<a href="\${URL}" class="button">More</a>\` : '';
    const buyNowBtn = ShowBuyNowButton && PurchaseURL ? \`<a href="\${PurchaseURL}" class="button">Buy now</a>\` : '';

    // A card with no description and no buttons is non-interactive
    if (!description && !moreBtn && !buyNowBtn) {
      $cardItem.addClass('is-static').removeAttr('href');
    }

    $cardItem.append(\`
      <div class="card-content">
        <div class="widget-title-wrapper"><h3 class="widget-title">\${Title}</h3></div>
        <div class="hover-content">
          \${description}
          <div class="cards-buttons-container">\${moreBtn}\${buyNowBtn}</div>
        </div>
      </div>
    \`);
  });
}`
}

export function codegen(c: CardsConfig): CodeFile[] {
  return [
    { id: 'html', label: 'HTML', language: 'markup', code: toHtml(c) },
    { id: 'script', label: 'Script', language: 'javascript', code: toScript(c) },
    { id: 'data', label: 'Data', language: 'json', code: json(toData(c)) },
  ]
}
