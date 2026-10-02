import { useState } from 'react'
import { Highlight, themes } from 'prism-react-renderer'
import { Check, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { CodeFile } from './types'

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

export function CodeOutput({ files }: { files: CodeFile[] }) {
  const [active, setActive] = useState(files[0]?.id)
  const [copied, setCopied] = useState(false)
  const file = files.find((f) => f.id === active) ?? files[0]

  const copy = async () => {
    try {
      await writeClipboard(file.code)
      toast.success('Code copied')
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error('Could not copy — your browser blocked clipboard access')
    }
  }

  return (
    <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
        <Tabs value={file.id} onValueChange={setActive}>
          <TabsList>
            {files.map((f) => (
              <TabsTrigger key={f.id} value={f.id} className="px-3">
                {f.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Button size="sm" variant="outline" onClick={copy} aria-label={`Copy ${file.label} code`}>
          {copied ? <Check className="text-brand-green" /> : <Copy />}
          Copy
        </Button>
      </div>
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
    </section>
  )
}
