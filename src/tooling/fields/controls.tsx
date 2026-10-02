import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { HexAlphaColorPicker, HexColorInput, HexColorPicker } from 'react-colorful'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

const SWATCHES = ['#007bc7', '#005b94', '#003c61', '#f26922', '#66bb6a', '#daf1ff', '#ffffff', '#f0f0f0', '#222222', '#000000']
export const TRANSPARENT = '#00000000'

/** Checkerboard so transparent / semi-transparent colors are visible. */
const CHECKER = 'repeating-conic-gradient(#d4dbe2 0% 25%, #ffffff 0% 50%) 50% / 8px 8px'

/** Opacity (0–100) of a #rrggbb / #rrggbbaa value. */
function alphaOf(hex: string) {
  return hex.length === 9 ? Math.round((parseInt(hex.slice(7, 9), 16) / 255) * 100) : 100
}

/**
 * Color picker. `alpha` (backgrounds, shapes, borders) adds an opacity slider and a Transparent swatch;
 * values become 8-digit hex (#rrggbbaa) when not fully opaque.
 */
export function ColorPicker({ id, value, onChange, alpha = false }: { id: string; value: string; onChange: (v: string) => void; alpha?: boolean }) {
  const Picker = alpha ? HexAlphaColorPicker : HexColorPicker
  const swatches = alpha ? [...SWATCHES.slice(0, 9), TRANSPARENT] : SWATCHES
  const opacity = alphaOf(value)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          className="flex h-9 w-full items-center gap-2 rounded-md border border-input bg-card px-2 text-sm shadow-xs transition-colors hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <span className="size-5 shrink-0 overflow-hidden rounded border border-black/10" style={{ background: CHECKER }}>
            <span className="block size-full" style={{ background: value }} />
          </span>
          <span className="font-mono text-xs uppercase">{value.toLowerCase() === TRANSPARENT ? 'Transparent' : value}</span>
          {alpha && opacity < 100 && value.toLowerCase() !== TRANSPARENT && <span className="ml-auto text-xs text-muted-foreground tabular-nums">{opacity}%</span>}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-60 space-y-3 p-3" align="start">
        <Picker color={value} onChange={onChange} className="!w-full" />
        <div className="grid grid-cols-10 gap-1">
          {swatches.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={c === TRANSPARENT ? 'Use transparent' : `Use ${c}`}
              title={c === TRANSPARENT ? 'Transparent' : c}
              onClick={() => onChange(c)}
              className={cn(
                'aspect-square overflow-hidden rounded border border-black/10 transition-transform hover:scale-110',
                value.toLowerCase() === c && 'ring-2 ring-ring ring-offset-1',
              )}
              style={{ background: CHECKER }}
            >
              <span className="block size-full" style={{ background: c }} />
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">HEX</span>
          <HexColorInput
            color={value}
            onChange={onChange}
            prefixed
            alpha={alpha}
            className="h-8 w-full rounded-md border border-input px-2 font-mono text-xs uppercase focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
          />
          {alpha && <span className="w-10 shrink-0 text-right text-xs text-muted-foreground tabular-nums">{opacity}%</span>}
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
  const clean = (v: number) => Number(Math.min(max, Math.max(min, v)).toFixed(3))
  return (
    <div className="flex items-center gap-3">
      <Slider value={[value]} min={min} max={max} step={step} onValueChange={([v]) => onChange(clean(v))} className="flex-1" aria-label="Adjust value" />
      <NumberInput id={id} value={value} onChange={(v) => onChange(clean(v))} step={step} unit={unit} min={min} max={max} />
    </div>
  )
}

/** Typed value next to a slider: commits on Enter/blur, ArrowUp/Down step, clamped to the slider's range. */
function NumberInput({ id, value, onChange, step, unit, min, max }: { id: string; value: number; onChange: (v: number) => void; step: number; unit: string; min: number; max: number }) {
  const shown = String(Number(value.toFixed(3)))
  const [draft, setDraft] = useState<string | null>(null)
  const commit = () => {
    if (draft === null) return
    const n = parseFloat(draft.replace(',', '.'))
    if (!Number.isNaN(n)) onChange(n)
    setDraft(null)
  }
  return (
    <label className="flex h-8 w-[5.5rem] shrink-0 items-center rounded-md border border-input bg-card pr-2 shadow-xs focus-within:ring-[3px] focus-within:ring-ring/50">
      <input
        id={id}
        type="text"
        inputMode="decimal"
        aria-valuemin={min}
        aria-valuemax={max}
        value={draft ?? shown}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            commit()
          } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault()
            setDraft(null)
            onChange(value + (e.key === 'ArrowUp' ? step : -step) * (e.shiftKey ? 10 : 1))
          } else if (e.key === 'Escape') {
            setDraft(null)
          }
        }}
        className="w-full min-w-0 bg-transparent px-2 text-right font-mono text-xs tabular-nums outline-none"
      />
      {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
    </label>
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
