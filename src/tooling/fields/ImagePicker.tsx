import { useRef } from 'react'
import { Ban, Check, ImagePlus, X } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { ACCEPT, SAMPLE_ICONS, SAMPLE_IMAGES, addUpload, removeUpload, uploadsOf, useUploads } from '../assets'
import type { ImageLibrary } from '../types'

type Tile = { ref: string; name: string; url?: string; removable?: boolean }

export function ImagePicker({ id, value, onChange, library = 'background' }: { id: string; value: string; onChange: (v: string) => void; library?: ImageLibrary }) {
  const uploads = uploadsOf(useUploads(), library)
  const input = useRef<HTMLInputElement>(null)
  const icons = library === 'icon'

  const tiles: Tile[] = [
    { ref: '', name: 'None' },
    ...(icons
      ? SAMPLE_ICONS.map((s) => ({ ref: `icon:${s.id}`, name: s.name, url: s.url }))
      : SAMPLE_IMAGES.map((s) => ({ ref: `sample:${s.id}`, name: s.name, url: s.url }))),
    ...uploads.map((u) => ({ ref: `upload:${u.id}`, name: u.name, url: u.url, removable: true })),
  ]

  const onFile = async (file?: File) => {
    if (!file) return
    if (icons && file.type !== 'image/png') return toast.error('Icons must be PNG files')
    if (!file.type.startsWith('image/')) return toast.error('Please choose an image file')
    try {
      const { upload, persisted } = await addUpload(file, library)
      onChange(`upload:${upload.id}`)
      if (persisted) toast.success('Image saved in this browser')
      else toast.warning('Browser storage is full — the image only lasts for this session')
    } catch {
      toast.error('Could not read that image')
    }
  }

  return (
    <div id={id} className="space-y-2">
      <div role="radiogroup" aria-label={icons ? 'Icon' : 'Background image'} className={cn('grid gap-2', icons ? 'grid-cols-5' : 'grid-cols-4')}>
        {tiles.map((t) => {
          const active = value === t.ref
          return (
            <div key={t.ref || 'none'} className="group relative">
              <button
                type="button"
                role="radio"
                aria-checked={active}
                title={t.name}
                onClick={() => onChange(t.ref)}
                className={cn(
                  'relative grid w-full place-items-center overflow-hidden rounded-md border bg-muted bg-center transition hover:ring-2 hover:ring-ring/40',
                  // icons are white-on-transparent: show them contained on the brand blue
                  icons ? 'aspect-square bg-[length:60%] bg-no-repeat' : 'aspect-[4/3] bg-cover',
                  icons && t.url && 'bg-[#0079c2]',
                  active && 'ring-2 ring-ring ring-offset-1',
                )}
                style={t.url ? { backgroundImage: `url("${t.url}")` } : undefined}
              >
                {!t.url && <Ban className="size-4 text-muted-foreground" />}
                {active && t.url && (
                  <span className="absolute right-1 bottom-1 grid size-4 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-3" />
                  </span>
                )}
              </button>
              {t.removable && (
                <button
                  type="button"
                  aria-label={`Remove ${t.name}`}
                  onClick={() => {
                    removeUpload(t.ref.slice(7))
                    if (active) onChange('')
                  }}
                  className="absolute -top-1.5 -right-1.5 hidden size-5 place-items-center rounded-full bg-foreground text-background shadow group-hover:grid"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>
          )
        })}
        <button
          type="button"
          onClick={() => input.current?.click()}
          className={cn(
            'grid w-full place-items-center rounded-md border border-dashed border-primary/50 text-primary transition hover:bg-brand-sky/50',
            icons ? 'aspect-square' : 'aspect-[4/3]',
          )}
          aria-label={icons ? 'Upload a PNG icon' : 'Upload an image'}
          title={icons ? 'Upload a PNG icon' : 'Upload an image'}
        >
          <ImagePlus className="size-4" />
        </button>
      </div>
      <input ref={input} type="file" accept={ACCEPT[library]} hidden onChange={(e) => (onFile(e.target.files?.[0]), (e.target.value = ''))} />
      <p className="text-xs text-muted-foreground">
        {icons ? 'PNG only (transparency kept). ' : ''}Uploads are resized and kept in this browser only (no server).
      </p>
    </div>
  )
}
