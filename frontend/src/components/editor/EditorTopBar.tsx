import React, { useEffect, useRef, useState } from 'react'
import {
  ChevronDownIcon,
  EyeIcon,
  FilePlus2Icon,
  FolderOpenIcon,
  SendIcon,
  UsersIcon,
} from 'lucide-react'
import { Button } from '../ui/Primitives'
import type { Department } from '../../types/studio'
import { ZOOM_LEVELS } from '../canvas/constants'

interface EditorTopBarProps {
  title: string
  onTitleChange: (title: string) => void
  departments: Department[]
  segmentId: string
  onSegmentChange: (id: string) => void
  zoom: number
  onZoomChange: (zoom: number) => void
  onBackToFiles: () => void
  onNewDesign: () => void
  onPreview: () => void
  onOpenCrm: () => void
  onSend: () => void
}

export function EditorTopBar({
  title,
  onTitleChange,
  departments,
  segmentId,
  onSegmentChange,
  zoom,
  onZoomChange,
  onBackToFiles,
  onNewDesign,
  onPreview,
  onOpenCrm,
  onSend,
}: EditorTopBarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenuOpen(false)
    }
    window.addEventListener('mousedown', onClick)
    return () => window.removeEventListener('mousedown', onClick)
  }, [menuOpen])

  const items = [
    {
      label: 'Back to Files',
      Icon: FolderOpenIcon,
      action: onBackToFiles,
    },
    { label: 'New Design', Icon: FilePlus2Icon, action: onNewDesign },
    { label: 'Preview Artifact', Icon: EyeIcon, action: onPreview },
    { label: 'Workspace Audience', Icon: UsersIcon, action: onOpenCrm },
  ]

  return (
    <header className="flex h-14 shrink-0 items-center gap-4 bg-onyx px-4">
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          className="flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-[14px] font-semibold text-parchment transition-colors duration-150 ease-out hover:bg-white/10"
        >
          Lathala Studio
          <ChevronDownIcon size={14} strokeWidth={1.5} />
        </button>
        {menuOpen && (
          <div
            role="menu"
            className="absolute left-0 top-11 z-40 w-52 overflow-hidden rounded-xl border border-sandbar bg-base py-1 shadow-artboard"
          >
            {items.map(({ label, Icon, action }) => (
              <button
                key={label}
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false)
                  action()
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[12px] text-espresso transition-colors duration-150 ease-out hover:bg-sandbar/60"
              >
                <Icon size={14} strokeWidth={1.5} />
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      <input
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        aria-label="Design title"
        className="mx-auto h-9 w-[320px] rounded-lg border border-transparent bg-transparent px-3 text-center text-[13px] font-medium text-parchment transition-colors duration-150 ease-out hover:border-white/15 focus:border-accent focus:bg-white/[0.06] focus:outline-none"
      />

      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] pl-3 pr-1">
          <span className="text-[11px] text-parchment/50">Audience</span>
          <select
            value={segmentId}
            onChange={(e) => onSegmentChange(e.target.value)}
            aria-label="Audience target"
            className="h-8 cursor-pointer bg-transparent pr-1 text-[12px] font-medium text-parchment focus:outline-none [&>option]:text-onyx"
          >
            <option value="all">Everyone</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center rounded-lg border border-white/10 bg-white/[0.04] p-0.5">
          {ZOOM_LEVELS.map((level) => (
            <button
              key={level}
              onClick={() => onZoomChange(level)}
              aria-pressed={zoom === level}
              className={`h-7 rounded-md px-2 text-[11px] font-medium transition-colors duration-150 ease-out ${
                zoom === level
                  ? 'bg-parchment text-onyx'
                  : 'text-parchment/60 hover:text-parchment'
              }`}
            >
              {level * 100}%
            </button>
          ))}
        </div>

        <Button variant="primary" onClick={onSend} className="ring-1 ring-white/25">
          <SendIcon size={14} strokeWidth={1.5} />
          Send Dispatch
        </Button>
      </div>
    </header>
  )
}
