import { linkAttributes } from '@/tooling/codegen'
import { previewLinkClick } from '@/tooling/previewLinks'
import { cardParts, visibleItems } from './codegen'
import type { CardsConfig } from './schema'

export function Preview({ config: c }: { config: CardsConfig }) {
  return (
    <div className={`${c.widgetId}-container custom-cards-container`}>
      <div id={c.widgetId}>
        {visibleItems(c).map((item, i) => {
          const { description, buttons, interactive } = cardParts(item, c)
          return (
            // div instead of the real <a>: nested links are invalid in React's DOM
            <div key={i} className={`card-widget-item${interactive ? '' : ' void-link'}`} tabIndex={interactive ? 0 : undefined}>
              <div className="image-container" style={item.Image ? { backgroundImage: `url('${item.Image}')` } : undefined} />
              <div className="overlay" />
              <div className="card-content">
                <div className="widget-title-wrapper">
                  <h3 className="widget-title">{item.Title}</h3>
                </div>
                {interactive && (
                  <div className="hover-content">
                    {description && <p className="widget-description">{description}</p>}
                    {buttons.length > 0 && (
                      <div className="cards-buttons-container">
                        {buttons.map((b) => (
                          <a key={b.n} href={b.url} className={`button button-${b.n}`} onClick={previewLinkClick(b.url)} {...linkAttributes(b.url, b.label)}>
                            {b.label}
                          </a>
                        ))}
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
