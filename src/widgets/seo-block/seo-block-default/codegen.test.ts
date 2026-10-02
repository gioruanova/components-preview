import { describe, expect, it } from 'vitest'
import { codegen, isEmpty, toHtml } from './codegen'
import { defaults } from './schema'

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

  it('is empty when every content option is off', () => {
    const off = { ...defaults, showTitle: false, showDescription: false, button1Show: false, button2Show: false }
    expect(isEmpty(off)).toBe(true)
    expect(isEmpty(defaults)).toBe(false)
    expect(toHtml(off)).toContain('removed')
  })

  it('uses the widget id everywhere and outputs live data', () => {
    const files = codegen({ ...defaults, widgetId: 'promo', description: 'Hi' })
    expect(files.map((f) => f.id)).toEqual(['html', 'script', 'data'])
    expect(files[0].code).toContain('id="promo"')
    expect(files[1].code).toContain("const widgetName = 'promo'")
    expect(JSON.parse(files[2].code).Description).toBe('Hi')
  })
})
