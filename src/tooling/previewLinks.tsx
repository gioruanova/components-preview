import type { MouseEvent } from 'react'
import { notifyCenter } from './CenterNotice'
import { isExternalUrl } from './codegen'

/**
 * Click handler for links inside previews: never navigates. Shows a centered notification with confetti:
 * same domain → "Navigating to section"; other domain → "Opening external URL in a new tab".
 */
export function previewLinkClick(url: string) {
  return (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isExternalUrl(url)) notifyCenter('external', 'Opening external URL in a new tab', url)
    else notifyCenter('internal', 'Navigating to section', url)
  }
}
