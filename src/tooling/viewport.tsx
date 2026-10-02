import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Viewport } from './responsive'

/**
 * The viewport being previewed AND edited. The preview toolbar and the responsive fields share it,
 * so picking "Tablet" in the preview makes responsive fields edit their tablet values.
 */
type Ctx = { viewport: Viewport; setViewport: (v: Viewport) => void }

const ViewportContext = createContext<Ctx | null>(null)

export function ViewportProvider({ children }: { children: ReactNode }) {
  const [viewport, setViewport] = useState<Viewport>('desktop')
  return <ViewportContext.Provider value={{ viewport, setViewport }}>{children}</ViewportContext.Provider>
}

/** Falls back to local state when used outside a provider. */
export function useViewport(): Ctx {
  const ctx = useContext(ViewportContext)
  const [local, setLocal] = useState<Viewport>('desktop')
  return ctx ?? { viewport: local, setViewport: setLocal }
}
