import { useMemo } from 'react'
import { useUploads } from '@/tooling/assets'
import { ContainerPreview, type ContainerConfig } from '@/tooling/container'
import { previewCss } from '@/tooling/output'
import { profile } from '@/tooling/outputProfile'
import { PreviewFrame } from '@/tooling/PreviewFrame'
import { toCss } from '@/tooling/stylesheet'
import { findWidgetByKey, type Layout } from './model'
import { GUIDES_CSS, sectionSheets } from './sections'

/** All sections + their components rendered in one iframe (same viewports and popup as component pages). */
export function CombinedPreview({ layout, guides }: { layout: Layout; guides: boolean }) {
  const uploads = useUploads()

  const css = useMemo(() => {
    const sectionCss = toCss(layout.sections.flatMap(sectionSheets))
    const itemCss = layout.sections
      .flatMap((s) => s.columns.flatMap((c) => c.items))
      .map((item) => {
        const widget = findWidgetByKey(item.widget)
        return widget ? previewCss(widget, item.config) : ''
      })
    return [sectionCss, ...itemCss, guides ? GUIDES_CSS : ''].join('\n\n')
    // uploads: background images resolve from the upload store
  }, [layout, guides, uploads])

  return (
    <PreviewFrame css={css} empty={false}>
      {layout.sections.length === 0 ? (
        <p style={{ padding: 48, textAlign: 'center', color: '#5b6672', font: '15px system-ui, sans-serif' }}>Add a section to start building.</p>
      ) : (
        layout.sections.map((s) => (
          <section key={s.id} id={`cs-${s.id}`} className="combiner-section" data-label={s.settings.name}>
            <div className={profile.classNames.containerInner}>
              <div className="combiner-columns">
                {s.columns.map((col, i) => (
                  <div key={col.id} className="combiner-column">
                    {col.items.length === 0 && guides && <div className="combiner-empty">Empty column {i + 1}</div>}
                    {col.items.map((item) => {
                      const widget = findWidgetByKey(item.widget)
                      if (!widget) return null
                      if (widget.isEmpty?.(item.config)) return null // removed widgets render nothing, like on the site
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
