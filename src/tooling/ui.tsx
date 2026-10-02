import type { ReactNode } from 'react'
import { FlaskConical, Info } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { Status } from './types'

const STATUS_STYLES: Record<Status, string> = {
  stable: 'bg-brand-green/15 text-[#2e7d32] border-brand-green/30',
  beta: 'bg-brand-sky text-brand-blue-dark border-brand-blue/20',
  draft: 'bg-muted text-muted-foreground border-border',
  deprecated: 'bg-brand-orange/10 text-brand-orange border-brand-orange/30',
}

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  return (
    <Badge variant="outline" className={cn('capitalize', STATUS_STYLES[status], className)}>
      {status}
    </Badge>
  )
}

/** Small "i" icon that explains something on hover/focus. Safe to place inside other buttons (renders a span). */
export function InfoTip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          role="img"
          tabIndex={0}
          aria-label={label}
          onClick={(e) => e.stopPropagation()}
          className="inline-grid size-5 cursor-help place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-brand-blue focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <Info className="size-3.5" />
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-72 text-[13px] leading-snug">
        {children}
      </TooltipContent>
    </Tooltip>
  )
}

/** Renders `backtick` segments as inline code. */
export function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split(/(`[^`]+`)/g).map((part, i) =>
        part.startsWith('`') ? (
          <code key={i} className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em] text-brand-navy">
            {part.slice(1, -1)}
          </code>
        ) : (
          part
        ),
      )}
    </>
  )
}

/** Marks experimental features. */
export function TestingPocBadge({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-brand-orange/40 bg-brand-orange/10 px-2.5 py-0.5 text-xs font-bold tracking-wide text-[#b4470e] uppercase ${className}`}
    >
      <FlaskConical className="size-3.5" /> Testing POC
    </span>
  )
}
