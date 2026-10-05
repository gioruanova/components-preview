import { Burger, Countdown, Logo, Nav, Spacer, Ticket, TopContent, useHeader } from '../shared/parts'
import type { HeaderConfig } from './schema'

/** startermango structure: everything is a grid item of `.headerInnerContent`. */
export function Preview({ config: c }: { config: HeaderConfig }) {
  const { p, open, toggle, headerRef, spacer } = useHeader(c)
  return (
    <>
      <header ref={headerRef} className={`header ticket-${c.ticketPlacement}${c.fixed ? ' header-fixed' : ''}`} id={c.widgetId}>
        <span className="headerInnerContent">
          <Logo c={c} />
          <Countdown p={p} />
          <TopContent c={c} p={p} />
          <Ticket p={p} />
          <Burger open={open} toggle={toggle} />
          <Nav open={open} />
        </span>
      </header>
      <Spacer c={c} height={spacer} />
    </>
  )
}
