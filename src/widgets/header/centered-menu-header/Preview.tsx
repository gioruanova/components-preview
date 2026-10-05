import { Burger, Countdown, Logo, Nav, Spacer, Ticket, TopContent, useHeader } from '../shared/parts'
import type { CenteredHeaderConfig } from './schema'

/** startercherry structure: three-zone top row + full-width menu bar. */
export function Preview({ config: c }: { config: CenteredHeaderConfig }) {
  const { p, open, toggle, headerRef, spacer } = useHeader(c)
  return (
    <>
      <header ref={headerRef} className={`header header-centered${c.fixed ? ' header-fixed' : ''}`} id={c.widgetId}>
        <span className="headerInnerContent">
          <div className="top-header">
            <div className="top-header-left">
              <Countdown p={p} />
            </div>
            <div className="top-header-center">
              <Logo c={c} />
            </div>
            <div className="top-header-right">
              <TopContent c={c} p={p} />
              <Ticket p={p} />
            </div>
            <Burger open={open} toggle={toggle} />
          </div>
          <div className="bottom-header">
            <Nav open={open} />
          </div>
        </span>
      </header>
      <Spacer c={c} height={spacer} />
    </>
  )
}
