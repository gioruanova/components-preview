import { describe, expect, it } from 'vitest'
import { toCss } from '@/tooling/stylesheet'
import { cardParts, codegen, toHtml, visibleItems } from './codegen'
import { defaults } from './schema'
import { styles } from './styles'

describe('cards codegen', () => {
  it('only renders a button when the card has its URL and the button has a label', () => {
    const c = { ...defaults, button2Show: true, button1Label: 'Details' }
    const [concert, family, tailgate] = visibleItems(c)
    expect(cardParts(concert, c).buttons).toEqual([
      { n: 1, label: 'Details', url: concert.Button1URL },
      { n: 2, label: 'Buy now', url: concert.Button2URL },
    ])
    expect(cardParts(family, c).buttons.map((b) => b.n)).toEqual([1])
    expect(cardParts(tailgate, c).buttons.map((b) => b.n)).toEqual([2])
    expect(cardParts(concert, { ...c, button1Label: '  ' }).buttons.map((b) => b.n)).toEqual([2])
  })

  it('marks cards with no description and no buttons as non-interactive', () => {
    const tailgate = defaults.items[2]
    expect(cardParts(tailgate, defaults).interactive).toBe(false)
    expect(cardParts(tailgate, { ...defaults, button2Show: true }).interactive).toBe(true)
  })

  it('pads and slices items to the configured count', () => {
    expect(visibleItems({ ...defaults, cardCount: 2 })).toHaveLength(2)
    const six = visibleItems({ ...defaults, cardCount: 6 })
    expect(six).toHaveLength(6)
    expect(six[5].Title).toBe('Card 6')
  })

  it('outputs live HTML and data', () => {
    expect(toHtml({ ...defaults, showDescription: false })).not.toContain('widget-description')
    const { script, data } = codegen({ ...defaults, widgetId: 'events', cardCount: 3 })
    expect(script).toContain("const widgetName = 'events'")
    expect((data as { Items: unknown[] }).Items).toHaveLength(3)
  })
})

describe('cards styles', () => {
  it('card sizing: "Keep card size" = equal widths (flex 0 1) in a centered row, "Stretch to fill" = flex 1 1', () => {
    const fixed = toCss([styles({ ...defaults, cardMinWidth: 0, cardCount: 2 })])
    const stretch = toCss([styles({ ...defaults, cardCount: 2, cardSizing: 'stretch' })])
    expect(fixed).toMatch(/#customCards \{[^}]*justify-content: center;/)
    expect(fixed).toContain('flex: 0 1 calc((100% - 1 * var(--cards-gap)) / 2);')
    expect(stretch).toContain('flex: 1 1 calc((100% - 1 * var(--cards-gap)) / 2);')
    expect(stretch).not.toContain('@container')
  })

  it('"Keep card size" picks the cards per row from the grid width: k fit when width >= k * min + (k - 1) * gap', () => {
    const css = toCss([styles(defaults)]) // 4 per row, min 260px, gap 20px
    expect(css).toMatch(/#customCards \{[^}]*container-name: cards-grid;[^}]*container-type: inline-size;/)
    const desktop = css.slice(0, css.indexOf('@media'))
    expect(desktop).toMatch(/#customCards \.card-widget-item \{[^}]*flex: 0 1 100%;/) // narrower than 2 cards
    expect(desktop).toMatch(/@container cards-grid \(min-width: 540px\) \{\s*#customCards \.card-widget-item \{\s*flex: 0 1 calc\(\(100% - 1 \* var\(--cards-gap\)\) \/ 2\);/)
    expect(desktop).toContain('@container cards-grid (min-width: 820px)')
    expect(desktop).toMatch(/@container cards-grid \(min-width: 1100px\) \{\s*#customCards \.card-widget-item \{\s*flex: 0 1 calc\(\(100% - 3 \* var\(--cards-gap\)\) \/ 4\);/)
    expect(desktop).not.toContain('min-width: 1380px') // never more than cards per row
    // tablet (2 per row): resets the base and only adds its own step; mobile (1 per row): no steps
    const tablet = css.slice(css.indexOf('@media (max-width: 768px)'), css.indexOf('@media (max-width: 480px)'))
    expect(tablet).toContain('flex: 0 1 100%;')
    expect(tablet.match(/@container/g)).toHaveLength(1)
    const mobile = css.slice(css.indexOf('@media (max-width: 480px)'))
    expect(mobile).not.toContain('@container')
  })

  it('"Keep card size" without a min width needs no container queries', () => {
    const css = toCss([styles({ ...defaults, cardMinWidth: 0, 'cardMinWidth@tablet': 0 } as typeof defaults)])
    expect(css).not.toContain('@container')
    expect(css).not.toContain('container-name')
    expect(css).toContain('flex: 0 1 calc((100% - 3 * var(--cards-gap)) / 4);')
  })

  it('"Limit card width" controls max-width independently of sizing', () => {
    expect(toCss([styles({ ...defaults, cardSizing: 'stretch' })])).toContain('max-width: var(--card-width);') // stretch, but capped
    expect(toCss([styles({ ...defaults, limitWidth: false })])).not.toContain('max-width: var(--card-width);')
  })

  it('both options can change per viewport', () => {
    const css = toCss([styles({ ...defaults, 'cardSizing@mobile': 'stretch', 'limitWidth@mobile': false } as typeof defaults)])
    const mobile = css.slice(css.indexOf('@media (max-width: 480px)'))
    expect(mobile).toContain('flex: 1 1 100%;')
    expect(mobile).toContain('max-width: none;')
    const back = toCss([styles({ ...defaults, cardSizing: 'stretch', 'cardSizing@tablet': 'fixed' } as typeof defaults)])
    expect(back.slice(0, back.indexOf('@media'))).not.toContain('@container')
    const tablet = back.slice(back.indexOf('@media (max-width: 768px)'), back.indexOf('@media (max-width: 480px)'))
    expect(tablet).toContain('flex: 0 1 100%;')
    expect(tablet).toContain('@container cards-grid (min-width: 540px)')
  })

  it('positions content and uses the card color for the title background', () => {
    const css = toCss([styles({ ...defaults, contentVertical: 'bottom', contentHorizontal: 'left' })])
    expect(css).toMatch(/\.card-content \{[^}]*justify-content: flex-end;/)
    expect(css).toMatch(/\.card-content \{[^}]*align-items: flex-start;/)
    expect(css).toMatch(/\.widget-title-wrapper \{[^}]*background-color: var\(--card-color\);/)
    expect(toCss([styles({ ...defaults, titleBackground: false })])).toMatch(/\.widget-title-wrapper \{[^}]*background-color: transparent;/)
  })

  it('supports max width or 100% for the grid', () => {
    expect(toCss([styles(defaults)])).toContain('max-width: var(--cards-max-width);')
    const full = toCss([styles({ ...defaults, widthMode: 'full' })])
    expect(full).not.toContain('--cards-max-width')
    expect(full).toMatch(/#customCards \{[^}]*max-width: none;/)
  })

  it('clamps text only when enabled', () => {
    expect(toCss([styles(defaults)])).toMatch(/\.widget-title \{[^}]*-webkit-line-clamp: 2;/)
    const off = toCss([styles({ ...defaults, titleFont: { ...defaults.titleFont, clamp: false } })])
    const desktopOnly = off.slice(0, off.indexOf('@media')) // tablet/mobile keep their own (clamped) overrides
    expect(desktopOnly).not.toMatch(/\.widget-title \{[^}]*-webkit-line-clamp/)
  })

  it('keeps the hover reveal on mobile', () => {
    const css = toCss([styles(defaults)])
    const mobile = css.slice(css.indexOf('@media (max-width: 480px)'))
    expect(mobile).not.toContain('display: none')
  })
})
