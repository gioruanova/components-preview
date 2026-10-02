import { lazy } from 'react'
import { ArrowRight, ChevronRight, Hourglass } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { findCategory, findUpcoming, findWidget, type RegisteredCategory } from '@/tooling/registry'
import { StatusBadge } from '@/tooling/ui'
import { ComingSoon } from './ComingSoon'

// Code-split: config panel, iframe preview and code highlighting load with the first component page
const ComponentPage = lazy(() => import('@/tooling/ComponentPage').then((m) => ({ default: m.ComponentPage })))

export function CategoryPage() {
  const category = findCategory(useParams().category)
  if (!category) return <NotFound />

  // A family with nothing in it yet is itself "coming soon"
  if (!category.widgets.length && !category.upcomingWidgets.length) {
    return <ComingSoon category={category} name={category.name} summary={category.description} />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-brand-navy">{category.name}</h1>
        <p className="mt-1 max-w-2xl text-muted-foreground">{category.description}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {category.widgets.map((w) => (
          <Link key={w.slug} to={w.path} className="group rounded-xl border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-blue/40 hover:shadow-md">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-semibold text-brand-navy">{w.name}</h2>
              <StatusBadge status={w.status} />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{w.summary}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-blue">
              Open live preview <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
        {category.upcomingWidgets.map((w) => (
          <Link
            key={w.slug}
            to={w.path}
            className="group rounded-xl border border-dashed bg-card/60 p-5 transition hover:border-brand-orange/50 hover:bg-card"
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-semibold text-muted-foreground">{w.name}</h2>
              <SoonBadge />
            </div>
            {w.summary && <p className="mt-2 text-sm text-muted-foreground">{w.summary}</p>}
          </Link>
        ))}
      </div>
    </div>
  )
}

export function SoonBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-brand-orange/10 px-2 py-0.5 text-[11px] font-semibold text-[#b4470e]">
      <Hourglass className="size-3" /> Soon
    </span>
  )
}

function Breadcrumb({ category, name }: { category: RegisteredCategory; name: string }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-muted-foreground">
      <Link to={category.path} className="hover:text-foreground">
        {category.name}
      </Link>
      <ChevronRight className="size-3.5" />
      <span className="text-foreground">{name}</span>
    </nav>
  )
}

export function WidgetPage() {
  const { category: categorySlug, component } = useParams()
  const category = findCategory(categorySlug)
  const widget = findWidget(categorySlug, component)
  const upcoming = findUpcoming(categorySlug, component)
  if (!category || (!widget && !upcoming)) return <NotFound />

  return (
    <div className="space-y-4">
      <Breadcrumb category={category} name={(widget ?? upcoming)!.name} />
      {widget ? <ComponentPage key={widget.path} widget={widget} /> : <ComingSoon category={category} name={upcoming!.name} summary={upcoming!.summary} />}
    </div>
  )
}

export function NotFound() {
  return (
    <div className="rounded-xl border bg-card p-10 text-center">
      <h1 className="text-xl font-semibold">Not found</h1>
      <p className="mt-1 text-muted-foreground">That component doesn't exist (yet).</p>
      <Link to="/" className="mt-4 inline-block text-brand-blue underline">
        Back to components
      </Link>
    </div>
  )
}
