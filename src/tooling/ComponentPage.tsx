import { useMemo, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUploads } from './assets'
import { CodeOutput } from './CodeOutput'
import { ConfigPanel } from './ConfigPanel'
import { ContainerPreview, type ContainerConfig } from './container'
import { outputFiles, previewCss } from './output'
import { PreviewFrame } from './PreviewFrame'
import type { RegisteredWidget } from './registry'
import type { Config } from './types'
import { InfoTip, RichText, StatusBadge } from './ui'
import { ViewportProvider } from './viewport'

/** Generic page for any widget. Mount with `key={widget.path}` so state resets per widget. */
export function ComponentPage({ widget }: { widget: RegisteredWidget }) {
  return (
    <ViewportProvider>
      <ComponentPageBody widget={widget} />
    </ViewportProvider>
  )
}

function ComponentPageBody({ widget }: { widget: RegisteredWidget }) {
  const [config, setConfig] = useState<Config>(() => structuredClone(widget.defaults))
  const onChange = (key: string, value: unknown) => setConfig((c) => ({ ...c, [key]: value }))
  const uploads = useUploads() // re-render when an uploaded background changes

  const files = useMemo(() => outputFiles(widget, config), [widget, config, uploads])
  const css = useMemo(() => previewCss(widget, config), [widget, config, uploads])
  const empty = widget.isEmpty?.(config) ?? false
  const { Preview } = widget

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-brand-navy">{widget.name}</h1>
            <StatusBadge status={widget.status} />
          </div>
          <p className="mt-1 text-muted-foreground">{widget.summary}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setConfig(structuredClone(widget.defaults))}>
          <RotateCcw /> Reset to defaults
        </Button>
      </header>

      <section className="rounded-xl border border-l-4 border-l-brand-blue bg-card p-5 shadow-sm">
        <h2 className="mb-2 text-sm font-semibold tracking-wide text-brand-blue uppercase">Functional description</h2>
        <ul className="list-disc space-y-1.5 pl-5 text-[15px] marker:text-brand-blue">
          {widget.description.map((line) => (
            <li key={line}>
              <RichText text={line} />
            </li>
          ))}
        </ul>
      </section>

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(320px,400px)_minmax(0,1fr)]">
        <div className="order-2 min-w-0 lg:order-1">
          <ConfigPanel schema={widget.schema} config={config} onChange={onChange} />
        </div>
        <div className="order-1 min-w-0 space-y-2 lg:sticky lg:top-28 lg:order-2">
          <PreviewFrame css={css} empty={empty}>
            <ContainerPreview config={config as ContainerConfig}>
              <Preview config={config} />
            </ContainerPreview>
          </PreviewFrame>
          {widget.previewHint && <p className="px-1 text-xs text-muted-foreground">{widget.previewHint}</p>}
        </div>
      </div>

      <div>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-brand-navy">
          Output code
          <InfoTip label="About the output code">
            Generated live from the configuration above. <b>HTML</b>: markup with data placeholders. <b>SCSS</b> / <b>CSS</b>: styles with
            variables for colors, fonts and sizes. <b>Script</b>: the widget's render function. <b>Data</b>: the JSON the widget receives.
          </InfoTip>
        </h2>
        <CodeOutput files={files} />
      </div>
    </div>
  )
}
