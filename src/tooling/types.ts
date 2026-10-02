import type { ComponentType } from 'react'
import type { LucideIcon } from 'lucide-react'
import type { Sheet } from './stylesheet'

/** Config sections, rendered top to bottom in the config panel (Updates §3.1). */
export type Section = 'content' | 'widget' | 'styles'

export type Status = 'stable' | 'beta' | 'draft' | 'deprecated'

export type Option = { value: string; label: string }

/** Any widget config is a flat object of serialisable values. */
export type Config = Record<string, unknown>

type BaseField<C extends Config> = {
  /** Config key this field reads/writes. */
  key: Extract<keyof C, string>
  label: string
  help?: string
  /** Short explanation shown in an info tooltip next to the label. */
  tip?: string
  /** Hide the field when this returns false (e.g. radius only for square cards). */
  visibleWhen?: (config: C) => boolean
}

export type TextField<C extends Config> = BaseField<C> & { type: 'text'; placeholder?: string }
export type TextareaField<C extends Config> = BaseField<C> & { type: 'textarea'; rows?: number }
export type SwitchField<C extends Config> = BaseField<C> & { type: 'switch'; hint?: string }
/** A switch plus the input it enables (e.g. Show title + title text). `key` is the text, `toggleKey` the boolean. */
export type SwitchTextField<C extends Config> = BaseField<C> & {
  type: 'switchText'
  toggleKey: Extract<keyof C, string>
  multiline?: boolean
  placeholder?: string
}
export type SelectField<C extends Config> = BaseField<C> & { type: 'select'; options: Option[] }
export type SegmentedField<C extends Config> = BaseField<C> & { type: 'segmented'; options: Option[] }
/** Backgrounds/shapes/borders allow transparency by default; set `solid` for colors that must be opaque. */
export type ColorField<C extends Config> = BaseField<C> & { type: 'color'; solid?: boolean }
export type SliderField<C extends Config> = BaseField<C> & {
  type: 'slider'
  min: number
  max: number
  step?: number
  unit?: string
}
export type StepperField<C extends Config> = BaseField<C> & { type: 'stepper'; min: number; max: number }
/** Font family, size, weight, line height, spacing, color, transform, italic — value is a `Typography`. */
export type TypographyField<C extends Config> = BaseField<C> & { type: 'typography' }
/** Per-button custom style (switch + panel). Value is a `ButtonStyle` (see tooling/buttons). */
export type ButtonStyleField<C extends Config> = BaseField<C> & { type: 'buttonStyle' }
/** Background image picker: none / sample decorations / uploads. Value is a reference string (see tooling/assets). */
export type ImageField<C extends Config> = BaseField<C> & { type: 'image' }

/** Fields shown for each item of a `list` field. Keys refer to the item object. */
export type ItemField = {
  key: string
  label: string
  type: 'text' | 'textarea'
  placeholder?: string
  tip?: string
}

/** Repeatable items (e.g. cards). When `countKey` is set, that number field decides how many are shown. */
export type ListField<C extends Config> = BaseField<C> & {
  type: 'list'
  itemFields: ItemField[]
  itemLabel: (index: number) => string
  countKey?: Extract<keyof C, string>
  newItem: (index: number) => Record<string, unknown>
}

export type LeafField<C extends Config> =
  | TextField<C>
  | TextareaField<C>
  | SwitchField<C>
  | SwitchTextField<C>
  | SelectField<C>
  | SegmentedField<C>
  | ColorField<C>
  | SliderField<C>
  | StepperField<C>
  | TypographyField<C>
  | ImageField<C>
  | ButtonStyleField<C>
  | ListField<C>

/** Visual grouping of fields under a small heading (e.g. "Button 1"). */
export type GroupField<C extends Config> = {
  type: 'group'
  label: string
  fields: LeafField<C>[]
  visibleWhen?: (config: C) => boolean
}

export type FieldDef<C extends Config> = LeafField<C> | GroupField<C>

export type Schema<C extends Config> = Record<Section, FieldDef<C>[]>

export type CodeFile = { id: string; label: string; language: 'markup' | 'javascript' | 'json' | 'css'; code: string }

/** What a widget's codegen returns. The tooling adds the container wrapper and the SCSS / CSS outputs. */
export type WidgetCode = { html: string; script: string; data: unknown }

export type WidgetDefinition<C extends Config = Config> = {
  name: string
  status: Status
  /** Lower comes first inside its category. */
  order?: number
  /** One-line summary shown on the category overview. */
  summary: string
  /** Functional description bullets. Inline `code` in backticks is rendered as code. */
  description: string[]
  /** Optional hint shown above the live preview. */
  previewHint?: string
  defaults: C
  schema: Schema<C>
  Preview: ComponentType<{ config: C }>
  /** Widget styles from config. Rendered into the preview and exported as SCSS + CSS. */
  styles: (config: C) => Sheet
  codegen: (config: C) => WidgetCode
  /** When true the preview shows the "Component empty/removed" state. */
  isEmpty?: (config: C) => boolean
  /** Set to false to hide the global "Uses container" options. */
  container?: false
}

export type CategoryDefinition = {
  name: string
  description: string
  /** Shown in the collapsed (icon-only) sidebar. */
  icon?: LucideIcon
  order?: number
  /** Planned components: listed in the nav with a "coming soon" page until a real folder replaces them. */
  upcoming?: { name: string; summary?: string }[]
}

/** Identity helper so widget files get full type inference on their config. */
export function defineWidget<C extends Config>(def: WidgetDefinition<C>): WidgetDefinition<C> {
  return def
}

export function defineCategory(def: CategoryDefinition): CategoryDefinition {
  return def
}
