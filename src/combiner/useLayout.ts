import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { exampleLayout, loadLayout, saveLayout, type Layout } from './model'

export type Selection = { type: 'section'; id: string } | { type: 'item'; id: string } | null

/** Layout state, saved to this browser on every change. */
export function useLayout() {
  const [layout, setLayout] = useState<Layout>(loadLayout)
  const [saved, setSaved] = useState(true)
  const warned = useRef(false)

  useEffect(() => {
    const ok = saveLayout(layout)
    setSaved(ok)
    if (!ok && !warned.current) {
      warned.current = true
      toast.warning('Browser storage is full or blocked — this layout only lasts for this session')
    }
  }, [layout])

  const current = useRef(layout)
  current.current = layout

  const update = useCallback((fn: (l: Layout) => Layout) => setLayout(fn), [])

  /** Applies a destructive change and offers an Undo in the toast. */
  const updateWithUndo = useCallback((fn: (l: Layout) => Layout, message: string) => {
    const prev = current.current
    setLayout(fn(prev))
    toast(message, { action: { label: 'Undo', onClick: () => setLayout(prev) } })
  }, [])

  const reset = useCallback(() => updateWithUndo(() => exampleLayout(), 'Example layout restored'), [updateWithUndo])
  const clear = useCallback(() => updateWithUndo(() => ({ version: 1, sections: [] }), 'Layout cleared'), [updateWithUndo])

  return { layout, update, updateWithUndo, reset, clear, saved }
}
