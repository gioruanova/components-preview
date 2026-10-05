import { Settings2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfigPanel } from '@/tooling/ConfigPanel'
import { FieldRenderer } from '@/tooling/fields/FieldRenderer'
import type { Config } from '@/tooling/types'
import { findItem, findWidgetByKey, updateItemConfig, updateSectionHeading, updateSectionSettings, type Layout, type SectionSettings } from './model'
import { headingOf, headingSchema } from './sectionHeading'
import { sectionFields } from './sections'
import type { Selection } from './useLayout'

type Props = {
  layout: Layout
  selection: Selection
  onClose: () => void
  update: (fn: (l: Layout) => Layout) => void
}

/** Settings for the selected section, section heading or component. */
export function Inspector({ layout, selection, onClose, update }: Props) {
  if (!selection) {
    return (
      <div className="rounded-xl border border-dashed bg-card/60 p-5 text-center text-sm text-muted-foreground">
        <Settings2 className="mx-auto mb-2 size-5" />
        Select a section, its heading or a component in the scheme to edit its settings.
      </div>
    )
  }

  if (selection.type === 'heading') {
    const section = layout.sections.find((s) => s.id === selection.id)
    if (!section) return null
    const onChange = (key: string, value: unknown) => update((l) => updateSectionHeading(l, section.id, key, value))
    return (
      <Panel title={`Heading · ${section.settings.name}`} onClose={onClose}>
        <div className="p-3">
          <ConfigPanel key={`heading-${section.id}`} schema={headingSchema} config={headingOf(section)} onChange={onChange} />
        </div>
      </Panel>
    )
  }

  if (selection.type === 'section') {
    const section = layout.sections.find((s) => s.id === selection.id)
    if (!section) return null
    const onChange = (key: string, value: unknown) => update((l) => updateSectionSettings(l, section.id, { [key]: value } as Partial<SectionSettings>))
    return (
      <Panel title={`Section · ${section.settings.name}`} onClose={onClose}>
        <div className="space-y-4 p-4">
          {sectionFields.map((f, i) => (
            <FieldRenderer key={'key' in f ? f.key : `${f.label}-${i}`} field={f} config={section.settings} onChange={onChange} />
          ))}
        </div>
      </Panel>
    )
  }

  const found = findItem(layout, selection.id)
  const widget = found && findWidgetByKey(found.item.widget)
  if (!found || !widget) return null
  const onChange = (key: string, value: unknown) => update((l) => updateItemConfig(l, found.item.id, key, value))
  return (
    <Panel title={`${widget.name} · #${String(found.item.config.widgetId ?? '')}`} onClose={onClose}>
      <div className="p-3">
        <ConfigPanel key={found.item.id} schema={widget.schema} config={found.item.config as Config} onChange={onChange} />
      </div>
    </Panel>
  )
}

function Panel({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <section aria-label="Settings" className="overflow-hidden rounded-xl border bg-muted/40 shadow-sm">
      <header className="flex items-center gap-2 border-b bg-card px-4 py-2.5">
        <Settings2 className="size-4 text-brand-blue" />
        <h3 className="min-w-0 flex-1 truncate text-sm font-semibold">{title}</h3>
        <Button variant="ghost" size="icon" className="size-7" onClick={onClose} aria-label="Close settings">
          <X />
        </Button>
      </header>
      {children}
    </section>
  )
}
