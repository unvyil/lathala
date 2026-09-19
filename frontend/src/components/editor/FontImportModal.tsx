import React, { useState } from 'react'
import { CheckCircle2Icon, LoaderIcon } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button, Input, Label, Select } from '../ui/Primitives'
import type { ImportedFont } from '../../types/studio'

type Format = ImportedFont['source']

interface FontImportModalProps {
  open: boolean
  onClose: () => void
  onImported: (font: Omit<ImportedFont, 'id'>) => void
}

export function FontImportModal({
  open,
  onClose,
  onImported,
}: FontImportModalProps) {
  const [family, setFamily] = useState('')
  const [url, setUrl] = useState('')
  const [format, setFormat] = useState<Format>('google')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>(
    'idle',
  )
  const [message, setMessage] = useState('')

  const placeholder =
    format === 'google'
      ? 'https://fonts.googleapis.com/css2?family=Fraunces&display=swap'
      : `https://cdn.example.com/fonts/typeface.${format}`

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const name = family.trim()
    const href = url.trim()
    if (!name || !href) return
    setStatus('loading')
    setMessage('')

    try {
      if (format === 'google') {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = href
        document.head.appendChild(link)
        await new Promise((resolve) => setTimeout(resolve, 450))
      } else if (typeof FontFace !== 'undefined') {
        const face = new FontFace(
          name,
          `url(${href}) format('${format === 'ttf' ? 'truetype' : 'woff2'}')`,
        )
        await face.load()
        ;(document.fonts as any).add(face)
      } else {
        const style = document.createElement('style')
        style.textContent = `@font-face{font-family:"${name}";src:url("${href}");font-display:swap;}`
        document.head.appendChild(style)
      }
      onImported({ family: name, source: format, url: href })
      setStatus('done')
      setMessage(`${name} is now available in the type selector.`)
      setFamily('')
      setUrl('')
    } catch {
      setStatus('error')
      setMessage(
        'Could not load that file. Check the URL is public and CORS-enabled.',
      )
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Import a typeface"
      description="Paste a font link. It is injected into the document and added to the type selector."
      width="max-w-md"
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label htmlFor="font-format">Format</Label>
          <Select
            id="font-format"
            value={format}
            onChange={(e) => setFormat(e.target.value as Format)}
          >
            <option value="google">Google Fonts stylesheet</option>
            <option value="woff2">.woff2 file</option>
            <option value="ttf">.ttf file</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="font-family">Family name</Label>
          <Input
            id="font-family"
            value={family}
            onChange={(e) => setFamily(e.target.value)}
            placeholder="Fraunces"
            required
          />
        </div>
        <div>
          <Label htmlFor="font-url">Source URL</Label>
          <Input
            id="font-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={placeholder}
            required
          />
        </div>

        {status !== 'idle' && status !== 'loading' && (
          <p
            className={`flex items-start gap-2 text-[12px] ${
              status === 'done' ? 'text-[#2F6F5E]' : 'text-[#8C2B1F]'
            }`}
          >
            {status === 'done' && (
              <CheckCircle2Icon size={14} strokeWidth={1.5} className="mt-0.5" />
            )}
            {message}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={status === 'loading'}
          >
            {status === 'loading' && (
              <LoaderIcon
                size={14}
                strokeWidth={1.5}
                className="animate-spin"
              />
            )}
            {status === 'loading' ? 'Loading' : 'Import font'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
