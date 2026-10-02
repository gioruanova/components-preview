import { Minus, Plus } from 'lucide-react'
import { HexColorInput, HexColorPicker } from 'react-colorful'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

const SWATCHES = ['#007bc7', '#005b94', '#003c61', '#f26922', '#66bb6a', '#daf1ff', '#ffffff', '#f0f0f0', '#222222', '#000000']

export function ColorPicker({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          className="flex h-9 w-full items-center gap-2 rounded-md border border-input bg-card px-2 text-sm shadow-xs transition-colors hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <span className="size-5 shrink-0 rounded border border-black/10" style={{ background: value }} />
          <span className="font-mono text-xs uppercase">{value}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-60 space-y-3 p-3" align="start">
        <HexColorPicker color={value} onChange={onChange} className="!w-full" />
        <div className="grid grid-cols-10 gap-1">
          {SWATCHES.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Use ${c}`}
              onClick={() => onChange(c)}
              className={cn(
                'aspect-square rounded border border-black/10 transition-transform hover:scale-110',
                value.toLowerCase() === c && 'ring-2 ring-ring ring-offset-1',
              )}
              style={{ background: c }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">HEX</span>
          <HexColorInput
            color={value}
            onChange={onChange}
            prefixed
            className="h-8 w-full rounded-md border border-input px-2 font-mono text-xs uppercase focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function SliderControl({
  id,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = '',
}: {
  id: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step?: number
  unit?: string
}) {
  return (
    <div className="flex items-center gap-3">
      <Slider id={id} value={[value]} min={min} max={max} step={step} onValueChange={([v]) => onChange(v)} className="flex-1" />
      <span className="w-14 shrink-0 rounded-md bg-muted px-1.5 py-1 text-center font-mono text-xs tabular-nums">
        {value}
        {unit}
      </span>
    </div>
  )
}

export function Stepper({
  id,
  value,
  onChange,
  min,
  max,
}: {
  id: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
}) {
  const clamp = (v: number) => Math.min(max, Math.max(min, v))
  return (
    <div className="inline-flex items-center rounded-md border border-input bg-card shadow-xs">
      <Button variant="ghost" size="icon" className="size-8" aria-label="Decrease" disabled={value <= min} onClick={() => onChange(clamp(value - 1))}>
        <Minus />
      </Button>
      <output id={id} className="w-10 text-center text-sm font-medium tabular-nums">
        {value}
      </output>
      <Button variant="ghost" size="icon" className="size-8" aria-label="Increase" disabled={value >= max} onClick={() => onChange(clamp(value + 1))}>
        <Plus />
      </Button>
    </div>
  )
}
