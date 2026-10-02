import { Blocks, Palette, Type } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { FieldRenderer } from './fields/FieldRenderer'
import type { Config, Schema, Section } from './types'

const SECTIONS: { id: Section; letter: string; title: string; icon: typeof Type }[] = [
  { id: 'content', letter: 'A', title: 'Content', icon: Type },
  { id: 'widget', letter: 'B', title: 'Widget configuration', icon: Blocks },
  { id: 'styles', letter: 'C', title: 'Styles', icon: Palette },
]

type Props<C extends Config> = {
  schema: Schema<C>
  config: C
  onChange: (key: string, value: unknown) => void
}

export function ConfigPanel<C extends Config>({ schema, config, onChange }: Props<C>) {
  const sections = SECTIONS.filter((s) => schema[s.id]?.length)
  return (
    <Accordion type="multiple" defaultValue={sections.map((s) => s.id)} className="space-y-3">
      {sections.map(({ id, letter, title, icon: Icon }) => (
        <AccordionItem key={id} value={id} className="overflow-hidden rounded-xl border bg-card shadow-sm last:border-b">
          <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 hover:no-underline">
            <span className="flex items-center gap-2.5">
              <span className="grid size-6 place-items-center rounded-md bg-brand-sky text-xs font-bold text-brand-navy">{letter}</span>
              <span className="font-semibold">{title}</span>
              <Icon className="size-4 text-muted-foreground" />
            </span>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 border-t px-4 pt-4 pb-4">
            {schema[id].map((field, i) => (
              <FieldRenderer key={'key' in field ? field.key : `${field.label}-${i}`} field={field} config={config} onChange={onChange} />
            ))}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
