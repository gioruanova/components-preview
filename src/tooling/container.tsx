import type { ReactNode } from 'react'
import { outputPath, previewUrl } from './assets'
import { profile } from './outputProfile'
import { responsive, withOverrides } from './responsive'
import type { Rule, Sheet } from './stylesheet'
import type { FieldDef, GroupField } from './types'

/**
 * "Uses container" — added to every widget's Widget configuration by the registry
 * (opt out with `container: false`). Wraps the widget in an outer section (width + background)
 * and an inner content box (max width).
 */
export type ContainerConfig = {
  useContainer: boolean
  containerWidth: 'boxed' | 'full'
  containerMaxWidth: number
  contentMaxWidth: number
  containerPadding: number
  containerBgColor: string
  containerBgImage: string
  containerBgPosition: 'center' | 'top' | 'bottom' | 'left' | 'right'
}

export const containerDefaults: ContainerConfig = withOverrides<ContainerConfig>({
  useContainer: false,
  containerWidth: 'full',
  containerMaxWidth: 1440,
  contentMaxWidth: 1200,
  containerPadding: 48,
  containerBgColor: '#ffffff',
  containerBgImage: 'sample:blobs',
  containerBgPosition: 'center',
}, { 'containerPadding@mobile': 24 })

const on = (c: ContainerConfig) => c.useContainer
const CLS = profile.classNames

export const containerFields: FieldDef<ContainerConfig>[] = [
  { type: 'switch', key: 'useContainer', label: 'Uses container', hint: 'Wrap the widget in a section with its own width and background' },
  {
    type: 'group',
    label: 'Container',
    visibleWhen: on,
    fields: [
      {
        type: 'segmented',
        key: 'containerWidth',
        label: 'Width',
        options: [
          { value: 'boxed', label: 'Boxed' },
          { value: 'full', label: 'Full width (edge to edge)' },
        ],
      },
      { type: 'slider', key: 'containerMaxWidth', label: 'Max width', min: 600, max: 1920, step: 10, unit: 'px', visibleWhen: (c) => c.containerWidth === 'boxed' },
      {
        type: 'slider',
        key: 'contentMaxWidth',
        label: 'Inner content max width',
        min: 320,
        max: 1920,
        step: 10,
        unit: 'px',
        tip: 'Keeps the widget readable while the background spans the full container.',
      },
      { type: 'slider', key: 'containerPadding', label: 'Padding', min: 0, max: 120, step: 4, unit: 'px', responsive: true },
      { type: 'color', key: 'containerBgColor', label: 'Background color' },
      { type: 'image', key: 'containerBgImage', label: 'Background image', tip: 'Images always cover the container.' },
      {
        type: 'segmented',
        key: 'containerBgPosition',
        label: 'Image position',
        options: [
          { value: 'top', label: 'Top' },
          { value: 'center', label: 'Center' },
          { value: 'bottom', label: 'Bottom' },
          { value: 'left', label: 'Left' },
          { value: 'right', label: 'Right' },
        ],
        visibleWhen: (c) => Boolean(c.containerBgImage),
      },
    ],
  },
]

/** The container options without the on/off switch (reused by Layout builder sections). */
export const containerOptionFields = (containerFields[1] as GroupField<ContainerConfig>).fields

/** `selector` lets other features (e.g. Layout builder sections) reuse the container styles under their own scope. */
export function containerSheet(c: ContainerConfig, mode: 'preview' | 'output', selector = `.${CLS.container}`, title = 'Container'): Sheet | null {
  if (!c.useContainer) return null
  const image = mode === 'preview' ? previewUrl(c.containerBgImage) : outputPath(c.containerBgImage)
  const boxed = c.containerWidth === 'boxed'
  const pad = responsive(c, 'containerPadding')
  return {
    scope: selector,
    title,
    vars: [
      { name: 'container-bg-color', value: c.containerBgColor, group: 'Colors' },
      ...(boxed ? [{ name: 'container-max-width', value: `${c.containerMaxWidth}px`, group: 'Layout' as const }] : []),
      { name: 'container-padding', value: `${pad.desktop}px`, group: 'Layout' },
      ...(['tablet', 'mobile'] as const).flatMap((vp) => (pad[vp] === undefined ? [] : [{ name: `container-padding-${vp}`, value: `${pad[vp]}px`, group: 'Layout' as const }])),
      { name: 'content-max-width', value: `${c.contentMaxWidth}px`, group: 'Layout' },
    ],
    rules: [
      {
        sel: selector,
        decls: {
          'box-sizing': 'border-box',
          width: '100%',
          'max-width': boxed ? '$$container-max-width' : 'none',
          margin: boxed ? '0 auto' : 0,
          padding: '$$container-padding',
          'background-color': '$$container-bg-color',
          'background-image': image ? `url("${image}")` : undefined,
          'background-size': image ? 'cover' : undefined,
          'background-repeat': image ? 'no-repeat' : undefined,
          'background-position': image ? c.containerBgPosition : undefined,
        },
        nest: [{ sel: `& > .${CLS.containerInner}`, decls: { 'max-width': '$$content-max-width', margin: '0 auto' } }],
      },
      { media: 'tablet', rules: [{ sel: selector, decls: { padding: pad.tablet === undefined ? undefined : '$$container-padding-tablet' } }] },
      { media: 'mobile', rules: [{ sel: selector, decls: { padding: pad.mobile === undefined ? undefined : '$$container-padding-mobile' } }] },
    ],
  }
}

/**
 * Outer spacing of every widget, on its wrapper (the sheet `scope`, e.g. `.customCards-container`). One value for all
 * widgets, and only when nothing around it already provides spacing: inside the global container or a Layout builder
 * section the container padding (and column gap) is the spacing, so the wrapper gets none — no doubled space.
 */
export const WIDGET_SPACING = '20px 15px'

export function withWrapperSpacing(sheet: Sheet, inContainer: boolean): Sheet {
  const padding = inContainer ? undefined : WIDGET_SPACING
  const index = sheet.rules.findIndex((r) => 'sel' in r && r.sel === sheet.scope)
  if (index === -1) return padding ? { ...sheet, rules: [{ sel: sheet.scope, decls: { padding } }, ...sheet.rules] } : sheet
  const rules = [...sheet.rules]
  const rule = rules[index] as Rule
  rules[index] = { ...rule, decls: { ...rule.decls, padding } }
  return { ...sheet, rules }
}

export function wrapHtml(c: ContainerConfig, html: string): string {
  if (!c.useContainer) return html
  const inner = html
    .split('\n')
    .map((l) => (l ? `    ${l}` : l))
    .join('\n')
  return `<section class="${CLS.container}">\n  <div class="${CLS.containerInner}">\n${inner}\n  </div>\n</section>`
}

export function ContainerPreview({ config, children }: { config: ContainerConfig; children: ReactNode }) {
  if (!config.useContainer) return <>{children}</>
  return (
    <section className={CLS.container}>
      <div className={CLS.containerInner}>{children}</div>
    </section>
  )
}
