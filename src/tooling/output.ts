import { containerDefaults, containerFields, containerSheet, wrapHtml, type ContainerConfig } from './container'
import { json } from './codegen'
import { toCss, toScss, type Sheet } from './stylesheet'
import { profile, type CodeTabId } from './outputProfile'
import type { RegisteredWidget } from './registry'
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

const COMMENT: Record<CodeTabId, (t: string) => string> = {
  html: (t) => `<!-- ${t} -->`,
  scss: (t) => `// ${t}`,
  css: (t) => `/* ${t} */`,
  script: (t) => `// ${t}`,
  data: () => '', // JSON has no comments
}

/** Output tabs, in the order/labels/headers defined by the output profile. */
export function outputFiles(def: RegisteredWidget, config: Config): CodeFile[] {
  const code = def.codegen(config)
  const html = def.container === false ? code.html : wrapHtml(config as ContainerConfig, code.html)
  const s = sheets(def, config, 'output')
  const files: Record<CodeTabId, Omit<CodeFile, 'label'>> = {
    html: { id: 'html', language: 'markup', code: html },
    scss: { id: 'scss', language: 'css', code: toScss(s) },
    css: { id: 'css', language: 'css', code: toCss(s) },
    script: { id: 'script', language: 'javascript', code: code.script },
    data: { id: 'data', language: 'json', code: json(code.data) },
  }
  return profile.tabs.map((id) => {
    const header = profile.header?.(id, def)
    const comment = header ? COMMENT[id](header) : ''
    return { ...files[id], label: profile.labels[id], code: comment ? `${comment}\n${files[id].code}` : files[id].code }
  })
}
