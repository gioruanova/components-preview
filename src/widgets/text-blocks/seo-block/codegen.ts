import { lines } from '@/tooling/codegen'
import type { WidgetCode } from '@/tooling/types'
import { newItem, type HeadingLevel, type SeoBlockConfig, type SeoBlockItem } from './schema'

const HEADINGS: HeadingLevel[] = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']
const HTML_ID = /^[A-Za-z][\w-]*$/

/** Simulated placement id: Spark falls back to `seoBlock-{placement id}` when Widget Id is empty or invalid. */
export const FALLBACK_WIDGET_ID = 'seoBlock-42'

export const widgetIdOf = (c: SeoBlockConfig) => (HTML_ID.test(c.widgetId.trim()) ? c.widgetId.trim() : FALLBACK_WIDGET_ID)

/** Rows with a selected item, in order, up to the module Max Items (padding with placeholders). Shared by Preview and codegen. */
export function shownItems(c: SeoBlockConfig): SeoBlockItem[] {
  return Array.from({ length: Math.max(0, Math.min(c.itemCount, c.maxItems)) }, (_, i) => c.items[i] ?? newItem(i))
}

/** First item uses the Title Heading; next items one level lower (capped at h6), so a page never gets two h1. */
export function titleTagOf(c: SeoBlockConfig, index: number): HeadingLevel {
  const level = HEADINGS.indexOf(c.headingLevel)
  return HEADINGS[Math.min(Math.max(level, 0) + (index > 0 ? 1 : 0), HEADINGS.length - 1)]
}

export type RenderedItem = {
  index: number
  titleTag: HeadingLevel
  /** Title lines that render: module field enabled + placement "Show" on + text. */
  titleLines: string[]
  paragraphs: string[]
  buttons: { n: 1 | 2; label: string; url: string }[]
}

/** Everything a row renders. Same rules as SeoBlockComponentDefinition / SeoBlockWidgetConfigurator in Saffire. */
export function renderItem(c: SeoBlockConfig, item: SeoBlockItem, index: number): RenderedItem {
  const line1 = c.titleLine1Enabled && c.showTitleLine1 ? item.TitleLine1.trim() : ''
  const line2 = c.titleLine2Enabled && c.showTitleLine2 ? item.TitleLine2.trim() : ''
  const paragraphs =
    c.descriptionEnabled && c.showDescription
      ? item.Description.split('\n').map((p) => p.trim()).filter(Boolean).slice(0, c.paragraphLimit)
      : []
  const count = Number(c.buttonCount)
  const buttons = (
    [
      { n: 1, show: c.button1Show && count >= 1, label: item.Button1Label, url: item.Button1URL },
      { n: 2, show: c.button2Show && count >= 2, label: item.Button2Label, url: item.Button2URL },
    ] as const
  )
    // Spark requires a URL when a label is set, so a rendered button always has both
    .filter((b) => b.show && b.label.trim() && b.url.trim())
    .map((b) => ({ n: b.n, label: b.label.trim(), url: b.url.trim() }))

  return { index, titleTag: titleTagOf(c, index), titleLines: [line1, line2].filter(Boolean), paragraphs, buttons }
}

export const renderedItems = (c: SeoBlockConfig) => shownItems(c).map((item, i) => renderItem(c, item, i))

/** No row with a selected item → nothing is rendered and `seoBlock-no-data` is added to the body. */
export const isEmpty = (c: SeoBlockConfig) => shownItems(c).length === 0

const flag = (value: boolean) => (value ? 'True' : 'False')

/** The `data` the JS callback receives (rendered by the server as JSON next to the block). */
export function toData(c: SeoBlockConfig) {
  const items = renderedItems(c)
  return {
    widgetId: widgetIdOf(c),
    hasData: items.length > 0,
    // Placement options as Spark stores them (strings)
    options: {
      WidgetId: c.widgetId,
      TitleHeading: c.headingLevel,
      ShowTitleLine1: flag(c.showTitleLine1),
      ShowTitleLine2: flag(c.showTitleLine2),
      ShowDivider: flag(c.showDivider),
      ShowDescription: flag(c.showDescription),
      ShowButton1: flag(c.button1Show),
      ShowButton2: flag(c.button2Show),
    },
    items: shownItems(c).map((item, i) => ({
      titleLine1: c.titleLine1Enabled ? item.TitleLine1 : null,
      titleLine2: c.titleLine2Enabled ? item.TitleLine2 : null,
      titleTag: titleTagOf(c, i),
      paragraphs: c.descriptionEnabled ? item.Description.split('\n').map((p) => p.trim()).filter(Boolean).slice(0, c.paragraphLimit) : [],
      button1: { label: Number(c.buttonCount) >= 1 ? item.Button1Label : null, url: Number(c.buttonCount) >= 1 ? item.Button1URL : '' },
      button2: { label: Number(c.buttonCount) >= 2 ? item.Button2Label : null, url: Number(c.buttonCount) >= 2 ? item.Button2URL : '' },
    })),
  }
}

/** Markup of the default Spark template, for the first row (the comment says how many rows repeat). */
export function toHtml(c: SeoBlockConfig) {
  if (isEmpty(c)) return '<!-- No row with a selected item: nothing is rendered and "seoBlock-no-data" is added to <body> -->'
  const items = renderedItems(c)
  const first = items[0]
  const h = first.titleTag
  const twoLines = first.titleLines.length === 2
  return lines(
    '<div class="seoBlock-container">',
    `  <div id="${widgetIdOf(c)}">`,
    `    <!-- {#Items}: title, divider, description and buttons repeat once per row with a selected item (${items.length}); next items use <${titleTagOf(c, 1)}> -->`,
    twoLines && `    <${h} class="seo-title" aria-label="\${TitleLine1} \${TitleLine2}">`,
    twoLines && '      <span>${TitleLine1}</span>',
    twoLines && '      <span>${TitleLine2}</span>',
    twoLines && `    </${h}>`,
    first.titleLines.length === 1 && `    <${h} class="seo-title">\${TitleText}</${h}>`,
    c.showDivider && '    <span class="seo-divider"></span>',
    first.paragraphs.length > 0 && '    <div class="seo-description">',
    first.paragraphs.length > 0 && `      <!-- one <p> per paragraph (${first.paragraphs.length}) -->`,
    first.paragraphs.length > 0 && '      <p>${Paragraph}</p>',
    first.paragraphs.length > 0 && '    </div>',
    first.buttons.length > 0 && '    <div class="buttons-container">',
    ...first.buttons.map((b) => `      <a class="button button-${b.n}" href="\${Button${b.n}URL}">\${Button${b.n}Label}</a>`),
    first.buttons.length > 0 && '    </div>',
    '  </div>',
    '</div>',
  )
}

/**
 * What the placement template runs (server-rendered markup: this is only the "DOM ready" hook).
 * seoBlock.js + widgetHelpers.js are registered by the widget itself.
 */
export function toScript(c: SeoBlockConfig) {
  return `$(function () {
  saffire.widgets.seoBlock('#${widgetIdOf(c)}', function ($el, data) {
    // DOM is ready: manipulate the block here.
    // data = { widgetId, hasData, options, items: [{ titleLine1, titleLine2, titleTag, paragraphs, button1, button2 }] }
  });
});`
}

export function codegen(c: SeoBlockConfig): WidgetCode {
  return { html: toHtml(c), script: toScript(c), data: toData(c) }
}
