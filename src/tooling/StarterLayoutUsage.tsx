import { LayoutTemplate } from 'lucide-react'
import { cn } from '@/lib/utils'
import { STARTER_LAYOUTS, type StarterLayoutId } from './starterLayouts'

/** One starter layout pill (colors come from STARTER_LAYOUTS); links to its mirror site in a new tab. */
export function StarterLayoutPill({ id }: { id: StarterLayoutId }) {
  const s = STARTER_LAYOUTS[id]
  return (
    <a
      href={s.url}
      target="_blank"
      rel="noopener noreferrer"
      title={`Open the ${s.name} starter site (new tab)`}
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition hover:brightness-95 hover:underline"
      style={{ background: s.background, color: s.text }}
    >
      <span aria-hidden className="size-2 rounded-full" style={{ background: s.color }} />
      {s.name}
    </a>
  )
}

/** "Starter layout usage" section: which starter layouts use this component. Renders nothing for an empty list. */
export function StarterLayoutUsage({ layouts, className }: { layouts?: readonly StarterLayoutId[]; className?: string }) {
  if (!layouts?.length) return null
  return (
    <section className={cn('rounded-xl border bg-card p-5 shadow-sm', className)} aria-labelledby="starter-layout-usage">
      <h2 id="starter-layout-usage" className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-wide text-brand-blue uppercase">
        <LayoutTemplate className="size-4" /> Starter layout usage
      </h2>
      <ul className="flex flex-wrap gap-2">
        {layouts.map((id) => (
          <li key={id}>
            <StarterLayoutPill id={id} />
          </li>
        ))}
      </ul>
    </section>
  )
}
