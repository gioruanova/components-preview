import { describe, expect, it } from 'vitest'
import { toCss } from '@/tooling/stylesheet'
import { cardParts, codegen, toHtml, visibleItems } from './codegen'
import { defaults } from './schema'
import { styles } from './styles'

describe('cards codegen', () => {
  it('only renders a button when it is shown and the card has its label and URL', () => {
    const [concert, family, tailgate] = visibleItems(defaults)
    expect(cardParts(concert, defaults).buttons).toEqual([
      { n: 1, label: 'More', url: concert.Button1URL },
      { n: 2, label: 'Buy now', url: concert.Button2URL },
    ])
    expect(cardParts(family, defaults).buttons.map((b) => b.n)).toEqual([1])
    expect(cardParts(tailgate, defaults).buttons.map((b) => b.n)).toEqual([2])
    expect(cardParts({ ...concert, Button1Label: '  ' }, defaults).buttons.map((b) => b.n)).toEqual([2])
    expect(cardParts(concert, { ...defaults, button2Show: false }).buttons.map((b) => b.n)).toEqual([1])
  })

  it('hides image and description with the widget switches', () => {
    const [concert] = defaults.items
    expect(cardParts(concert, defaults).image).toBe(concert.Image)
    expect(cardParts(concert, { ...defaults, showImage: false }).image).toBe('')
    expect(cardParts(concert, { ...defaults, showDescription: false }).description).toBe('')
  })

  it('pads and slices items to the configured count', () => {
    expect(visibleItems({ ...defaults, cardCount: 2 })).toHaveLength(2)
    const six = visibleItems({ ...defaults, cardCount: 6 })
    expect(six).toHaveLength(6)
    expect(six[5].Title).toBe('Card 6')
  })

  it('outputs the Saffire Card Block markup, script and data', () => {
    const html = toHtml(defaults)
    expect(html).toMatch(/<div id="cardBlock" class="cards-container">\s*<!--[^>]*-->\s*<div class="card-item">/)
    expect(html).toContain('<div class="image-container"><img class="card-image" src="${ImageURL}" alt="${ImageAlt}" /></div>')
    expect(html).toContain('<div class="overlay"></div>')
    expect(html).toContain('<h3 class="widget-title">${Title}</h3>')
    expect(toHtml({ ...defaults, titleTag: 'h2' })).toContain('<h2 class="widget-title">${Title}</h2>')
    expect(toHtml({ ...defaults, showOverlay: false, showImage: false, showDescription: false })).not.toMatch(/overlay|image-container|widget-description/)
    const { script, data } = codegen({ ...defaults, widgetId: 'events', cardCount: 3 })
    expect(script).toContain("saffire.widgets.cardBlock('#events', function ($el, data, hasData)")
    const d = data as { HasData: boolean; Items: { Source: string; ImageURL: string; Button1Label: string }[] }
    expect(d.HasData).toBe(true)
    expect(d.Items).toHaveLength(3)
    expect(d.Items[0]).toMatchObject({ Source: 'custom', Button1Label: 'More' })
  })
})

describe('cards styles', () => {
  it('card sizing: "Keep card size" = equal widths (flex 0 1) in a centered row, "Stretch to fill" = flex 1 1', () => {
    const fixed = toCss([styles({ ...defaults, cardMinWidth: 0, cardCount: 2 })])
    const stretch = toCss([styles({ ...defaults, cardCount: 2, cardSizing: 'stretch' })])
    expect(fixed).toMatch(/#cardBlock \{[^}]*justify-content: center;/)
    expect(fixed).toContain('flex: 0 1 calc((100% - 1 * var(--cards-gap)) / 2);')
    expect(stretch).toContain('flex: 1 1 calc((100% - 1 * var(--cards-gap)) / 2);')
    expect(stretch).not.toContain('@container')
  })

  it('"Keep card size" picks the cards per row from the grid width: k fit when width >= k * min + (k - 1) * gap', () => {
    const css = toCss([styles(defaults)]) // 4 per row, min 260px, gap 20px
    expect(css).toMatch(/#cardBlock \{[^}]*container-name: cards-grid;[^}]*container-type: inline-size;/)
    const desktop = css.slice(0, css.indexOf('@media'))
    expect(desktop).toMatch(/#cardBlock \.card-item \{[^}]*flex: 0 1 100%;/) // narrower than 2 cards
    expect(desktop).toMatch(/@container cards-grid \(min-width: 540px\) \{\s*#cardBlock \.card-item \{\s*flex: 0 1 calc\(\(100% - 1 \* var\(--cards-gap\)\) \/ 2\);/)
    expect(desktop).toContain('@container cards-grid (min-width: 820px)')
    expect(desktop).toMatch(/@container cards-grid \(min-width: 1100px\) \{\s*#cardBlock \.card-item \{\s*flex: 0 1 calc\(\(100% - 3 \* var\(--cards-gap\)\) \/ 4\);/)
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
    expect(css).toMatch(/\.widget-title \{[^}]*background-color: var\(--card-color\);/)
    expect(toCss([styles({ ...defaults, titleBackground: false })])).toMatch(/\.widget-title \{[^}]*background-color: transparent;/)
  })

  it('supports max width or 100% for the grid', () => {
    expect(toCss([styles(defaults)])).toContain('max-width: var(--cards-max-width);')
    const full = toCss([styles({ ...defaults, widthMode: 'full' })])
    expect(full).not.toContain('--cards-max-width')
    expect(full).toMatch(/#cardBlock \{[^}]*max-width: none;/)
  })

  it('clamps text only when enabled', () => {
    expect(toCss([styles(defaults)])).toMatch(/\.widget-title \{[^}]*-webkit-line-clamp: 2;/)
    const off = toCss([styles({ ...defaults, titleFont: { ...defaults.titleFont, clamp: false } })])
    const desktopOnly = off.slice(0, off.indexOf('@media')) // tablet/mobile keep their own (clamped) overrides
    expect(desktopOnly).not.toMatch(/\.widget-title \{[^}]*-webkit-line-clamp/)
  })

  it('keeps every part visible on every viewport; hover zooms the image and darkens the overlay', () => {
    const css = toCss([styles(defaults)])
    expect(css).not.toContain('display: none')
    expect(css).toMatch(/\.card-item:hover \.card-image,[^{]*\{[^}]*transform: scale\(1\.15\);/)
    expect(css).toMatch(/:focus-within \.overlay \{[^}]*opacity: 0\.7;/)
  })
})
