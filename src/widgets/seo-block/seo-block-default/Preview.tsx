import type { CSSProperties } from 'react'
import { linkAttributes } from '@/tooling/codegen'
import type { SeoBlockConfig } from './schema'

export function Preview({ config: c }: { config: SeoBlockConfig }) {
  const Heading = c.headingLevel
  const buttons = [
    c.button1Show && { url: c.button1Url, label: c.button1Label },
    c.button2Show && { url: c.button2Url, label: c.button2Label },
  ].filter((b): b is { url: string; label: string } => Boolean(b))

  const vars = {
    '--seo-bg': c.backgroundColor,
    '--seo-text': c.textColor,
    '--seo-radius': `${c.borderRadius}px`,
    '--seo-border': c.borderWidth ? `${c.borderWidth}px solid ${c.borderColor}` : 'none',
  } as CSSProperties

  return (
    <div className="seo-preview" style={vars}>
      <div className={`${c.widgetId}-signup-container seo-container`}>
        <div id={c.widgetId} className="seo-block">
          {c.showTitle && (
            <Heading className="seo-title">
              {c.titleLine1}
              {c.titleLine2 && <span className="seo-title-line2">{c.titleLine2}</span>}
              {c.showDivider && <span className="seo-divider" />}
            </Heading>
          )}
          {c.showDescription && <div className="seo-description">{c.description}</div>}
          {buttons.length > 0 && (
            <div className="buttons-container">
              {buttons.map((b) => (
                <a key={b.label + b.url} href={b.url} className="button" onClick={(e) => e.preventDefault()} {...linkAttributes(b.url, b.label, c.siteBaseUrl)}>
                  {b.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
