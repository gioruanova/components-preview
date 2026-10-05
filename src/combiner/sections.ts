import { containerOptionFields, containerSheet } from '@/tooling/container'
import { responsive } from '@/tooling/responsive'
import type { Sheet } from '@/tooling/stylesheet'
import type { FieldDef } from '@/tooling/types'
import { renderedColumns, type Section, type SectionSettings } from './model'

const containerFields = containerOptionFields as unknown as FieldDef<SectionSettings>[]

export const sectionFields: FieldDef<SectionSettings>[] = [
  { type: 'text', key: 'name', label: 'Section name', help: 'Only used in the scheme' },
  {
    type: 'group',
    label: 'Columns',
    fields: [
      { type: 'stepper', key: 'columns', label: 'Number of columns', min: 1, max: 3 },
      {
        type: 'select',
        key: 'ratio2',
        label: 'Proportions',
        visibleWhen: (s) => s.columns === 2,
        options: [
          { value: '1:1', label: '1 : 1 (50% / 50%)' },
          { value: '2:1', label: '2 : 1 (66% / 33%)' },
          { value: '1:2', label: '1 : 2 (33% / 66%)' },
          { value: '3:1', label: '3 : 1 (75% / 25%)' },
          { value: '1:3', label: '1 : 3 (25% / 75%)' },
        ],
      },
      {
        type: 'select',
        key: 'ratio3',
        label: 'Proportions',
        visibleWhen: (s) => s.columns === 3,
        options: [
          { value: '1:1:1', label: '1 : 1 : 1 (33% / 33% / 33%)' },
          { value: '2:1:1', label: '2 : 1 : 1 (50% / 25% / 25%)' },
          { value: '1:2:1', label: '1 : 2 : 1 (25% / 50% / 25%)' },
          { value: '1:1:2', label: '1 : 1 : 2 (25% / 25% / 50%)' },
        ],
      },
      { type: 'slider', key: 'columnGap', label: 'Lateral gap', min: 0, max: 120, step: 4, unit: 'px', responsive: true, help: 'Between columns side by side', visibleWhen: (s) => s.columns > 1 },
      { type: 'slider', key: 'rowGap', label: 'Vertical gap', min: 0, max: 120, step: 4, unit: 'px', responsive: true, help: 'Between components in a column, and between columns once they stack' },
      {
        type: 'segmented',
        key: 'align',
        label: 'Vertical alignment',
        visibleWhen: (s) => s.columns > 1,
        options: [
          { value: 'stretch', label: 'Stretch' },
          { value: 'start', label: 'Top' },
          { value: 'center', label: 'Center' },
          { value: 'end', label: 'Bottom' },
        ],
      },
      {
        type: 'switch',
        key: 'stackOnTablet',
        label: 'Stack on tablet',
        hint: 'Columns always stack on mobile',
        visibleWhen: (s) => s.columns > 1,
      },
    ],
  },
  { type: 'group', label: 'Container', fields: containerFields as never },
]

/** Container (width, background…) + column grid styles for one section, scoped by its id. */
export function sectionSheets(s: Section): Sheet[] {
  const sel = `#cs-${s.id}`
  // empty columns are not rendered: the remaining ones share the full width
  const tracks = renderedColumns(s)
    .map((c) => `minmax(0, ${c.fraction}fr)`)
    .join(' ')
  const container = containerSheet({ ...s.settings, useContainer: true }, 'preview', sel, s.settings.name)
  const colGap = responsive(s.settings, 'columnGap')
  const rowGap = responsive(s.settings, 'rowGap')
  const px = (v: number | undefined) => (v === undefined ? undefined : `${v}px`)
  const stack = { 'grid-template-columns': 'minmax(0, 1fr)' }
  /** Tablet / mobile: stacking + only the gaps that change. */
  const at = (vp: 'tablet' | 'mobile') => ({
    media: vp,
    rules: [
      { sel: `${sel} .combiner-columns`, decls: { ...(vp === 'mobile' || s.settings.stackOnTablet ? stack : {}), 'column-gap': px(colGap[vp]), 'row-gap': px(rowGap[vp]) } },
      { sel: `${sel} .combiner-column`, decls: { gap: px(rowGap[vp]) } },
    ],
  })
  const grid: Sheet = {
    scope: sel,
    vars: [],
    rules: [
      {
        sel: `${sel} .combiner-columns`,
        decls: {
          display: 'grid',
          'grid-template-columns': tracks,
          'column-gap': px(colGap.desktop),
          'row-gap': px(rowGap.desktop),
          'align-items': s.settings.align,
        },
      },
      { sel: `${sel} .combiner-column`, decls: { display: 'flex', 'flex-direction': 'column', gap: px(rowGap.desktop), 'min-width': 0 } },
      at('tablet'),
      at('mobile'),
    ],
  }
  return [...(container ? [container] : []), grid]
}

/** Dashed outlines + labels so the section/column structure is visible in the preview. */
export const GUIDES_CSS = `
  .combiner-section { position: relative; outline: 1px dashed rgba(0, 123, 199, 0.55); outline-offset: -1px; }
  .combiner-section::before {
    content: attr(data-label); position: absolute; top: 0; left: 0; z-index: 50;
    padding: 2px 8px; border-bottom-right-radius: 6px;
    background: #007bc7; color: #fff; font: 600 11px/1.6 system-ui, sans-serif;
  }
  .combiner-site-header { position: relative; outline: 1px dashed rgba(142, 68, 173, 0.6); outline-offset: -1px; }
  .combiner-site-header::before {
    content: attr(data-label); position: absolute; bottom: 0; left: 0; z-index: 50;
    padding: 2px 8px; border-top-right-radius: 6px;
    background: #8e44ad; color: #fff; font: 600 11px/1.6 system-ui, sans-serif;
  }
  .section-heading { outline: 1px dashed rgba(102, 187, 106, 0.8); outline-offset: 4px; }
  .combiner-column { outline: 1px dashed rgba(242, 105, 34, 0.55); outline-offset: 2px; min-height: 48px; }
  .combiner-empty {
    display: grid; place-items: center; min-height: 96px; border-radius: 8px;
    background: repeating-linear-gradient(45deg, rgba(242,105,34,.06) 0 10px, transparent 10px 20px);
    color: #b4470e; font: 500 13px system-ui, sans-serif;
  }
`
