import { defineWidget } from '@/tooling/types'
import { codegen, isEmpty } from './codegen'
import { Preview } from './Preview'
import { defaults, schema } from './schema'
import styles from './styles.css?inline'

export default defineWidget({
  name: 'SEO Block',
  status: 'stable',
  order: 10,
  summary: 'Heading, divider, description and up to two call-to-action buttons.',
  description: [
    'Displays a two-line title, an optional divider under the title, an optional description, and up to two optional buttons — each independently shown or hidden.',
    'The heading level (`h1`–`h6`) is configurable so the block fits the page outline.',
    'Each button has its own URL and label.',
    "If both buttons are hidden, the buttons container itself is omitted (it doesn't render as an empty wrapper).",
    'External button URLs (not matching the site\'s own base URL) automatically get `target="_blank"` and `rel="noopener noreferrer"`, plus an accessible label noting the link opens in a new tab.',
    "If the widget has no data at all, it's removed from the page entirely.",
  ],
  previewHint: 'Turn every content option off to simulate the removed state.',
  defaults,
  schema,
  Preview,
  styles,
  codegen,
  isEmpty,
})
