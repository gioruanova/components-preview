import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { previewUrl, useUploads } from '@/tooling/assets'
import { linkAttributes } from '@/tooling/codegen'
import { previewLinkClick } from '@/tooling/previewLinks'
import type { HeaderBaseConfig } from './config'
import { headerParts, ICONS, NAV_ITEMS, SAMPLE, type HeaderParts } from './markup'

/** Preview building blocks shared by every header (same markup as the HTML fragments in markup.ts). */

/** Renders one of the shared inline SVG icons. */
export function Icon({ svg }: { svg: string }) {
  const inner = svg.replace(/^<svg[^>]*>|<\/svg>$/g, '')
  return <svg className="header-icon" viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{ __html: inner }} />
}

export const Link = ({ url, label, className, children }: { url: string; label: string; className?: string; children: ReactNode }) => (
  <a href={url} className={className} onClick={previewLinkClick(url)} {...linkAttributes(url, label)}>
    {children}
  </a>
)

/** Parts + burger state + the fixed-header spacer height (same as the generated script). */
export function useHeader(c: HeaderBaseConfig) {
  useUploads() // re-render when an uploaded logo / icon changes
  const [open, setOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const [spacer, setSpacer] = useState(0)
  useLayoutEffect(() => {
    const el = headerRef.current
    if (!c.fixed || !el) return
    const sync = () => setSpacer(el.offsetHeight)
    const ro = new ResizeObserver(sync)
    ro.observe(el)
    sync()
    return () => ro.disconnect()
  }, [c.fixed])
  return { p: headerParts(c), open, toggle: () => setOpen((o) => !o), headerRef, spacer }
}

export function Logo({ c }: { c: HeaderBaseConfig }) {
  const logo = previewUrl(c.logo)
  return (
    <Link url="/" label={c.organizationName} className="header-logo">
      {logo && <img src={logo} alt={c.organizationName} />}
    </Link>
  )
}

export function Countdown({ p }: { p: HeaderParts }) {
  if (!p.countdown) return null
  const icon = previewUrl(p.countdownIcon)
  // the icon is a mask, painted in one plain color (works for the SVG icons and PNG uploads)
  const glyph = icon ? { maskImage: `url("${icon}")` } : undefined
  return (
    <div className="header-countdown">
      {glyph && (
        <span className="countdown-icon">
          <span className="countdown-icon-glyph" style={glyph} />
        </span>
      )}
      {/* date + event name come from Site settings → Countdown (samples here) */}
      <span className="countdown-text">
        <span className="countdown-date">{SAMPLE.countdownDate}</span>
        <span className="countdown-event">{SAMPLE.countdownEvent}</span>
      </span>
    </div>
  )
}

export function TopContent({ c, p }: { c: HeaderBaseConfig; p: HeaderParts }) {
  return (
    <div className="top-content">
      {p.search && (
        <div className={`searchBox search-${c.searchMode}`}>
          <button className="searchBoxClicker" type="button" aria-label={c.searchLabel}>
            <Icon svg={ICONS.search} />
          </button>
          <div className="searchBoxInput">
            <input type="text" placeholder={c.searchLabel} aria-label={c.searchLabel} />
          </div>
          {c.showSearchWord && <span className="searchBoxLabel">{c.searchLabel}</span>}
        </div>
      )}
      {p.login && (
        <Link url={p.login.url} label={p.login.label} className="header-login">
          <Icon svg={ICONS.user} />
          <span>{p.login.label}</span>
        </Link>
      )}
      {p.weather && (
        <div className="header-weather">
          <Icon svg={ICONS.weather} />
          <span className="weather-temp">{SAMPLE.temperature}</span>
        </div>
      )}
      {p.hours && (
        <Link url={p.hours.url} label={p.hours.label} className="header-hours">
          {c.showHoursIcon && <Icon svg={ICONS.pin} />}
          <span>{p.hours.label}</span>
        </Link>
      )}
      {p.cart && (
        <div className="viewcart">
          <Link url="/cart" label="Cart" className="cartMenuLink">
            <Icon svg={ICONS.cart} />
            <span className="cart-count">{SAMPLE.cartCount}</span>
          </Link>
        </div>
      )}
    </div>
  )
}

export function Ticket({ p }: { p: HeaderParts }) {
  if (!p.ticket) return null
  return (
    <div id="customTicketButton">
      <Link url={p.ticket.url} label={p.ticket.label} className="button alternative-btn">
        <span className="btn-label">{p.ticket.label}</span>
      </Link>
    </div>
  )
}

export function Burger({ open, toggle }: { open: boolean; toggle: () => void }) {
  return (
    <div
      className="mobile-nav-toggle"
      role="button"
      tabIndex={0}
      aria-label="Toggle mobile menu"
      aria-expanded={open}
      onClick={toggle}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), toggle())}
    >
      <Icon svg={ICONS.burger} />
    </div>
  )
}

export function Nav({ open }: { open: boolean }) {
  return (
    <nav className={`nav${open ? ' is-open' : ''}`} id="mainNavigation">
      <ul className="groups">
        {NAV_ITEMS.map((item) => (
          <li key={item.label} className="group">
            <Link url={item.url} label={item.label}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export const Spacer = ({ c, height }: { c: HeaderBaseConfig; height: number }) =>
  c.fixed ? <div className="header-spacer" aria-hidden="true" style={{ height }} /> : null
