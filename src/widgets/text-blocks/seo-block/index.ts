import { defineWidget } from '@/tooling/types'
import { codegen, isEmpty } from './codegen'
import { Preview } from './Preview'
import { defaults, schema } from './schema'
import { styles } from './styles'

export default defineWidget({
  name: 'SEO Block',
  status: 'stable',
  order: 10,
  summary: 'Heading, divider, description and up to two call-to-action buttons.',
  description: [
    'Displays a two-line title, an optional divider under the title, an optional description, and up to two optional buttons — each independently shown or hidden.',
    'The heading level (`h1`–`h6`) is configurable so the block fits the page outline.',
    'Content can be aligned left, center or right; every text element has its own typography.',
    'Each button (Button 1, Button 2) has its own label and URL. A button without a URL (or label) is not rendered.',
    "If both buttons are hidden, the buttons container itself is omitted (it doesn't render as an empty wrapper).",
    'External button URLs (not matching the site\'s own base URL) automatically get `target="_blank"` and `rel="noopener noreferrer"`, plus an accessible label noting the link opens in a new tab.',
    "If the widget has no data at all, it's removed from the page entirely.",
  ],
  specs: [
    'Markup root: `div.<widgetId>-signup-container` > `div#<widgetId>` > heading `.seo-title` (H1–H6 from Heading level; `.seo-title-line1`, optional `.seo-title-line2`, `.seo-divider` inside the heading) · `.seo-description` · `.buttons-container` with `a.button.button-1|2`.',
    'Shared `renderedButtons(c)` (Preview + codegen): a button renders only when shown and it has a URL and a label; the buttons container is omitted when no button renders.',
    'Empty state: no title, no description and no rendered button → `isEmpty` is true and the script removes the widget (`$widget.parent().remove()`).',
    'Script entry `createCustomSeo(widgetData)` reads `widgetData[0]` (`ShowTitle`, `TitleLine1/2`, `HeadingLevel`, `ShowDivider`, `ShowDescription`, `Description`, `Button1/2 Show/URL/Label`); links use `updateLinksAttributes(url, label)`.',
    'Styles: alignment drives `text-align`, flex alignment of title / buttons and the block margin; title, description and buttons have responsive typography (clamp per title line and description). Buttons use `customButtonStyles` for `.button.button-N`.',
    'Responsive: tablet / mobile overrides come from `withOverrides` defaults (title scale, padding, stacked buttons), emitted only when they differ from desktop.',
    'Wrapped by the global container unless “Uses container” is off. Tests: `codegen.test.ts`. Spec: `docs/specs/text-blocks--seo-block.md`.',
  ],
  previewHint: 'Turn every content option off to simulate the removed state.',
  defaults,
  schema,
  Preview,
  styles,
  codegen,
  isEmpty,
})
