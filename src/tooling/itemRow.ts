import { profile } from './outputProfile'
import type { ResponsiveValue, Viewport } from './responsive'
import type { ContainerBlock, Decls, Rule } from './stylesheet'

/**
 * A centered, wrapping flex row of equal items (cards, hot buttons…) with "N per row", a min width and two sizings:
 * - 'stretch': items grow into their row's leftover space (flex: 1 1), so a short last row gets wider items.
 * - 'fixed': every item has the same width (flex: 0 1) and full rows fill the row. The items per row come from the
 *   row's width (container queries): k items fit when width >= k * min + (k - 1) * gap, at most N. A short last row
 *   keeps the same item width and is centered.
 *
 * The widget keeps its own vars: `$$<gapVar>` (the gap) and `$$<minVar>` / `$$<minVar>-tablet|mobile` (min width,
 * declared only where it is non-zero / changes).
 */
export type ItemRowOptions = {
  /** Row selector, e.g. `#customCards`. */
  root: string
  /** Item selector nested in the row, e.g. `.card-widget-item`. */
  item: string
  /** Container name used by the queries, e.g. `cards-grid`. */
  name: string
  /** Gap in px (must match the value of `$$<gapVar>`). */
  gap: number
  gapVar: string
  minVar: string
  /** Items per row at a viewport (already capped by the item count). */
  perRow: (vp: Viewport) => number
  min: ResponsiveValue<number>
  sizing: ResponsiveValue<'fixed' | 'stretch'>
}

export function itemRow(o: ItemRowOptions) {
  const basis = (n: number) => (n <= 1 ? '100%' : `calc((100% - ${n - 1} * $$${o.gapVar}) / ${n})`)
  const fixed = (vp: Viewport) => o.sizing.at[vp] === 'fixed'
  /** Items per row for a row width (fixed mode). */
  const fit = (vp: Viewport, width: number) => {
    const n = o.perRow(vp)
    const m = o.min.at[vp]
    if (!m) return n
    return Math.max(1, Math.min(n, Math.floor((width + o.gap) / (m + o.gap))))
  }
  /** Row widths at which one more item fits (fixed mode with a min width). */
  const steps = (vp: Viewport) => {
    const m = o.min.at[vp]
    if (!fixed(vp) || !m) return []
    return Array.from({ length: o.perRow(vp) - 1 }, (_, i) => (i + 2) * m + (i + 1) * o.gap)
  }
  // flex below the first step (stretch: always)
  const flex = (vp: Viewport) => (fixed(vp) ? `0 1 ${basis(fit(vp, 0))}` : `1 1 ${basis(o.perRow(vp))}`)
  const flexAt = (vp: Viewport, width: number) => (fixed(vp) ? `0 1 ${basis(fit(vp, width))}` : `1 1 ${basis(o.perRow(vp))}`)
  const key = (vp: Viewport) => JSON.stringify([o.sizing.at[vp], o.perRow(vp), o.min.at[vp]])
  const prevOf = (vp: 'tablet' | 'mobile'): Viewport => (vp === 'tablet' ? 'desktop' : 'tablet')
  const changed = (vp: 'tablet' | 'mobile') => key(vp) !== key(prevOf(vp))
  const itemRule = (decls: Decls): Rule => ({ sel: o.root, nest: [{ sel: o.item, decls }] })
  const queried = (['desktop', 'tablet', 'mobile'] as const).some((vp) => steps(vp).length > 0)

  /**
   * Container queries of a viewport. In a media block the item's base `flex` comes later than every inherited query, so
   * it resets them; only this viewport's own steps follow (the row is never wider than the viewport).
   */
  const queries = (vp: Viewport): ContainerBlock[] =>
    steps(vp)
      .filter((w) => vp === 'desktop' || w <= profile.breakpoints[vp])
      .map((w) => ({ container: o.name, minWidth: w, rules: [itemRule({ flex: flexAt(vp, w) })] }))

  return {
    basis,
    /** Spread into the row's base decls. */
    rootDecls: {
      display: 'flex',
      'flex-wrap': 'wrap',
      'justify-content': 'center',
      gap: `$$${o.gapVar}`,
      // "fixed" picks the items per row from this width (@container)
      'container-type': queried ? 'inline-size' : undefined,
      'container-name': queried ? o.name : undefined,
    } satisfies Decls,
    /** Spread into the item's base decls. */
    itemDecls: { flex: flex('desktop'), 'min-width': o.min.desktop ? `$$${o.minVar}` : undefined } satisfies Decls,
    /** Spread into the item's decls in the tablet / mobile override (same nesting as the base). */
    itemOverride(vp: 'tablet' | 'mobile'): Decls {
      const min = o.min[vp]
      return {
        // always re-set when the sizing changes: it also resets the inherited @container steps
        flex: changed(vp) ? flex(vp) : undefined,
        'min-width': min === undefined ? undefined : min ? `$$${o.minVar}-${vp}` : 0,
      }
    },
    /** Sheet-level container queries (desktop). */
    desktopQueries: queries('desktop'),
    /** Container queries to append to the tablet / mobile media block, after the override rule. */
    mediaQueries: (vp: 'tablet' | 'mobile') => (changed(vp) ? queries(vp) : []),
  }
}
