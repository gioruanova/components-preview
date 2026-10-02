import { json, lines } from '@/tooling/codegen'
import type { CodeFile } from '@/tooling/types'
import type { SeoBlockConfig } from './schema'

export function isEmpty(c: SeoBlockConfig) {
  return !c.showTitle && !c.showDescription && !c.button1Show && !c.button2Show
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
  const anyButton = c.button1Show || c.button2Show
  return lines(
    `<div class="${c.widgetId}-signup-container">`,
    `  <div id="${c.widgetId}">`,
    c.showTitle && `    <${h} class="seo-title">`,
    c.showTitle && '      ${TitleLine1}',
    c.showTitle && c.titleLine2 && '      <span class="seo-title-line2">${TitleLine2}</span>',
    c.showTitle && c.showDivider && '      <span class="seo-divider"></span>',
    c.showTitle && `    </${h}>`,
    c.showDescription && '    <div class="seo-description">${Description}</div>',
    anyButton && '    <div class="buttons-container">',
    c.button1Show && '      <a href="${Button1URL}" class="button">${Button1Label}</a>',
    c.button2Show && '      <a href="${Button2URL}" class="button">${Button2Label}</a>',
    anyButton && '    </div>',
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

  // No data at all: remove the widget from the page
  if (!ShowTitle && !ShowDescription && !Button1Show && !Button2Show) {
    $widget.parent().remove();
    return;
  }

  const Title = [TitleLine1, TitleLine2].filter(Boolean).join(' ');
  const titleHtml = ShowTitle
    ? \`<\${HeadingLevel} class="seo-title">\${TitleLine1}\${TitleLine2 ? \`<span class="seo-title-line2">\${TitleLine2}</span>\` : ''}\${ShowDivider ? '<span class="seo-divider"></span>' : ''}</\${HeadingLevel}>\`
    : '';
  const descriptionHtml = ShowDescription ? \`<div class="seo-description">\${Description}</div>\` : '';
  $widget.html(titleHtml + descriptionHtml);

  // Buttons container is omitted when both buttons are hidden
  if (Button1Show || Button2Show) {
    $widget.append(\`
      <div class="buttons-container">
        \${Button1Show ? \`<a href="\${Button1URL}" class="button" \${updateLinksAttributes(Button1URL, Title)}>\${Button1Label}</a>\` : ''}
        \${Button2Show ? \`<a href="\${Button2URL}" class="button" \${updateLinksAttributes(Button2URL, Title)}>\${Button2Label}</a>\` : ''}
      </div>
    \`);
  }
}`
}

export function codegen(c: SeoBlockConfig): CodeFile[] {
  return [
    { id: 'html', label: 'HTML', language: 'markup', code: toHtml(c) },
    { id: 'script', label: 'Script', language: 'javascript', code: toScript(c) },
    { id: 'data', label: 'Data', language: 'json', code: json(toData(c)) },
  ]
}
