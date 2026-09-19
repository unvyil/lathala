import React, { useEffect, useRef, useState } from 'react'
import {
  CopyIcon,
  MoreHorizontalIcon,
  PencilLineIcon,
  Trash2Icon,
} from 'lucide-react'
import type { Department, Project } from '../../types/studio'
import { ArtboardPreview } from '../canvas/ArtboardPreview'
import { DepartmentBadge } from '../ui/Primitives'

const formatEdited = (iso: string) => {
  const date = new Date(iso)
  const days = Math.round((Date.now() - date.getTime()) / 86400000)
  if (days <= 0) return 'Edited today'
  if (days === 1) return 'Edited yesterday'
  if (days < 30) return `Edited ${days} days ago`
  return `Edited ${date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })}`
}

interface ProjectCardProps {
  project: Project
  department?: Department
  onOpen: () => void
  onRename: (title: string) => void
  onDuplicate: () => void
  onDelete: () => void
}

export function ProjectCard({
  project,
  department,
  onOpen,
  onRename,
  onDuplicate,
  onDelete,
}: ProjectCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [draft, setDraft] = useState(project.title)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    window.addEventListener('mousedown', onClick)
    return () => window.removeEventListener('mousedown', onClick)
  }, [menuOpen])

  const commitRename = () => {
    const next = draft.trim()
    if (next && next !== project.title) onRename(next)
    else setDraft(project.title)
    setRenaming(false)
  }

  return (
    <article className="group flex flex-col">
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Open ${project.title}`}
        className="relative block overflow-hidden rounded-xl border border-sandbar bg-base transition-[border-color,transform] duration-150 ease-out hover:border-espresso/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <div className="flex h-[248px] items-start justify-center overflow-hidden p-4">
          <ArtboardPreview
            elements={project.elements}
            scale={0.27}
            className="shadow-panel"
          />
        </div>
      </button>

      <div className="mt-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          {renaming ? (
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitRename()
                if (e.key === 'Escape') {
                  setDraft(project.title)
                  setRenaming(false)
                }
              }}
              className="w-full rounded-md border border-accent bg-base px-1.5 py-0.5 text-[13px] font-medium text-onyx focus:outline-none"
            />
          ) : (
            <h3 className="truncate text-[13px] font-semibold text-onyx">
              {project.title}
            </h3>
          )}
          <p className="mt-0.5 text-[11px] text-espresso/60">
            {formatEdited(project.editedAt)}
          </p>
          <div className="mt-2">
            {department ? (
              <DepartmentBadge name={department.name} color={department.color} />
            ) : (
              <span className="inline-flex items-center rounded-full bg-sandbar px-2.5 py-1 text-[11px] font-medium text-espresso">
                Everyone
              </span>
            )}
          </div>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            aria-label={`Actions for ${project.title}`}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-lg p-1.5 text-espresso/70 transition-colors duration-150 ease-out hover:bg-sandbar/70 hover:text-onyx focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <MoreHorizontalIcon size={16} strokeWidth={1.5} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-9 z-20 w-40 overflow-hidden rounded-xl border border-sandbar bg-base py-1 shadow-artboard">
              <MenuItem
                icon={<PencilLineIcon size={14} strokeWidth={1.5} />}
                label="Rename"
                onClick={() => {
                  setMenuOpen(false)
                  setDraft(project.title)
                  setRenaming(true)
                }}
              />
              <MenuItem
                icon={<CopyIcon size={14} strokeWidth={1.5} />}
                label="Duplicate"
                onClick={() => {
                  setMenuOpen(false)
                  onDuplicate()
                }}
              />
              <MenuItem
                icon={<Trash2Icon size={14} strokeWidth={1.5} />}
                label="Delete"
                destructive
                onClick={() => {
                  setMenuOpen(false)
                  onDelete()
                }}
              />
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

function MenuItem({
  icon,
  label,
  onClick,
  destructive,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  destructive?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-[12px] transition-colors duration-150 ease-out hover:bg-sandbar/60 ${
        destructive ? 'text-[#8C2B1F]' : 'text-espresso'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}
