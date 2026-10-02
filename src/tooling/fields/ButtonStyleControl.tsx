import type { CSSProperties, ReactNode } from 'react'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { SHADOWS, type ButtonStyle } from '../buttons'
import { fontStack } from '../typography'
import { ColorPicker, SliderControl } from './controls'
import { TypographyControl } from './TypographyControl'

function Sub({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  )
}

/** "Custom style" switch for one button; when on, a panel with every style option and a live sample. */
export function ButtonStyleControl({ id, label, value, onChange }: { id: string; label: string; value: ButtonStyle; onChange: (v: ButtonStyle) => void }) {
  const set = <K extends keyof ButtonStyle>(k: K, v: ButtonStyle[K]) => onChange({ ...value, [k]: v })
  const f = value.font

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={id} className="text-[13px] font-medium">
          {label}
        </Label>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{value.custom ? 'Custom' : 'Default'}</span>
          <Switch id={id} checked={value.custom} onCheckedChange={(v) => set('custom', v)} />
        </div>
      </div>

      {value.custom && (
        <div className="space-y-3 rounded-lg border bg-card p-3">
          {/* Live sample (hover it to see the hover colors) */}
          <div className="grid place-items-center rounded-md bg-[repeating-conic-gradient(#eef2f6_0%_25%,#fff_0%_50%)] bg-[length:16px_16px] p-4">
            <span
              className="cursor-default transition-colors duration-300 [background:var(--b-bg)] [color:var(--b-color)] hover:[background:var(--b-hover-bg)] hover:[color:var(--b-hover-color)]"
              style={
                {
                  '--b-bg': value.background,
                  '--b-color': f.color,
                  '--b-hover-bg': value.hoverBackground,
                  '--b-hover-color': value.hoverColor,
                  borderRadius: value.radius,
                  border: value.borderWidth ? `${value.borderWidth}px solid ${value.borderColor}` : 'none',
                  boxShadow: SHADOWS[value.shadow],
                  padding: `${value.paddingY}px ${value.paddingX}px`,
                  fontFamily: fontStack(f.family),
                  fontSize: Math.min(f.size, 22),
                  fontWeight: f.weight,
                  fontStyle: f.italic ? 'italic' : undefined,
                  letterSpacing: `${f.letterSpacing}em`,
                  textTransform: f.transform,
                  lineHeight: f.lineHeight,
                } as CSSProperties
              }
            >
              Sample
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Sub label="Background">
              <ColorPicker id={`${id}-bg`} value={value.background} onChange={(v) => set('background', v)} alpha />
            </Sub>
            <Sub label="Hover background">
              <ColorPicker id={`${id}-hbg`} value={value.hoverBackground} onChange={(v) => set('hoverBackground', v)} alpha />
            </Sub>
            <Sub label="Text color">
              <ColorPicker id={`${id}-color`} value={f.color} onChange={(v) => set('font', { ...f, color: v })} />
            </Sub>
            <Sub label="Hover text color">
              <ColorPicker id={`${id}-hcolor`} value={value.hoverColor} onChange={(v) => set('hoverColor', v)} />
            </Sub>
          </div>
          <Sub label="Font">
            <TypographyControl id={`${id}-font`} value={f} onChange={(v) => set('font', v)} clamp={false} />
          </Sub>
          <Sub label="Corner radius">
            <SliderControl id={`${id}-radius`} value={value.radius} onChange={(v) => set('radius', v)} min={0} max={60} unit="px" />
          </Sub>
          <Sub label="Border width">
            <SliderControl id={`${id}-bw`} value={value.borderWidth} onChange={(v) => set('borderWidth', v)} min={0} max={8} unit="px" />
          </Sub>
          {value.borderWidth > 0 && (
            <Sub label="Border color">
              <ColorPicker id={`${id}-bc`} value={value.borderColor} onChange={(v) => set('borderColor', v)} alpha />
            </Sub>
          )}
          <Sub label="Shadow">
            <ToggleGroup type="single" variant="outline" size="sm" value={value.shadow} onValueChange={(v) => v && set('shadow', v as ButtonStyle['shadow'])} className="w-full">
              {(['none', 'sm', 'md', 'lg'] as const).map((s) => (
                <ToggleGroupItem key={s} value={s} className="flex-1 capitalize data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                  {s === 'none' ? 'None' : s.toUpperCase()}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </Sub>
          <Sub label="Padding horizontal">
            <SliderControl id={`${id}-px`} value={value.paddingX} onChange={(v) => set('paddingX', v)} min={0} max={64} unit="px" />
          </Sub>
          <Sub label="Padding vertical">
            <SliderControl id={`${id}-py`} value={value.paddingY} onChange={(v) => set('paddingY', v)} min={0} max={40} unit="px" />
          </Sub>
        </div>
      )}
    </div>
  )
}
