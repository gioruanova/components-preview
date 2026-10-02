import { containerDefaults, containerFields, containerSheet, wrapHtml, type ContainerConfig } from './container'
import { json } from './codegen'
import { toCss, toScss, type Sheet } from './stylesheet'
import type { CodeFile, Config, FieldDef, WidgetDefinition } from './types'

/** Adds the global container options to a widget's defaults and schema (unless it opts out). */
export function withContainer(def: WidgetDefinition<Config>): WidgetDefinition<Config> {
  if (def.container === false) return def
  const fields = containerFields as unknown as FieldDef<Config>[]
  return {
    ...def,
    defaults: { ...containerDefaults, ...def.defaults },
    schema: {
      ...def.schema,
      widget: [...def.schema.widget, ...fields],
    },
  }
}

function sheets(def: WidgetDefinition<Config>, config: Config, mode: 'preview' | 'output'): Sheet[] {
  const container = def.container === false ? null : containerSheet(config as ContainerConfig, mode)
  return [...(container ? [container] : []), def.styles(config)]
}

/** CSS injected into the preview iframe — same generator as the CSS output, with real image URLs. */
export function previewCss(def: WidgetDefinition<Config>, config: Config): string {
  return toCss(sheets(def, config, 'preview'))
}

/** All output tabs: HTML, SCSS, CSS, Script, Data. */
export function outputFiles(def: WidgetDefinition<Config>, config: Config): CodeFile[] {
  const code = def.codegen(config)
  const html = def.container === false ? code.html : wrapHtml(config as ContainerConfig, code.html)
  const s = sheets(def, config, 'output')
  return [
    { id: 'html', label: 'HTML', language: 'markup', code: html },
    { id: 'scss', label: 'SCSS', language: 'css', code: toScss(s) },
    { id: 'css', label: 'CSS', language: 'css', code: toCss(s) },
    { id: 'script', label: 'Script', language: 'javascript', code: code.script },
    { id: 'data', label: 'Data', language: 'json', code: json(code.data) },
  ]
}
