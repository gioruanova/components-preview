import { widthDecls } from '@/tooling/layout'
import type { Sheet } from '@/tooling/stylesheet'
import { collapsedAreas, headerElementStyles, quote } from '../shared/styles'
import type { HeaderConfig } from './schema'

export function styles(c: HeaderConfig): Sheet {
  const root = `#${c.widgetId}`
  // mango look: orange gradient ticket, dark capitalized menu links
  const { p, vars, root: rootDecls, elements, mobile } = headerElementStyles(c, {
    ticket: { background: 'linear-gradient(183deg, #ffa700 45%, #f26922 75%)', hoverBackground: '#f26922', radius: '5px', padding: '14px 18px' },
    nav: { color: '#313841', hoverColor: '#0079c2', transform: 'capitalize', padding: '9px 20px' },
  })
  const ticketTop = c.ticketPlacement === 'top'

  /**
   * Desktop grid: the logo spans both rows; countdown, top container and ticket share the top row; the menu fills the
   * second row ("Next to navigation" moves the ticket there).
   */
  const cols = ['logo', ...(p.countdown && c.showCountdown ? ['countdown'] : []), 'top', ...(p.ticket ? ['ticket'] : [])]
  const row1 = cols.map((a) => (a === 'ticket' && !ticketTop ? 'top' : a))
  const row2 = cols.map((a) => (a === 'logo' ? 'logo' : a === 'ticket' && !ticketTop ? 'ticket' : 'nav'))

  return {
    scope: root,
    title: 'Header',
    vars,
    rules: [
      {
        sel: root,
        decls: rootDecls,
        nest: [
          {
            sel: '.headerInnerContent',
            decls: {
              'box-sizing': 'border-box',
              display: 'grid',
              'grid-template-columns': cols.map((a) => (a === 'top' ? '1fr' : 'auto')).join(' '),
              'grid-template-areas': quote([row1, row2]),
              'align-items': 'center',
              gap: '6px 20px',
              ...widthDecls(c, 'header-max-width'),
              margin: '0 auto',
              padding: '12px 20px 0',
            },
          },
          ...elements,
          { sel: '.nav', decls: { 'grid-area': 'nav', display: 'flex', 'justify-content': 'flex-end' } },
        ],
      },
      // collapsed header (own breakpoint, no tablet step); same nesting as the base rules
      {
        media: c.breakpoint,
        rules: [{ sel: root, nest: [{ sel: '.headerInnerContent', decls: { ...collapsedAreas(c, p, true), padding: '10px 15px' } }, ...mobile] }],
      },
    ],
  }
}
