import React from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Primitives'
import { ArtboardPreview } from '../canvas/ArtboardPreview'
import type { Project } from '../../types/studio'

export function PreviewModal({
  open,
  onClose,
  project,
  audience,
}: {
  open: boolean
  onClose: () => void
  project: Project
  audience: string
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Preview artifact"
      description={`${project.title} · rendered for ${audience}`}
      width="max-w-2xl"
      footer={
        <Button variant="primary" onClick={onClose}>
          Close preview
        </Button>
      }
    >
      <div className="flex justify-center bg-parchment py-6">
        <ArtboardPreview
          elements={project.elements}
          scale={0.62}
          className="shadow-artboard"
        />
      </div>
      <p className="mt-4 text-center text-[11px] text-espresso/60">
        600 × 800 · {project.elements.filter((e) => e.visible).length} visible
        layers
      </p>
    </Modal>
  )
}
