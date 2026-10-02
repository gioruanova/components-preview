import type { Config } from './types'

/**
 * Per-viewport values for fields marked `responsive: true`.
 * Stored next to the desktop value as `<key>@tablet` / `<key>@mobile` (absent = inherit).
 * Tablet inherits Desktop, Mobile inherits Tablet — like the CSS cascade of the generated media queries.
 */
export type Viewport = 'desktop' | 'tablet' | 'mobile'
export const VIEWPORT_ORDER: Viewport[] = ['desktop', 'tablet', 'mobile']

export const viewportKey = (key: string, vp: Viewport) => (vp === 'desktop' ? key : `${key}@${vp}`)

export const hasOverride = (c: Config, key: string, vp: Viewport) => vp !== 'desktop' && c[viewportKey(key, vp)] !== undefined

/** Effective value at a viewport. */
export function valueAt<T = unknown>(c: Config, key: string, vp: Viewport): T {
  if (vp === 'mobile' && c[`${key}@mobile`] !== undefined) return c[`${key}@mobile`] as T
  if (vp !== 'desktop' && c[`${key}@tablet`] !== undefined) return c[`${key}@tablet`] as T
  return c[key] as T
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

export type ResponsiveValue<T> = {
  desktop: T
  /** Only set when it differs from desktop (→ emit in the tablet media block). */
  tablet?: T
  /** Only set when it differs from the effective tablet value (→ emit in the mobile media block). */
  mobile?: T
  /** Effective values, always set (handy for computing derived values). */
  at: Record<Viewport, T>
}

/**
 * For styles: the desktop value plus only the values that CHANGE at tablet / mobile.
 * Unchanged → `undefined`, and undefined declarations are dropped by the stylesheet,
 * so media blocks only contain real differences.
 */
export function responsive<C, K extends Extract<keyof C, string>>(c: C, key: K): ResponsiveValue<C[K]> {
  const cfg = c as unknown as Config
  const at = {
    desktop: valueAt<C[K]>(cfg, key, 'desktop'),
    tablet: valueAt<C[K]>(cfg, key, 'tablet'),
    mobile: valueAt<C[K]>(cfg, key, 'mobile'),
  }
  return {
    desktop: at.desktop,
    tablet: same(at.tablet, at.desktop) ? undefined : at.tablet,
    mobile: same(at.mobile, at.tablet) ? undefined : at.mobile,
    at,
  }
}

/** Default per-viewport values, type-checked against the config keys: `withOverrides(base, { 'titleFont@mobile': … })`. */
export function withOverrides<C>(base: C, overrides: Partial<Record<`${Extract<keyof C, string>}@${'tablet' | 'mobile'}`, unknown>>): C {
  return { ...base, ...overrides }
}

/** Maps a responsive value (e.g. alignment → flex keyword), keeping undefined as undefined. */
export function mapResponsive<T, U>(r: ResponsiveValue<T>, fn: (v: T) => U): ResponsiveValue<U> {
  return {
    desktop: fn(r.desktop),
    tablet: r.tablet === undefined ? undefined : fn(r.tablet),
    mobile: r.mobile === undefined ? undefined : fn(r.mobile),
    at: { desktop: fn(r.at.desktop), tablet: fn(r.at.tablet), mobile: fn(r.at.mobile) },
  }
}
