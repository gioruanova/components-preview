import { ChevronRight } from 'lucide-react'
import { NavLink, useLocation } from 'react-router'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import { categories } from '@/tooling/registry'

/** Category → component tree, generated from the registry. */
export function SidebarTree({ onNavigate }: { onNavigate?: () => void }) {
  const { pathname } = useLocation()

  return (
    <nav aria-label="Components" className="space-y-1">
      <p className="px-3 pb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">Components</p>
      {categories.map((category) => {
        const inCategory = pathname === category.path || pathname.startsWith(`${category.path}/`)
        return (
          <Collapsible key={category.slug} defaultOpen className="group/cat">
            <div
              className={cn(
                'flex items-center rounded-lg transition-colors hover:bg-muted',
                inCategory && 'text-brand-navy',
              )}
            >
              <CollapsibleTrigger className="grid size-8 place-items-center rounded-md text-muted-foreground" aria-label={`Toggle ${category.name}`}>
                <ChevronRight className="size-4 transition-transform group-data-[state=open]/cat:rotate-90" />
              </CollapsibleTrigger>
              <NavLink to={category.path} end onClick={onNavigate} className="flex flex-1 items-center justify-between py-1.5 pr-3 text-sm font-semibold">
                {category.name}
                <span className="rounded-full bg-muted px-1.5 text-[11px] font-medium text-muted-foreground tabular-nums">{category.widgets.length}</span>
              </NavLink>
            </div>
            <CollapsibleContent>
              <ul className="my-1 ml-[15px] space-y-0.5 border-l pl-3">
                {category.widgets.map((w) => (
                  <li key={w.slug}>
                    <NavLink
                      to={w.path}
                      onClick={onNavigate}
                      className={({ isActive }) =>
                        cn(
                          '-ml-[13px] flex items-center gap-2 border-l-2 border-transparent py-1.5 pr-2 pl-3 text-sm text-muted-foreground transition-colors hover:text-foreground',
                          isActive && 'border-brand-blue bg-brand-sky/60 font-medium text-brand-navy',
                        )
                      }
                    >
                      <span className="truncate">{w.name}</span>
                      {w.status !== 'stable' && <span className="ml-auto text-[10px] font-semibold text-brand-orange uppercase">{w.status}</span>}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        )
      })}
    </nav>
  )
}
