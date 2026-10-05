import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { ArrowLeft, ArrowRight, Bot, Check, Code2, Layers, LayoutTemplate, Minus, PenTool, Puzzle, Route as RouteIcon, ShieldCheck, Sparkles, TriangleAlert, Wand2, X } from 'lucide-react'
import { Link } from 'react-router'
import logo from '@/assets/saffire-loog-blue.png'
import { cn } from '@/lib/utils'
import { TestingPocBadge } from '@/tooling/ui'
import { hasSeenBenchmark, markBenchmarkSeen } from './benchmarkVisit'

/**
 * Hidden presentation (/benchmark, not in the nav): why we built Components Live Preview vs market tools.
 * Navigate with ← / →, Space, Home / End, the buttons, swiping, or the progress bar at the bottom.
 */

type Mark = 'yes' | 'partial' | 'no'

const OURS = [
  { icon: ShieldCheck, title: 'Real Saffire output', text: 'Generates exactly what the platform uses — markup, styles, scripts and data — following our standards automatically.' },
  { icon: Wand2, title: 'Configure, don’t code', text: 'Options follow the platform split: client content, Saffire setup and styles. Anyone can try every variant live.' },
  {
    icon: Layers,
    title: 'Cross-referenced components',
    text: 'Every component knows which starter layouts use it, and mixes freely into page structures — sections, columns, header slot — across Mango, Cherry & co.',
  },
  { icon: Puzzle, title: 'Easy to grow', text: 'New components and variants plug in quickly and stay consistent with everything else.' },
  { icon: Sparkles, title: 'Skills that evolve', text: 'Saffire structures, standards and workflows captured as custom skills — learned once, applied every time, improved as we go.' },
]

const MARKET = [
  { icon: Code2, name: 'Storybook', good: 'Developer component catalog', gap: 'Shows code components, not configurable Saffire widgets. No Saffire-ready output, no client vs Saffire customization; every special design needs custom setup.' },
  { icon: PenTool, name: 'Figma (Dev Mode)', good: 'Visual design & specs', gap: 'Design specs, not platform output. Responsive, empty states and client edits aren’t real — custom designs drift from what ships.' },
  { icon: LayoutTemplate, name: 'Page builders (Webflow, Builder.io)', good: 'Visual page building', gap: 'Locked into their markup and options: can’t match Saffire’s output structure, standards or special designs. License cost + lock-in.' },
]

/** The hidden layer every market tool adds. */
const ADAPTING = {
  title: 'The hidden layer: adapting',
  text: 'None of them fits Saffire’s theme requirements 100%. Every theme, starter layout and special design means bending the tool — workarounds, custom setup, translating the output back to our structure — and that layer has to be built and maintained on every project.',
}

const TOOLS = ['Our tool', 'Storybook', 'Figma', 'Page builders'] as const
const ROWS: { label: string; marks: [Mark, Mark, Mark, Mark] }[] = [
  { label: 'Saffire-ready output', marks: ['yes', 'no', 'no', 'no'] },
  { label: 'Client vs Saffire customization', marks: ['yes', 'no', 'no', 'partial'] },
  { label: 'Platform rules (empty widgets, mobile, fixed header)', marks: ['yes', 'partial', 'no', 'partial'] },
  { label: 'Special / custom Saffire designs', marks: ['yes', 'partial', 'yes', 'partial'] },
  { label: 'Saffire standards & skills built in', marks: ['yes', 'no', 'no', 'no'] },
  { label: 'Fits Saffire themes without adapting', marks: ['yes', 'no', 'no', 'no'] },
]
const HIGHLIGHTS = ['Only option with Saffire-ready output', 'Built around how Saffire customizes', 'Evolves with our standards, not a vendor roadmap']

/** Featured: the agent builder. */
const AGENT = {
  title: 'Agent component builder',
  text: 'Describe a component — or point to a starter site — and an agent builds it on demand, the Saffire way.',
  points: [
    'Built on our skills: Saffire standards, structures and naming, applied from the first draft',
    'Knows the scope and boundaries of Spark — proposes only what the platform can deliver',
    'Consistent, tested, platform-ready components in hours instead of sprints',
    'Frees the team for what matters: special designs and real client needs',
  ],
}

const FUTURE = [
  { icon: RouteIcon, title: 'Bridge to production', text: 'Adopt the real source structure, export page layouts from the Layout builder, align with the design system.' },
  { icon: LayoutTemplate, title: 'Every starter mirrored', text: 'Signup, countdown, weather, event feeds… all starter-site components, standardized in one place.' },
]

const MARK_ICON: Record<Mark, ReactNode> = {
  yes: <Check className="size-4 text-[#2e7d32]" aria-label="Yes" />,
  partial: <Minus className="size-4 text-[#b4470e]" aria-label="Partly" />,
  no: <X className="size-4 text-[#c62828]" aria-label="No" />,
}

/** Stagger helper: each item enters a bit later. */
const delay = (i: number) => ({ animationDelay: `${120 + i * 70}ms` })

const SLIDES: { kicker: string; title: string; color: string; body: ReactNode }[] = [
  {
    kicker: '01 · Why we built it',
    title: 'Built for Saffire, by design',
    color: '#007bc7',
    body: (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {OURS.map(({ icon: Icon, title, text }, i) => (
          <div key={title} className="bm-item rounded-2xl border bg-white/80 p-5 shadow-sm backdrop-blur" style={delay(i)}>
            <span className="grid size-10 place-items-center rounded-xl bg-brand-sky text-brand-blue">
              <Icon className="size-5" />
            </span>
            <h3 className="mt-3 font-semibold text-brand-navy">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{text}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    kicker: '02 · Market solutions',
    title: 'Great tools — just not built for Saffire',
    color: '#f26922',
    body: (
      <div className="grid gap-3 lg:grid-cols-3">
        {MARKET.map(({ icon: Icon, name, good, gap }, i) => (
          <div key={name} className="bm-item flex flex-col rounded-2xl border bg-white/80 p-5 shadow-sm backdrop-blur" style={delay(i)}>
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-brand-orange/10 text-brand-orange">
                <Icon className="size-5" />
              </span>
              <h3 className="font-semibold text-brand-navy">{name}</h3>
            </div>
            <p className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-[#2e7d32]/10 px-2.5 py-0.5 text-xs font-semibold text-[#2e7d32]">
              <Check className="size-3.5" /> {good}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              <span className="font-semibold text-[#b4470e]">Not flexible enough for Saffire: </span>
              {gap}
            </p>
          </div>
        ))}
        <div className="bm-item flex gap-4 rounded-2xl border border-brand-orange/40 bg-brand-orange/10 p-5 lg:col-span-3" style={delay(MARKET.length)}>
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-orange text-white">
            <TriangleAlert className="size-5" />
          </span>
          <div>
            <h3 className="font-semibold text-brand-navy">{ADAPTING.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{ADAPTING.text}</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    kicker: '03 · Side by side',
    title: 'How they compare',
    color: '#66bb6a',
    body: (
      <div className="space-y-4">
        <div className="bm-item overflow-x-auto overflow-y-hidden rounded-2xl border bg-white/90 shadow-sm backdrop-blur" style={delay(0)}>
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b">
                <th className="p-3 text-left font-medium text-muted-foreground" />
                {TOOLS.map((t, i) => (
                  <th key={t} className={cn('p-3 text-center font-semibold text-brand-navy', i === 0 && 'bg-brand-sky/70')}>
                    {t}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r, ri) => (
                <tr key={r.label} className="bm-item border-b last:border-0" style={delay(ri + 1)}>
                  <td className="p-3 text-left font-medium">{r.label}</td>
                  {r.marks.map((m, i) => (
                    <td key={i} className={cn('p-3', i === 0 && 'bg-brand-sky/40')}>
                      <span className="flex justify-center">{MARK_ICON[m]}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap gap-2">
          {HIGHLIGHTS.map((h, i) => (
            <span key={h} className="bm-item inline-flex items-center gap-1.5 rounded-full bg-[#66bb6a]/15 px-3 py-1.5 text-sm font-semibold text-[#2e7d32]" style={delay(ROWS.length + 1 + i)}>
              <Sparkles className="size-4" /> {h}
            </span>
          ))}
        </div>
      </div>
    ),
  },
  {
    kicker: '04 · What’s next',
    title: 'An open roadmap',
    color: '#8e44ad',
    body: (
      <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr]">
        {/* featured: the agent builder */}
        <div className="bm-item relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#8e44ad] to-[#5b2a91] p-6 text-white shadow-lg" style={delay(0)}>
          <span aria-hidden className="absolute -top-10 -right-10 size-40 rounded-full bg-white/10" />
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-white/15">
              <Bot className="size-6" />
            </span>
            <h3 className="text-xl font-bold">{AGENT.title}</h3>
          </div>
          <p className="mt-3 text-white/90">{AGENT.text}</p>
          <ul className="mt-4 space-y-2">
            {AGENT.points.map((p, i) => (
              <li key={p} className="bm-item flex gap-2 text-sm" style={delay(i + 1)}>
                <Check className="mt-0.5 size-4 shrink-0 text-[#d9b8f5]" /> {p}
              </li>
            ))}
          </ul>
        </div>
        <ol className="grid gap-3">
          {FUTURE.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="bm-item flex gap-4 rounded-2xl border bg-white/80 p-5 shadow-sm backdrop-blur" style={delay(i + AGENT.points.length + 1)}>
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#8e44ad]/10 text-[#8e44ad]">
                <Icon className="size-5" />
              </span>
              <div>
                <h3 className="font-semibold text-brand-navy">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    ),
  },
]

const STYLES = `
  @keyframes bm-in-next { from { opacity: 0; transform: translateX(48px); } to { opacity: 1; transform: none; } }
  @keyframes bm-in-prev { from { opacity: 0; transform: translateX(-48px); } to { opacity: 1; transform: none; } }
  @keyframes bm-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
  @keyframes bm-float { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(-30px, 20px) scale(1.08); } }
  .bm-slide-next { animation: bm-in-next 0.5s cubic-bezier(.2,.7,.2,1) both; }
  .bm-slide-prev { animation: bm-in-prev 0.5s cubic-bezier(.2,.7,.2,1) both; }
  .bm-item { animation: bm-rise 0.5s cubic-bezier(.2,.7,.2,1) both; }
  .bm-blob { animation: bm-float 14s ease-in-out infinite; transition: background-color 0.7s ease; }
  @media (prefers-reduced-motion: reduce) {
    .bm-slide-next, .bm-slide-prev, .bm-item { animation-name: bm-fade; animation-duration: 0.2s; }
    .bm-blob { animation: none; }
    @keyframes bm-fade { from { opacity: 0; } to { opacity: 1; } }
  }
`

export function BenchmarkPage() {
  const [index, setIndex] = useState(0)
  // read before marking as seen: first-time visitors get "Explore the tool" (and no header link)
  const [firstVisit] = useState(() => !hasSeenBenchmark())
  const [direction, setDirection] = useState<'next' | 'prev'>('next')
  const last = SLIDES.length - 1
  const slide = SLIDES[index]

  const go = useCallback(
    (to: number) => {
      const next = Math.max(0, Math.min(last, to))
      if (next === index) return
      setDirection(next > index ? 'next' : 'prev')
      setIndex(next)
    },
    [index, last],
  )

  // keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (['ArrowRight', 'PageDown', ' '].includes(e.key)) (e.preventDefault(), go(index + 1))
      else if (['ArrowLeft', 'PageUp'].includes(e.key)) (e.preventDefault(), go(index - 1))
      else if (e.key === 'Home') go(0)
      else if (e.key === 'End') go(last)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, index, last])

  // swipe
  const startX = useRef<number | null>(null)

  useEffect(() => {
    document.title = 'Benchmark · Components Live Preview'
    markBenchmarkSeen() // first-time visitors land here once; afterwards the tool starts at home
  }, [])

  return (
    <div
      className="relative flex min-h-dvh flex-col overflow-hidden bg-[#f6fafd] text-foreground select-none"
      onPointerDown={(e) => (startX.current = e.clientX)}
      onPointerUp={(e) => {
        if (startX.current === null) return
        const dx = e.clientX - startX.current
        startX.current = null
        if (Math.abs(dx) > 60) go(index + (dx < 0 ? 1 : -1))
      }}
    >
      <style>{STYLES}</style>
      {/* soft background blob tinted with the slide color */}
      <div aria-hidden className="bm-blob pointer-events-none absolute -top-40 -right-40 size-[560px] rounded-full opacity-20 blur-3xl" style={{ backgroundColor: slide.color }} />
      <div aria-hidden className="bm-blob pointer-events-none absolute -bottom-48 -left-40 size-[420px] rounded-full opacity-10 blur-3xl" style={{ backgroundColor: slide.color, animationDelay: '-7s' }} />

      <header className="relative z-10 flex items-center justify-between gap-3 px-5 py-4 sm:px-10">
        <div className="flex items-center gap-3">
          <img src={logo} alt="" className="h-7 w-auto" />
          <span className="hidden text-sm font-semibold text-brand-navy sm:inline">Components Live Preview · Benchmark</span>
          <TestingPocBadge />
        </div>
        {!firstVisit && (
          <Link to="/" className="text-sm font-medium text-brand-blue hover:underline">
            Back to the tool
          </Link>
        )}
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-5 pb-28 sm:px-10">
        <section key={index} aria-roledescription="slide" aria-label={`${index + 1} of ${SLIDES.length}: ${slide.title}`} className={direction === 'next' ? 'bm-slide-next' : 'bm-slide-prev'}>
          <p className="bm-item text-sm font-bold tracking-widest uppercase" style={{ color: slide.color, animationDelay: '0ms' }}>
            {slide.kicker}
          </p>
          <h1 className="bm-item mt-2 mb-8 text-3xl font-bold tracking-tight text-brand-navy sm:text-5xl" style={{ animationDelay: '60ms' }}>
            {slide.title}
          </h1>
          {slide.body}
          {index === last && (
            <div className="bm-item mt-8 flex justify-center" style={{ animationDelay: '700ms' }}>
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
                style={{ backgroundColor: slide.color }}
              >
                {firstVisit ? 'Explore the tool' : 'Back to the tool'} <ArrowRight className="size-4" />
              </Link>
            </div>
          )}
        </section>
      </main>

      {/* controls + progress bar (fill grows and changes color per slide) */}
      <footer className="fixed inset-x-0 bottom-0 z-20 bg-[#f6fafd]/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3 sm:px-10">
          <span className="font-mono text-xs text-muted-foreground tabular-nums">
            {String(index + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
          </span>
          <div className="flex items-center gap-2">
            <NavButton label="Previous slide" disabled={index === 0} onClick={() => go(index - 1)}>
              <ArrowLeft className="size-4" />
            </NavButton>
            <NavButton label="Next slide" disabled={index === last} onClick={() => go(index + 1)} color={slide.color}>
              <ArrowRight className="size-4" />
            </NavButton>
          </div>
        </div>
        <div className="relative h-1.5 bg-black/5">
          <div
            className="absolute inset-y-0 left-0 rounded-r-full transition-all duration-700 ease-out"
            style={{ width: `${((index + 1) / SLIDES.length) * 100}%`, backgroundColor: slide.color }}
          />
          <div className="absolute inset-0 flex" role="tablist" aria-label="Slides">
            {SLIDES.map((s, i) => (
              <button
                key={s.title}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`${i + 1}. ${s.title}`}
                title={s.title}
                onClick={() => go(i)}
                className="-mt-2 h-4 flex-1 border-r border-white/60 last:border-0 focus-visible:outline-2 focus-visible:outline-brand-blue"
              />
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}

function NavButton({ label, disabled, onClick, color, children }: { label: string; disabled: boolean; onClick: () => void; color?: string; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn('grid size-9 place-items-center rounded-full border bg-white shadow-sm transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-40', color && 'border-transparent text-white')}
      style={color ? { backgroundColor: color } : undefined}
    >
      {children}
    </button>
  )
}
