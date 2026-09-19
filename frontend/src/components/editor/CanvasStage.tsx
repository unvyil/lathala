import React, { useCallback, useEffect, useRef } from 'react'
import type { CanvasElement } from '../../types/studio'
import { ElementView } from '../canvas/ElementView'
import { ARTBOARD_HEIGHT, ARTBOARD_WIDTH } from '../canvas/constants'

type Corner = 'nw' | 'ne' | 'sw' | 'se'

interface DragState {
  id: string
  mode: 'move' | Corner
  startX: number
  startY: number
  origin: { x: number; y: number; width: number; height: number }
}

interface CanvasStageProps {
  elements: CanvasElement[]
  selectedId: string | null
  zoom: number
  onSelect: (id: string | null) => void
  onPatch: (id: string, patch: Partial<CanvasElement>) => void
  onDelete: (id: string) => void
}

const MIN_SIZE = 16

export function CanvasStage({
  elements,
  selectedId,
  zoom,
  onSelect,
  onPatch,
  onDelete,
}: CanvasStageProps) {
  const drag = useRef<DragState | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const typing =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      if (typing || !selectedId) return
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        onDelete(selectedId)
      }
      if (e.key === 'Escape') onSelect(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedId, onDelete, onSelect])

  const beginDrag = useCallback(
    (
      e: React.PointerEvent,
      element: CanvasElement,
      mode: DragState['mode'],
    ) => {
      if (element.locked) return
      e.stopPropagation()
      ;(e.target as Element).setPointerCapture(e.pointerId)
      drag.current = {
        id: element.id,
        mode,
        startX: e.clientX,
        startY: e.clientY,
        origin: {
          x: element.x,
          y: element.y,
          width: element.width,
          height: element.height,
        },
      }
    },
    [],
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const state = drag.current
      if (!state) return
      const dx = (e.clientX - state.startX) / zoom
      const dy = (e.clientY - state.startY) / zoom
      const o = state.origin

      if (state.mode === 'move') {
        onPatch(state.id, {
          x: Math.round(o.x + dx),
          y: Math.round(o.y + dy),
        })
        return
      }

      let { x, y, width, height } = o
      if (state.mode === 'se') {
        width = Math.max(MIN_SIZE, o.width + dx)
        height = Math.max(MIN_SIZE, o.height + dy)
      } else if (state.mode === 'sw') {
        width = Math.max(MIN_SIZE, o.width - dx)
        height = Math.max(MIN_SIZE, o.height + dy)
        x = o.x + (o.width - width)
      } else if (state.mode === 'ne') {
        width = Math.max(MIN_SIZE, o.width + dx)
        height = Math.max(MIN_SIZE, o.height - dy)
        y = o.y + (o.height - height)
      } else {
        width = Math.max(MIN_SIZE, o.width - dx)
        height = Math.max(MIN_SIZE, o.height - dy)
        x = o.x + (o.width - width)
        y = o.y + (o.height - height)
      }
      onPatch(state.id, {
        x: Math.round(x),
        y: Math.round(y),
        width: Math.round(width),
        height: Math.round(height),
      })
    },
    [onPatch, zoom],
  )

  const endDrag = useCallback(() => {
    drag.current = null
  }, [])

  return (
    <div
      className="flex min-h-full w-full items-start justify-center overflow-auto bg-parchment p-12 lathala-scroll"
      onPointerDown={() => onSelect(null)}
    >
      <div
        style={{
          width: ARTBOARD_WIDTH * zoom,
          height: ARTBOARD_HEIGHT * zoom,
        }}
      >
        <div
          role="application"
          aria-label="Design artboard"
          className="relative shadow-artboard"
          style={{
            width: ARTBOARD_WIDTH,
            height: ARTBOARD_HEIGHT,
            backgroundColor: '#DBD6D0',
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
          }}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          {elements
            .filter((el) => el.visible)
            .map((el) => {
              const selected = el.id === selectedId
              return (
                <div
                  key={el.id}
                  style={{
                    position: 'absolute',
                    left: el.x,
                    top: el.y,
                    width: el.width,
                    height: el.height,
                    cursor: el.locked ? 'default' : 'move',
                  }}
                  onPointerDown={(e) => {
                    e.stopPropagation()
                    onSelect(el.id)
                    beginDrag(e, el, 'move')
                  }}
                >
                  <ElementView element={el} interactive />
                  {selected && (
                    <>
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -inset-px"
                        style={{ outline: '2px solid #0062FF' }}
                      />
                      {(['nw', 'ne', 'sw', 'se'] as Corner[]).map((corner) => (
                        <button
                          key={corner}
                          aria-label={`Resize ${corner}`}
                          onPointerDown={(e) => beginDrag(e, el, corner)}
                          className="absolute h-[9px] w-[9px] border border-[#0062FF] bg-white"
                          style={{
                            left: corner.includes('w') ? -5 : undefined,
                            right: corner.includes('e') ? -5 : undefined,
                            top: corner.includes('n') ? -5 : undefined,
                            bottom: corner.includes('s') ? -5 : undefined,
                            cursor:
                              corner === 'nw' || corner === 'se'
                                ? 'nwse-resize'
                                : 'nesw-resize',
                          }}
                        />
                      ))}
                    </>
                  )}
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}
