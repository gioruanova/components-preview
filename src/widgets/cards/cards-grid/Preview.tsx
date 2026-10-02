import type { CSSProperties } from 'react'
import { cardParts, visibleItems } from './codegen'
import type { CardsConfig } from './schema'

export function Preview({ config: c }: { config: CardsConfig }) {
  const circle = c.shape === 'circle'
  const vars = {
    '--cols': c.cardsPerRow,
    '--cols-tablet': Math.min(c.cardsPerRow, 2),
    '--card-w': `${c.cardWidth}px`,
    '--card-h': `${c.cardHeight}px`,
    '--card-radius': circle ? '50%' : `${c.borderRadius}px`,
    '--card-border': c.borderWidth ? `${c.borderWidth}px solid ${c.borderColor}` : 'none',
    '--card-color': c.cardColor,
  } as CSSProperties

  return (
    <div className={`${c.widgetId}-container custom-cards-container`} style={vars}>
      <div id={c.widgetId} className={['cards-grid', circle && 'is-circle', c.titleBackground && 'has-title-bg'].filter(Boolean).join(' ')}>
        {visibleItems(c).map((item, i) => {
          const { description, more, buyNow, interactive } = cardParts(item, c)
          return (
            // div instead of the real <a>: nested links are invalid in React's DOM
            <div key={i} className={`card-widget-item${interactive ? '' : ' is-static'}`} tabIndex={interactive ? 0 : undefined}>
              <div className="image-container" style={{ backgroundImage: `url('${item.Image}')` }} />
              <div className="overlay" />
              <div className="card-content">
                <div className="widget-title-wrapper">
                  <h3 className="widget-title">{item.Title}</h3>
                </div>
                {interactive && (
                  <div className="hover-content">
                    {description && <p className="widget-description">{description}</p>}
                    {(more || buyNow) && (
                      <div className="cards-buttons-container">
                        {more && (
                          <a href={more} className="button" onClick={(e) => e.preventDefault()}>
                            More
                          </a>
                        )}
                        {buyNow && (
                          <a href={buyNow} className="button button-alt" onClick={(e) => e.preventDefault()}>
                            Buy now
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
