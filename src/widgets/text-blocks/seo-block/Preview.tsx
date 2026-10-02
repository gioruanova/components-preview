import { linkAttributes } from '@/tooling/codegen'
import { previewLinkClick } from '@/tooling/previewLinks'
import { renderedButtons } from './codegen'
import type { SeoBlockConfig } from './schema'

export function Preview({ config: c }: { config: SeoBlockConfig }) {
  const Heading = c.headingLevel
  const buttons = renderedButtons(c)

  return (
    <div className={`${c.widgetId}-signup-container`}>
      <div id={c.widgetId}>
        {c.showTitle && (
          <Heading className="seo-title">
            <span className="seo-title-line1">{c.titleLine1}</span>
            {c.titleLine2 && <span className="seo-title-line2">{c.titleLine2}</span>}
            {c.showDivider && <span className="seo-divider" />}
          </Heading>
        )}
        {c.showDescription && <div className="seo-description">{c.description}</div>}
        {buttons.length > 0 && (
          <div className="buttons-container">
            {buttons.map((b) => (
              <a key={b.n} href={b.url} className={`button button-${b.n}`} onClick={previewLinkClick(b.url)} {...linkAttributes(b.url, b.label)}>
                {b.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
