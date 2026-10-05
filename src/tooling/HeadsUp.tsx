import { Lightbulb } from 'lucide-react'

export type HeadsUpNote = { quote: string; note: string }

/**
 * A friendly heads-up quote for a whole category (`headsUp` in category.ts). Shown on the category overview and on
 * every component page of that category.
 */
export function HeadsUp({ headsUp }: { headsUp?: HeadsUpNote }) {
  if (!headsUp) return null
  return (
    <figure className="flex gap-3 rounded-xl border border-l-4 border-l-brand-orange bg-brand-orange/5 p-4">
      <Lightbulb aria-hidden className="mt-0.5 size-5 shrink-0 text-brand-orange" />
      <div>
        <blockquote className="text-[15px] font-semibold text-brand-navy italic">“{headsUp.quote}”</blockquote>
        <figcaption className="mt-1 text-sm text-muted-foreground">
          <span className="font-semibold text-[#b4470e]">Heads-up: </span>
          {headsUp.note}
        </figcaption>
      </div>
    </figure>
  )
}
