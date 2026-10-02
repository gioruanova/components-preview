import type { ReactNode } from 'react'
import { ChevronDown, Italic } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Toggle } from '@/components/ui/toggle'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { FONTS, WEIGHTS, fontStack, type Typography } from '../typography'
import { ColorPicker, SliderControl, Stepper } from './controls'

const TRANSFORMS: { value: Typography['transform']; label: string }[] = [
  { value: 'none', label: 'Aa' },
  { value: 'capitalize', label: 'Ab' },
  { value: 'uppercase', label: 'AB' },
  { value: 'lowercase', label: 'ab' },
]

function Sub({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  )
}

export function TypographyControl({ id, value, onChange, clamp = true }: { id: string; value: Typography; onChange: (v: Typography) => void; clamp?: boolean }) {
  const set = <K extends keyof Typography>(k: K, v: Typography[K]) => onChange({ ...value, [k]: v })

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          className="flex h-10 w-full items-center gap-3 rounded-md border border-input bg-card px-2.5 text-left shadow-xs transition-colors hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <span
            className="grid size-7 shrink-0 place-items-center rounded border bg-white text-sm"
            style={{ fontFamily: fontStack(value.family), fontWeight: value.weight, color: value.color, fontStyle: value.italic ? 'italic' : undefined }}
          >
            Aa
          </span>
          <span className="min-w-0 flex-1 truncate text-sm">
            {value.family} · {value.size}px · {value.weight}
            {clamp && value.clamp && ` · ${value.lines} line${value.lines > 1 ? 's' : ''}`}
          </span>
          <span className="size-3.5 shrink-0 rounded-full border border-black/10" style={{ background: value.color }} />
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 space-y-3 p-3">
        <Sub label="Font family">
          <Select value={value.family} onValueChange={(v) => set('family', v)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONTS.map((f) => (
                <SelectItem key={f.value} value={f.value} style={{ fontFamily: f.stack }}>
                  {f.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Sub>
        <div className="grid grid-cols-[1fr_auto] items-end gap-2">
          <Sub label="Weight">
            <Select value={String(value.weight)} onValueChange={(v) => set('weight', Number(v))}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WEIGHTS.map((w) => (
                  <SelectItem key={w} value={String(w)}>
                    {w}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Sub>
          <Toggle variant="outline" aria-label="Italic" pressed={value.italic} onPressedChange={(v) => set('italic', v)} className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
            <Italic />
          </Toggle>
        </div>
        <Sub label="Size">
          <SliderControl id={`${id}-size`} value={value.size} onChange={(v) => set('size', v)} min={10} max={72} unit="px" />
        </Sub>
        <Sub label="Line height">
          <SliderControl id={`${id}-lh`} value={value.lineHeight} onChange={(v) => set('lineHeight', v)} min={0.8} max={2.4} step={0.05} />
        </Sub>
        <Sub label="Letter spacing">
          <SliderControl id={`${id}-ls`} value={value.letterSpacing} onChange={(v) => set('letterSpacing', v)} min={-0.05} max={0.3} step={0.01} unit="em" />
        </Sub>
        <Sub label="Case">
          <ToggleGroup type="single" variant="outline" size="sm" value={value.transform} onValueChange={(v) => v && set('transform', v as Typography['transform'])} className="w-full">
            {TRANSFORMS.map((t) => (
              <ToggleGroupItem key={t.value} value={t.value} aria-label={t.value} className="flex-1 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                {t.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </Sub>
        <Sub label="Color">
          <ColorPicker id={`${id}-color`} value={value.color} onChange={(v) => set('color', v)} />
        </Sub>
        {clamp && (
        <div className="flex items-center justify-between gap-3 rounded-md border bg-muted/40 px-2.5 py-2">
          <div className="flex items-center gap-2">
            <Switch id={`${id}-clamp`} checked={value.clamp} onCheckedChange={(v) => set('clamp', v)} />
            <Label htmlFor={`${id}-clamp`} className="text-xs">
              Clamp lines
            </Label>
          </div>
          {value.clamp && <Stepper id={`${id}-lines`} value={value.lines} onChange={(v) => set('lines', v)} min={1} max={10} />}
        </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
