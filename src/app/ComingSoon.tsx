import { ArrowLeft, Folder, Hourglass } from 'lucide-react'
import { Link } from 'react-router'
import type { RegisteredCategory } from '@/tooling/registry'
import type { StarterLayoutId } from '@/tooling/starterLayouts'
import { StarterLayoutUsage } from '@/tooling/StarterLayoutUsage'

const QUIPS = [
  'This component is in a superposition of done and not done. Observing it collapses it into a sprint ticket.',
  'git push --force-with-hope origin coming-soon',
  'while (!ready) { coffee++; pixels.align(); }',
  '404: Component not found (yet). Our elves are hand-crafting the CSS, one flexbox at a time.',
  'Compiling… 42% done. The remaining 58% is still in a stand-up.',
  'The flux capacitor is charging. ETA: exactly when it’s ready.',
  'We asked the AI to build it. It replied with a haiku. We’re building it ourselves.',
  'Loading module… please do not unplug the mainframe.',
  'It works on my machine. Now we’re making it work on yours.',
  'Currently refactoring the space-time continuum for better responsive breakpoints.',
]

/** Same quip for the same page, so it doesn't change on every render. */
function quipFor(key: string) {
  let h = 0
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return QUIPS[h % QUIPS.length]
}

export function ComingSoon({
  category,
  name,
  summary,
  starterLayouts,
}: {
  category: RegisteredCategory
  name: string
  summary?: string
  starterLayouts?: StarterLayoutId[]
}) {
  const Icon = category.icon ?? Folder
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-')

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm sm:p-10">
        <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-brand-sky blur-3xl" />
        <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_minmax(0,460px)]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-orange/10 px-3 py-1 text-xs font-bold tracking-wide text-[#b4470e] uppercase">
              <Hourglass className="size-3.5 animate-[spin_3s_linear_infinite]" /> Coming soon
            </span>
            <h1 className="mt-4 flex items-center gap-3 text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand-sky text-brand-blue">
                <Icon className="size-6" />
              </span>
              {name}
            </h1>
            <p className="mt-3 max-w-xl text-lg text-muted-foreground">{summary ?? category.description}</p>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              This page will get the full live preview — configuration, viewports and code output — as soon as the component lands.
            </p>
            <Link to="/" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-brand-blue hover:underline">
              <ArrowLeft className="size-4" /> Back to the overview
            </Link>
          </div>

          <figure className="overflow-hidden rounded-xl bg-[#011627] font-mono text-[13px] text-[#d6deeb] shadow-lg" aria-label="Build status">
            <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
              <span className="size-2.5 rounded-full bg-[#ff5f57]" />
              <span className="size-2.5 rounded-full bg-[#febc2e]" />
              <span className="size-2.5 rounded-full bg-[#28c840]" />
              <span className="ml-2 text-xs text-white/40">~/saffire/widgets/{category.slug}</span>
            </div>
            <div className="space-y-1.5 p-4">
              <p>
                <span className="text-[#7fdbca]">$</span> npm run build {slug}
              </p>
              <p className="text-white/60">› resolving dependencies… ok</p>
              <p className="text-white/60">› generating pixels… ok</p>
              <p className="text-[#ffcb8b]">⚠ {quipFor(category.slug + slug)}</p>
              <div className="pt-2" role="progressbar" aria-label="Build progress" aria-valuetext="In progress">
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-1/3 animate-[soon_1.8s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-brand-blue to-brand-orange" />
                </div>
              </div>
              <p>
                <span className="text-[#7fdbca]">$</span> <span className="inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-[#d6deeb]" />
              </p>
            </div>
          </figure>
        </div>
      </div>
      <StarterLayoutUsage layouts={starterLayouts} />
    </div>
  )
}
