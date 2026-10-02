/** Helpers shared by every widget's codegen and preview. */

/** Joins template lines, dropping `false`/`null` entries so optional markup disappears cleanly. */
export function lines(...parts: (string | false | null | undefined)[]): string {
  return parts.filter((p): p is string => typeof p === 'string').join('\n')
}

export function isExternalUrl(url: string, siteBaseUrl: string): boolean {
  if (!url) return false
  try {
    return new URL(url, siteBaseUrl).origin !== new URL(siteBaseUrl).origin
  } catch {
    return false
  }
}

/**
 * Port of the platform's `updateLinksAttributes`: external links open in a new tab
 * with `rel="noopener noreferrer"` and an accessible label.
 */
export function linkAttributes(url: string, label: string, siteBaseUrl: string) {
  return isExternalUrl(url, siteBaseUrl)
    ? { target: '_blank', rel: 'noopener noreferrer', 'aria-label': `${label} (opens in a new tab)` }
    : {}
}

export function json(value: unknown): string {
  return JSON.stringify(value, null, 2)
}
