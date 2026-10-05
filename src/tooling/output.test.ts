import { describe, expect, it } from 'vitest'
import { WIDGET_SPACING } from './container'
import { outputFiles, previewCss } from './output'
import { profile } from './outputProfile'
import { categories } from './registry'

const widgets = categories.flatMap((c) => c.widgets)

describe('output', () => {
  it('produces the profile tabs, in order, for every registered widget', () => {
    expect(widgets.length).toBeGreaterThan(0)
    for (const w of widgets) {
      const files = outputFiles(w, w.defaults)
      expect(files.map((f) => f.id)).toEqual(profile.tabs)
      expect(files.map((f) => f.label)).toEqual(profile.tabs.map((t) => profile.labels[t]))
      expect(files.every((f) => f.code.length > 0)).toBe(true)
    }
  })

  it('wraps HTML and CSS with the profile container class names', () => {
    const w = widgets[0]
    const config = { ...w.defaults, useContainer: true }
    const [html] = outputFiles(w, config)
    expect(html.code).toContain(`class="${profile.classNames.container}"`)
    expect(previewCss(w, config)).toContain(`.${profile.classNames.container} > .${profile.classNames.containerInner}`)
  })

  it('gives every widget wrapper the same spacing, only when no container provides it', () => {
    for (const w of widgets) {
      const scope = w.styles(w.defaults).scope
      // every top-level block of the wrapper selector (variables block + rule)
      const wrapper = (css: string) =>
        css
          .split('\n\n')
          .filter((b) => b.startsWith(`${scope} {`))
          .join('\n')
      expect(wrapper(previewCss(w, { ...w.defaults, useContainer: false })), w.path).toContain(`padding: ${WIDGET_SPACING};`)
      expect(wrapper(previewCss(w, { ...w.defaults, useContainer: true })), w.path).not.toContain('padding')
      expect(wrapper(previewCss(w, { ...w.defaults, useContainer: false }, { inContainer: true })), w.path).not.toContain('padding')
      const css = outputFiles(w, { ...w.defaults, useContainer: false }).find((f) => f.id === 'css')!.code
      expect(css).toContain(`padding: ${WIDGET_SPACING};`)
    }
  })
})
