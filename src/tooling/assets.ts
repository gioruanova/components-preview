import { useSyncExternalStore } from 'react'

/**
 * Background images for containers. A config stores a *reference*, never the image itself:
 *   ''              → none
 *   'sample:<id>'   → built-in soft decoration (SVG)
 *   'upload:<id>'   → user upload, kept in this browser's localStorage
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

// ---------- uploads (localStorage, with in-memory fallback) ----------

export type Upload = { id: string; name: string; url: string }

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

/** Downscale to keep localStorage small (max 1600px, JPEG). */
async function downscale(file: File, max = 1600): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const ratio = Math.min(1, max / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * ratio)
  canvas.height = Math.round(bitmap.height * ratio)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', 0.82)
}

export async function addUpload(file: File): Promise<{ upload: Upload; persisted: boolean }> {
  const upload = { id: crypto.randomUUID().slice(0, 8), name: file.name, url: await downscale(file) }
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
  if (ref.startsWith('upload:')) return uploads.find((u) => `upload:${u.id}` === ref)?.url ?? null
  return null
}

/** Readable file path for the exported code (the real asset gets uploaded to the site). */
export function outputPath(ref: string): string | null {
  if (ref.startsWith('sample:')) return `/assets/bg-${ref.slice(7)}.svg`
  if (ref.startsWith('upload:')) {
    const u = uploads.find((x) => `upload:${x.id}` === ref)
    return u ? `/assets/${slug(u.name) || 'background'}.jpg` : null
  }
  return null
}
