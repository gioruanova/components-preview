import type { ReactNode } from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { cn } from '@/lib/utils'
import type { Config, FieldDef, LeafField, ListField } from '../types'
import { ColorPicker, SliderControl, Stepper } from './controls'

type Props<C extends Config> = {
  field: FieldDef<C>
  config: C
  onChange: (key: string, value: unknown) => void
}

export function FieldRenderer<C extends Config>({ field, config, onChange }: Props<C>) {
  if (field.visibleWhen && !field.visibleWhen(config)) return null

  if (field.type === 'group') {
    return (
      <fieldset className="space-y-3 rounded-lg border bg-muted/40 p-3">
        <legend className="px-1 text-xs font-semibold tracking-wide text-brand-navy uppercase">{field.label}</legend>
        {field.fields.map((f) => (
          <FieldRenderer key={f.key} field={f} config={config} onChange={onChange} />
        ))}
      </fieldset>
    )
  }

  return <Leaf field={field} config={config} onChange={onChange} />
}

function Row({ id, label, help, children, inline }: { id: string; label: string; help?: string; children: ReactNode; inline?: boolean }) {
  return (
    <div className={cn(inline ? 'flex items-center justify-between gap-3' : 'space-y-1.5')}>
      <div className="min-w-0">
        <Label htmlFor={id} className="text-[13px] font-medium">
          {label}
        </Label>
        {help && <p className="mt-0.5 text-xs text-muted-foreground">{help}</p>}
      </div>
      {children}
    </div>
  )
}

function Leaf<C extends Config>({ field, config, onChange }: { field: LeafField<C>; config: C; onChange: Props<C>['onChange'] }) {
  const id = `field-${field.key}`
  const value = config[field.key]
  const set = (v: unknown) => onChange(field.key, v)

  switch (field.type) {
    case 'text':
      return (
        <Row id={id} label={field.label} help={field.help}>
          <Input id={id} value={String(value ?? '')} placeholder={field.placeholder} onChange={(e) => set(e.target.value)} />
        </Row>
      )
    case 'textarea':
      return (
        <Row id={id} label={field.label} help={field.help}>
          <Textarea id={id} rows={field.rows ?? 3} value={String(value ?? '')} onChange={(e) => set(e.target.value)} />
        </Row>
      )
    case 'switch':
      return (
        <Row id={id} label={field.label} help={field.hint ?? field.help} inline>
          <Switch id={id} checked={Boolean(value)} onCheckedChange={set} />
        </Row>
      )
    case 'switchText': {
      const on = Boolean(config[field.toggleKey])
      const Control = field.multiline ? Textarea : Input
      return (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor={id} className="text-[13px] font-medium">
              {field.label}
            </Label>
            <Switch aria-label={`Show ${field.label}`} checked={on} onCheckedChange={(v) => onChange(field.toggleKey, v)} />
          </div>
          <Control
            id={id}
            disabled={!on}
            value={String(value ?? '')}
            placeholder={field.placeholder}
            onChange={(e: { target: { value: string } }) => set(e.target.value)}
          />
        </div>
      )
    }
    case 'select':
      return (
        <Row id={id} label={field.label} help={field.help}>
          <Select value={String(value)} onValueChange={set}>
            <SelectTrigger id={id} className="w-full bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {field.options.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Row>
      )
    case 'segmented':
      return (
        <Row id={id} label={field.label} help={field.help}>
          <ToggleGroup
            id={id}
            type="single"
            variant="outline"
            value={String(value)}
            onValueChange={(v) => v && set(v)}
            className="w-full bg-card"
          >
            {field.options.map((o) => (
              <ToggleGroupItem key={o.value} value={o.value} className="flex-1 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                {o.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </Row>
      )
    case 'color':
      return (
        <Row id={id} label={field.label} help={field.help}>
          <ColorPicker id={id} value={String(value)} onChange={set} />
        </Row>
      )
    case 'slider':
      return (
        <Row id={id} label={field.label} help={field.help}>
          <SliderControl id={id} value={Number(value)} onChange={set} min={field.min} max={field.max} step={field.step} unit={field.unit} />
        </Row>
      )
    case 'stepper':
      return (
        <Row id={id} label={field.label} help={field.help} inline>
          <Stepper id={id} value={Number(value)} onChange={set} min={field.min} max={field.max} />
        </Row>
      )
    case 'list':
      return <ListEditor field={field} config={config} onChange={onChange} />
  }
}

function ListEditor<C extends Config>({ field, config, onChange }: { field: ListField<C>; config: C; onChange: Props<C>['onChange'] }) {
  const items = (config[field.key] as Record<string, unknown>[]) ?? []
  const count = field.countKey ? Number(config[field.countKey]) : items.length
  const visible = Array.from({ length: count }, (_, i) => items[i] ?? field.newItem(i))

  const update = (index: number, key: string, v: string) => {
    const next = [...visible, ...items.slice(count)]
    next[index] = { ...next[index], [key]: v }
    onChange(field.key, next)
  }

  return (
    <div className="space-y-1.5">
      <Label className="text-[13px] font-medium">{field.label}</Label>
      <Accordion type="multiple" className="rounded-lg border bg-card">
        {visible.map((item, i) => (
          <AccordionItem key={i} value={String(i)} className="px-3">
            <AccordionTrigger className="py-2.5 text-sm hover:no-underline">
              <span className="truncate">
                <span className="mr-2 text-xs font-semibold text-muted-foreground uppercase">{field.itemLabel(i)}</span>
                {String(item[field.itemFields[0].key] ?? '')}
              </span>
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pb-3">
              {field.itemFields.map((f) => {
                const id = `field-${field.key}-${i}-${f.key}`
                const Control = f.type === 'textarea' ? Textarea : Input
                return (
                  <Row key={f.key} id={id} label={f.label}>
                    <Control
                      id={id}
                      value={String(item[f.key] ?? '')}
                      placeholder={f.placeholder}
                      onChange={(e: { target: { value: string } }) => update(i, f.key, e.target.value)}
                    />
                  </Row>
                )
              })}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
