import { previewUrl, useUploads } from '@/tooling/assets'
import { linkAttributes } from '@/tooling/codegen'
import { previewLinkClick } from '@/tooling/previewLinks'
import { hasLink, iconOf, renderedItems } from './codegen'
import type { HotButtonsConfig } from './schema'

export function Preview({ config: c }: { config: HotButtonsConfig }) {
  useUploads() // re-render when an uploaded icon changes
  return (
    <div id={c.widgetId} className="hot-buttons">
      {renderedItems(c).map((item, i) => {
        const icon = previewUrl(iconOf(item, c))
        const link = hasLink(item)
        return (
          <a
            key={i}
            className={link ? 'hot-button' : 'hot-button void-link'}
            {...(link ? { href: item.URL, onClick: previewLinkClick(item.URL), ...linkAttributes(item.URL, item.Title) } : { 'aria-disabled': true })}
          >
            <div className="card-content">
              {icon && (
                <div className="icon-wrapper">
                  <img className="hot-button-icon" src={icon} alt={item.Title} />
                </div>
              )}
              <span className="widget-title">{item.Title}</span>
            </div>
          </a>
        )
      })}
    </div>
  )
}
