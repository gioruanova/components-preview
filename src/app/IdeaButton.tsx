import { Lightbulb, Rocket } from 'lucide-react'
import { toast } from 'sonner'

/** Floating "component idea" button: icon only; the text slides out on hover/focus. Click → toast. */
export function IdeaButton() {
  return (
    <button
      type="button"
      onClick={() =>
        toast('Coming soon!', {
          id: 'idea',
          description: "We're building this feature — soon you'll be able to send us your component ideas right from here.",
          icon: <Rocket className="size-4 text-brand-orange" />,
        })
      }
      aria-label="Do you have a component idea? Let us know and we'll build it"
      className="group fixed right-5 bottom-5 z-50 flex items-center gap-3 focus-visible:outline-none"
    >
      <span
        aria-hidden
        className="pointer-events-none max-w-0 translate-x-3 overflow-hidden rounded-full bg-brand-navy py-2.5 text-sm font-medium whitespace-nowrap text-white opacity-0 shadow-lg transition-all duration-300 ease-out group-hover:max-w-[min(40rem,calc(100vw-7rem))] group-hover:translate-x-0 group-hover:px-4 group-hover:opacity-100 group-focus-visible:max-w-[min(40rem,calc(100vw-7rem))] group-focus-visible:translate-x-0 group-focus-visible:px-4 group-focus-visible:opacity-100 max-sm:hidden"
      >
        Do you have any component idea? <span className="text-brand-orange">Let us know</span> and we build it
      </span>
      <span className="relative grid size-14 shrink-0 place-items-center rounded-full bg-brand-orange text-white shadow-lg ring-4 ring-white transition-transform duration-300 group-hover:scale-105 group-hover:rotate-[-8deg] group-focus-visible:ring-brand-blue/50 group-active:scale-95">
        <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-brand-orange opacity-25 [animation-duration:2.5s]" />
        <Lightbulb className="relative size-6" />
      </span>
    </button>
  )
}
