import { Blocks, Palette, Type, UserPen } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { cn } from '@/lib/utils'
import { FieldRenderer } from './fields/FieldRenderer'
import type { Config, FieldDef, Schema, Section } from './types'
import { InfoTip } from './ui'

const SECTIONS: { id: Section; letter: string; title: string; icon: typeof Type; info: string; clientManaged?: boolean }[] = [
  {
    id: 'content',
    letter: 'A',
    title: 'Content',
    icon: Type,
    clientManaged: true,
    info: 'Client-managed: this is the only part the client can edit (titles, descriptions, button labels and URLs, items). Widget configuration and Styles are set up by Saffire. These values end up in the Data output.',
  },
  {
    id: 'widget',
    letter: 'B',
    title: 'Widget configuration',
    icon: Blocks,
    info: 'Set up by Saffire, not editable by the client: widget ID, counts, which elements are shown or hidden, and the container.',
  },
  {
    id: 'styles',
    letter: 'C',
    title: 'Styles',
    icon: Palette,
    info: 'Set up by Saffire, not editable by the client: colors, typography, shapes, borders and sizes. Exported as SCSS / CSS with variables.',
  },
]

function ClientCallout() {
  return (
    <div role="note" className="flex gap-3 rounded-lg border border-brand-orange/40 bg-brand-orange/10 p-3">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-orange text-white">
        <UserPen className="size-4" />
      </span>
      <div className="text-[13px] leading-snug">
        <p className="font-semibold text-[#b4470e]">Managed by the client</p>
        <p className="text-foreground/80">
          These are the <b>only</b> fields the client can edit. Widget configuration and Styles are set up by Saffire.
        </p>
      </div>
    </div>
  )
}

function isVisible<C extends Config>(field: FieldDef<C>, config: C): boolean {
  if (field.visibleWhen && !field.visibleWhen(config)) return false
  return field.type === 'group' ? field.fields.some((f) => isVisible(f, config)) : true
}

type Props<C extends Config> = {
  schema: Schema<C>
  config: C
  onChange: (key: string, value: unknown) => void
}

export function ConfigPanel<C extends Config>({ schema, config, onChange }: Props<C>) {
  const sections = SECTIONS.filter((s) => schema[s.id]?.length)
  return (
    <Accordion type="single" collapsible defaultValue={sections[0]?.id} className="space-y-3">
      {sections.map(({ id, letter, title, icon: Icon, info, clientManaged }) => (
        <AccordionItem
          key={id}
          value={id}
          className={cn('overflow-hidden rounded-xl border bg-card shadow-sm last:border-b', clientManaged && 'border-l-4 border-l-brand-orange')}
        >
          <AccordionTrigger className="items-center px-4 py-3 hover:bg-muted/50 hover:no-underline">
            <span className="flex flex-wrap items-center gap-2.5">
              <span className="grid size-6 place-items-center rounded-md bg-brand-sky text-xs font-bold text-brand-navy">{letter}</span>
              <span className="font-semibold">{title}</span>
              <Icon className="size-4 text-muted-foreground" />
              <InfoTip label={`About ${title}`}>{info}</InfoTip>
              {clientManaged && (
                <span className="rounded-full bg-brand-orange px-2 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase">Client</span>
              )}
            </span>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 border-t px-4 pt-4 pb-4">
            {clientManaged && <ClientCallout />}
            {schema[id].map((field, i) => (
              <FieldRenderer key={'key' in field ? field.key : `${field.label}-${i}`} field={field} config={config} onChange={onChange} />
            ))}
            {!schema[id].some((f) => isVisible(f, config)) && (
              <p className="rounded-lg border border-dashed p-3 text-center text-sm text-muted-foreground">
                Nothing to edit here — turn elements on in <b>Widget configuration → Show / hide</b>.
              </p>
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
