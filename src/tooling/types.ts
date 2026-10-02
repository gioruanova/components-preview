import type { ComponentType } from 'react'

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
export type ColorField<C extends Config> = BaseField<C> & { type: 'color' }
export type SliderField<C extends Config> = BaseField<C> & {
  type: 'slider'
  min: number
  max: number
  step?: number
  unit?: string
}
export type StepperField<C extends Config> = BaseField<C> & { type: 'stepper'; min: number; max: number }

/** Fields shown for each item of a `list` field. Keys refer to the item object. */
export type ItemField = {
  key: string
  label: string
  type: 'text' | 'textarea'
  placeholder?: string
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
  /** Widget CSS injected into the preview iframe (import with `?inline`). */
  styles: string
  codegen: (config: C) => CodeFile[]
  /** When true the preview shows the "Component empty/removed" state. */
  isEmpty?: (config: C) => boolean
}

export type CategoryDefinition = {
  name: string
  description: string
  order?: number
}

/** Identity helper so widget files get full type inference on their config. */
export function defineWidget<C extends Config>(def: WidgetDefinition<C>): WidgetDefinition<C> {
  return def
}

export function defineCategory(def: CategoryDefinition): CategoryDefinition {
  return def
}
