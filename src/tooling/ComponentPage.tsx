import { useMemo, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { RegisteredWidget } from './registry'
import type { Config } from './types'
import { CodeOutput } from './CodeOutput'
import { ConfigPanel } from './ConfigPanel'
import { PreviewFrame } from './PreviewFrame'
import { RichText, StatusBadge } from './ui'

/** Generic simulator page. Mount with `key={widget.path}` so state resets per widget. */
export function ComponentPage({ widget }: { widget: RegisteredWidget }) {
  const [config, setConfig] = useState<Config>(() => structuredClone(widget.defaults))
  const onChange = (key: string, value: unknown) => setConfig((c) => ({ ...c, [key]: value }))

  const files = useMemo(() => widget.codegen(config), [widget, config])
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
        <div className="order-1 min-w-0 space-y-2 lg:sticky lg:top-24 lg:order-2">
          <PreviewFrame styles={widget.styles} empty={empty}>
            <Preview config={config} />
          </PreviewFrame>
          {widget.previewHint && <p className="px-1 text-xs text-muted-foreground">{widget.previewHint}</p>}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-brand-navy">Output code</h2>
        <CodeOutput files={files} />
      </div>
    </div>
  )
}
