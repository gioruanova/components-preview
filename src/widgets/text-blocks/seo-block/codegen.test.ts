import { describe, expect, it } from 'vitest'
import { codegen, isEmpty, toHtml } from './codegen'
import { currentOrigin, isExternalUrl } from '@/tooling/codegen'
import { toCss, toScss } from '@/tooling/stylesheet'
import { defaults } from './schema'
import { styles } from './styles'

describe('seo-block codegen', () => {
  it('renders both title lines inside the chosen heading', () => {
    const html = toHtml({ ...defaults, headingLevel: 'h3' })
    expect(html).toContain('<h3 class="seo-title">')
    expect(html).toContain('${TitleLine1}')
    expect(html).toContain('seo-title-line2')
    expect(html).toContain('</h3>')
  })

  it('omits the buttons container when both buttons are hidden', () => {
    const html = toHtml({ ...defaults, button1Show: false, button2Show: false })
    expect(html).not.toContain('buttons-container')
  })

  it('does not render a button without a URL', () => {
    const html = toHtml({ ...defaults, button1Url: '' })
    expect(html).not.toContain('${Button1URL}')
    expect(html).toContain('${Button2URL}')
    expect(toHtml({ ...defaults, button1Url: '', button2Url: ' ' })).not.toContain('buttons-container')
    expect(isEmpty({ ...defaults, showTitle: false, showDescription: false, button1Url: '', button2Url: '' })).toBe(true)
  })

  it('is empty when every content option is off', () => {
    const off = { ...defaults, showTitle: false, showDescription: false, button1Show: false, button2Show: false }
    expect(isEmpty(off)).toBe(true)
    expect(isEmpty(defaults)).toBe(false)
    expect(toHtml(off)).toContain('removed')
  })

  it('uses the widget id everywhere and outputs live data', () => {
    const { html, script, data } = codegen({ ...defaults, widgetId: 'promo', description: 'Hi' })
    expect(html).toContain('id="promo"')
    expect(script).toContain("const widgetName = 'promo'")
    expect(data).toMatchObject({ Description: 'Hi' })
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
    expect(css).toMatch(/#customSeoBlock \.button\.button-2 \{[^}]*border-radius: var\(--seo-button-2-radius\);[^}]*box-shadow: 0 4px 12px/)
    expect(css).toContain('--seo-button-2-hover-bg: #123456;')
    expect(css).toMatch(/\.button\.button-2:hover, #customSeoBlock \.button\.button-2:focus-visible \{[^}]*background: var\(--seo-button-2-hover-bg\);/)
  })

  it('marks each button with its own class', () => {
    expect(toHtml(defaults)).toContain('class="button button-1"')
    expect(toHtml(defaults)).toContain('class="button button-2"')
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
    expect(css).toMatch(/\.seo-title-line1 \{[^}]*-webkit-line-clamp: 1;/)
  })

  it('exposes typography and colors as variables', () => {
    const scss = toScss([styles({ ...defaults, titleFont: { ...defaults.titleFont, family: 'Inter', size: 40 } })])
    expect(scss).toContain("$seo-title-font-family: 'Inter', sans-serif;")
    expect(scss).toContain('$seo-title-font-size: 40px;')
    expect(scss).toContain('font-size: $seo-title-font-size;')
    expect(scss).toContain('$seo-bg-color: #eeeeee;')
  })
})
