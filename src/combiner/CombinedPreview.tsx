import { useMemo } from 'react'
import { useUploads } from '@/tooling/assets'
import { ContainerPreview, type ContainerConfig } from '@/tooling/container'
import { previewCss } from '@/tooling/output'
import { profile } from '@/tooling/outputProfile'
import { PreviewFrame } from '@/tooling/PreviewFrame'
import { toCss } from '@/tooling/stylesheet'
import { findWidgetByKey, isItemRendered, renderedColumns, type Layout } from './model'
import { headingOf, headingSheet, isHeadingEmpty, SectionHeadingPreview } from './sectionHeading'
import { GUIDES_CSS, isSectionRendered, sectionSheets } from './sections'

/** All sections + their components rendered in one iframe (same viewports and popup as component pages). */
export function CombinedPreview({ layout, guides }: { layout: Layout; guides: boolean }) {
  const uploads = useUploads()

  // sections whose columns are all empty (and without heading) are removed, like on the site
  const sections = layout.sections.filter(isSectionRendered)

  const css = useMemo(() => {
    const sectionCss = toCss(
      sections.flatMap((s) => {
        const h = headingOf(s)
        return [...sectionSheets(s), ...(isHeadingEmpty(h) ? [] : [headingSheet(`#cs-${s.id}`, h, `${s.settings.name} — heading`)])]
      }),
    )
    const items = sections.flatMap((s) => s.columns.flatMap((c) => c.items.filter((i) => isItemRendered(i, s))))
    const itemCss = [...(layout.siteHeader ? [layout.siteHeader] : []), ...items]
      .map((item) => {
        const widget = findWidgetByKey(item.widget)
        // the section container provides the spacing: no extra wrapper padding
        return widget ? previewCss(widget, item.config, { inContainer: true }) : ''
      })
    return [sectionCss, ...itemCss, guides ? GUIDES_CSS : ''].join('\n\n')
    // uploads: background images resolve from the upload store
  }, [layout, guides, uploads])

  // Site header: always at the very top, outside the sections (only Header components)
  const headerWidget = layout.siteHeader && findWidgetByKey(layout.siteHeader.widget)
  const siteHeader =
    layout.siteHeader && headerWidget ? (
      <div className="combiner-site-header" data-label="Header">
        <headerWidget.Preview config={layout.siteHeader.config} />
      </div>
    ) : null

  return (
    <PreviewFrame css={css} empty={false}>
      {siteHeader}
      {sections.length === 0 ? (
        <p style={{ padding: 48, textAlign: 'center', color: '#5b6672', font: '15px system-ui, sans-serif' }}>
          {layout.sections.length ? 'Every section is empty, so none is rendered (as on the site).' : 'Add a section to start building.'}
        </p>
      ) : (
        sections.map((s) => (
          <section key={s.id} id={`cs-${s.id}`} className="combiner-section" data-label={s.settings.name}>
            <div className={profile.classNames.containerInner}>
              {/* section heading: inside the container, outside (above) the columns wrapper */}
              <SectionHeadingPreview heading={headingOf(s)} />
              <div className="combiner-columns">
                {/* empty columns are dropped, so the other columns take the full width */}
                {renderedColumns(s).map(({ column: col }) => (
                  <div key={col.id} className="combiner-column">
                    {col.items.map((item) => {
                      const widget = findWidgetByKey(item.widget)
                      // removed (or simulated empty) widgets render nothing, like on the site
                      if (!widget || !isItemRendered(item, s)) return null
                      const { Preview } = widget
                      return (
                        <ContainerPreview key={item.id} config={item.config as ContainerConfig}>
                          <Preview config={item.config} />
                        </ContainerPreview>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))
      )}
    </PreviewFrame>
  )
}
