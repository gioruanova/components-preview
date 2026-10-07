/** Helpers shared by every widget's codegen and preview. */

/** Joins template lines, dropping `false`/`null` entries so optional markup disappears cleanly. */
export function lines(...parts: (string | false | null | undefined)[]): string {
  return parts.filter((p): p is string => typeof p === 'string').join('\n')
}

/** Domain the page is served from — detected automatically, so it works on any hosting. */
export const currentOrigin = () => (typeof window !== 'undefined' ? window.location.origin : 'https://example.com')

/** True when `url` points to another domain than the current page. `base` is only for tests. */
export function isExternalUrl(url: string, base = currentOrigin()): boolean {
  if (!url) return false
  try {
    return new URL(url, base).origin !== new URL(base).origin
  } catch {
    return false
  }
}

/**
 * Port of the platform's `updateLinksAttributes`: external links open in a new tab
 * with `rel="noopener noreferrer"` and an accessible label.
 * `newTab` forces the same for any link (an explicit "Open in a new tab" option).
 */
export function linkAttributes(url: string, label: string, newTab = false) {
  return newTab || isExternalUrl(url)
    ? { target: '_blank', rel: 'noopener noreferrer', 'aria-label': `${label} (opens in a new tab)` }
    : {}
}

export function json(value: unknown): string {
  return JSON.stringify(value, null, 2)
}
