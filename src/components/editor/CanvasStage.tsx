import React, { useCallback, useEffect, useRef, useState } from 'react';
import type {
  CanvasElement,
  Subscriber,
  Department,
  TextElement,
  ShapeElement,
  DividerElement,
} from '../../types/studio';
import { interpolateMergeTags } from '../../services/exportHtml';
import { LinkIcon, Maximize2Icon, FrameIcon } from 'lucide-react';

type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';
type FrameResizeHandle = 'e' | 's' | 'se';

interface DragSession {
  mode: 'move-single' | 'move-multi' | ResizeHandle | 'frame-resize';
  handle?: ResizeHandle | FrameResizeHandle;
  startX: number;
  startY: number;
  primaryId?: string;
  elementsOrigin: Record<string, { x: number; y: number; width: number; height: number }>;
  frameOrigin?: { width: number; height: number };
}

interface MarqueeBox {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

interface CanvasStageProps {
  elements: CanvasElement[];
  selectedIds: string[];
  isFrameSelected: boolean;
  zoom: number;
  artboardWidth: number;
  artboardHeight: number;
  artboardBackground: string;
  artboardBorderRadius?: number;
  previewSubscriber: Subscriber | null;
  departments: Department[];
  onSelect: (id: string | null, isMulti?: boolean) => void;
  onSelectMultiple: (ids: string[]) => void;
  onSelectFrame: () => void;
  onPatchElement: (id: string, patch: Partial<CanvasElement>) => void;
  onPatchMultiple: (patches: { id: string; patch: Partial<CanvasElement> }[]) => void;
  onPatchArtboard: (patch: {
    artboardWidth?: number;
    artboardHeight?: number;
    artboardBackground?: string;
    artboardBorderRadius?: number;
  }) => void;
  onDeleteSelected: () => void;
  onZoomChange?: (zoom: number) => void;
}

const MIN_SIZE = 12;

export function CanvasStage({
  elements,
  selectedIds,
  isFrameSelected,
  zoom,
  artboardWidth,
  artboardHeight,
  artboardBackground,
  artboardBorderRadius = 0,
  previewSubscriber,
  departments,
  onSelect,
  onSelectMultiple,
  onSelectFrame,
  onPatchElement,
  onPatchMultiple,
  onPatchArtboard,
  onDeleteSelected,
  onZoomChange,
}: CanvasStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const artboardRef = useRef<HTMLDivElement>(null);

  const dragSession = useRef<DragSession | null>(null);
  const [marquee, setMarquee] = useState<MarqueeBox | null>(null);

  // Dynamic zoom via Trackpad pinch or Ctrl + mouse wheel
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !onZoomChange) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const factor = e.deltaY < 0 ? 1.08 : 0.92;
        const next = Math.max(0.25, Math.min(3.5, Math.round(zoom * factor * 100) / 100));
        onZoomChange(next);
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [zoom, onZoomChange]);

  // Keyboard shortcut for deleting selected elements & escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement ||
        (e.target as HTMLElement).isContentEditable;

      if (isInput) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedIds.length > 0) {
          e.preventDefault();
          onDeleteSelected();
        }
      } else if (e.key === 'Escape') {
        onSelect(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds, onDeleteSelected, onSelect]);

  // Begin dragging one or more elements
  const beginElementDrag = (
    e: React.PointerEvent,
    element: CanvasElement,
    mode: 'move-single' | 'move-multi' | ResizeHandle,
  ) => {
    if (element.locked) return;
    e.stopPropagation();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);

    const isAlreadySelected = selectedIds.includes(element.id);
    let targetIds = selectedIds;

    if (!isAlreadySelected) {
      if (e.shiftKey || e.metaKey || e.ctrlKey) {
        targetIds = [...selectedIds, element.id];
      } else {
        targetIds = [element.id];
      }
      onSelectMultiple(targetIds);
    }

    const origins: Record<string, { x: number; y: number; width: number; height: number }> = {};
    elements.forEach((el) => {
      if (targetIds.includes(el.id)) {
        origins[el.id] = { x: el.x, y: el.y, width: el.width, height: el.height };
      }
    });

    dragSession.current = {
      mode: targetIds.length > 1 && mode.startsWith('move') ? 'move-multi' : mode,
      handle: mode.startsWith('move') ? undefined : (mode as ResizeHandle),
      startX: e.clientX,
      startY: e.clientY,
      primaryId: element.id,
      elementsOrigin: origins,
    };
  };

  // Begin Frame Resizing (Direct Artboard scaling)
  const beginFrameResize = (e: React.PointerEvent, handle: FrameResizeHandle) => {
    e.stopPropagation();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);

    dragSession.current = {
      mode: 'frame-resize',
      handle,
      startX: e.clientX,
      startY: e.clientY,
      elementsOrigin: {},
      frameOrigin: { width: artboardWidth, height: artboardHeight },
    };
  };

  // Pointer move handler
  const handlePointerMove = (e: React.PointerEvent) => {
    // 1. If currently area-selecting (Marquee)
    if (marquee) {
      setMarquee((prev) => (prev ? { ...prev, currentX: e.clientX, currentY: e.clientY } : null));
      return;
    }

    const session = dragSession.current;
    if (!session) return;

    const dx = (e.clientX - session.startX) / zoom;
    const dy = (e.clientY - session.startY) / zoom;

    // Handle Frame Resize
    if (session.mode === 'frame-resize' && session.frameOrigin && session.handle) {
      const handle = session.handle;
      let newW = session.frameOrigin.width;
      let newH = session.frameOrigin.height;

      if (handle === 'e' || handle === 'se') {
        newW = Math.max(320, Math.round(session.frameOrigin.width + dx));
      }
      if (handle === 's' || handle === 'se') {
        newH = Math.max(400, Math.round(session.frameOrigin.height + dy));
      }
      onPatchArtboard({ artboardWidth: newW, artboardHeight: newH });
      return;
    }

    // Handle Multi-Element Move
    if (session.mode === 'move-multi') {
      const patches = Object.entries(session.elementsOrigin).map(([id, orig]) => ({
        id,
        patch: {
          x: Math.round(orig.x + dx),
          y: Math.round(orig.y + dy),
        },
      }));
      onPatchMultiple(patches);
      return;
    }

    // Handle Single Element Move
    if (session.mode === 'move-single' && session.primaryId) {
      const orig = session.elementsOrigin[session.primaryId];
      if (orig) {
        onPatchElement(session.primaryId, {
          x: Math.round(orig.x + dx),
          y: Math.round(orig.y + dy),
        });
      }
      return;
    }

    // Handle Element Resizing
    if (session.handle && session.primaryId) {
      const orig = session.elementsOrigin[session.primaryId];
      if (!orig) return;

      const handle = session.handle;
      let newX = orig.x;
      let newY = orig.y;
      let newW = orig.width;
      let newH = orig.height;

      if (handle.includes('e')) {
        newW = Math.max(MIN_SIZE, orig.width + dx);
      } else if (handle.includes('w')) {
        newW = Math.max(MIN_SIZE, orig.width - dx);
        newX = orig.x + (orig.width - newW);
      }

      if (handle.includes('s')) {
        newH = Math.max(MIN_SIZE, orig.height + dy);
      } else if (handle.includes('n')) {
        newH = Math.max(MIN_SIZE, orig.height - dy);
        newY = orig.y + (orig.height - newH);
      }

      onPatchElement(session.primaryId, {
        x: Math.round(newX),
        y: Math.round(newY),
        width: Math.round(newW),
        height: Math.round(newH),
      });
    }
  };

  // Pointer Up handler (ends drag or completes marquee selection)
  const handlePointerUp = (e: React.PointerEvent) => {
    // Complete Marquee selection
    if (marquee && artboardRef.current) {
      const artboardRect = artboardRef.current.getBoundingClientRect();
      const left = Math.min(marquee.startX, marquee.currentX);
      const right = Math.max(marquee.startX, marquee.currentX);
      const top = Math.min(marquee.startY, marquee.currentY);
      const bottom = Math.max(marquee.startY, marquee.currentY);

      const width = right - left;
      const height = bottom - top;

      if (width > 6 || height > 6) {
        // Convert screen rect to artboard local coords
        const marqueeBoxArtboard = {
          x1: (left - artboardRect.left) / zoom,
          y1: (top - artboardRect.top) / zoom,
          x2: (right - artboardRect.left) / zoom,
          y2: (bottom - artboardRect.top) / zoom,
        };

        const intersectedIds = elements
          .filter((el) => {
            if (!el.visible || el.locked) return false;
            const elX1 = el.x;
            const elY1 = el.y;
            const elX2 = el.x + el.width;
            const elY2 = el.y + el.height;

            // Check AABB intersection
            return (
              elX1 < marqueeBoxArtboard.x2 &&
              elX2 > marqueeBoxArtboard.x1 &&
              elY1 < marqueeBoxArtboard.y2 &&
              elY2 > marqueeBoxArtboard.y1
            );
          })
          .map((el) => el.id);

        if (intersectedIds.length > 0) {
          if (e.shiftKey || e.metaKey || e.ctrlKey) {
            onSelectMultiple(Array.from(new Set([...selectedIds, ...intersectedIds])));
          } else {
            onSelectMultiple(intersectedIds);
          }
        } else {
          onSelect(null);
        }
      }
      setMarquee(null);
    }

    dragSession.current = null;
  };

  // Initiate drag-to-select (Marquee) when clicking background
  const handleStagePointerDown = (e: React.PointerEvent) => {
    // Only left button
    if (e.button !== 0) return;

    // Capture pointer on container so dragging from outside across the canvas is uninterrupted
    try {
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
    } catch {}

    // If shift not held and clicking on empty background, deselect elements
    if (!e.shiftKey && !e.metaKey && !e.ctrlKey) {
      onSelect(null);
    }

    setMarquee({
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
    });
  };

  const resizeHandles: ResizeHandle[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

  const getHandleCursor = (handle: ResizeHandle) => {
    switch (handle) {
      case 'n':
      case 's':
        return 'ns-resize';
      case 'e':
      case 'w':
        return 'ew-resize';
      case 'nw':
      case 'se':
        return 'nwse-resize';
      case 'ne':
      case 'sw':
        return 'nesw-resize';
    }
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handleStagePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="flex-1 min-h-full w-full flex items-start justify-center p-8 md:p-14 overflow-auto bg-warm-beige/60 lathala-scroll select-none relative"
    >
      {/* Outer Scaled Artboard Stage */}
      <div
        className="relative transition-all duration-75"
        style={{
          width: artboardWidth * zoom,
          height: artboardHeight * zoom,
        }}
      >
        {/* Figma-Style Frame Header & Dimensions */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            onSelectFrame();
          }}
          className={`absolute -top-7 left-0 flex items-center justify-between text-[11px] font-mono px-1 cursor-pointer transition-colors ${
            isFrameSelected ? 'text-accent font-semibold' : 'text-espresso/60 hover:text-onyx'
          }`}
          style={{ width: artboardWidth * zoom }}
        >
          <div className="flex items-center gap-1.5">
            <FrameIcon size={12} />
            <span>Newsletter Frame</span>
          </div>
          <span>
            {artboardWidth} × {artboardHeight} px ({Math.round(zoom * 100)}%)
          </span>
        </div>

        {/* Artboard Frame Container */}
        <div
          ref={artboardRef}
          role="region"
          aria-label="Newsletter Canvas"
          onClick={(e) => {
            // Clicking empty canvas area selects the frame itself
            if (e.target === e.currentTarget) {
              e.stopPropagation();
              onSelectFrame();
            }
          }}
          className={`relative shadow-artboard overflow-hidden transition-shadow ${
            isFrameSelected ? 'ring-2 ring-accent shadow-2xl' : ''
          }`}
          style={{
            width: artboardWidth,
            height: artboardHeight,
            backgroundColor: artboardBackground,
            borderRadius: `${artboardBorderRadius}px`,
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
          }}
        >
          {/* Elements on Canvas */}
          {elements
            .filter((el) => el.visible)
            .map((el) => {
              const isSelected = selectedIds.includes(el.id);
              const isPrimarySelected = isSelected && selectedIds[0] === el.id;

              return (
                <div
                  key={el.id}
                  style={{
                    position: 'absolute',
                    left: el.x,
                    top: el.y,
                    width: el.width,
                    height: el.height,
                    opacity: el.opacity !== undefined ? el.opacity : 1,
                    transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
                    cursor: el.locked ? 'default' : 'move',
                    zIndex: isSelected ? 30 : 10,
                  }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    beginElementDrag(e, el, 'move-single');
                  }}
                >
                  {/* Element Graphic Content */}
                  {renderElement(el, previewSubscriber, departments)}

                  {/* Multi / Single Selection Outline */}
                  {isSelected && (
                    <div
                      className="pointer-events-none absolute -inset-0.5 border-2 border-accent"
                      style={{ zIndex: 40 }}
                    />
                  )}

                  {/* 8 Resize Handles (Only for primary single-selected unlocked element) */}
                  {isPrimarySelected &&
                    !el.locked &&
                    resizeHandles.map((h) => {
                      const isTop = h.includes('n');
                      const isBottom = h.includes('s');
                      const isLeft = h.includes('w');
                      const isRight = h.includes('e');
                      const isMidX = !isLeft && !isRight;
                      const isMidY = !isTop && !isBottom;

                      return (
                        <button
                          key={h}
                          aria-label={`Resize ${h}`}
                          onPointerDown={(e) => beginElementDrag(e, el, h)}
                          className="absolute h-2.5 w-2.5 bg-white border border-accent rounded-xs shadow-sm hover:scale-125 transition-transform"
                          style={{
                            top: isTop ? -5 : isBottom ? undefined : '50%',
                            bottom: isBottom ? -5 : undefined,
                            left: isLeft ? -5 : isRight ? undefined : '50%',
                            right: isRight ? -5 : undefined,
                            transform: `${isMidX ? 'translateX(-50%)' : ''} ${
                              isMidY ? 'translateY(-50%)' : ''
                            }`.trim() || undefined,
                            cursor: getHandleCursor(h),
                            zIndex: 50,
                          }}
                        />
                      );
                    })}
                </div>
              );
            })}
        </div>

        {/* Free Canvas Frame Resizing Handles (Right edge, Bottom edge, Corner) */}
        <div
          title="Drag to resize Canvas Width freely"
          onPointerDown={(e) => beginFrameResize(e, 'e')}
          className="absolute -right-2 top-0 bottom-0 w-3 cursor-ew-resize hover:bg-accent/40 rounded transition-colors group flex items-center justify-center"
        >
          <div className="w-1 h-8 bg-espresso/40 group-hover:bg-accent rounded-full transition-colors" />
        </div>

        <div
          title="Drag to resize Canvas Height freely"
          onPointerDown={(e) => beginFrameResize(e, 's')}
          className="absolute -bottom-2 left-0 right-0 h-3 cursor-ns-resize hover:bg-accent/40 rounded transition-colors group flex items-center justify-center"
        >
          <div className="h-1 w-8 bg-espresso/40 group-hover:bg-accent rounded-full transition-colors" />
        </div>

        <div
          title="Drag to freely scale Canvas Dimensions"
          onPointerDown={(e) => beginFrameResize(e, 'se')}
          className="absolute -right-2 -bottom-2 h-4 w-4 bg-white border-2 border-accent rounded-sm shadow-md cursor-nwse-resize hover:scale-125 transition-transform z-40"
        />
      </div>

      {/* Interactive Drag-to-Select (Marquee Box) */}
      {marquee && (
        <div
          className="fixed pointer-events-none border border-accent bg-accent/15 z-50 rounded-xs"
          style={{
            left: Math.min(marquee.startX, marquee.currentX),
            top: Math.min(marquee.startY, marquee.currentY),
            width: Math.abs(marquee.currentX - marquee.startX),
            height: Math.abs(marquee.currentY - marquee.startY),
          }}
        />
      )}
    </div>
  );
}

// Render element graphics with high visual fidelity
function renderElement(
  el: CanvasElement,
  previewSubscriber: Subscriber | null,
  departments: Department[],
) {
  switch (el.kind) {
    case 'text': {
      const displayText = interpolateMergeTags(el.text, previewSubscriber, departments);
      return (
        <div
          className="h-full w-full select-none break-words"
          style={{
            fontFamily: `"${el.fontFamily}", sans-serif`,
            fontSize: `${el.fontSize}px`,
            fontWeight: el.fontWeight,
            color: el.color,
            textAlign: el.align,
            lineHeight: el.lineHeight,
            letterSpacing: `${el.letterSpacing}px`,
            backgroundColor: el.backgroundColor || 'transparent',
            padding: el.padding ? `${el.padding}px` : undefined,
            borderRadius: el.borderRadius ? `${el.borderRadius}px` : undefined,
            whiteSpace: 'pre-wrap',
            overflow: 'hidden',
          }}
        >
          {displayText}
        </div>
      );
    }

    case 'shape': {
      const fill = el.fill || '#070D0D';
      const border = el.borderColor;
      const strokeWidth = el.borderWidth || 0;

      if (el.shape === 'rect') {
        return (
          <div
            className="h-full w-full"
            style={{
              backgroundColor: fill,
              borderRadius: `${el.radius || 0}px`,
              borderColor: border,
              borderWidth: strokeWidth ? `${strokeWidth}px` : undefined,
              borderStyle: strokeWidth ? 'solid' : undefined,
            }}
          />
        );
      }

      if (el.shape === 'ellipse' || el.shape === 'pill') {
        return (
          <div
            className="h-full w-full"
            style={{
              backgroundColor: fill,
              borderRadius: '9999px',
              borderColor: border,
              borderWidth: strokeWidth ? `${strokeWidth}px` : undefined,
              borderStyle: strokeWidth ? 'solid' : undefined,
            }}
          />
        );
      }

      if (el.shape === 'triangle') {
        return (
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="h-full w-full overflow-visible"
          >
            <polygon
              points="50,0 100,100 0,100"
              fill={fill}
              stroke={border || 'none'}
              strokeWidth={strokeWidth}
            />
          </svg>
        );
      }

      if (el.shape === 'star') {
        return (
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="h-full w-full overflow-visible"
          >
            <polygon
              points="50,0 63,35 100,35 70,57 82,91 50,70 18,91 30,57 0,35 37,35"
              fill={fill}
              stroke={border || 'none'}
              strokeWidth={strokeWidth}
            />
          </svg>
        );
      }

      return null;
    }

    case 'divider':
    case 'line': {
      const lineEl = el as DividerElement;
      const color = lineEl.color || '#DBD6D0';
      const thickness = lineEl.thickness || 2;
      const style = lineEl.style || 'solid';
      const startEnd = lineEl.startEndpoint || 'none';
      const endEnd = lineEl.endEndpoint || 'none';

      return (
        <div className="h-full w-full flex items-center relative select-none">
          {/* Start Endpoint Decoration */}
          {startEnd === 'circle' && (
            <div
              className="absolute left-0 rounded-full -translate-x-1/2"
              style={{
                width: Math.max(6, thickness * 3),
                height: Math.max(6, thickness * 3),
                backgroundColor: color,
              }}
            />
          )}
          {startEnd === 'square' && (
            <div
              className="absolute left-0 -translate-x-1/2"
              style={{
                width: Math.max(6, thickness * 3),
                height: Math.max(6, thickness * 3),
                backgroundColor: color,
              }}
            />
          )}

          {/* Center Stroke Line */}
          <div
            className="w-full"
            style={{
              height: `${thickness}px`,
              borderTop: `${thickness}px ${style} ${color}`,
            }}
          />

          {/* End Endpoint Decoration */}
          {endEnd === 'arrow' && (
            <div
              className="absolute right-0 translate-x-1/2 w-0 h-0"
              style={{
                borderTop: `${Math.max(4, thickness * 2)}px solid transparent`,
                borderBottom: `${Math.max(4, thickness * 2)}px solid transparent`,
                borderLeft: `${Math.max(7, thickness * 3.5)}px solid ${color}`,
              }}
            />
          )}
          {endEnd === 'circle' && (
            <div
              className="absolute right-0 rounded-full translate-x-1/2"
              style={{
                width: Math.max(6, thickness * 3),
                height: Math.max(6, thickness * 3),
                backgroundColor: color,
              }}
            />
          )}
          {endEnd === 'square' && (
            <div
              className="absolute right-0 translate-x-1/2"
              style={{
                width: Math.max(6, thickness * 3),
                height: Math.max(6, thickness * 3),
                backgroundColor: color,
              }}
            />
          )}
        </div>
      );
    }

    case 'image': {
      return (
        <img
          src={el.src}
          alt={el.alt || 'Newsletter graphic'}
          draggable={false}
          className="h-full w-full select-none"
          style={{
            borderRadius: `${el.radius || 0}px`,
            objectFit: el.objectFit || 'cover',
          }}
        />
      );
    }

    case 'hotspot': {
      return (
        <div
          className="h-full w-full flex items-center justify-center gap-1.5 rounded text-[11px] font-medium border-2 border-dashed border-accent/80 bg-accent/10 text-accent select-none"
          title={`Clickable Link Hotspot: ${el.href}`}
        >
          <LinkIcon size={13} />
          <span className="truncate px-2 font-mono text-[10px]">{el.label || el.href}</span>
        </div>
      );
    }

    default:
      return null;
  }
}
