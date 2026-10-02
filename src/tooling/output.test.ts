import { describe, expect, it } from 'vitest'
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
})
