import { useState } from 'react'
import { Menu } from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { categories } from '@/tooling/registry'
import { SidebarTree } from './Sidebar'

function Brand() {
  return (
    <NavLink to="/" className="flex items-center gap-3 text-white">
      <span className="text-2xl leading-none font-black tracking-tight italic">Saffire</span>
      <span className="hidden h-6 w-px bg-white/30 sm:block" />
      <span className="hidden text-sm font-medium text-white/85 sm:block">Component Simulator</span>
    </NavLink>
  )
}

/** Quick switch between categories (families). */
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
              to={c.widgets[0]?.path ?? c.path}
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

export function Layout() {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-svh">
      <header className="sticky top-0 z-40 bg-gradient-to-r from-brand-navy via-brand-blue-dark to-brand-blue shadow-md">
        <div className="flex h-16 items-center gap-3 px-4 lg:px-6">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-white lg:hidden" aria-label="Open navigation">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="border-b">
                <SheetTitle>Saffire Components</SheetTitle>
              </SheetHeader>
              <div className="p-3">
                <SidebarTree onNavigate={() => setOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
          <Brand />
          <span className="ml-auto rounded-full bg-brand-orange px-3 py-1 text-xs font-semibold text-white shadow-sm">Demo</span>
        </div>
      </header>

      <div className="flex">
        <aside className="sticky top-16 hidden h-[calc(100svh-4rem)] w-64 shrink-0 overflow-y-auto border-r bg-card p-3 lg:block">
          <SidebarTree />
        </aside>
        <main className="min-w-0 flex-1 px-4 py-6 lg:px-8">
          <div className="mx-auto max-w-[1400px] space-y-6">
            <CategoryTabs />
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
