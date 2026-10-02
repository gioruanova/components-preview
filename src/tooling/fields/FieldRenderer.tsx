import type { ReactNode } from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Monitor, Smartphone, Tablet } from 'lucide-react'
import { cn } from '@/lib/utils'
import { hasOverride, valueAt, VIEWPORT_ORDER, viewportKey } from '../responsive'
import { useViewport } from '../viewport'
import type { Config, FieldDef, LeafField, ListField } from '../types'
import type { Typography } from '../typography'
import { InfoTip } from '../ui'
import { ColorPicker, SliderControl, Stepper } from './controls'
import type { ButtonStyle } from '../buttons'
import { ButtonStyleControl } from './ButtonStyleControl'
import { ImagePicker } from './ImagePicker'
import { TypographyControl } from './TypographyControl'

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

function Row({ id, label, help, tip, children, inline }: { id: string; label: string; help?: string; tip?: string; children: ReactNode; inline?: boolean }) {
  return (
    <div className={cn(inline ? 'flex items-center justify-between gap-3' : 'space-y-1.5')}>
      <div className="min-w-0">
        <div className="flex items-center gap-1">
          <Label htmlFor={id} className="text-[13px] font-medium">
            {label}
          </Label>
          {tip && <InfoTip label={tip}>{tip}</InfoTip>}
        </div>
        {help && <p className="mt-0.5 text-xs text-muted-foreground">{help}</p>}
      </div>
      {children}
    </div>
  )
}

const VP_ICONS = { desktop: Monitor, tablet: Tablet, mobile: Smartphone } as const
const VP_LABEL = { desktop: 'Desktop', tablet: 'Tablet', mobile: 'Mobile' } as const

/** Leaf field; `responsive` fields read/write the value of the viewport being edited (tablet/mobile overrides). */
function Leaf<C extends Config>({ field, config, onChange }: { field: LeafField<C>; config: C; onChange: Props<C>['onChange'] }) {
  const { viewport, setViewport } = useViewport()
  const responsiveField = 'responsive' in field && field.responsive === true
  const vp = responsiveField ? viewport : 'desktop'
  const value = responsiveField ? valueAt(config, field.key, vp) : config[field.key]
  const set = (v: unknown) => onChange(viewportKey(field.key, vp), v)
  const control = <LeafControl field={field} config={config} onChange={onChange} value={value} set={set} />
  if (!responsiveField) return control

  const overridden = hasOverride(config, field.key, vp)
  const anyOverride = hasOverride(config, field.key, 'tablet') || hasOverride(config, field.key, 'mobile')
  const status =
    vp === 'desktop' ? (anyOverride ? 'Desktop value · has per-viewport overrides' : 'Same on every viewport') : overridden ? `${VP_LABEL[vp]} override` : `Inherits ${vp === 'mobile' ? 'Tablet' : 'Desktop'}`

  return (
    <div className={cn('-mx-1.5 space-y-1.5 rounded-md px-1.5 py-1 transition-colors', overridden && 'bg-brand-orange/5 ring-1 ring-brand-orange/30')}>
      {control}
      <div className="flex items-center justify-between gap-2 text-[11px]">
        <span className={cn('truncate', overridden ? 'font-medium text-[#b4470e]' : 'text-muted-foreground')}>
          {status}
          {overridden && (
            <button type="button" onClick={() => onChange(viewportKey(field.key, vp), undefined)} className="ml-2 text-brand-blue underline-offset-2 hover:underline">
              Reset
            </button>
          )}
        </span>
        <span className="flex shrink-0 items-center gap-0.5" role="group" aria-label={`${field.label}: viewport`}>
          {VIEWPORT_ORDER.map((v) => {
            const Icon = VP_ICONS[v]
            const has = hasOverride(config, field.key, v)
            return (
              <button
                key={v}
                type="button"
                onClick={() => setViewport(v)}
                aria-pressed={vp === v}
                aria-label={`Edit ${VP_LABEL[v]} value${has ? ' (overridden)' : ''}`}
                title={`${VP_LABEL[v]}${has ? ' · overridden' : ''}`}
                className={cn('relative grid size-6 place-items-center rounded text-muted-foreground transition-colors hover:bg-muted', vp === v && 'bg-brand-blue text-white hover:bg-brand-blue')}
              >
                <Icon className="size-3.5" />
                {has && <span className="absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-brand-orange" />}
              </button>
            )
          })}
        </span>
      </div>
    </div>
  )
}

function LeafControl<C extends Config>({
  field,
  config,
  onChange,
  value,
  set,
}: {
  field: LeafField<C>
  config: C
  onChange: Props<C>['onChange']
  value: unknown
  set: (v: unknown) => void
}) {
  const id = `field-${field.key}`

  switch (field.type) {
    case 'text':
      return (
        <Row id={id} label={field.label} help={field.help} tip={field.tip}>
          <Input id={id} value={String(value ?? '')} placeholder={field.placeholder} onChange={(e) => set(e.target.value)} />
        </Row>
      )
    case 'textarea':
      return (
        <Row id={id} label={field.label} help={field.help} tip={field.tip}>
          <Textarea id={id} rows={field.rows ?? 3} value={String(value ?? '')} onChange={(e) => set(e.target.value)} />
        </Row>
      )
    case 'switch':
      return (
        <Row id={id} label={field.label} help={field.hint ?? field.help} tip={field.tip} inline>
          <Switch id={id} checked={Boolean(value)} onCheckedChange={set} />
        </Row>
      )
    case 'select':
      return (
        <Row id={id} label={field.label} help={field.help} tip={field.tip}>
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
        <Row id={id} label={field.label} help={field.help} tip={field.tip}>
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
        <Row id={id} label={field.label} help={field.help} tip={field.tip}>
          <ColorPicker id={id} value={String(value)} onChange={set} alpha={!field.solid} />
        </Row>
      )
    case 'slider':
      return (
        <Row id={id} label={field.label} help={field.help} tip={field.tip}>
          <SliderControl id={id} value={Number(value)} onChange={set} min={field.min} max={field.max} step={field.step} unit={field.unit} />
        </Row>
      )
    case 'stepper':
      return (
        <Row id={id} label={field.label} help={field.help} tip={field.tip} inline>
          <Stepper id={id} value={Number(value)} onChange={set} min={field.min} max={field.max} />
        </Row>
      )
    case 'typography':
      return (
        <Row id={id} label={field.label} help={field.help} tip={field.tip}>
          <TypographyControl id={id} value={value as Typography} onChange={set} />
        </Row>
      )
    case 'buttonStyle':
      return <ButtonStyleControl id={id} label={field.label} value={value as ButtonStyle} onChange={set} />
    case 'image':
      return (
        <Row id={id} label={field.label} help={field.help} tip={field.tip}>
          <ImagePicker id={id} value={String(value ?? '')} onChange={set} />
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
      <Accordion type="single" collapsible className="rounded-lg border bg-card">
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
                  <Row key={f.key} id={id} label={f.label} tip={f.tip}>
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
