import { ArrowRight, Code2, Folder, Layers, LayoutPanelTop, MonitorSmartphone, Puzzle, SlidersHorizontal, Users } from 'lucide-react'
import { Link } from 'react-router'
import { categories } from '@/tooling/registry'
import { StatusBadge, TestingPocBadge } from '@/tooling/ui'
import { SoonBadge } from './pages'

const GOALS = [
  {
    icon: Layers,
    title: 'One source of truth',
    text: 'Every Saffire widget and its variants in one place, with a clear functional description of what it does and how it behaves.',
  },
  {
    icon: SlidersHorizontal,
    title: 'Configure live',
    text: 'Change content, behavior and styles and watch the component update instantly. No build, no deploy.',
  },
  {
    icon: MonitorSmartphone,
    title: 'Every screen size',
    text: 'Preview each component on Desktop, Tablet and Mobile to see exactly how it responds.',
  },
  {
    icon: Code2,
    title: 'Ready-to-use code',
    text: 'Copy HTML, SCSS / CSS (with variables for colors, fonts and sizes), Script and Data generated from your configuration.',
  },
  {
    icon: Users,
    title: 'A shared language',
    text: 'Product, design, support and development look at the same thing when talking about a component.',
  },
  {
    icon: Puzzle,
    title: 'Built to grow',
    text: 'New components and whole component families are added from a short spec, keeping the same consistent experience.',
  },
]

const STEPS = [
  { n: 1, title: 'Pick a component', text: 'Browse by family in the sidebar or the tabs above.' },
  { n: 2, title: 'Configure it', text: 'A · Content, B · Widget configuration, C · Styles.' },
  { n: 3, title: 'Check every viewport', text: 'Switch between Desktop, Tablet and Mobile.' },
  { n: 4, title: 'Copy the code', text: 'HTML, SCSS, CSS, Script and Data — one click each.' },
]

export function HomePage() {
  const total = categories.reduce((n, c) => n + c.widgets.length, 0)
  const planned = categories.reduce((n, c) => n + c.upcomingWidgets.length + (c.widgets.length || c.upcomingWidgets.length ? 0 : 1), 0)
  const first = categories[0]?.widgets[0]

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-navy via-brand-blue-dark to-brand-blue px-6 py-10 text-white shadow-lg sm:px-10 sm:py-14">
        <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-white/10 blur-2xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-32 left-1/3 size-80 rounded-full bg-brand-orange/20 blur-3xl" />
        <div className="relative max-w-3xl">
          <p className="mb-3 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide uppercase">
            {categories.length} families · {total} live components · {planned} coming soon
          </p>
          <h1 className="text-4xl leading-tight font-black tracking-tight sm:text-5xl">Components Live Preview</h1>
          <p className="mt-4 max-w-2xl text-lg text-white/85">
            Explore, configure and preview Saffire's website components in real time, then copy the exact code behind what you see.
          </p>
          {first && (
            <Link
              to={first.path}
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-brand-orange px-6 py-3 font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              Start exploring <ArrowRight className="size-4" />
            </Link>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold text-brand-navy">What this tool is for</h2>
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {GOALS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="rounded-xl border bg-card p-5 shadow-sm">
              <span className="mb-3 grid size-10 place-items-center rounded-lg bg-brand-sky text-brand-blue">
                <Icon className="size-5" />
              </span>
              <h3 className="font-semibold text-brand-navy">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold text-brand-navy">How it works</h2>
        <ol className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {STEPS.map((s) => (
            <li key={s.n} className="relative rounded-xl border bg-card p-5 shadow-sm">
              <span className="grid size-8 place-items-center rounded-full bg-brand-blue text-sm font-bold text-white">{s.n}</span>
              <h3 className="mt-3 font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <Link
        to="/combiner"
        className="group flex flex-col gap-4 rounded-2xl border border-brand-orange/30 bg-gradient-to-r from-brand-orange/10 to-brand-sky/40 p-6 shadow-sm transition hover:shadow-md sm:flex-row sm:items-center"
      >
        <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-white text-brand-blue shadow-sm">
          <LayoutPanelTop className="size-6" />
        </span>
        <span className="flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-lg font-bold text-brand-navy">Combiner</span>
            <TestingPocBadge />
          </span>
          <span className="mt-1 block text-sm text-muted-foreground">
            Build page sections with 1–3 columns, drop any component into them, rearrange with drag &amp; drop and preview the whole layout
            on every screen size. Saved in your browser.
          </span>
        </span>
        <ArrowRight className="size-5 text-brand-blue transition-transform group-hover:translate-x-1" />
      </Link>

      <section>
        <h2 className="mb-4 text-xl font-bold text-brand-navy">Component library</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {categories
            .filter((c) => c.widgets.length)
            .map((c) => (
              <div key={c.slug} className="rounded-xl border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <Link to={c.path} className="text-lg font-semibold text-brand-navy hover:text-brand-blue">
                    {c.name}
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    {c.widgets.length} component{c.widgets.length === 1 ? '' : 's'}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
                <ul className="mt-4 divide-y rounded-lg border">
                  {c.widgets.map((w) => (
                    <li key={w.slug}>
                      <Link to={w.path} className="group flex items-center gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-muted/60">
                        <span className="font-medium">{w.name}</span>
                        <StatusBadge status={w.status} />
                        <ArrowRight className="ml-auto size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brand-blue" />
                      </Link>
                    </li>
                  ))}
                  {c.upcomingWidgets.map((w) => (
                    <li key={w.slug}>
                      <Link to={w.path} className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted/60">
                        <span>{w.name}</span>
                        <SoonBadge />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </div>

        <h3 className="mt-8 mb-3 text-sm font-semibold tracking-wide text-muted-foreground uppercase">Coming soon</h3>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories
            .filter((c) => !c.widgets.length)
            .map((c) => {
              const Icon = c.icon ?? Folder
              return (
                <li key={c.slug}>
                  <Link to={c.path} className="flex h-full items-start gap-3 rounded-xl border border-dashed bg-card/60 p-4 transition hover:border-brand-orange/50 hover:bg-card">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-2 font-semibold text-brand-navy">
                        {c.name} <SoonBadge />
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {c.upcomingWidgets.length ? c.upcomingWidgets.map((w) => w.name).join(' · ') : c.description}
                      </span>
                    </span>
                  </Link>
                </li>
              )
            })}
        </ul>
      </section>
    </div>
  )
}
