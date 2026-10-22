import { Fragment } from 'react'
import { linkAttributes } from '@/tooling/codegen'
import { previewLinkClick } from '@/tooling/previewLinks'
import { renderedItems, widgetIdOf } from './codegen'
import type { SeoBlockConfig } from './schema'

export function Preview({ config: c }: { config: SeoBlockConfig }) {
  return (
    <div className="seoBlock-container">
      <div id={widgetIdOf(c)}>
      {renderedItems(c).map((item) => {
        const Heading = item.titleTag
        const twoLines = item.titleLines.length === 2
        return (
          <Fragment key={item.index}>
            {/* Two lines: one span per line + aria-label. One line: plain text, no span, no aria-label. */}
            {twoLines && (
              <Heading className="seo-title" aria-label={item.titleLines.join(' ')}>
                <span>{item.titleLines[0]}</span>
                <span>{item.titleLines[1]}</span>
              </Heading>
            )}
            {item.titleLines.length === 1 && <Heading className="seo-title">{item.titleLines[0]}</Heading>}
            {c.showDivider && <span className="seo-divider" />}
            {item.paragraphs.length > 0 && (
              <div className="seo-description">
                {item.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            )}
            {item.buttons.length > 0 && (
              <div className="buttons-container">
                {item.buttons.map((b) => (
                  <a key={b.n} href={b.url} className={`button button-${b.n}`} onClick={previewLinkClick(b.url)} {...linkAttributes(b.url, b.label)}>
                    {b.label}
                  </a>
                ))}
              </div>
            )}
          </Fragment>
        )
      })}
      </div>
    </div>
  )
}
