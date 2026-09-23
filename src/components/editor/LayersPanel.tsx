import React, { useState } from 'react';
import {
  CanvasElement,
} from '../../types/studio';
import {
  LayersIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronsUpIcon,
  ChevronsDownIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  UnlockIcon,
  TypeIcon,
  SquareIcon,
  CircleIcon,
  TriangleIcon,
  StarIcon,
  ImageIcon,
  LinkIcon,
  MinusIcon,
  GripVerticalIcon,
} from 'lucide-react';

interface LayersPanelProps {
  elements: CanvasElement[];
  selectedIds: string[];
  onSelect: (id: string | null, isMulti?: boolean) => void;
  onPatch: (id: string, patch: Partial<CanvasElement>) => void;
  onDelete: (id: string) => void;
  onReorder: (elements: CanvasElement[]) => void;
}

export function LayersPanel({
  elements,
  selectedIds,
  onSelect,
  onPatch,
  onDelete,
  onReorder,
}: LayersPanelProps) {
  // Elements in model are bottom-to-top (index 0 is back).
  // In UI, users expect top layer at top of the list!
  // So displayLayers has index 0 as highest z-index.
  const displayLayers = [...elements].reverse();

  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<'above' | 'below'>('above');

  // Move layer single step
  const moveLayer = (elementId: string, direction: 'up' | 'down') => {
    const currentIndex = elements.findIndex((el) => el.id === elementId);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex + 1 : currentIndex - 1;
    if (targetIndex < 0 || targetIndex >= elements.length) return;

    const next = [...elements];
    const [moved] = next.splice(currentIndex, 1);
    next.splice(targetIndex, 0, moved);
    onReorder(next);
  };

  // Move layer to front (top of stack)
  const bringToFront = (elementId: string) => {
    const currentIndex = elements.findIndex((el) => el.id === elementId);
    if (currentIndex === -1 || currentIndex === elements.length - 1) return;

    const next = [...elements];
    const [moved] = next.splice(currentIndex, 1);
    next.push(moved);
    onReorder(next);
  };

  // Move layer to back (bottom of stack)
  const sendToBack = (elementId: string) => {
    const currentIndex = elements.findIndex((el) => el.id === elementId);
    if (currentIndex <= 0) return;

    const next = [...elements];
    const [moved] = next.splice(currentIndex, 1);
    next.unshift(moved);
    onReorder(next);
  };

  // HTML5 Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (draggedId === targetId) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const pos = e.clientY < midY ? 'above' : 'below';

    setDragOverId(targetId);
    setDropPosition(pos);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = draggedId || e.dataTransfer.getData('text/plain');
    setDraggedId(null);
    setDragOverId(null);

    if (!sourceId || sourceId === targetId) return;

    // Convert display positions back to model indices
    const currentModelIdx = elements.findIndex((el) => el.id === sourceId);
    const targetModelIdx = elements.findIndex((el) => el.id === targetId);
    if (currentModelIdx === -1 || targetModelIdx === -1) return;

    const next = [...elements];
    const [moved] = next.splice(currentModelIdx, 1);

    // Note: display list is reversed, so 'above' in display means higher z-index (after in elements array)
    let newIndex = targetModelIdx;
    if (dropPosition === 'above') {
      newIndex = currentModelIdx < targetModelIdx ? targetModelIdx : targetModelIdx + 1;
    } else {
      newIndex = currentModelIdx < targetModelIdx ? targetModelIdx - 1 : targetModelIdx;
    }
    newIndex = Math.max(0, Math.min(next.length, newIndex));

    next.splice(newIndex, 0, moved);
    onReorder(next);
  };

  const getElementIcon = (el: CanvasElement) => {
    if (el.kind === 'shape') {
      if (el.shape === 'ellipse') return CircleIcon;
      if (el.shape === 'triangle') return TriangleIcon;
      if (el.shape === 'star') return StarIcon;
      return SquareIcon;
    }
    if (el.kind === 'text') return TypeIcon;
    if (el.kind === 'image') return ImageIcon;
    if (el.kind === 'hotspot') return LinkIcon;
    if (el.kind === 'line' || el.kind === 'divider') return MinusIcon;
    return LayersIcon;
  };

  const primarySelectedId = selectedIds[0] || null;

  return (
    <div className="border-b border-white/10 flex flex-col max-h-64 shrink-0 bg-onyx/40">
      {/* Header with Quick Z-Index Arrangement Controls */}
      <div className="px-3 py-2 bg-onyx/80 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-parchment/80">
          <LayersIcon size={13} className="text-accent" />
          <span className="text-[11px] font-semibold uppercase tracking-wider font-mono">
            Layers ({elements.length})
          </span>
        </div>

        {/* Global Z-Index Arrangement Controls for currently selected layer */}
        {primarySelectedId && (
          <div className="flex items-center gap-0.5 bg-white/5 rounded-md p-0.5 border border-white/10">
            <button
              onClick={() => bringToFront(primarySelectedId)}
              title="Bring to Front (Shift + ])"
              className="p-1 rounded text-parchment/60 hover:text-parchment hover:bg-white/10 transition-colors"
            >
              <ChevronsUpIcon size={12} />
            </button>
            <button
              onClick={() => moveLayer(primarySelectedId, 'up')}
              title="Bring Forward (])"
              className="p-1 rounded text-parchment/60 hover:text-parchment hover:bg-white/10 transition-colors"
            >
              <ChevronUpIcon size={12} />
            </button>
            <button
              onClick={() => moveLayer(primarySelectedId, 'down')}
              title="Send Backward ([)"
              className="p-1 rounded text-parchment/60 hover:text-parchment hover:bg-white/10 transition-colors"
            >
              <ChevronDownIcon size={12} />
            </button>
            <button
              onClick={() => sendToBack(primarySelectedId)}
              title="Send to Back (Shift + [)"
              className="p-1 rounded text-parchment/60 hover:text-parchment hover:bg-white/10 transition-colors"
            >
              <ChevronsDownIcon size={12} />
            </button>
          </div>
        )}
      </div>

      {/* Draggable Layer List */}
      <div className="overflow-y-auto lathala-scroll p-1.5 space-y-0.5">
        {displayLayers.map((el) => {
          const isSelected = selectedIds.includes(el.id);
          const Icon = getElementIcon(el);
          const isDragTarget = dragOverId === el.id;

          return (
            <div
              key={el.id}
              draggable={!el.locked}
              onDragStart={(e) => handleDragStart(e, el.id)}
              onDragOver={(e) => handleDragOver(e, el.id)}
              onDrop={(e) => handleDrop(e, el.id)}
              onDragEnd={() => {
                setDraggedId(null);
                setDragOverId(null);
              }}
              onClick={(e) => {
                onSelect(el.id, e.shiftKey || e.metaKey || e.ctrlKey);
              }}
              className={`group relative flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors cursor-pointer select-none ${
                isSelected
                  ? 'bg-accent text-white font-medium shadow-xs'
                  : 'text-parchment/75 hover:bg-white/5 hover:text-parchment'
              } ${draggedId === el.id ? 'opacity-40' : ''}`}
            >
              {/* Drop Target Indicator Line */}
              {isDragTarget && (
                <div
                  className={`absolute left-0 right-0 h-0.5 bg-accent z-20 pointer-events-none ${
                    dropPosition === 'above' ? '-top-0.5' : '-bottom-0.5'
                  }`}
                />
              )}

              {/* Layer Title & Drag Handle */}
              <div className="flex items-center gap-1.5 min-w-0">
                <GripVerticalIcon
                  size={12}
                  className="text-parchment/30 group-hover:text-parchment/70 cursor-grab shrink-0"
                />
                <Icon size={13} className={isSelected ? 'text-white' : 'text-parchment/50'} />
                <span className="truncate max-w-[125px]">{el.name}</span>
              </div>

              {/* Quick Layer Controls: Visibility & Lock */}
              <div
                className="flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => onPatch(el.id, { visible: !el.visible })}
                  title={el.visible ? 'Hide layer' : 'Show layer'}
                  className="p-1 rounded hover:bg-black/20"
                >
                  {el.visible ? <EyeIcon size={12} /> : <EyeOffIcon size={12} />}
                </button>

                <button
                  onClick={() => onPatch(el.id, { locked: !el.locked })}
                  title={el.locked ? 'Unlock layer' : 'Lock layer'}
                  className="p-1 rounded hover:bg-black/20"
                >
                  {el.locked ? <LockIcon size={12} /> : <UnlockIcon size={12} />}
                </button>
              </div>
            </div>
          );
        })}

        {elements.length === 0 && (
          <div className="p-4 text-center text-xs text-parchment/40 font-mono">
            No layers on canvas. Choose a tool to add.
          </div>
        )}
      </div>
    </div>
  );
}
