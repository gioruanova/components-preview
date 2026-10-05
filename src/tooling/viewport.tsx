import { createContext, useContext, useState, type ReactNode } from 'react'
import { VIEWPORT_ORDER, type Viewport } from './responsive'

/**
 * The viewport being previewed AND edited. The preview toolbar and the responsive fields share it,
 * so picking "Tablet" in the preview makes responsive fields edit their tablet values.
 */
type Ctx = { viewport: Viewport; setViewport: (v: Viewport) => void; viewports: Viewport[] }

const ViewportContext = createContext<Ctx | null>(null)

/** `viewports`: the ones this page offers (e.g. a header: desktop + mobile only). */
export function ViewportProvider({ children, viewports = VIEWPORT_ORDER }: { children: ReactNode; viewports?: Viewport[] }) {
  const [viewport, setViewport] = useState<Viewport>('desktop')
  return <ViewportContext.Provider value={{ viewport, setViewport, viewports }}>{children}</ViewportContext.Provider>
}

/** Falls back to local state when used outside a provider. */
export function useViewport(): Ctx {
  const ctx = useContext(ViewportContext)
  const [local, setLocal] = useState<Viewport>('desktop')
  return ctx ?? { viewport: local, setViewport: setLocal, viewports: VIEWPORT_ORDER }
}
