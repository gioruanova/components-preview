/**
 * Saffire starter layouts (the "fruit" starter sites). Components list the ones that use them with
 * `starterLayouts: ['mango', …]` — on a widget definition or an `upcoming` entry — and the page shows a
 * "Starter layout usage" section with these pills (see StarterLayoutUsage.tsx).
 *
 * Add a new starter layout here once; every component can then reference it (typos fail typecheck).
 */
export const STARTER_LAYOUTS = {
  cherry: { name: 'Cherry', color: '#d7263d', background: '#fde2e4', text: '#8f1726' },
  mango: { name: 'Mango', color: '#ff8c1a', background: '#ffe8cc', text: '#8a4300' },
  banana: { name: 'Banana', color: '#f5c518', background: '#fff4c2', text: '#6b5200' },
  peach: { name: 'Peach', color: '#ff9e7a', background: '#ffe4d9', text: '#93391a' },
  grape: { name: 'Grape', color: '#8e44ad', background: '#efe3fa', text: '#56277f' },
  lemon: { name: 'Lemon', color: '#c6d42b', background: '#f6f8cf', text: '#555b00' },
} as const satisfies Record<string, { name: string; color: string; background: string; text: string }>

export type StarterLayoutId = keyof typeof STARTER_LAYOUTS
