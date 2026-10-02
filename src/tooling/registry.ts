import type { CategoryDefinition, Config, WidgetDefinition } from './types'

/**
 * Folder-driven registry. Nothing to edit here when adding widgets:
 *   src/widgets/<category>/category.ts          → a category (component family)
 *   src/widgets/<category>/<component>/index.ts → a component inside it
 * Folder names are the URL slugs. `shared/` folders are ignored.
 */
const categoryModules = import.meta.glob<{ default: CategoryDefinition }>('../widgets/*/category.ts', {
  eager: true,
})
const widgetModules = import.meta.glob<{ default: WidgetDefinition<Config> }>(
  ['../widgets/*/*/index.ts', '!../widgets/*/shared/**'],
  { eager: true },
)

export type RegisteredWidget = WidgetDefinition<Config> & { slug: string; categorySlug: string; path: string }
export type RegisteredCategory = CategoryDefinition & { slug: string; path: string; widgets: RegisteredWidget[] }

const byOrder = (a: { order?: number; name: string }, b: { order?: number; name: string }) =>
  (a.order ?? 100) - (b.order ?? 100) || a.name.localeCompare(b.name)

function build(): RegisteredCategory[] {
  const categories = new Map<string, RegisteredCategory>()

  for (const [file, mod] of Object.entries(categoryModules)) {
    const slug = file.split('/').at(-2)!
    categories.set(slug, { ...mod.default, slug, path: `/${slug}`, widgets: [] })
  }

  for (const [file, mod] of Object.entries(widgetModules)) {
    const [categorySlug, slug] = file.split('/').slice(-3, -1)
    const category = categories.get(categorySlug)
    if (!category) {
      console.warn(`[registry] ${file} has no ${categorySlug}/category.ts — skipped`)
      continue
    }
    category.widgets.push({ ...mod.default, slug, categorySlug, path: `/${categorySlug}/${slug}` })
  }

  return [...categories.values()].map((c) => ({ ...c, widgets: c.widgets.sort(byOrder) })).sort(byOrder)
}

export const categories = build()

export function findCategory(slug?: string) {
  return categories.find((c) => c.slug === slug)
}

export function findWidget(categorySlug?: string, slug?: string) {
  return findCategory(categorySlug)?.widgets.find((w) => w.slug === slug)
}
