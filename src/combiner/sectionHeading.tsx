import { responsive, withOverrides, type Viewport } from '@/tooling/responsive'
import type { Rule, Sheet } from '@/tooling/stylesheet'
import type { Schema } from '@/tooling/types'
import { responsiveType, typography, type Typography } from '@/tooling/typography'

/**
 * Optional heading + description of ONE section (container with columns).
 * Rendered inside the section's inner container, ABOVE (outside) the columns wrapper.
 * Configured like a component (A Content / B Show-hide + heading tag / C Styles); stored as `section.heading`.
 */
export type SectionHeading = {
  showHeading: boolean
  heading: string
  headingLevel: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  showDescription: boolean
  description: string
  alignment: 'left' | 'center' | 'right'
  headingFont: Typography
  descriptionFont: Typography
  maxWidth: number
  gap: number
  spaceBelow: number
}

export const headingDefaults: SectionHeading = withOverrides<SectionHeading>(
  {
    showHeading: false,
    heading: 'Section heading',
    headingLevel: 'h2',
    showDescription: false,
    description: 'A short introduction to the content of this section.',
    alignment: 'center',
    headingFont: typography({ size: 36, weight: 700, lineHeight: 1.2, color: '#003c61' }),
    descriptionFont: typography({ size: 18, weight: 400, lineHeight: 1.6, color: '#313841' }),
    maxWidth: 840,
    gap: 12,
    spaceBelow: 32,
  },
  {
    'headingFont@tablet': typography({ size: 31, weight: 700, lineHeight: 1.2, color: '#003c61' }),
    'headingFont@mobile': typography({ size: 26, weight: 700, lineHeight: 1.2, color: '#003c61' }),
    'spaceBelow@mobile': 24,
  },
)

const HEADINGS = (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const).map((h) => ({ value: h, label: h.toUpperCase() }))

export const headingSchema: Schema<SectionHeading> = {
  content: [
    { type: 'text', key: 'heading', label: 'Section heading', visibleWhen: (h) => h.showHeading },
    { type: 'textarea', key: 'description', label: 'Section description', visibleWhen: (h) => h.showDescription },
  ],
  widget: [
    {
      type: 'group',
      label: 'Show / hide',
      fields: [
        { type: 'switch', key: 'showHeading', label: 'Show heading', hint: 'Above the columns of this section' },
        { type: 'switch', key: 'showDescription', label: 'Show description' },
      ],
    },
    { type: 'select', key: 'headingLevel', label: 'Heading tag', options: HEADINGS, help: 'H1 only for the main page title', visibleWhen: (h) => h.showHeading },
  ],
  styles: [
    {
      type: 'segmented',
      key: 'alignment',
      label: 'Alignment',
      responsive: true,
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
      ],
    },
    {
      type: 'group',
      label: 'Typography',
      fields: [
        { type: 'typography', key: 'headingFont', label: 'Heading', responsive: true, visibleWhen: (h) => h.showHeading },
        { type: 'typography', key: 'descriptionFont', label: 'Description', responsive: true, visibleWhen: (h) => h.showDescription },
      ],
    },
    { type: 'slider', key: 'maxWidth', label: 'Max width', min: 320, max: 1600, step: 10, unit: 'px' },
    { type: 'slider', key: 'gap', label: 'Space between heading and description', min: 0, max: 64, unit: 'px' },
    { type: 'slider', key: 'spaceBelow', label: 'Space below (before the columns)', min: 0, max: 120, step: 4, unit: 'px', responsive: true },
  ],
}

export const headingOf = (section: { heading?: Partial<SectionHeading> }): SectionHeading => ({ ...headingDefaults, ...section.heading })

export const isHeadingEmpty = (h: SectionHeading) => !(h.showHeading && h.heading.trim()) && !(h.showDescription && h.description.trim())

const FLEX = { left: 'flex-start', center: 'center', right: 'flex-end' } as const

/** Styles for one section's heading, scoped by the section selector (e.g. `#cs-abc123`). */
export function headingSheet(sectionSel: string, h: SectionHeading, title = 'Section heading'): Sheet {
  const root = `${sectionSel} .section-heading`
  const align = responsive(h, 'alignment')
  const below = responsive(h, 'spaceBelow')
  const heading = responsiveType('section-heading-title', responsive(h, 'headingFont'))
  const desc = responsiveType('section-heading-description', responsive(h, 'descriptionFont'))

  /** Per-viewport values; media overrides reuse the base selectors exactly (same specificity). */
  const at = (vp: Viewport): Rule => {
    const d = vp === 'desktop'
    const a = d ? align.desktop : align[vp]
    const b = d ? below.desktop : below[vp]
    const t = d ? heading.base : heading[vp]
    const ds = d ? desc.base : desc[vp]
    return {
      sel: root,
      decls: { 'align-items': a && FLEX[a], 'margin-bottom': b === undefined ? undefined : `${b}px`, 'text-align': a },
      nest: [
        { sel: '.section-heading-title', decls: { ...t.decls, ...t.clamp } },
        { sel: '.section-heading-description', decls: { ...ds.decls, ...ds.clamp } },
      ],
    }
  }
  const base = at('desktop')

  return {
    scope: root,
    title,
    vars: [
      ...heading.vars,
      ...desc.vars,
      { name: 'section-heading-max-width', value: `${h.maxWidth}px`, group: 'Layout' },
      { name: 'section-heading-gap', value: `${h.gap}px`, group: 'Layout' },
    ],
    rules: [
      {
        sel: root,
        decls: {
          display: 'flex',
          'flex-direction': 'column',
          gap: '$$section-heading-gap',
          'max-width': '$$section-heading-max-width',
          'margin-right': 'auto',
          'margin-left': 'auto',
          ...base.decls,
        },
        nest: [
          { sel: '.section-heading-title', decls: { margin: 0, 'text-wrap': 'balance', ...base.nest![0].decls } },
          { sel: '.section-heading-description', decls: { margin: 0, ...base.nest![1].decls } },
        ],
      },
      { media: 'tablet', rules: [at('tablet')] },
      { media: 'mobile', rules: [at('mobile')] },
    ],
  }
}

export function SectionHeadingPreview({ heading: h }: { heading: SectionHeading }) {
  if (isHeadingEmpty(h)) return null
  const Heading = h.headingLevel
  return (
    <header className="section-heading">
      {h.showHeading && h.heading.trim() && <Heading className="section-heading-title">{h.heading}</Heading>}
      {h.showDescription && h.description.trim() && <p className="section-heading-description">{h.description}</p>}
    </header>
  )
}
