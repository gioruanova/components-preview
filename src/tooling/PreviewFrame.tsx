import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import Frame, { useFrame } from 'react-frame-component'
import { Monitor, PackageOpen, Smartphone, Tablet } from 'lucide-react'
import poppins400 from '@fontsource/poppins/400.css?inline'
import poppins600 from '@fontsource/poppins/600.css?inline'
import poppins700 from '@fontsource/poppins/700.css?inline'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export const VIEWPORTS = [
  { id: 'desktop', label: 'Desktop', width: 1280, icon: Monitor },
  { id: 'tablet', label: 'Tablet', width: 768, icon: Tablet },
  { id: 'mobile', label: 'Mobile', width: 375, icon: Smartphone },
] as const

type ViewportId = (typeof VIEWPORTS)[number]['id']

const FRAME_BASE_CSS = `
  *, *::before, *::after { box-sizing: border-box; }
  html, body { margin: 0; background: #fff; }
  body { font-family: 'Poppins', system-ui, sans-serif; color: #222; padding: 32px 24px; }
  img { max-width: 100%; }
`
const INITIAL = '<!DOCTYPE html><html><head></head><body><div id="frame-root"></div></body></html>'
const MIN_HEIGHT = 320

/** Reports the iframe document height so the frame grows with its content. */
function AutoHeight({ onHeight, children }: { onHeight: (h: number) => void; children: ReactNode }) {
  const { window: win } = useFrame()
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || !win) return
    // Observe our own wrapper (the frame swaps its document after mount) and add the body padding.
    const measure = () => {
      const body = win.getComputedStyle(el.ownerDocument.body)
      onHeight(Math.ceil(el.getBoundingClientRect().height + parseFloat(body.paddingTop) + parseFloat(body.paddingBottom)))
    }
    const RO = (win as Window & { ResizeObserver: typeof ResizeObserver }).ResizeObserver
    const ro = new RO(measure)
    ro.observe(el)
    measure()
    return () => ro.disconnect()
  }, [win, onHeight])
  return <div ref={ref}>{children}</div>
}

type Props = {
  styles: string
  empty?: boolean
  children: ReactNode
}

export function PreviewFrame({ styles, empty, children }: Props) {
  const [viewport, setViewport] = useState<ViewportId>('desktop')
  const [available, setAvailable] = useState(800)
  const [contentHeight, setContentHeight] = useState(MIN_HEIGHT)
  const stageRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = stageRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setAvailable(entry.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const width = VIEWPORTS.find((v) => v.id === viewport)!.width
  const scale = Math.min(1, available / width)
  const height = Math.max(MIN_HEIGHT, contentHeight)

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-green opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-brand-green" />
          </span>
          <span className="text-sm font-semibold">Live preview</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden font-mono text-xs text-muted-foreground sm:inline">
            {width}px · {Math.round(scale * 100)}%
          </span>
          <ToggleGroup type="single" variant="outline" size="sm" value={viewport} onValueChange={(v) => v && setViewport(v as ViewportId)}>
            {VIEWPORTS.map(({ id, label, icon: Icon }) => (
              <Tooltip key={id}>
                <TooltipTrigger asChild>
                  <ToggleGroupItem value={id} aria-label={label} className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                    <Icon />
                    <span className="hidden xl:inline">{label}</span>
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent>{label}</TooltipContent>
              </Tooltip>
            ))}
          </ToggleGroup>
        </div>
      </div>

      {/* Capped height on desktop so the sticky preview never overflows the screen */}
      <div
        ref={stageRef}
        className="overflow-y-auto bg-[radial-gradient(circle,_#d6dee6_1px,_transparent_1px)] bg-[size:16px_16px] [scrollbar-gutter:stable] lg:max-h-[calc(100svh-11rem)]"
      >
        {empty ? (
          <div className="grid min-h-80 place-items-center p-6">
            <div className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-muted-foreground/30 bg-card/80 px-8 py-10 text-center">
              <PackageOpen className="size-8 text-muted-foreground" />
              <p className="font-semibold">Component empty/removed</p>
              <p className="max-w-64 text-sm text-muted-foreground">Every option is turned off, so the widget is removed from the page.</p>
            </div>
          </div>
        ) : (
          <div className="mx-auto transition-[width,height] duration-300" style={{ width: width * scale, height: height * scale }}>
            <Frame
              title="Component preview"
              initialContent={INITIAL}
              mountTarget="#frame-root"
              head={<style>{poppins400 + poppins600 + poppins700 + FRAME_BASE_CSS + styles}</style>}
              className="block origin-top-left border-0 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.06)]"
              style={{ width, height, transform: `scale(${scale})` }}
            >
              <AutoHeight onHeight={setContentHeight}>{children}</AutoHeight>
            </Frame>
          </div>
        )}
      </div>
    </div>
  )
}
