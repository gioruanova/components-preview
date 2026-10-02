import { useState } from 'react'
import { CheckCircle2, CircleAlert, Eraser, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { InfoTip, TestingPocBadge } from '@/tooling/ui'
import { CombinedPreview } from './CombinedPreview'
import { Inspector } from './Inspector'
import { Scheme } from './Scheme'
import { useLayout, type Selection } from './useLayout'

export function CombinerPage() {
  const { layout, update, updateWithUndo, reset, clear, saved } = useLayout()
  const [selection, setSelection] = useState<Selection>(null)
  const [guides, setGuides] = useState(true)

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-brand-navy">Combiner</h1>
            <TestingPocBadge />
          </div>
          <p className="mt-1 max-w-2xl text-muted-foreground">
            Combine components into page sections. Drag sections and components to rearrange them, and preview the result on every screen size.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center gap-1 text-xs ${saved ? 'text-[#2e7d32]' : 'text-brand-orange'}`}>
            {saved ? <CheckCircle2 className="size-3.5" /> : <CircleAlert className="size-3.5" />}
            {saved ? 'Saved in this browser' : 'Not saved (storage unavailable)'}
          </span>
          <Button variant="outline" size="sm" onClick={reset}>
            <RotateCcw /> Example layout
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelection(null)
              clear()
            }}
          >
            <Eraser /> Clear
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(340px,420px)_minmax(0,1fr)]">
        <div className="order-2 min-w-0 space-y-4 lg:order-1">
          <section aria-labelledby="scheme-title">
            <h2 id="scheme-title" className="mb-2 flex items-center gap-2 text-sm font-semibold tracking-wide text-brand-navy uppercase">
              Layout scheme
              <InfoTip label="About the layout scheme">
                Each section is a container (width, background, padding) with 1–3 columns. Drag the grip to reorder sections, or move
                components within and between columns. Click a section or a component to edit it below.
              </InfoTip>
            </h2>
            <Scheme layout={layout} update={update} updateWithUndo={updateWithUndo} selection={selection} select={setSelection} />
          </section>
          <Inspector layout={layout} selection={selection} onClose={() => setSelection(null)} update={update} />
        </div>

        <div className="order-1 min-w-0 space-y-2 lg:sticky lg:top-28 lg:order-2">
          <div className="flex items-center justify-end gap-2 px-1">
            <Switch id="combiner-guides" checked={guides} onCheckedChange={setGuides} />
            <Label htmlFor="combiner-guides" className="text-xs">
              Show section &amp; column guides
            </Label>
          </div>
          <CombinedPreview layout={layout} guides={guides} />
        </div>
      </div>
    </div>
  )
}
