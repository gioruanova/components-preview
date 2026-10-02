import { containerOptionFields, containerSheet } from '@/tooling/container'
import type { Sheet } from '@/tooling/stylesheet'
import type { FieldDef } from '@/tooling/types'
import { columnFractions, type Section, type SectionSettings } from './model'

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
          { value: '1:1', label: '1 : 1 (50 / 50)' },
          { value: '2:1', label: '2 : 1 (66 / 33)' },
          { value: '1:2', label: '1 : 2 (33 / 66)' },
          { value: '3:1', label: '3 : 1 (75 / 25)' },
          { value: '1:3', label: '1 : 3 (25 / 75)' },
        ],
      },
      {
        type: 'select',
        key: 'ratio3',
        label: 'Proportions',
        visibleWhen: (s) => s.columns === 3,
        options: [
          { value: '1:1:1', label: '1 : 1 : 1 (equal)' },
          { value: '2:1:1', label: '2 : 1 : 1 (wide first)' },
          { value: '1:2:1', label: '1 : 2 : 1 (wide middle)' },
          { value: '1:1:2', label: '1 : 1 : 2 (wide last)' },
        ],
      },
      { type: 'slider', key: 'gap', label: 'Gap', min: 0, max: 80, step: 4, unit: 'px' },
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

export const sectionSelector = (s: Section) => `#cs-${s.id}`

/** Container (width, background…) + column grid styles for one section, scoped by its id. */
export function sectionSheets(s: Section): Sheet[] {
  const sel = sectionSelector(s)
  const tracks = columnFractions(s.settings)
    .map((f) => `minmax(0, ${f}fr)`)
    .join(' ')
  const container = containerSheet({ ...s.settings, useContainer: true }, 'preview', sel, s.settings.name)
  const grid: Sheet = {
    scope: sel,
    vars: [],
    rules: [
      {
        sel: `${sel} .combiner-columns`,
        decls: { display: 'grid', 'grid-template-columns': tracks, gap: `${s.settings.gap}px`, 'align-items': s.settings.align },
      },
      { sel: `${sel} .combiner-column`, decls: { display: 'flex', 'flex-direction': 'column', gap: `${s.settings.gap}px`, 'min-width': 0 } },
      ...(s.settings.stackOnTablet ? [{ media: 'tablet' as const, rules: [{ sel: `${sel} .combiner-columns`, decls: { 'grid-template-columns': 'minmax(0, 1fr)' } }] }] : []),
      { media: 'mobile', rules: [{ sel: `${sel} .combiner-columns`, decls: { 'grid-template-columns': 'minmax(0, 1fr)' } }] },
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
  .combiner-column { outline: 1px dashed rgba(242, 105, 34, 0.55); outline-offset: 2px; min-height: 48px; }
  .combiner-empty {
    display: grid; place-items: center; min-height: 96px; border-radius: 8px;
    background: repeating-linear-gradient(45deg, rgba(242,105,34,.06) 0 10px, transparent 10px 20px);
    color: #b4470e; font: 500 13px system-ui, sans-serif;
  }
`
