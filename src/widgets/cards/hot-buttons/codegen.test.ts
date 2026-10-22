import { describe, expect, it } from 'vitest'
import { toCss, toScss } from '@/tooling/stylesheet'
import { codegen, hasLink, iconOf, isEmpty, renderedItems, toHtml, visibleItems } from './codegen'
import { defaults, type HotButtonsConfig } from './schema'
import { styles } from './styles'

const withItems = (items: HotButtonsConfig['items']): HotButtonsConfig => ({ ...defaults, items, buttonCount: items.length })

describe('hot buttons codegen', () => {
  it('renders a button when it has a label; without a URL it is not clickable', () => {
    const c = withItems([
      { Title: 'Tickets', URL: 'https://example.com/t', Icon: '' },
      { Title: 'No link', URL: '  ', Icon: '' },
      { Title: ' ', URL: 'https://example.com/x', Icon: '' },
    ])
    expect(renderedItems(c).map((i) => i.Title)).toEqual(['Tickets', 'No link'])
    expect(renderedItems(c).map(hasLink)).toEqual([true, false])
  })

  it('renders buttons added with "Number of buttons" right away', () => {
    expect(renderedItems({ ...defaults, buttonCount: 7 })).toHaveLength(7)
  })

  it('is removed when no button has a label', () => {
    expect(isEmpty(defaults)).toBe(false)
    const empty = withItems([{ Title: ' ', URL: 'https://example.com', Icon: '' }])
    expect(isEmpty(empty)).toBe(true)
    expect(toHtml(empty)).toContain('hotButtons-no-data')
  })

  it('shows the icon (inside .icon-wrapper) only when "Show icons" is on and the item has one', () => {
    const [first] = defaults.items
    expect(iconOf(first, defaults)).toBe('icon:ticket')
    expect(iconOf(first, { ...defaults, showIcons: false })).toBe('')
    expect(iconOf({ ...first, Icon: '' }, defaults)).toBe('')
    expect(toHtml(defaults)).toContain('<div class="icon-wrapper"><img class="hot-button-icon"')
    expect(toHtml({ ...defaults, showIcons: false })).not.toContain('icon-wrapper')
  })

  it('uses the Saffire markup: the whole button is the link', () => {
    expect(toHtml(defaults)).toMatch(/<div id="hotButtons" class="hot-buttons">[\s\S]*<a class="hot-button" href="\$\{URL\}">\s*<div class="card-content">[\s\S]*<span class="widget-title">\$\{Title\}<\/span>/)
    expect(codegen(defaults).script).toContain("saffire.widgets.hotButtons('#hotButtons', function ($el, data, hasData)")
  })

  it('exports the Saffire data shape with icon asset paths', () => {
    const { data, script } = codegen({ ...defaults, widgetId: 'shortcuts', buttonCount: 6 })
    const d = data as { HasData: boolean; Items: { Source: string; IconURL: string; IconAlt: string; URL: string }[] }
    expect(d.HasData).toBe(true)
    expect(d.Items).toHaveLength(6)
    expect(d.Items[0]).toMatchObject({ Source: 'custom', IconURL: '/assets/icons/ticket.svg', IconAlt: '' })
    expect(d.Items[5].URL).toBe('https://example.com/button-6') // added buttons get a placeholder URL
    expect(script).toContain("'#shortcuts'")
    expect(visibleItems({ ...defaults, buttonCount: 2 })).toHaveLength(2)
  })
})

describe('hot buttons styles', () => {
  it('icon position maps to flex-direction, alignment to the matching axis', () => {
    // declarations of the desktop `.card-content` rule
    const item = (c: Partial<HotButtonsConfig>) => toCss([styles({ ...defaults, ...c })]).match(/#hotButtons \.hot-button \.card-content \{([^}]*)\}/)![1]
    const left = item({ iconPosition: 'left' })
    expect(left).toContain('flex-direction: row;')
    expect(left).toContain('justify-content: center;')
    expect(left).toContain('align-items: center;')
    const right = item({ iconPosition: 'right', contentAlign: 'left' })
    expect(right).toContain('flex-direction: row-reverse;')
    expect(right).toContain('justify-content: flex-start;')
    const top = item({ iconPosition: 'top', contentAlign: 'right' })
    expect(top).toContain('flex-direction: column;')
    expect(top).toContain('align-items: flex-end;')
    expect(top).toContain('justify-content: center;')
    expect(item({ iconPosition: 'bottom' })).toContain('flex-direction: column-reverse;')
  })

  it('icon position, sizes and alignment can change per viewport', () => {
    const css = toCss([styles({ ...defaults, 'iconPosition@mobile': 'top', 'iconSize@tablet': 32, 'contentAlign@mobile': 'left' } as HotButtonsConfig)])
    const tablet = css.slice(css.indexOf('@media (max-width: 768px)'), css.indexOf('@media (max-width: 480px)'))
    const mobile = css.slice(css.indexOf('@media (max-width: 480px)'))
    expect(css).toContain('--hot-button-icon-size-tablet: 32px;')
    expect(tablet).toMatch(/\.icon-wrapper \{[^}]*width: var\(--hot-button-icon-size-tablet\);/)
    expect(mobile).toMatch(/\.card-content \{[^}]*flex-direction: column;/)
    expect(mobile).toMatch(/\.card-content \{[^}]*align-items: flex-start;/)
  })

  it('uses the shared row model: keep = equal widths + container queries, stretch = flex 1 1', () => {
    const keep = toCss([styles(defaults)])
    expect(keep).toMatch(/#hotButtons \{[^}]*justify-content: center;/)
    expect(keep).toContain('@container hot-buttons (min-width: 420px)') // 2 × 200 + 20
    const stretch = toCss([styles({ ...defaults, buttonSizing: 'stretch' })])
    expect(stretch).toContain('flex: 1 1 calc((100% - 3 * var(--hot-buttons-gap)) / 4);')
    expect(stretch).not.toContain('@container')
  })

  it('hover changes the background and the title color; shadow and border are optional', () => {
    const css = toCss([styles(defaults)])
    expect(css).toMatch(/\.hot-button:not\(\.void-link\):hover,\s*#hotButtons \.hot-button:not\(\.void-link\):focus-visible \{[^}]*background-color: var\(--hot-button-hover-color\);/)
    expect(css).toMatch(/:focus-visible \.widget-title \{[^}]*color: var\(--hot-button-hover-text-color\);/)
    expect(css).toContain('box-shadow')
    expect(toCss([styles({ ...defaults, shadow: false })])).not.toContain('box-shadow')
    expect(toCss([styles({ ...defaults, borderWidth: 2 })])).toContain('border: var(--hot-button-border-width) solid var(--hot-button-border-color);')
  })

  it('outputs SCSS variables', () => {
    expect(toScss([styles(defaults)])).toContain('$hot-button-color: #0079c2;')
  })
})
