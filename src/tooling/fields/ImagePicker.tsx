import { useRef } from 'react'
import { Ban, Check, ImagePlus, X } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { SAMPLE_IMAGES, addUpload, removeUpload, useUploads } from '../assets'

type Tile = { ref: string; name: string; url?: string; removable?: boolean }

export function ImagePicker({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) {
  const uploads = useUploads()
  const input = useRef<HTMLInputElement>(null)

  const tiles: Tile[] = [
    { ref: '', name: 'None' },
    ...SAMPLE_IMAGES.map((s) => ({ ref: `sample:${s.id}`, name: s.name, url: s.url })),
    ...uploads.map((u) => ({ ref: `upload:${u.id}`, name: u.name, url: u.url, removable: true })),
  ]

  const onFile = async (file?: File) => {
    if (!file) return
    if (!file.type.startsWith('image/')) return toast.error('Please choose an image file')
    try {
      const { upload, persisted } = await addUpload(file)
      onChange(`upload:${upload.id}`)
      if (persisted) toast.success('Image saved in this browser')
      else toast.warning('Browser storage is full — the image only lasts for this session')
    } catch {
      toast.error('Could not read that image')
    }
  }

  return (
    <div id={id} className="space-y-2">
      <div role="radiogroup" aria-label="Background image" className="grid grid-cols-4 gap-2">
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
                  'relative grid aspect-[4/3] w-full place-items-center overflow-hidden rounded-md border bg-muted bg-cover bg-center transition hover:ring-2 hover:ring-ring/40',
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
          className="grid aspect-[4/3] w-full place-items-center rounded-md border border-dashed border-primary/50 text-primary transition hover:bg-brand-sky/50"
          aria-label="Upload an image"
          title="Upload an image"
        >
          <ImagePlus className="size-4" />
        </button>
      </div>
      <input ref={input} type="file" accept="image/*" hidden onChange={(e) => (onFile(e.target.files?.[0]), (e.target.value = ''))} />
      <p className="text-xs text-muted-foreground">Uploads are resized and kept in this browser only (no server).</p>
    </div>
  )
}
