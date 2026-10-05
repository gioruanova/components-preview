import { Suspense, useState } from 'react'
import { FlaskConical, Menu, PanelLeftClose, PanelLeftOpen, Presentation } from 'lucide-react'
import logo from '@/assets/tool-logo.png'
import { NavLink, Outlet, useLocation } from 'react-router'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { categories, categoryEntry } from '@/tooling/registry'
import { CenterNotice } from '@/tooling/CenterNotice'
import { IdeaButton } from './IdeaButton'
import { CheckLayoutsLink, SidebarTree } from './Sidebar'

function Brand() {
  return (
    <NavLink to="/" className="flex items-center gap-3 text-white" aria-label="Components Live Preview — home">
      <img src={logo} alt="Saffire" className="h-14 w-auto" />
      <span className="hidden h-6 w-px bg-white/30 sm:block" />
      <span className="hidden text-sm font-medium text-white/90 sm:block">Components Live Preview</span>
    </NavLink>
  )
}

/** Quick switch between categories. */
function CategoryTabs() {
  const { pathname } = useLocation()
  return (
    <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <div role="tablist" aria-label="Component categories" className="inline-flex gap-1 rounded-xl border bg-card p-1 shadow-sm">
        {categories.map((c) => {
          const active = pathname === c.path || pathname.startsWith(`${c.path}/`)
          return (
            <NavLink
              key={c.slug}
              role="tab"
              aria-selected={active}
              to={categoryEntry(c)}
              className={cn(
                'rounded-lg px-4 py-1.5 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground',
                active && 'bg-brand-blue text-white shadow-sm hover:text-white',
              )}
            >
              {c.name}
            </NavLink>
          )
        })}
      </div>
    </div>
  )
}

function PageLoading() {
  return (
    <div role="status" className="grid min-h-64 place-items-center text-sm text-muted-foreground">
      <span className="flex items-center gap-2">
        <span className="size-4 animate-spin rounded-full border-2 border-brand-blue border-t-transparent" /> Loading…
      </span>
    </div>
  )
}

function Footer() {
  // Evaluated on render, so the year rolls over on its own
  const year = new Date().getFullYear()
  return (
    <footer className="border-t bg-card px-4 py-4 text-center text-xs text-muted-foreground lg:px-8">
      Copyright ©{year}, Saffire. All Rights Reserved.
    </footer>
  )
}

const COLLAPSE_KEY ='live-preview:sidebar-collapsed'

function readCollapsed() {
  try {
    return localStorage.getItem(COLLAPSE_KEY) === '1'
  } catch {
    return false
  }
}

export function Layout() {
  const [open, setOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(readCollapsed)

  const toggleCollapsed = () =>
    setCollapsed((v) => {
      try {
        localStorage.setItem(COLLAPSE_KEY, v ? '0' : '1')
      } catch {
        // storage unavailable — the toggle still works for this session
      }
      return !v
    })

  return (
    <div className="min-h-svh">
      <header className="sticky top-0 z-40 bg-gradient-to-r from-brand-navy via-brand-blue-dark to-brand-blue shadow-md">
        <div className="flex h-20 items-center gap-3 px-4 lg:px-6">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-white lg:hidden" aria-label="Open navigation">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="border-b">
                <SheetTitle>Components Live Preview</SheetTitle>
              </SheetHeader>
              <div className="p-3">
                <SidebarTree onNavigate={() => setOpen(false)} />
              </div>
              <div className="mt-auto border-t p-3">
                <CheckLayoutsLink />
              </div>
            </SheetContent>
          </Sheet>
          <Brand />
          <NavLink
            to="/benchmark"
            className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-white/40 px-3 py-1 text-xs font-bold tracking-wide text-white uppercase transition hover:bg-white/15"
            title="Why we built this tool: benchmark vs market tools"
          >
            <Presentation className="size-3.5" /> Benchmark
          </NavLink>
          <span
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-orange px-3 py-1 text-xs font-bold tracking-wide text-white uppercase shadow-sm"
            title="Proof of concept for testing — not a production tool"
          >
            <FlaskConical className="size-3.5" /> Testing POC
          </span>
        </div>
      </header>

      <div className="flex">
        <aside
          className={cn(
            'sticky top-20 hidden h-[calc(100svh-5rem)] shrink-0 flex-col border-r bg-card transition-[width] duration-200 lg:flex',
            collapsed ? 'w-16' : 'w-64',
          )}
        >
          <div className="flex-1 overflow-x-hidden overflow-y-auto p-3">
            <SidebarTree collapsed={collapsed} />
          </div>
          <div className={cn('border-t p-2', collapsed && 'flex justify-center')}>
            <CheckLayoutsLink collapsed={collapsed} />
          </div>
          <div className={cn('border-t p-2', collapsed ? 'flex justify-center' : 'flex justify-end')}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={toggleCollapsed} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-expanded={!collapsed}>
                  {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">{collapsed ? 'Expand sidebar' : 'Collapse to icons'}</TooltipContent>
            </Tooltip>
          </div>
        </aside>
        <div className="flex min-h-[calc(100svh-5rem)] min-w-0 flex-1 flex-col">
          <main className="w-full flex-1 space-y-6 px-4 py-6 lg:px-8">
            <CategoryTabs />
            <Suspense fallback={<PageLoading />}>
              <Outlet />
            </Suspense>
          </main>
          <Footer />
        </div>
      </div>
      <IdeaButton />
      <CenterNotice />
    </div>
  )
}
