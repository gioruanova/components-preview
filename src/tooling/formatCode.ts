import type { Plugin } from 'prettier'
import prettierConfig from '../../output-standards/prettier.json'
import type { CodeTabId } from './outputProfile'
import type { CodeFile } from './types'

/**
 * Formats the generated code with `output-standards/prettier.json` (the same config the real codebase uses).
 * Prettier (standalone build + plugins) is loaded on demand, so it never weighs on the first page load.
 * Used by the Output code panel (what you see and copy) and by the standards tests.
 */
export const PARSERS: Record<CodeTabId, string> = { html: 'html', scss: 'scss', css: 'css', script: 'babel', data: 'json' }

let loading: Promise<{ format: (code: string, parser: string) => Promise<string> }> | null = null

function loadPrettier() {
  loading ??= Promise.all([
    import('prettier/standalone'),
    import('prettier/plugins/postcss'),
    import('prettier/plugins/html'),
    import('prettier/plugins/babel'),
    import('prettier/plugins/estree'),
  ]).then(([prettier, ...plugins]) => ({
    format: (code: string, parser: string) =>
      prettier.format(code, { ...(prettierConfig as object), parser, plugins: plugins as unknown as Plugin[] }),
  }))
  return loading
}

/** Formats every tab; a tab that can't be parsed is returned unchanged (never blocks the output). */
export async function formatFiles(files: CodeFile[]): Promise<CodeFile[]> {
  const { format } = await loadPrettier()
  return Promise.all(
    files.map(async (f) => {
      const parser = PARSERS[f.id as CodeTabId]
      if (!parser) return f
      try {
        return { ...f, code: await format(f.code, parser) }
      } catch {
        return f
      }
    }),
  )
}
