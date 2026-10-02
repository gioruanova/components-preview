import { ArrowRight, ChevronRight } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router'
import { ComponentPage } from '@/tooling/ComponentPage'
import { categories, findCategory, findWidget } from '@/tooling/registry'
import { StatusBadge } from '@/tooling/ui'

export function HomeRedirect() {
  const first = categories[0]?.widgets[0]
  return first ? <Navigate to={first.path} replace /> : <NotFound />
}

export function CategoryPage() {
  const category = findCategory(useParams().category)
  if (!category) return <NotFound />

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
              Open simulator <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export function WidgetPage() {
  const { category: categorySlug, component } = useParams()
  const category = findCategory(categorySlug)
  const widget = findWidget(categorySlug, component)
  if (!category || !widget) return <NotFound />

  return (
    <div className="space-y-4">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-muted-foreground">
        <Link to={category.path} className="hover:text-foreground">
          {category.name}
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-foreground">{widget.name}</span>
      </nav>
      <ComponentPage key={widget.path} widget={widget} />
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
