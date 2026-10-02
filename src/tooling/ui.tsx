import { Badge } from '@/components/ui/badge'
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
