import { describe, expect, it } from 'vitest'
import { cardParts, codegen, toHtml, visibleItems } from './codegen'
import { defaults } from './schema'

describe('cards codegen', () => {
  it('only renders a button when the card has the matching URL', () => {
    const [concert, family, tailgate] = visibleItems({ ...defaults, showBuyNowButton: true })
    const c = { ...defaults, showBuyNowButton: true }
    expect(cardParts(concert, c)).toMatchObject({ more: concert.URL, buyNow: concert.PurchaseURL })
    expect(cardParts(family, c).buyNow).toBe('')
    expect(cardParts(tailgate, c).more).toBe('')
  })

  it('marks cards with no description and no buttons as non-interactive', () => {
    const tailgate = defaults.items[2]
    expect(cardParts(tailgate, defaults).interactive).toBe(false)
    expect(cardParts(tailgate, { ...defaults, showBuyNowButton: true }).interactive).toBe(true)
  })

  it('pads and slices items to the configured count', () => {
    expect(visibleItems({ ...defaults, cardCount: 2 })).toHaveLength(2)
    const six = visibleItems({ ...defaults, cardCount: 6 })
    expect(six).toHaveLength(6)
    expect(six[5].Title).toBe('Card 6')
  })

  it('outputs live HTML and data', () => {
    expect(toHtml({ ...defaults, showDescription: false })).not.toContain('widget-description')
    const [, script, data] = codegen({ ...defaults, widgetId: 'events', cardCount: 3 })
    expect(script.code).toContain("const widgetName = 'events'")
    expect(JSON.parse(data.code).Items).toHaveLength(3)
  })
})
