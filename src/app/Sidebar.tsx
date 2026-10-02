import { ChevronRight, ExternalLink, Folder, Home, LayoutPanelTop } from 'lucide-react'
import flameIcon from '@/assets/flame-icon.png'
import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { categories } from '@/tooling/registry'

/** Category → component tree, generated from the registry. `collapsed` renders the icon-only rail. */
export function SidebarTree({ onNavigate, collapsed = false }: { onNavigate?: () => void; collapsed?: boolean }) {
  const { pathname } = useLocation()
  const inCategory = (path: string) => pathname === path || pathname.startsWith(`${path}/`)
  const active = categories.find((c) => inCategory(c.path))?.slug
  // Only the active family starts expanded; navigating to another family expands it too.
  const [open, setOpen] = useState<Set<string>>(() => new Set(active ? [active] : []))
  useEffect(() => {
    if (active) setOpen((s) => (s.has(active) ? s : new Set(s).add(active)))
  }, [active])

  if (collapsed) {
    return (
      <nav aria-label="Components" className="flex flex-col items-center gap-1">
        <RailLink to="/" label="Overview" active={pathname === '/'} icon={Home} />
        <span className="my-2 h-px w-8 bg-border" />
        {categories.map((c) => (
          <RailLink
            key={c.slug}
            to={c.path}
            label={c.name}
            detail={c.widgets.map((w) => w.name).join(' · ')}
            active={inCategory(c.path)}
            icon={c.icon ?? Folder}
          />
        ))}
        <span className="my-2 h-px w-8 bg-border" />
        <RailLink to="/combiner" label="Combiner" detail="Testing POC" active={pathname === '/combiner'} icon={LayoutPanelTop} />
      </nav>
    )
  }

  return (
    <nav aria-label="Components" className="space-y-1">
      <NavLink
        to="/"
        end
        onClick={onNavigate}
        className={({ isActive }) =>
          cn(
            'mb-3 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors hover:bg-muted',
            isActive && 'bg-brand-sky/60 text-brand-navy',
          )
        }
      >
        <Home className="size-4" /> Overview
      </NavLink>
      <p className="px-3 pb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">Components</p>
      {categories.map((category) => {
        const Icon = category.icon ?? Folder
        const hasChildren = category.widgets.length + category.upcomingWidgets.length > 0
        const isOpen = open.has(category.slug)
        return (
          <Collapsible
            key={category.slug}
            open={hasChildren && isOpen}
            onOpenChange={(v) => setOpen((s) => (v ? new Set(s).add(category.slug) : new Set([...s].filter((x) => x !== category.slug))))}
            className="group/cat"
          >
            <div className={cn('flex items-center rounded-lg transition-colors hover:bg-muted', inCategory(category.path) && 'bg-muted/60 text-brand-navy')}>
              {hasChildren ? (
                <CollapsibleTrigger className="grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground" aria-label={`Toggle ${category.name}`}>
                  <ChevronRight className="size-4 transition-transform group-data-[state=open]/cat:rotate-90" />
                </CollapsibleTrigger>
              ) : (
                <span className="size-8 shrink-0" />
              )}
              <NavLink to={category.path} end onClick={onNavigate} className="flex min-w-0 flex-1 items-center gap-2 py-1.5 pr-3 text-sm font-semibold">
                <Icon className="size-4 shrink-0 text-brand-blue" />
                <span className="flex-1 truncate">{category.name}</span>
                {category.widgets.length ? (
                  <span className="rounded-full bg-muted px-1.5 text-[11px] font-medium text-muted-foreground tabular-nums">{category.widgets.length}</span>
                ) : (
                  <span className="text-[10px] font-semibold text-[#b4470e] uppercase">soon</span>
                )}
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
                {category.upcomingWidgets.map((w) => (
                  <li key={w.slug}>
                    <NavLink
                      to={w.path}
                      onClick={onNavigate}
                      className={({ isActive }) =>
                        cn(
                          '-ml-[13px] flex items-center gap-2 border-l-2 border-transparent py-1.5 pr-2 pl-3 text-sm text-muted-foreground/80 italic transition-colors hover:text-foreground',
                          isActive && 'border-brand-orange bg-brand-orange/10 text-brand-navy not-italic',
                        )
                      }
                    >
                      <span className="truncate">{w.name}</span>
                      <span className="ml-auto text-[10px] font-semibold text-[#b4470e] not-italic uppercase">soon</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        )
      })}

      <p className="px-3 pt-4 pb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">Tools</p>
      <NavLink
        to="/combiner"
        onClick={onNavigate}
        className={({ isActive }) =>
          cn('flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors hover:bg-muted', isActive && 'bg-brand-sky/60 text-brand-navy')
        }
      >
        <LayoutPanelTop className="size-4 text-brand-blue" />
        <span className="flex-1">Combiner</span>
        <span className="rounded-full bg-brand-orange/15 px-1.5 text-[10px] font-bold text-[#b4470e] uppercase">POC</span>
      </NavLink>
    </nav>
  )
}

export const LAYOUTS_URL = 'https://www.saffire.com/layouts'

/** External "Check Layouts" link (sidebar footer). */
export function CheckLayoutsLink({ collapsed = false }: { collapsed?: boolean }) {
  const link = (
    <a
      href={LAYOUTS_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={collapsed ? 'Check Layouts (opens saffire.com in a new tab)' : undefined}
      className={cn(
        'flex items-center gap-2 rounded-lg text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-sky/60',
        collapsed ? 'size-10 justify-center' : 'px-3 py-2',
      )}
    >
      <img src={flameIcon} alt="" className="size-5 shrink-0" />
      {!collapsed && (
        <>
          <span className="flex-1">Check Layouts</span>
          <ExternalLink className="size-3.5 text-muted-foreground" />
          <span className="sr-only">(opens saffire.com in a new tab)</span>
        </>
      )}
    </a>
  )
  if (!collapsed) return link
  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">Check Layouts ↗</TooltipContent>
    </Tooltip>
  )
}

function RailLink({ to, label, detail, active, icon: Icon }: { to: string; label: string; detail?: string; active: boolean; icon: typeof Home }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <NavLink
          to={to}
          aria-label={label}
          className={cn(
            'grid size-10 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
            active && 'bg-brand-sky text-brand-navy',
          )}
        >
          <Icon className="size-5" />
        </NavLink>
      </TooltipTrigger>
      <TooltipContent side="right">
        <p className="font-semibold">{label}</p>
        {detail && <p className="opacity-80">{detail}</p>}
      </TooltipContent>
    </Tooltip>
  )
}
