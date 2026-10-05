import { useSyncExternalStore } from 'react'

import type { ImageLibrary } from './types'

/**
 * Images picked in the config (see the `image` field). A config stores a *reference*, never the image itself:
 *   ''              → none
 *   'sample:<id>'   → built-in soft background decoration (SVG)            — library 'background'
 *   'icon:<id>'     → built-in placeholder icon (SVG, white strokes)         — library 'icon'
 *   'upload:<id>'   → user upload, kept in this browser's localStorage. Backgrounds become JPEG (max 1600px);
 *                     icons must be PNG and stay PNG (transparency kept, max 256px).
 */

const svg = (body: string) => `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice">${body}</svg>`)}`

export const SAMPLE_IMAGES = [
  {
    id: 'blobs',
    name: 'Soft blobs',
    url: svg(
      `<defs><filter id="b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="70"/></filter></defs><rect width="1200" height="600" fill="#f4f9fd"/><g filter="url(#b)" opacity=".75"><circle cx="220" cy="140" r="190" fill="#bfe3fa"/><circle cx="980" cy="460" r="230" fill="#ffd9c2"/><circle cx="700" cy="80" r="140" fill="#d7f0d8"/></g>`,
    ),
  },
  {
    id: 'waves',
    name: 'Waves',
    url: svg(
      `<rect width="1200" height="600" fill="#f6fafd"/><path d="M0 420 C 200 360 400 480 600 420 S 1000 360 1200 420 V600 H0Z" fill="#e3f1fb"/><path d="M0 480 C 250 430 450 540 700 480 S 1050 430 1200 480 V600 H0Z" fill="#d2e9f8"/><path d="M0 540 C 300 500 500 590 800 540 S 1100 510 1200 540 V600 H0Z" fill="#c3e1f5"/>`,
    ),
  },
  {
    id: 'dots',
    name: 'Dot grid',
    url: svg(
      `<defs><pattern id="d" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="2" fill="#c9dbe8"/></pattern><radialGradient id="f" cx=".5" cy=".5" r=".7"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff"/></radialGradient></defs><rect width="1200" height="600" fill="#fafcfe"/><rect width="1200" height="600" fill="url(#d)"/><rect width="1200" height="600" fill="url(#f)"/>`,
    ),
  },
  {
    id: 'rings',
    name: 'Rings',
    url: svg(
      `<rect width="1200" height="600" fill="#fbf8f5"/><g fill="none" stroke="#f3dccd" stroke-width="2">${Array.from({ length: 9 }, (_, i) => `<circle cx="1080" cy="80" r="${60 + i * 55}"/>`).join('')}</g><g fill="none" stroke="#d6e8f4" stroke-width="2">${Array.from({ length: 7 }, (_, i) => `<circle cx="80" cy="560" r="${50 + i * 55}"/>`).join('')}</g>`,
    ),
  },
  {
    id: 'diagonal',
    name: 'Diagonal light',
    url: svg(
      `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e8f4fc"/><stop offset=".55" stop-color="#ffffff"/><stop offset="1" stop-color="#fdeee4"/></linearGradient></defs><rect width="1200" height="600" fill="url(#g)"/><g fill="#ffffff" opacity=".55"><polygon points="0,0 420,0 0,600"/><polygon points="760,600 1200,180 1200,600"/></g>`,
    ),
  },
] as const

const icon = (body: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`)}`

/** 8 placeholder icons for the `icon` library (replace with the real brand icons when available). */
export const SAMPLE_ICONS = [
  { id: 'ticket', name: 'Ticket', url: icon('<path d="M3 8a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-2a2 2 0 0 0 0-4Z"/><path d="M14 6v12" stroke-dasharray="2 2"/>') },
  { id: 'calendar', name: 'Calendar', url: icon('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>') },
  { id: 'map-pin', name: 'Map pin', url: icon('<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11Z"/><circle cx="12" cy="10" r="2.5"/>') },
  { id: 'star', name: 'Star', url: icon('<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9Z"/>') },
  { id: 'info', name: 'Info', url: icon('<circle cx="12" cy="12" r="9"/><path d="M12 16v-5M12 8h.01"/>') },
  { id: 'bag', name: 'Shopping bag', url: icon('<path d="M5 8h14l-1 13H6Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>') },
  { id: 'phone', name: 'Phone', url: icon('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/>') },
  { id: 'user', name: 'User', url: icon('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>') },
] as const

// ---------- uploads (localStorage, with in-memory fallback) ----------

/** `kind` is missing on uploads saved before icons existed: those are backgrounds. */
export type Upload = { id: string; name: string; url: string; kind?: ImageLibrary }

const KEY = 'live-preview:uploads'
const MAX_UPLOADS = 8
let uploads: Upload[] = load()
const listeners = new Set<() => void>()

function load(): Upload[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]')
  } catch {
    return []
  }
}

/** Returns false when the browser refused to persist (quota / private mode) — the image still works this session. */
function persist(): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(uploads))
    return true
  } catch {
    return false
  }
}

function emit() {
  listeners.forEach((l) => l())
}

export function useUploads() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => uploads,
  )
}

/** Downscale to keep localStorage small: backgrounds max 1600px JPEG, icons max 256px PNG (keeps transparency). */
async function downscale(file: File, kind: ImageLibrary): Promise<string> {
  const max = kind === 'icon' ? 256 : 1600
  const bitmap = await createImageBitmap(file)
  const ratio = Math.min(1, max / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * ratio)
  canvas.height = Math.round(bitmap.height * ratio)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  return kind === 'icon' ? canvas.toDataURL('image/png') : canvas.toDataURL('image/jpeg', 0.82)
}

/** File types a library accepts for uploads. */
export const ACCEPT: Record<ImageLibrary, string> = { background: 'image/*', icon: 'image/png' }

export const uploadsOf = (all: Upload[], kind: ImageLibrary) => all.filter((u) => (u.kind ?? 'background') === kind)

export async function addUpload(file: File, kind: ImageLibrary = 'background'): Promise<{ upload: Upload; persisted: boolean }> {
  const upload: Upload = { id: crypto.randomUUID().slice(0, 8), name: file.name, url: await downscale(file, kind), kind }
  uploads = [upload, ...uploads].slice(0, MAX_UPLOADS)
  const persisted = persist()
  emit()
  return { upload, persisted }
}

export function removeUpload(id: string) {
  uploads = uploads.filter((u) => u.id !== id)
  persist()
  emit()
}

// ---------- resolving references ----------

const slug = (s: string) => s.toLowerCase().replace(/\.[a-z0-9]+$/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

/** URL to render in the preview. */
export function previewUrl(ref: string): string | null {
  if (ref.startsWith('sample:')) return SAMPLE_IMAGES.find((s) => `sample:${s.id}` === ref)?.url ?? null
  if (ref.startsWith('icon:')) return SAMPLE_ICONS.find((s) => `icon:${s.id}` === ref)?.url ?? null
  if (ref.startsWith('upload:')) return uploads.find((u) => `upload:${u.id}` === ref)?.url ?? null
  return null
}

/** Readable file path for the exported code (the real asset gets uploaded to the site). */
export function outputPath(ref: string): string | null {
  if (ref.startsWith('sample:')) return `/assets/bg-${ref.slice(7)}.svg`
  if (ref.startsWith('icon:')) return `/assets/icons/${ref.slice(5)}.svg`
  if (ref.startsWith('upload:')) {
    const u = uploads.find((x) => `upload:${x.id}` === ref)
    if (!u) return null
    return u.kind === 'icon' ? `/assets/icons/${slug(u.name) || 'icon'}.png` : `/assets/${slug(u.name) || 'background'}.jpg`
  }
  return null
}
