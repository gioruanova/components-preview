import { linkAttributes } from '@/tooling/codegen'
import { previewLinkClick } from '@/tooling/previewLinks'
import { cardParts, visibleItems } from './codegen'
import type { CardsConfig } from './schema'

export function Preview({ config: c }: { config: CardsConfig }) {
  const Title = c.titleTag
  return (
    <div id={c.widgetId} className="cards-container">
      {visibleItems(c).map((item, i) => {
        const { image, description, buttons } = cardParts(item, c)
        return (
          <div key={i} className="card-item" tabIndex={0}>
            {image && (
              <div className="image-container">
                <img className="card-image" src={image} alt={item.Title} />
              </div>
            )}
            {c.showOverlay && <div className="overlay" />}
            <div className="card-content">
              <Title className="widget-title">{item.Title}</Title>
              {description && <p className="widget-description">{description}</p>}
              {buttons.length > 0 && (
                <div className="buttons-container">
                  {buttons.map((b) => (
                    <a key={b.n} href={b.url} className={`button button-${b.n}`} onClick={previewLinkClick(b.url)} {...linkAttributes(b.url, `${item.Title} - ${b.label}`)}>
                      {b.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
