import { useEffect, useState } from 'react'
import { Highlight, themes } from 'prism-react-renderer'
import { Check, Copy, FlaskConical, LoaderCircle, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatFiles } from './formatCode'
import type { CodeFile } from './types'
import { RichText } from './ui'

/** Async Clipboard API, falling back to execCommand when it's unavailable or denied. */
async function writeClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.cssText = 'position:fixed;opacity:0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    ta.remove()
    if (!ok) throw new Error('copy failed')
  }
}

/** Prettier-formats the files (output-standards/prettier.json), debounced while the user drags sliders. */
function useFormatted(files: CodeFile[]) {
  const [state, setState] = useState<{
    source: CodeFile[]
    formatted: CodeFile[]
  } | null>(null)
  useEffect(() => {
    let cancelled = false
    const t = window.setTimeout(() => {
      void formatFiles(files).then((formatted) => !cancelled && setState({ source: files, formatted }))
    }, 150)
    return () => {
      cancelled = true
      window.clearTimeout(t)
    }
  }, [files])
  // until the latest formatting is ready, keep showing the previous formatted version (no flicker)
  return { files: state?.formatted ?? files, pending: state?.source !== files }
}

/** Generated code tabs that are illustrative (Testing POC): they get the "illustrative output" notice. */
const ILLUSTRATIVE = new Set(['html', 'scss', 'css', 'script'])
const SPECS = 'specs'

/** Notice on the code tabs: the output envisions the layout, it isn't guaranteed to be the final platform code. */
function IllustrativeNotice() {
  return (
    <p className="flex items-start gap-2 border-b border-brand-orange/30 bg-brand-orange/10 px-4 py-2 text-xs text-brand-navy">
      <FlaskConical aria-hidden className="mt-px size-3.5 shrink-0 text-brand-orange" />
      <span>
        <b className="text-[#b4470e]">Illustrative output · Testing POC.</b> A reference that envisions the layout and behavior — structure, class
        names and code may differ from the final platform implementation.
      </span>
    </p>
  )
}

/** Code tabs + an optional "Specs" tab (developer notes) after them. */
export function CodeOutput({ files: raw, specs }: { files: CodeFile[]; specs?: string[] }) {
  const { files, pending } = useFormatted(raw)
  const [active, setActive] = useState(raw[0]?.id)
  const [copied, setCopied] = useState(false)
  const showSpecs = active === SPECS && Boolean(specs?.length)
  const file = files.find((f) => f.id === active) ?? files[0]

  const copy = async () => {
    try {
      // always copy the formatted version of the current config (even if the panel is still re-formatting)
      const rawFile = raw.find((f) => f.id === file.id)
      const code = showSpecs ? specs!.map((s) => `- ${s}`).join('\n') : pending && rawFile ? (await formatFiles([rawFile]))[0].code : file.code
      await writeClipboard(code)
      toast.success(showSpecs ? 'Specs copied' : 'Code copied')
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error('Could not copy — your browser blocked clipboard access')
    }
  }

  return (
    <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
        <Tabs value={showSpecs ? SPECS : file.id} onValueChange={setActive}>
          <TabsList>
            {files.map((f) => (
              <TabsTrigger key={f.id} value={f.id} className="px-3">
                {f.label}
              </TabsTrigger>
            ))}
            {specs?.length ? (
              <TabsTrigger value={SPECS} className="px-3">
                Specs
              </TabsTrigger>
            ) : null}
          </TabsList>
        </Tabs>
        {!showSpecs && (
          <span
            className="ml-auto hidden items-center gap-1 text-[11px] text-muted-foreground sm:inline-flex"
            title="Formatted with output-standards/prettier.json; SCSS/CSS checked against output-standards/stylelint.json"
          >
            {pending ? <LoaderCircle className="size-3 animate-spin" /> : <Sparkles className="size-3 text-brand-blue" />}
            Prettier · output standards
          </span>
        )}
        <Button
          size="sm"
          variant="outline"
          className="ml-auto sm:ml-0"
          onClick={copy}
          aria-label={showSpecs ? 'Copy specs' : `Copy ${file.label} code`}
        >
          {copied ? <Check className="text-brand-green" /> : <Copy />}
          Copy
        </Button>
      </div>
      {showSpecs ? (
        <div className="max-h-[480px] overflow-auto p-5">
          <h3 className="mb-2 text-sm font-semibold tracking-wide text-brand-blue uppercase">Developer specs</h3>
          <ul className="list-disc space-y-1.5 pl-5 text-sm marker:text-brand-blue">
            {specs!.map((line) => (
              <li key={line}>
                <RichText text={line} />
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <>
          {ILLUSTRATIVE.has(file.id) && <IllustrativeNotice />}
          <Highlight theme={themes.nightOwl} code={file.code} language={file.language}>
            {({ tokens, getLineProps, getTokenProps }) => (
              <pre className="max-h-[480px] overflow-auto bg-[#011627] p-4 font-mono text-[13px] leading-relaxed">
                {tokens.map((line, i) => (
                  <div key={i} {...getLineProps({ line })}>
                    <span className="mr-4 inline-block w-6 text-right text-white/25 select-none">{i + 1}</span>
                    {line.map((token, key) => (
                      <span key={key} {...getTokenProps({ token })} />
                    ))}
                  </div>
                ))}
              </pre>
            )}
          </Highlight>
        </>
      )}
    </section>
  )
}
