import { describe, expect, it } from 'vitest'
import { joinSelectors, toCss, toScss, type Sheet } from './stylesheet'

const sheet: Sheet = {
  scope: '.w',
  title: 'Widget',
  vars: [
    { name: 'brand', value: '#007bc7', group: 'Colors' },
    { name: 'gap', value: '20px', group: 'Layout' },
  ],
  rules: [
    {
      sel: '#w',
      decls: { color: '$$brand', gap: '$$gap', margin: 0, hidden: undefined },
      nest: [{ sel: '.item', decls: { padding: '4px' }, nest: [{ sel: '&:hover', decls: { color: 'red' } }] }],
    },
    { media: 'mobile', rules: [{ sel: '#w', decls: { gap: 'calc($$gap * 0.5)' } }] },
  ],
}

describe('stylesheet', () => {
  it('joins nested selectors, including & and commas', () => {
    expect(joinSelectors('#w', '.a')).toBe('#w .a')
    expect(joinSelectors('#w .a', '&:hover, &:focus')).toBe('#w .a:hover, #w .a:focus')
    expect(joinSelectors('.a, .b', '.c')).toBe('.a .c, .b .c')
  })

  it('renders CSS with custom properties on the scope', () => {
    const css = toCss([sheet])
    expect(css).toContain('.w {\n  --brand: #007bc7;\n  --gap: 20px;\n}')
    expect(css).toContain('#w {\n  color: var(--brand);\n  gap: var(--gap);\n  margin: 0;\n}')
    expect(css).toContain('#w .item:hover {\n  color: red;\n}')
    expect(css).toContain('@media (max-width: 480px) {\n  #w {\n    gap: calc(var(--gap) * 0.5);\n  }\n}')
    expect(css).not.toContain('hidden')
  })

  it('renders SCSS with grouped $variables and nesting', () => {
    const scss = toScss([sheet])
    expect(scss).toContain('$bp-mobile: 480px;')
    expect(scss).toContain('// Colors\n$brand: #007bc7;')
    expect(scss).toContain('  .item {\n    padding: 4px;\n    &:hover {\n      color: red;\n    }\n  }')
    expect(scss).toContain('@media (max-width: $bp-mobile) {\n  #w {\n    gap: calc($gap * 0.5);\n  }\n}')
  })
})
