import { useEffect, useSyncExternalStore } from 'react'
import { ExternalLink, Navigation, X } from 'lucide-react'

/**
 * Centered, non-modal notification with a confetti burst. Used for button clicks inside previews.
 * Call `notifyCenter(...)` from anywhere; `<CenterNotice />` is mounted once in the app layout.
 */
type Notice = { id: number; kind: 'internal' | 'external'; title: string; url: string }

const VISIBLE_MS = 3500
const BRAND = ['#007bc7', '#0081d1', '#003c61', '#f26922', '#66bb6a', '#daf1ff']

let current: Notice | null = null
let timer: number | undefined
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

function close() {
  current = null
  window.clearTimeout(timer)
  emit()
}

export function notifyCenter(kind: Notice['kind'], title: string, url: string) {
  current = { id: Date.now(), kind, title, url }
  window.clearTimeout(timer)
  timer = window.setTimeout(close, VISIBLE_MS)
  emit()
  // loaded on first click only (keeps it out of the main bundle)
  void import('canvas-confetti').then(({ default: confetti }) => {
    const base = { disableForReducedMotion: true, colors: BRAND, zIndex: 70, origin: { x: 0.5, y: 0.5 } }
    confetti({ ...base, particleCount: 110, spread: 80, startVelocity: 38 })
    window.setTimeout(() => confetti({ ...base, particleCount: 70, spread: 120, startVelocity: 26, scalar: 0.8 }), 160)
  })
}

export function CenterNotice() {
  const notice = useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => current,
  )

  useEffect(() => {
    if (!notice) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [notice])

  const external = notice?.kind === 'external'
  const Icon = external ? ExternalLink : Navigation

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-0 z-[60] grid place-items-center p-4">
      {notice && (
        <div
          key={notice.id}
          role="status"
          className="pointer-events-auto relative w-full max-w-sm animate-in rounded-2xl border bg-card p-6 text-center shadow-2xl duration-300 zoom-in-90 fade-in"
        >
          <button type="button" onClick={close} aria-label="Close" className="absolute top-3 right-3 grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-muted">
            <X className="size-4" />
          </button>
          <span
            className={`mx-auto grid size-14 place-items-center rounded-full ${external ? 'bg-brand-orange/10 text-brand-orange' : 'bg-brand-sky text-brand-blue'}`}
          >
            <Icon className="size-7" />
          </span>
          <p className="mt-3 text-lg font-bold text-brand-navy">{notice.title}</p>
          <p className="mt-1 truncate font-mono text-xs text-muted-foreground" title={notice.url}>
            {notice.url || '(no URL)'}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">Preview only — nothing was opened.</p>
        </div>
      )}
    </div>
  )
}
