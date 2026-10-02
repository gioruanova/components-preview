/**
 * Output profile: the naming conventions and layout of the generated code, in ONE place.
 *
 * When the real source-code structure / nomenclature arrives, adapt this file first
 * (see docs/output-integration.md and the /adopt-source-structure skill). Widgets keep
 * producing HTML / Script / Data through their codegen; styles go through `stylesheet.ts`,
 * which reads the variable naming and breakpoints from here.
 */

export type CodeTabId = 'html' | 'scss' | 'css' | 'script' | 'data'

export type OutputProfile = {
  /** Output tabs, in display order. Remove an id to hide that tab. */
  tabs: CodeTabId[]
  labels: Record<CodeTabId, string>
  /** CSS custom property / SCSS variable name for a style variable (e.g. add a project prefix). */
  varName: (name: string) => string
  /** Media query breakpoints (max-width, px). */
  breakpoints: { tablet: number; mobile: number }
  /** Class names of the global "Uses container" wrapper (preview and HTML output use the same). */
  classNames: { container: string; containerInner: string }
  /** Optional comment prepended to a tab's code (e.g. file path in the real repo). */
  header?: (tab: CodeTabId, widget: { name: string; slug: string; categorySlug: string }) => string | null
}

export const defaultProfile: OutputProfile = {
  tabs: ['html', 'scss', 'css', 'script', 'data'],
  labels: { html: 'HTML', scss: 'SCSS', css: 'CSS', script: 'Script', data: 'Data' },
  varName: (name) => name,
  breakpoints: { tablet: 768, mobile: 480 },
  classNames: { container: 'widget-container', containerInner: 'widget-container-inner' },
  header: () => null,
}

/** The profile in use. Swap or extend this when adopting the real source structure. */
export const profile: OutputProfile = defaultProfile
