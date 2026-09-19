import React from 'react'
import {
  CircleIcon,
  ImageIcon,
  LinkIcon,
  SquareIcon,
  TypeIcon,
} from 'lucide-react'

export type ToolId = 'text' | 'rect' | 'ellipse' | 'image' | 'hotspot'

const TOOLS: { id: ToolId; label: string; Icon: typeof TypeIcon }[] = [
  { id: 'text', label: 'Add text', Icon: TypeIcon },
  { id: 'rect', label: 'Add rectangle', Icon: SquareIcon },
  { id: 'ellipse', label: 'Add ellipse', Icon: CircleIcon },
  { id: 'image', label: 'Add image', Icon: ImageIcon },
  { id: 'hotspot', label: 'Add hotspot', Icon: LinkIcon },
]

export function ToolDock({ onAdd }: { onAdd: (tool: ToolId) => void }) {
  return (
    <nav
      aria-label="Insert tools"
      className="flex w-14 shrink-0 flex-col items-center gap-1 border-r border-white/5 bg-onyx py-4"
    >
      {TOOLS.map(({ id, label, Icon }) => (
        <button
          key={id}
          onClick={() => onAdd(id)}
          title={label}
          aria-label={label}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-parchment/65 transition-colors duration-150 ease-out hover:bg-white/10 hover:text-parchment focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <Icon size={17} strokeWidth={1.5} />
        </button>
      ))}
    </nav>
  )
}
