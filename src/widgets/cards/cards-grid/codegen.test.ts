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
  it('lets cards grow to fill the row with "fit space"', () => {
    const fixed = toCss([styles({ ...defaults, cardCount: 2 })])
    const fit = toCss([styles({ ...defaults, cardCount: 2, fitSpace: true })])
    expect(fixed).toContain('flex: 0 1 calc((100% - 1 * var(--cards-gap)) / 2);')
    expect(fixed).toContain('max-width: var(--card-width);')
    expect(fit).toContain('flex: 1 1 calc((100% - 1 * var(--cards-gap)) / 2);')
    expect(fit).not.toContain('max-width: var(--card-width);')
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
