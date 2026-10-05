import { previewUrl, useUploads } from '@/tooling/assets'
import { linkAttributes } from '@/tooling/codegen'
import { previewLinkClick } from '@/tooling/previewLinks'
import { iconOf, renderedItems } from './codegen'
import type { HotButtonsConfig } from './schema'

export function Preview({ config: c }: { config: HotButtonsConfig }) {
  useUploads() // re-render when an uploaded icon changes
  return (
    <div className={`${c.widgetId}-container custom-hot-buttons-container`}>
      <div id={c.widgetId}>
        {renderedItems(c).map((item, i) => {
          const icon = previewUrl(iconOf(item, c))
          return (
            <a key={i} href={item.URL} className="hot-button-item" onClick={previewLinkClick(item.URL)} {...linkAttributes(item.URL, item.Title)}>
              {icon && <img className="hot-button-icon" src={icon} alt="" />}
              <span className="hot-button-title">{item.Title}</span>
            </a>
          )
        })}
      </div>
    </div>
  )
}
