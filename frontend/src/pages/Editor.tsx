import React, { useCallback, useState } from 'react'
import { useStudio } from '../contexts/StudioContext'
import { EditorTopBar } from '../components/editor/EditorTopBar'
import { ToolDock, type ToolId } from '../components/editor/ToolDock'
import { CanvasStage } from '../components/editor/CanvasStage'
import { LayersPanel } from '../components/editor/LayersPanel'
import { Inspector } from '../components/editor/Inspector'
import { FontImportModal } from '../components/editor/FontImportModal'
import { PreviewModal } from '../components/editor/PreviewModal'
import { DispatchModal } from '../components/editor/DispatchModal'
import type { CanvasElement } from '../types/studio'
import { HERO_IMAGE } from '../data/projects'

const uid = () => `el-${Math.random().toString(36).slice(2, 9)}`

function createElement(tool: ToolId): CanvasElement {
  const base = {
    id: uid(),
    x: 120,
    y: 300,
    visible: true,
    locked: false,
  }
  switch (tool) {
    case 'text':
      return {
        ...base,
        kind: 'text',
        name: 'Text layer',
        width: 320,
        height: 48,
        text: 'Double-click the layer name to rename',
        fontFamily: 'Instrument Sans',
        fontSize: 20,
        fontWeight: 500,
        color: '#070D0D',
        align: 'left',
        lineHeight: 1.3,
        letterSpacing: 0,
      }
    case 'ellipse':
      return {
        ...base,
        kind: 'shape',
        name: 'Ellipse',
        width: 180,
        height: 180,
        shape: 'ellipse',
        fill: '#302E2F',
        radius: 0,
      }
    case 'image':
      return {
        ...base,
        kind: 'image',
        name: 'Image',
        width: 280,
        height: 180,
        src: HERO_IMAGE,
        radius: 2,
        alt: 'Placeholder photograph',
      }
    case 'hotspot':
      return {
        ...base,
        kind: 'hotspot',
        name: 'Hotspot',
        width: 180,
        height: 44,
        href: 'https://lathala.studio',
        label: 'Link',
      }
    case 'rect':
    default:
      return {
        ...base,
        kind: 'shape',
        name: 'Rectangle',
        width: 240,
        height: 120,
        shape: 'rect',
        fill: '#070D0D',
        radius: 4,
      }
  }
}

export function Editor() {
  const {
    activeProject,
    departments,
    setView,
    createProject,
    updateProject,
    setElements,
    fonts,
    addFont,
  } = useStudio()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [fontOpen, setFontOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [dispatchOpen, setDispatchOpen] = useState(false)

  const projectId = activeProject?.id ?? ''

  const patchElement = useCallback(
    (id: string, patch: Partial<CanvasElement>) => {
      setElements(projectId, (els) =>
        els.map((el) => (el.id === id ? ({ ...el, ...patch } as CanvasElement) : el)),
      )
    },
    [projectId, setElements],
  )

  const deleteElement = useCallback(
    (id: string) => {
      setElements(projectId, (els) => els.filter((el) => el.id !== id))
      setSelectedId((current) => (current === id ? null : current))
    },
    [projectId, setElements],
  )

  const addElement = useCallback(
    (tool: ToolId) => {
      const element = createElement(tool)
      setElements(projectId, (els) => [...els, element])
      setSelectedId(element.id)
    },
    [projectId, setElements],
  )

  /** Indices arrive in displayed (top-first) order. */
  const reorderLayers = useCallback(
    (from: number, to: number) => {
      setElements(projectId, (els) => {
        const count = els.length
        const modelFrom = count - 1 - from
        const modelTo = count - 1 - to
        const next = [...els]
        const [moved] = next.splice(modelFrom, 1)
        next.splice(modelTo, 0, moved)
        return next
      })
    },
    [projectId, setElements],
  )

  if (!activeProject) {
    return (
      <div className="flex min-h-full items-center justify-center bg-parchment">
        <button
          onClick={() => setView('dashboard')}
          className="text-[13px] font-medium text-accent"
        >
          No design open — back to files
        </button>
      </div>
    )
  }

  const selected =
    activeProject.elements.find((el) => el.id === selectedId) ?? null
  const segmentName =
    activeProject.segmentId === 'all'
      ? 'Everyone'
      : departments.find((d) => d.id === activeProject.segmentId)?.name ??
        'Everyone'

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-parchment">
      <EditorTopBar
        title={activeProject.title}
        onTitleChange={(title) => updateProject(activeProject.id, { title })}
        departments={departments}
        segmentId={activeProject.segmentId}
        onSegmentChange={(segmentId) =>
          updateProject(activeProject.id, { segmentId })
        }
        zoom={zoom}
        onZoomChange={setZoom}
        onBackToFiles={() => setView('dashboard')}
        onNewDesign={createProject}
        onPreview={() => setPreviewOpen(true)}
        onOpenCrm={() => setView('crm')}
        onSend={() => setDispatchOpen(true)}
      />

      <div className="flex min-h-0 flex-1">
        <ToolDock onAdd={addElement} />

        <main className="min-w-0 flex-1 overflow-auto">
          <CanvasStage
            elements={activeProject.elements}
            selectedId={selectedId}
            zoom={zoom}
            onSelect={setSelectedId}
            onPatch={patchElement}
            onDelete={deleteElement}
          />
        </main>

        <aside
          aria-label="Layers and properties"
          className="flex w-[300px] shrink-0 flex-col border-l border-white/5 bg-espresso"
        >
          <LayersPanel
            elements={activeProject.elements}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onPatch={patchElement}
            onDelete={deleteElement}
            onReorder={reorderLayers}
          />
          <Inspector
            element={selected}
            fonts={fonts}
            onPatch={patchElement}
            onImportFont={() => setFontOpen(true)}
          />
        </aside>
      </div>

      <FontImportModal
        open={fontOpen}
        onClose={() => setFontOpen(false)}
        onImported={addFont}
      />
      <PreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        project={activeProject}
        audience={segmentName}
      />
      <DispatchModal
        open={dispatchOpen}
        onClose={() => setDispatchOpen(false)}
        segmentId={activeProject.segmentId}
        title={activeProject.title}
      />
    </div>
  )
}
