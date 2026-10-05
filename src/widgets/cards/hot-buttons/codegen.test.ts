import { describe, expect, it } from 'vitest'
import { toCss, toScss } from '@/tooling/stylesheet'
import { codegen, iconOf, isEmpty, renderedItems, toHtml, visibleItems } from './codegen'
import { defaults, type HotButtonsConfig } from './schema'
import { styles } from './styles'

const withItems = (items: HotButtonsConfig['items']): HotButtonsConfig => ({ ...defaults, items, buttonCount: items.length })

describe('hot buttons codegen', () => {
  it('renders a button only when it has both a title and a URL', () => {
    const c = withItems([
      { Title: 'Tickets', URL: 'https://example.com/t', Icon: '' },
      { Title: 'No link', URL: '  ', Icon: '' },
      { Title: ' ', URL: 'https://example.com/x', Icon: '' },
    ])
    expect(renderedItems(c).map((i) => i.Title)).toEqual(['Tickets'])
  })

  it('renders buttons added with "Number of buttons" right away', () => {
    expect(renderedItems({ ...defaults, buttonCount: 7 })).toHaveLength(7)
  })

  it('is removed when no button can render', () => {
    expect(isEmpty(defaults)).toBe(false)
    const empty = withItems([{ Title: 'A', URL: '', Icon: '' }])
    expect(isEmpty(empty)).toBe(true)
    expect(toHtml(empty)).toContain('removed from the page')
  })

  it('shows the icon only when "Show icons" is on and the item has one', () => {
    const [first] = defaults.items
    expect(iconOf(first, defaults)).toBe('icon:ticket')
    expect(iconOf(first, { ...defaults, showIcons: false })).toBe('')
    expect(iconOf({ ...first, Icon: '' }, defaults)).toBe('')
    expect(toHtml(defaults)).toContain('class="hot-button-icon"')
    expect(toHtml({ ...defaults, showIcons: false })).not.toContain('hot-button-icon')
  })

  it('makes the whole button the link', () => {
    expect(toHtml(defaults)).toMatch(/<a href="\$\{URL\}" class="hot-button-item">[\s\S]*hot-button-title[\s\S]*<\/a>/)
    expect(codegen(defaults).script).toContain('updateLinksAttributes(URL, Title)')
  })

  it('exports icon asset paths in the data and pads items to the count', () => {
    const { data, script } = codegen({ ...defaults, widgetId: 'shortcuts', buttonCount: 6 })
    const items = (data as { Items: { Icon: string | null; URL: string | null }[] }).Items
    expect(items).toHaveLength(6)
    expect(items[0].Icon).toBe('/assets/icons/ticket.svg')
    expect(items[5].URL).toBe('https://example.com/button-6') // added buttons get a placeholder URL
    expect(script).toContain("const widgetName = 'shortcuts'")
    expect(visibleItems({ ...defaults, buttonCount: 2 })).toHaveLength(2)
  })
})

describe('hot buttons styles', () => {
  it('icon position maps to flex-direction, alignment to the matching axis', () => {
    // declarations of the desktop `.hot-button-item` rule
    const item = (c: Partial<HotButtonsConfig>) => toCss([styles({ ...defaults, ...c })]).match(/#customHotButtons \.hot-button-item \{([^}]*)\}/)![1]
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
    expect(tablet).toMatch(/\.hot-button-icon \{[^}]*width: var\(--hot-button-icon-size-tablet\);/)
    expect(mobile).toMatch(/\.hot-button-item \{[^}]*flex-direction: column;/)
    expect(mobile).toMatch(/\.hot-button-item \{[^}]*align-items: flex-start;/)
  })

  it('uses the shared row model: keep = equal widths + container queries, stretch = flex 1 1', () => {
    const keep = toCss([styles(defaults)])
    expect(keep).toMatch(/#customHotButtons \{[^}]*justify-content: center;/)
    expect(keep).toContain('@container hot-buttons (min-width: 420px)') // 2 × 200 + 20
    const stretch = toCss([styles({ ...defaults, buttonSizing: 'stretch' })])
    expect(stretch).toContain('flex: 1 1 calc((100% - 3 * var(--hot-buttons-gap)) / 4);')
    expect(stretch).not.toContain('@container')
  })

  it('hover changes the background and the title color; shadow and border are optional', () => {
    const css = toCss([styles(defaults)])
    expect(css).toMatch(/\.hot-button-item:hover,\s*#customHotButtons \.hot-button-item:focus-visible \{[^}]*background-color: var\(--hot-button-hover-color\);/)
    expect(css).toMatch(/:focus-visible \.hot-button-title \{[^}]*color: var\(--hot-button-hover-text-color\);/)
    expect(css).toContain('box-shadow')
    expect(toCss([styles({ ...defaults, shadow: false })])).not.toContain('box-shadow')
    expect(toCss([styles({ ...defaults, borderWidth: 2 })])).toContain('border: var(--hot-button-border-width) solid var(--hot-button-border-color);')
  })

  it('outputs SCSS variables', () => {
    expect(toScss([styles(defaults)])).toContain('$hot-button-color: #0079c2;')
  })
})
