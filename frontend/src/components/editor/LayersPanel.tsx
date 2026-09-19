import React, { useState } from 'react'
import {
  EyeIcon,
  EyeOffIcon,
  GripVerticalIcon,
  ImageIcon,
  LinkIcon,
  LockIcon,
  SquareIcon,
  Trash2Icon,
  TypeIcon,
  UnlockIcon,
} from 'lucide-react'
import type { CanvasElement, ElementKind } from '../../types/studio'

const KIND_ICON: Record<ElementKind, React.ComponentType<{ size?: number | string; strokeWidth?: number | string }>> =
  {
    text: TypeIcon,
    shape: SquareIcon,
    image: ImageIcon,
    hotspot: LinkIcon,
  }

interface LayersPanelProps {
  elements: CanvasElement[]
  selectedId: string | null
  onSelect: (id: string) => void
  onPatch: (id: string, patch: Partial<CanvasElement>) => void
  onDelete: (id: string) => void
  onReorder: (from: number, to: number) => void
}

export function LayersPanel({
  elements,
  selectedId,
  onSelect,
  onPatch,
  onDelete,
  onReorder,
}: LayersPanelProps) {
  const display = [...elements].reverse()
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between px-4 pb-2 pt-4">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-parchment/55">
          Layers
        </h2>
        <span className="text-[10px] text-parchment/40">
          {elements.length} items
        </span>
      </div>

      <ul
        className="min-h-0 flex-1 overflow-y-auto px-2 pb-3 lathala-scroll"
        onDragOver={(e) => e.preventDefault()}
      >
        {display.map((el, index) => {
          const Icon = KIND_ICON[el.kind]
          const selected = el.id === selectedId
          const isOver = overIndex === index && dragIndex !== null && dragIndex !== index
          return (
            <li
              key={el.id}
              draggable={editingId !== el.id}
              onDragStart={() => setDragIndex(index)}
              onDragEnter={() => setOverIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDragEnd={() => {
                setDragIndex(null)
                setOverIndex(null)
              }}
              onDrop={(e) => {
                e.preventDefault()
                if (dragIndex !== null && dragIndex !== index) {
                  onReorder(dragIndex, index)
                }
                setDragIndex(null)
                setOverIndex(null)
              }}
              className={[
                'group mb-0.5 flex items-center gap-1.5 rounded-lg px-1.5 py-1.5 transition-colors duration-150 ease-out',
                selected ? 'bg-accent/20' : 'hover:bg-white/[0.06]',
                dragIndex === index ? 'opacity-40' : '',
                isOver ? 'ring-1 ring-accent' : '',
              ].join(' ')}
            >
              <GripVerticalIcon
                size={13}
                strokeWidth={1.5}
                className="shrink-0 cursor-grab text-parchment/35"
              />
              <button
                type="button"
                onClick={() => onSelect(el.id)}
                onDoubleClick={() => setEditingId(el.id)}
                className="flex min-w-0 flex-1 items-center gap-2 text-left"
              >
                <Icon size={13} strokeWidth={1.5} />
                {editingId === el.id ? (
                  <input
                    autoFocus
                    value={el.name}
                    onChange={(e) => onPatch(el.id, { name: e.target.value })}
                    onBlur={() => setEditingId(null)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === 'Escape')
                        setEditingId(null)
                    }}
                    className="w-full rounded border border-accent bg-onyx/60 px-1 py-0.5 text-[12px] text-parchment focus:outline-none"
                  />
                ) : (
                  <span
                    className={`truncate text-[12px] ${
                      el.visible ? 'text-parchment/90' : 'text-parchment/40'
                    }`}
                  >
                    {el.name}
                  </span>
                )}
              </button>

              <LayerAction
                label={el.visible ? `Hide ${el.name}` : `Show ${el.name}`}
                active={!el.visible}
                onClick={() => onPatch(el.id, { visible: !el.visible })}
              >
                {el.visible ? (
                  <EyeIcon size={13} strokeWidth={1.5} />
                ) : (
                  <EyeOffIcon size={13} strokeWidth={1.5} />
                )}
              </LayerAction>
              <LayerAction
                label={el.locked ? `Unlock ${el.name}` : `Lock ${el.name}`}
                active={el.locked}
                onClick={() => onPatch(el.id, { locked: !el.locked })}
              >
                {el.locked ? (
                  <LockIcon size={13} strokeWidth={1.5} />
                ) : (
                  <UnlockIcon size={13} strokeWidth={1.5} />
                )}
              </LayerAction>
              <LayerAction
                label={`Delete ${el.name}`}
                onClick={() => onDelete(el.id)}
              >
                <Trash2Icon size={13} strokeWidth={1.5} />
              </LayerAction>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function LayerAction({
  label,
  children,
  onClick,
  active,
}: {
  label: string
  children: React.ReactNode
  onClick: () => void
  active?: boolean
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={[
        'shrink-0 rounded p-1 transition-colors duration-150 ease-out hover:bg-white/10',
        active
          ? 'text-parchment'
          : 'text-parchment/45 opacity-0 group-hover:opacity-100 focus-visible:opacity-100',
      ].join(' ')}
    >
      {children}
    </button>
  )
}
