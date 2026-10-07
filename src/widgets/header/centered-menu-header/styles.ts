import { widthDecls } from '@/tooling/layout'
import type { Sheet } from '@/tooling/stylesheet'
import { collapsedAreas, headerElementStyles } from '../shared/styles'
import type { CenteredHeaderConfig } from './schema'

export function styles(c: CenteredHeaderConfig): Sheet {
  const root = `#${c.widgetId}`
  // cherry look: flat square orange ticket, white uppercase links on the menu bar
  const shared = headerElementStyles(c, {
    ticket: { background: '#f26922', hoverBackground: '#d4561a', radius: '0', padding: '12px 20px' },
    nav: { color: c.navColor, hoverColor: c.navHoverColor, transform: 'uppercase', padding: '16px 20px' },
  })
  const zone = (justify: string) => ({ display: 'flex', 'justify-content': justify, 'align-items': 'center', gap: '20px', 'min-width': 0 })

  return {
    scope: root,
    title: 'Header',
    vars: [...shared.vars, ...(shared.p.nav ? [{ name: 'header-nav-bg', value: c.navBackground, group: 'Colors' as const }] : [])],
    rules: [
      {
        sel: root,
        decls: shared.root,
        nest: [
          { sel: '.headerInnerContent', decls: { display: 'block' } },
          // three zones: the logo stays centered whatever the side zones hold (1fr | auto | 1fr)
          {
            sel: '.top-header',
            decls: {
              'box-sizing': 'border-box',
              display: 'grid',
              'grid-template-columns': '1fr auto 1fr',
              'align-items': 'center',
              gap: '20px',
              ...widthDecls(c, 'header-max-width'),
              margin: '0 auto',
              padding: '15px 20px',
            },
          },
          { sel: '.top-header-left', decls: zone('flex-start') },
          { sel: '.top-header-center', decls: zone('center') },
          { sel: '.top-header-right', decls: zone('flex-end') },
          // full-width menu bar (only with the navigation)
          ...(shared.p.nav ? [{ sel: '.bottom-header', decls: { 'background-color': '$$header-nav-bg' } }] : []),
          ...shared.elements,
          ...(shared.p.nav ? [{ sel: '.nav', decls: { display: 'flex', 'justify-content': 'center', ...widthDecls(c, 'header-max-width'), margin: '0 auto' } }] : []),
        ],
      },
      // collapsed header (own breakpoint, no tablet step): the zones dissolve (display: contents) into one grid
      {
        media: c.breakpoint,
        rules: [
          {
            sel: root,
            nest: [
              { sel: '.top-header', decls: { ...collapsedAreas(c, shared.p, false), gap: '6px 15px', padding: '10px 15px' } },
              { sel: '.top-header-left', decls: { display: 'contents' } },
              { sel: '.top-header-center', decls: { display: 'contents' } },
              { sel: '.top-header-right', decls: { display: 'contents' } },
              ...(shared.p.nav ? [{ sel: '.bottom-header', decls: { padding: '0 15px' } }] : []),
              ...shared.mobile,
            ],
          },
        ],
      },
    ],
  }
}
