import { describe, expect, it } from 'vitest'
import { codegen, isEmpty, renderedItems, titleTagOf, toData, toHtml, widgetIdOf, FALLBACK_WIDGET_ID } from './codegen'
import { currentOrigin, isExternalUrl } from '@/tooling/codegen'
import { toCss, toScss } from '@/tooling/stylesheet'
import { defaults, newItem } from './schema'
import { styles } from './styles'

const two = { ...defaults, maxItems: 2, itemCount: 2 }

describe('seo-block items and rows', () => {
  it('shows the selected rows in order, up to Max Items', () => {
    expect(renderedItems({ ...defaults, maxItems: 1, itemCount: 2 })).toHaveLength(1)
    expect(renderedItems(two)).toHaveLength(2)
    expect(renderedItems({ ...two, items: [newItem(0)] })).toHaveLength(2) // missing rows fall back to placeholders
  })

  it('is empty (renders nothing) when no row has a selected item', () => {
    const empty = { ...defaults, itemCount: 0 }
    expect(isEmpty(empty)).toBe(true)
    expect(isEmpty(defaults)).toBe(false)
    expect(toHtml(empty)).toContain('seoBlock-no-data')
    expect(toData(empty)).toMatchObject({ hasData: false, items: [] })
  })

  it('repeats the item parts per row inside .seoBlock-container > #{WidgetId} (no item wrapper)', () => {
    const html = toHtml(two)
    expect(html).toMatch(/<div class="seoBlock-container">\s*<div id="seoBlock">/)
    expect(html).toContain('repeat once per row with a selected item (2)')
    expect(html).not.toContain('seo-block-item')
  })
})

describe('seo-block title', () => {
  it('uses spans and aria-label only when both lines render', () => {
    const html = toHtml(defaults)
    expect(html).toContain('<h1 class="seo-title" aria-label="${TitleLine1} ${TitleLine2}">')
    expect(html).toContain('<span>${TitleLine2}</span>')
  })

  it('puts a single line straight into the heading, without span or aria-label', () => {
    for (const c of [
      { ...defaults, showTitleLine2: false },
      { ...defaults, titleLine2Enabled: false },
      { ...defaults, items: [{ ...newItem(0), TitleLine2: '' }] },
    ]) {
      const html = toHtml(c)
      expect(html).toContain('<h1 class="seo-title">${TitleText}</h1>')
      expect(html).not.toContain('aria-label')
      expect(html).not.toContain('<span>${TitleLine')
    }
  })

  it('omits the heading when no title line renders', () => {
    expect(toHtml({ ...defaults, showTitleLine1: false, showTitleLine2: false })).not.toContain('seo-title')
  })

  it('uses the Title Heading for the first item and one level lower after it', () => {
    expect(titleTagOf({ ...defaults, headingLevel: 'h1' }, 0)).toBe('h1')
    expect(titleTagOf({ ...defaults, headingLevel: 'h1' }, 1)).toBe('h2')
    expect(titleTagOf({ ...defaults, headingLevel: 'h3' }, 2)).toBe('h4')
    expect(titleTagOf({ ...defaults, headingLevel: 'h6' }, 1)).toBe('h6')
    expect(renderedItems({ ...two, headingLevel: 'h2' }).map((i) => i.titleTag)).toEqual(['h2', 'h3'])
  })
})

describe('seo-block description and divider', () => {
  it('renders one paragraph per line, up to the Paragraphs Limit', () => {
    const item = { ...newItem(0), Description: 'One\n\nTwo\nThree' }
    expect(renderedItems({ ...defaults, items: [item] })[0].paragraphs).toEqual(['One', 'Two', 'Three'])
    expect(renderedItems({ ...defaults, items: [item], paragraphLimit: 2 })[0].paragraphs).toEqual(['One', 'Two'])
  })

  it('hides the description when the module disables it or the placement hides it', () => {
    expect(toHtml({ ...defaults, descriptionEnabled: false })).not.toContain('seo-description')
    expect(toHtml({ ...defaults, showDescription: false })).not.toContain('seo-description')
  })

  it('renders the divider from the placement option only', () => {
    expect(toHtml(defaults)).toContain('<span class="seo-divider"></span>')
    expect(toHtml({ ...defaults, showDivider: false })).not.toContain('seo-divider')
  })
})

describe('seo-block buttons', () => {
  it('respects the module Number of Buttons and the placement toggles', () => {
    expect(renderedItems({ ...defaults, buttonCount: '1' })[0].buttons.map((b) => b.n)).toEqual([1])
    expect(renderedItems({ ...defaults, buttonCount: '0' })[0].buttons).toHaveLength(0)
    expect(renderedItems({ ...defaults, button2Show: false })[0].buttons.map((b) => b.n)).toEqual([1])
    expect(toHtml({ ...defaults, buttonCount: '0' })).not.toContain('buttons-container')
  })

  it('renders a button only with a label and a URL', () => {
    const item = { ...newItem(0), Button1URL: '', Button2Label: '' }
    expect(renderedItems({ ...defaults, items: [item] })[0].buttons).toHaveLength(0)
  })

  it('marks each button with its own class', () => {
    expect(toHtml(defaults)).toContain('class="button button-1"')
    expect(toHtml(defaults)).toContain('class="button button-2"')
  })
})

describe('seo-block widget id, script and data', () => {
  it('falls back to seoBlock-{placement id} when the Widget Id is empty or invalid', () => {
    expect(widgetIdOf({ ...defaults, widgetId: 'hero' })).toBe('hero')
    expect(widgetIdOf({ ...defaults, widgetId: '' })).toBe(FALLBACK_WIDGET_ID)
    expect(widgetIdOf({ ...defaults, widgetId: '1-bad id' })).toBe(FALLBACK_WIDGET_ID)
  })

  it('uses the widget id in the markup, the script and the data', () => {
    const { html, script, data } = codegen({ ...defaults, widgetId: 'hero' })
    expect(html).toContain('id="hero"')
    expect(script).toContain("saffire.widgets.seoBlock('#hero', function ($el, data)")
    expect(script).not.toContain('console.log')
    expect(data).toMatchObject({ widgetId: 'hero', hasData: true, options: { TitleHeading: 'h1', ShowDivider: 'True' } })
  })

  it('leaves out disabled module fields from the data', () => {
    const data = toData({ ...defaults, titleLine2Enabled: false, buttonCount: '1' })
    expect(data.items[0]).toMatchObject({ titleLine2: null, button2: { label: null, url: '' } })
  })
})

describe('external links', () => {
  it('are detected against the current domain automatically', () => {
    const base = currentOrigin()
    expect(isExternalUrl('/learn-more')).toBe(false)
    expect(isExternalUrl(`${base}/tickets`)).toBe(false)
    expect(isExternalUrl('https://tickets.partner.com/join')).toBe(true)
    expect(isExternalUrl('https://example.org/x', 'https://example.org')).toBe(false)
  })
})

describe('custom buttons', () => {
  it('adds per-button overrides only when enabled', () => {
    expect(toCss([styles(defaults)])).not.toContain('.button.button-1')
    const css = toCss([
      styles({ ...defaults, button2Style: { ...defaults.button2Style, custom: true, radius: 4, shadow: 'md', hoverBackground: '#123456' } }),
    ])
    expect(css).not.toContain('.button.button-1')
    expect(css).toMatch(/#seoBlock \.button\.button-2 \{[^}]*border-radius: var\(--seo-button-2-radius\);[^}]*box-shadow: 0 4px 12px/)
    expect(css).toContain('--seo-button-2-hover-bg: #123456;')
  })
})

describe('seo-block styles', () => {
  it('follows the chosen alignment', () => {
    const css = toCss([styles({ ...defaults, alignment: 'right' })])
    expect(css).toContain('text-align: right;')
    expect(css).toContain('justify-content: flex-end;')
  })

  it('keeps mobile buttons aligned instead of stretched', () => {
    const css = toCss([styles({ ...defaults, alignment: 'right' })])
    const mobile = css.slice(css.indexOf('@media (max-width: 480px)'))
    expect(mobile).toMatch(/\.buttons-container \{[^}]*align-items: flex-end;/)
    expect(mobile).not.toContain('width: 100%')
  })

  it('clamps each title line when enabled', () => {
    const css = toCss([styles({ ...defaults, titleFont: { ...defaults.titleFont, clamp: true, lines: 1 } })])
    expect(css).toMatch(/\.seo-title > span:first-child \{[^}]*-webkit-line-clamp: 1;/)
  })

  it('styles one paragraph per <p> and the divider', () => {
    const css = toCss([styles(defaults)])
    expect(css).toContain('#seoBlock .seo-description p {')
    expect(css).toContain('#seoBlock .seo-divider {')
  })

  it('exposes typography and colors as variables', () => {
    const scss = toScss([styles({ ...defaults, titleFont: { ...defaults.titleFont, family: 'Inter', size: 40 } })])
    expect(scss).toContain("$seo-title-font-family: 'Inter', sans-serif;")
    expect(scss).toContain('$seo-title-font-size: 40px;')
    expect(scss).toContain('font-size: $seo-title-font-size;')
    expect(scss).toContain('$seo-bg-color: #eee;') // short hex
  })
})
