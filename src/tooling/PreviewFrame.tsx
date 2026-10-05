import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import Frame, { useFrame } from 'react-frame-component'
import { Maximize2, Monitor, PackageOpen, Smartphone, Tablet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { cn } from '@/lib/utils'
import { useViewport } from './viewport'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

const VIEWPORTS = [
  { id: 'desktop', label: 'Desktop', width: 1280, icon: Monitor },
  { id: 'tablet', label: 'Tablet', width: 768, icon: Tablet },
  { id: 'mobile', label: 'Mobile', width: 375, icon: Smartphone },
] as const

type ViewportId = (typeof VIEWPORTS)[number]['id']

const FRAME_BASE_CSS = `
  *, *::before, *::after { box-sizing: border-box; }
  html, body { margin: 0; background: #fff; }
  body { font-family: 'Poppins', system-ui, sans-serif; color: #222; }
  img { max-width: 100%; }
`
/** Every font offered by the typography control (latin subset; files load only when used). */
const FONT_CSS = Object.values(
  import.meta.glob<string>(
    [
      '/node_modules/@fontsource/{poppins,open-sans,montserrat,inter,playfair-display}/latin-{300,400,500,600,700,800}.css',
      '/node_modules/@fontsource/{poppins,open-sans,montserrat,inter,playfair-display}/latin-{400,700}-italic.css',
    ],
    { query: '?inline', import: 'default', eager: true },
  ),
).join('\n')

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

/** Tracks an element's content width. Callback ref, so it also works for elements mounted later (dialog content). */
function useWidth<T extends HTMLElement>(initial: number) {
  const [el, setEl] = useState<T | null>(null)
  const [width, setWidth] = useState(initial)
  useLayoutEffect(() => {
    if (!el) return
    setWidth(el.getBoundingClientRect().width)
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [el])
  return [setEl, width] as const
}

/** The iframe itself, at a given CSS width, optionally scaled down to fit. Grows with its content. */
function FrameView({ css, width, scale = 1, interactive = true, children }: { css: string; width: number; scale?: number; interactive?: boolean; children: ReactNode }) {
  const [contentHeight, setContentHeight] = useState(MIN_HEIGHT)
  const height = Math.max(MIN_HEIGHT, contentHeight)
  return (
    <div className="mx-auto transition-[height] duration-300" style={{ width: width * scale, height: height * scale }}>
      <Frame
        title="Component preview"
        initialContent={INITIAL}
        mountTarget="#frame-root"
        head={
          <>
            <style>{FONT_CSS + FRAME_BASE_CSS}</style>
            <style>{css}</style>
          </>
        }
        className="block origin-top-left border-0 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.06)]"
        style={{ width, height, transform: scale === 1 ? undefined : `scale(${scale})`, pointerEvents: interactive ? undefined : 'none' }}
      >
        <AutoHeight onHeight={setContentHeight}>{children}</AutoHeight>
      </Frame>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="grid min-h-80 place-items-center p-6">
      <div className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-muted-foreground/30 bg-card/80 px-8 py-10 text-center">
        <PackageOpen className="size-8 text-muted-foreground" />
        <p className="font-semibold">Component empty/removed</p>
        <p className="max-w-64 text-sm text-muted-foreground">Every option is turned off, so the widget is removed from the page.</p>
      </div>
    </div>
  )
}

function ViewportToggle({ value, onChange }: { value: ViewportId | null; onChange: (v: ViewportId) => void }) {
  const { viewports } = useViewport()
  return (
    <ToggleGroup type="single" variant="outline" size="sm" value={value ?? ''} onValueChange={(v) => v && onChange(v as ViewportId)}>
      {VIEWPORTS.filter((v) => viewports.includes(v.id)).map(({ id, label, icon: Icon }) => (
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
  )
}

const MIN_POPUP_WIDTH = 320

/** Large popup with a freely resizable viewport (drag the side handles) and preset widths. */
function PreviewDialog({ open, onOpenChange, css, empty, children }: Props & { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [stageRef, available] = useWidth<HTMLDivElement>(1200)
  const [width, setWidth] = useState<number | null>(null) // null = fit available width
  const [dragging, setDragging] = useState(false)
  const max = Math.max(MIN_POPUP_WIDTH, Math.floor(available - 48))
  const current = Math.min(width ?? max, max)
  const preset = VIEWPORTS.find((v) => v.width === current)?.id ?? null

  const startDrag = (side: 1 | -1) => (e: ReactPointerEvent) => {
    e.preventDefault()
    const startX = e.clientX
    const startW = current
    setDragging(true)
    const move = (ev: PointerEvent) => {
      // the frame is centered, so each side moves by half the width change
      const next = startW + side * (ev.clientX - startX) * 2
      setWidth(Math.round(Math.min(max, Math.max(MIN_POPUP_WIDTH, next))))
    }
    const up = () => {
      setDragging(false)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  const handle = (side: 1 | -1) => (
    <button
      type="button"
      aria-label={side === 1 ? 'Resize from the right' : 'Resize from the left'}
      onPointerDown={startDrag(side)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          e.preventDefault()
          const dir = (e.key === 'ArrowRight' ? 1 : -1) * side
          setWidth(Math.min(max, Math.max(MIN_POPUP_WIDTH, current + dir * 20)))
        }
      }}
      className="group absolute top-0 bottom-0 z-10 flex w-4 cursor-ew-resize items-center justify-center focus-visible:outline-none"
      style={side === 1 ? { right: -16 } : { left: -16 }}
    >
      <span className="h-12 w-1.5 rounded-full bg-muted-foreground/40 transition-colors group-hover:bg-brand-blue group-focus-visible:bg-brand-blue" />
    </button>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[92vh] w-[96vw] max-w-[96vw] flex-col gap-0 overflow-hidden p-0 sm:max-w-[96vw]">
        <DialogHeader className="flex-row flex-wrap items-center gap-3 border-b px-4 py-3 pr-12">
          <DialogTitle className="text-base">Live preview</DialogTitle>
          <DialogDescription className="sr-only">Resizable preview of the component. Drag the side handles or pick a preset width.</DialogDescription>
          <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs tabular-nums">{current}px</span>
          <div className="ml-auto flex items-center gap-2">
            <ViewportToggle value={preset} onChange={(id) => setWidth(VIEWPORTS.find((v) => v.id === id)!.width)} />
            <Button variant="outline" size="sm" onClick={() => setWidth(null)} aria-pressed={width === null}>
              Fit
            </Button>
          </div>
        </DialogHeader>
        <div
          ref={stageRef}
          className={cn('flex-1 overflow-auto bg-[radial-gradient(circle,_#d6dee6_1px,_transparent_1px)] bg-[size:16px_16px] py-6', dragging && 'cursor-ew-resize select-none')}
        >
          {empty ? (
            <EmptyState />
          ) : (
            <div className="relative mx-auto" style={{ width: current }}>
              {handle(-1)}
              <FrameView css={css} width={current} interactive={!dragging}>
                {children}
              </FrameView>
              {handle(1)}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

type Props = {
  /** Generated widget CSS (see tooling/output.ts). */
  css: string
  empty?: boolean
  children: ReactNode
}

export function PreviewFrame({ css, empty, children }: Props) {
  // shared with responsive fields: previewing Tablet = editing Tablet values
  const { viewport, setViewport } = useViewport()
  const [stageRef, available] = useWidth<HTMLDivElement>(800)
  const [popup, setPopup] = useState(false)

  const width = VIEWPORTS.find((v) => v.id === viewport)!.width
  const scale = Math.min(1, available / width)

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
          <ViewportToggle value={viewport} onChange={setViewport} />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" className="size-8" onClick={() => setPopup(true)} aria-label="Open preview in a resizable window">
                <Maximize2 />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Open in a resizable window</TooltipContent>
          </Tooltip>
        </div>
      </div>
      <PreviewDialog open={popup} onOpenChange={setPopup} css={css} empty={empty}>
        {children}
      </PreviewDialog>

      {/* Capped height on desktop so the sticky preview never overflows the screen */}
      <div
        ref={stageRef}
        className="overflow-y-auto bg-[radial-gradient(circle,_#d6dee6_1px,_transparent_1px)] bg-[size:16px_16px] [scrollbar-gutter:stable] lg:max-h-[calc(100svh-12rem)]"
      >
        {empty ? (
          <EmptyState />
        ) : (
          <FrameView css={css} width={width} scale={scale}>
            {children}
          </FrameView>
        )}
      </div>
    </div>
  )
}
