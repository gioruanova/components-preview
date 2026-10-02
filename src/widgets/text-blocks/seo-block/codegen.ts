import { lines } from '@/tooling/codegen'
import type { WidgetCode } from '@/tooling/types'
import type { SeoBlockConfig } from './schema'

/** A button renders only when it's shown AND has a URL and a label. Shared by Preview and codegen. */
export function renderedButtons(c: SeoBlockConfig) {
  return [
    { n: 1, show: c.button1Show, url: c.button1Url, label: c.button1Label },
    { n: 2, show: c.button2Show, url: c.button2Url, label: c.button2Label },
  ].filter((b) => b.show && b.url.trim() && b.label.trim())
}

export function isEmpty(c: SeoBlockConfig) {
  return !c.showTitle && !c.showDescription && renderedButtons(c).length === 0
}

export function toData(c: SeoBlockConfig) {
  return {
    ShowTitle: c.showTitle,
    TitleLine1: c.titleLine1,
    TitleLine2: c.titleLine2,
    HeadingLevel: c.headingLevel,
    ShowDivider: c.showDivider,
    ShowDescription: c.showDescription,
    Description: c.description,
    Button1Show: c.button1Show,
    Button1URL: c.button1Url,
    Button1Label: c.button1Label,
    Button2Show: c.button2Show,
    Button2URL: c.button2Url,
    Button2Label: c.button2Label,
  }
}

export function toHtml(c: SeoBlockConfig) {
  if (isEmpty(c)) return '<!-- Widget has no data: it is removed from the page -->'
  const h = c.headingLevel
  const buttons = renderedButtons(c)
  return lines(
    `<div class="${c.widgetId}-signup-container">`,
    `  <div id="${c.widgetId}">`,
    c.showTitle && `    <${h} class="seo-title">`,
    c.showTitle && '      <span class="seo-title-line1">${TitleLine1}</span>',
    c.showTitle && c.titleLine2 && '      <span class="seo-title-line2">${TitleLine2}</span>',
    c.showTitle && c.showDivider && '      <span class="seo-divider"></span>',
    c.showTitle && `    </${h}>`,
    c.showDescription && '    <div class="seo-description">${Description}</div>',
    buttons.length > 0 && '    <div class="buttons-container">',
    ...buttons.map((b) => `      <a href="\${Button${b.n}URL}" class="button button-${b.n}">\${Button${b.n}Label}</a>`),
    buttons.length > 0 && '    </div>',
    '  </div>',
    '</div>',
  )
}

export function toScript(c: SeoBlockConfig) {
  return `function createCustomSeo(widgetData) {
  const widgetName = '${c.widgetId}';
  const $widget = $(\`#\${widgetName}\`);
  const widgetOpts = typeof ${c.widgetId}Opts === 'undefined' ? null : ${c.widgetId}Opts;

  const {
    ShowTitle, TitleLine1, TitleLine2, HeadingLevel = 'h1', ShowDivider,
    ShowDescription, Description,
    Button1Show, Button1URL, Button1Label,
    Button2Show, Button2URL, Button2Label,
  } = widgetData[0];

  // A button renders only when it's shown and has both a URL and a label
  const showButton1 = Button1Show && Button1URL && Button1Label;
  const showButton2 = Button2Show && Button2URL && Button2Label;

  // No data at all: remove the widget from the page
  if (!ShowTitle && !ShowDescription && !showButton1 && !showButton2) {
    $widget.parent().remove();
    return;
  }

  const Title = [TitleLine1, TitleLine2].filter(Boolean).join(' ');
  const titleHtml = ShowTitle
    ? \`<\${HeadingLevel} class="seo-title"><span class="seo-title-line1">\${TitleLine1}</span>\${TitleLine2 ? \`<span class="seo-title-line2">\${TitleLine2}</span>\` : ''}\${ShowDivider ? '<span class="seo-divider"></span>' : ''}</\${HeadingLevel}>\`
    : '';
  const descriptionHtml = ShowDescription ? \`<div class="seo-description">\${Description}</div>\` : '';
  $widget.html(titleHtml + descriptionHtml);

  // Buttons container is omitted when no button renders
  if (showButton1 || showButton2) {
    $widget.append(\`
      <div class="buttons-container">
        \${showButton1 ? \`<a href="\${Button1URL}" class="button button-1" \${updateLinksAttributes(Button1URL, Title)}>\${Button1Label}</a>\` : ''}
        \${showButton2 ? \`<a href="\${Button2URL}" class="button button-2" \${updateLinksAttributes(Button2URL, Title)}>\${Button2Label}</a>\` : ''}
      </div>
    \`);
  }
}`
}

export function codegen(c: SeoBlockConfig): WidgetCode {
  return { html: toHtml(c), script: toScript(c), data: toData(c) }
}
