import React, { useState, useCallback, useEffect } from 'react';
import { useStudio } from '../../contexts/StudioContext';
import { useAuth } from '../../contexts/AuthContext';
import { syncProjectToSupabase } from '../../services/supabaseClient';
import { ToolDock, AddElementPayload } from './ToolDock';
import { CanvasStage } from './CanvasStage';
import { LayersPanel } from './LayersPanel';
import { Inspector } from './Inspector';
import { EditorTopBar } from './EditorTopBar';
import { CanvasElement } from '../../types/studio';
import { PanelLeftOpenIcon, PanelRightOpenIcon, PanelRightCloseIcon } from 'lucide-react';

const uid = (prefix: string = 'el') => `${prefix}-${Math.random().toString(36).slice(2, 9)}`;

function createElementFromPayload(payload: AddElementPayload): CanvasElement {
  const base = {
    id: uid(),
    x: 40,
    y: 120,
    visible: true,
    locked: false,
    opacity: 1,
    rotation: 0,
  };

  switch (payload.kind) {
    case 'text': {
      const role = payload.role;
      let text = 'The Art of Mindful Craftsmanship';
      let font = 'Instrument Serif';
      let size = 38;
      let weight = 400;
      let lineHeight = 1.15;
      let letterSpacing = -0.4;
      let width = 520;
      let height = 70;

      if (role === 'heading') {
        text = 'Section Headline';
        font = 'Instrument Serif';
        size = 26;
        weight = 400;
        lineHeight = 1.25;
        letterSpacing = -0.2;
        height = 50;
      } else if (role === 'subheading') {
        text = 'A curated briefing on typography, design systems, and audience reach';
        font = 'Instrument Sans';
        size = 17;
        weight = 500;
        lineHeight = 1.4;
        letterSpacing = 0;
        height = 45;
      } else if (role === 'body') {
        text =
          'Hello Reader,\nThank you for reading our dispatch. This paragraph dynamically syncs with your subscriber attributes and editorial theme.';
        font = 'Instrument Sans';
        size = 14;
        weight = 400;
        lineHeight = 1.6;
        letterSpacing = 0;
        height = 80;
      } else if (role === 'caption') {
        text = 'DISPATCH № 42 • ARCHIVE EDITION • AUTUMN RELEASE';
        font = 'Instrument Sans';
        size = 11;
        weight = 600;
        lineHeight = 1.4;
        letterSpacing = 1.5;
        height = 24;
      }

      return {
        ...base,
        kind: 'text',
        name: `${role.charAt(0).toUpperCase() + role.slice(1)} Layer`,
        textRole: role,
        width,
        height,
        text,
        fontFamily: font,
        fontSize: size,
        fontWeight: weight,
        color: '#070D0D',
        align: 'left',
        lineHeight,
        letterSpacing,
      };
    }

    case 'shape': {
      const shape = payload.shape;
      let name = 'Rectangle Card';
      let width = 520;
      let height = 140;
      let radius = 8;
      let fill = '#DBD6D0';

      if (shape === 'ellipse') {
        name = 'Circle Badge';
        width = 120;
        height = 120;
        radius = 9999;
        fill = '#070D0D';
      } else if (shape === 'pill') {
        name = 'Geometric Pill';
        width = 140;
        height = 36;
        radius = 18;
        fill = '#070D0D';
      } else if (shape === 'triangle') {
        name = 'Triangle Vector';
        width = 80;
        height = 80;
        fill = '#D97706';
      } else if (shape === 'star') {
        name = 'Feature Star';
        width = 90;
        height = 90;
        fill = '#070D0D';
      }

      return {
        ...base,
        kind: 'shape',
        name,
        shape,
        width,
        height,
        fill,
        radius,
      };
    }

    case 'line': {
      const opts = payload.lineOptions;
      return {
        ...base,
        kind: 'line',
        name: 'Custom Line',
        width: 520,
        height: 16,
        color: '#DBD6D0',
        thickness: 2,
        style: opts.style,
        startEndpoint: opts.startEndpoint,
        endEndpoint: opts.endEndpoint,
      };
    }

    case 'image':
      return {
        ...base,
        kind: 'image',
        name: 'Photograph',
        width: 520,
        height: 280,
        src: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000&auto=format&fit=crop',
        alt: 'Editorial photograph',
        radius: 4,
        objectFit: 'cover',
      };

    case 'button':
      return {
        ...base,
        kind: 'text',
        name: 'CTA Button',
        width: 220,
        height: 44,
        text: 'Read Full Edition →',
        fontFamily: 'Instrument Sans',
        fontSize: 13,
        fontWeight: 600,
        color: '#F1EEE9',
        backgroundColor: '#070D0D',
        borderRadius: 22,
        padding: 12,
        align: 'center',
        lineHeight: 1.4,
        letterSpacing: 0.5,
      };

    case 'hotspot':
      return {
        ...base,
        kind: 'hotspot',
        name: 'Link Hotspot',
        width: 220,
        height: 44,
        href: 'https://lathala.studio',
        label: 'https://lathala.studio',
      };
  }
}

interface EditorViewProps {
  onOpenPreview: () => void;
  onOpenExportHtml: () => void;
  onOpenDispatch: () => void;
  onOpenFontModal: () => void;
  onOpenSettings?: () => void;
}

export function EditorView({
  onOpenPreview,
  onOpenExportHtml,
  onOpenDispatch,
  onOpenFontModal,
  onOpenSettings,
}: EditorViewProps) {
  const {
    activeProject,
    updateProject,
    setElements,
    canUndo,
    canRedo,
    undo,
    redo,
    departments,
    subscribers,
    previewSubscriberId,
    setPreviewSubscriberId,
    previewSubscriber,
    customColumns,
    fonts,
    setView,
    addToast,
  } = useStudio();

  // Multi-Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isFrameSelected, setIsFrameSelected] = useState<boolean>(false);

  // Smooth Canvas Zoom
  const [zoom, setZoom] = useState<number>(1);

  // Collapsible Sidebars State
  const [leftSidebarOpen, setLeftSidebarOpen] = useState<boolean>(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState<boolean>(true);

  const { user } = useAuth();

  // Dynamic Keyboard Shortcuts: Zoom In (Ctrl +), Zoom Out (Ctrl -), Save (Ctrl S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement ||
        (e.target as HTMLElement).isContentEditable;

      if (isInput) return;

      // Zoom In: Ctrl + / Cmd + / =
      if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        setZoom((prev) => Math.min(3.5, Math.round((prev + 0.1) * 10) / 10));
      }
      // Zoom Out: Ctrl - / Cmd - / _
      else if ((e.ctrlKey || e.metaKey) && (e.key === '-' || e.key === '_')) {
        e.preventDefault();
        setZoom((prev) => Math.max(0.25, Math.round((prev - 0.1) * 10) / 10));
      }
      // Save Design: Ctrl + S / Cmd + S
      else if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        if (activeProject) {
          syncProjectToSupabase(activeProject, user?.id || 'default-user').then((res) => {
            if (res.success) {
              addToast(`Design "${activeProject.title}" synced to Supabase! (Ctrl+S)`, 'success');
            } else {
              addToast(`Design saved locally (Ctrl+S)`, 'info');
            }
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeProject, user, addToast]);

  if (!activeProject) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-parchment">
        <h2 className="font-serif text-2xl text-onyx mb-2">No Active Newsletter Open</h2>
        <p className="text-sm text-espresso/70 mb-4 max-w-md">
          Select an existing project from your dashboard or create a new edition.
        </p>
        <button
          onClick={() => setView('dashboard')}
          className="px-4 py-2 rounded-xl bg-onyx text-parchment text-xs font-semibold hover:bg-espresso transition-colors"
        >
          Open Projects Dashboard
        </button>
      </div>
    );
  }

  const projectId = activeProject.id;

  // Selection handlers
  const handleSelect = useCallback((id: string | null, isMulti?: boolean) => {
    if (!id) {
      setSelectedIds([]);
      setIsFrameSelected(false);
      return;
    }
    setIsFrameSelected(false);
    if (isMulti) {
      setSelectedIds((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
      );
    } else {
      setSelectedIds([id]);
    }
  }, []);

  const handleSelectMultiple = useCallback((ids: string[]) => {
    setIsFrameSelected(false);
    setSelectedIds(ids);
  }, []);

  const handleSelectFrame = useCallback(() => {
    setSelectedIds([]);
    setIsFrameSelected(true);
  }, []);

  // Patching elements
  const patchElement = useCallback(
    (id: string, patch: Partial<CanvasElement>) => {
      setElements(projectId, (els) =>
        els.map((el) => (el.id === id ? ({ ...el, ...patch } as CanvasElement) : el)),
      );
    },
    [projectId, setElements],
  );

  const patchMultiple = useCallback(
    (patches: { id: string; patch: Partial<CanvasElement> }[]) => {
      const patchMap = new Map(patches.map((p) => [p.id, p.patch]));
      setElements(projectId, (els) =>
        els.map((el) => {
          const p = patchMap.get(el.id);
          return p ? ({ ...el, ...p } as CanvasElement) : el;
        }),
      );
    },
    [projectId, setElements],
  );

  // Deletion
  const deleteElement = useCallback(
    (id: string) => {
      setElements(projectId, (els) => els.filter((el) => el.id !== id));
      setSelectedIds((curr) => curr.filter((i) => i !== id));
      addToast('Layer removed from canvas', 'info');
    },
    [projectId, setElements, addToast],
  );

  const deleteMultiple = useCallback(
    (ids: string[]) => {
      const set = new Set(ids);
      setElements(projectId, (els) => els.filter((el) => !set.has(el.id)));
      setSelectedIds([]);
      addToast(`Removed ${ids.length} layers`, 'info');
    },
    [projectId, setElements, addToast],
  );

  // Duplication
  const duplicateElement = useCallback(
    (element: CanvasElement) => {
      const copy: CanvasElement = {
        ...element,
        id: uid('el'),
        name: `${element.name} (Copy)`,
        x: element.x + 20,
        y: element.y + 20,
      };
      setElements(projectId, (els) => [...els, copy]);
      setSelectedIds([copy.id]);
      addToast('Duplicated layer', 'info');
    },
    [projectId, setElements, addToast],
  );

  // Adding Element from Tools Dock
  const addElement = useCallback(
    (payload: AddElementPayload) => {
      const newEl = createElementFromPayload(payload);
      setElements(projectId, (els) => [...els, newEl]);
      setSelectedIds([newEl.id]);
      setIsFrameSelected(false);
      addToast(`Added ${newEl.name} to artboard`, 'success');
    },
    [projectId, setElements, addToast],
  );

  const handleReorderLayers = useCallback(
    (updatedElements: CanvasElement[]) => {
      setElements(projectId, () => updatedElements);
    },
    [projectId, setElements],
  );

  const primarySelectedElement =
    activeProject.elements.find((el) => el.id === selectedIds[0]) ?? null;
  const selectedElements = activeProject.elements.filter((el) =>
    selectedIds.includes(el.id),
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-parchment">
      {/* Top Action Bar with Smooth Zoom & Collapsible Toggles */}
      <EditorTopBar
        title={activeProject.title}
        onTitleChange={(title) => updateProject(activeProject.id, { title })}
        departments={departments}
        segmentId={activeProject.segmentId}
        onSegmentChange={(segmentId) => updateProject(activeProject.id, { segmentId })}
        zoom={zoom}
        onZoomChange={setZoom}
        subscribers={subscribers}
        previewSubscriberId={previewSubscriberId}
        onSelectPreviewSubscriber={setPreviewSubscriberId}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onBackToDashboard={() => setView('dashboard')}
        onOpenCrm={() => setView('crm')}
        onPreview={onOpenPreview}
        onExportHtml={onOpenExportHtml}
        onSendDispatch={onOpenDispatch}
        onOpenSettings={onOpenSettings}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* Left Collapsible Tool Dock */}
        {leftSidebarOpen && (
          <ToolDock
            onAddElement={addElement}
            collapsed={false}
            onToggleCollapse={() => setLeftSidebarOpen(false)}
          />
        )}

        {!leftSidebarOpen && (
          <button
            onClick={() => setLeftSidebarOpen(true)}
            title="Expand Design Tools"
            className="absolute top-3 left-3 z-30 h-8 w-8 rounded-lg bg-espresso/90 hover:bg-espresso text-parchment/70 hover:text-white border border-white/10 shadow-lg flex items-center justify-center transition-all hover:scale-105"
          >
            <PanelLeftOpenIcon size={14} />
          </button>
        )}

        {/* Center Free Scalable Canvas */}
        <main className="flex-1 min-w-0 h-full flex flex-col relative overflow-hidden">
          <CanvasStage
            elements={activeProject.elements}
            selectedIds={selectedIds}
            isFrameSelected={isFrameSelected}
            zoom={zoom}
            artboardWidth={activeProject.artboardWidth || 600}
            artboardHeight={activeProject.artboardHeight || 880}
            artboardBackground={activeProject.artboardBackground || '#F1EEE9'}
            artboardBorderRadius={activeProject.artboardBorderRadius || 0}
            previewSubscriber={previewSubscriber}
            departments={departments}
            onSelect={handleSelect}
            onSelectMultiple={handleSelectMultiple}
            onSelectFrame={handleSelectFrame}
            onPatchElement={patchElement}
            onPatchMultiple={patchMultiple}
            onPatchArtboard={(patch) => updateProject(activeProject.id, patch)}
            onDeleteSelected={() => deleteMultiple(selectedIds)}
            onZoomChange={setZoom}
          />
        </main>

        {/* Right Collapsible Sidebar: Drag-and-Drop Layers & Inspector */}
        {rightSidebarOpen && (
          <aside
            aria-label="Layer Hierarchy & Inspector"
            className="w-72 lg:w-80 bg-espresso border-l border-white/5 flex flex-col shrink-0 overflow-hidden z-20 shadow-xl relative"
          >
            {/* Inner top-left corner collapse toggle */}
            <div className="h-8 px-2.5 bg-onyx/60 border-b border-white/5 flex items-center justify-between shrink-0">
              <button
                onClick={() => setRightSidebarOpen(false)}
                title="Collapse Layers & Inspector"
                className="p-1 rounded text-parchment/50 hover:text-parchment hover:bg-white/10 transition-colors"
              >
                <PanelRightCloseIcon size={13} />
              </button>
              <span className="text-[10px] font-mono uppercase tracking-widest text-parchment/40">
                Layers & Properties
              </span>
            </div>

            {/* Draggable Layers Panel */}
            <LayersPanel
              elements={activeProject.elements}
              selectedIds={selectedIds}
              onSelect={handleSelect}
              onPatch={patchElement}
              onDelete={deleteElement}
              onReorder={handleReorderLayers}
            />

            {/* Properties & Merge Tags Inspector */}
            <Inspector
              element={primarySelectedElement}
              selectedElements={selectedElements}
              isFrameSelected={isFrameSelected}
              activeProject={activeProject}
              fonts={fonts}
              customColumns={customColumns}
              onPatch={patchElement}
              onPatchMultiple={patchMultiple}
              onDelete={deleteElement}
              onDeleteMultiple={deleteMultiple}
              onDuplicate={duplicateElement}
              onPatchProject={(patch) => updateProject(activeProject.id, patch)}
              onOpenFontModal={onOpenFontModal}
            />
          </aside>
        )}

        {!rightSidebarOpen && (
          <button
            onClick={() => setRightSidebarOpen(true)}
            title="Expand Layers & Inspector"
            className="absolute top-3 right-3 z-30 h-8 w-8 rounded-lg bg-espresso/90 hover:bg-espresso text-parchment/70 hover:text-white border border-white/10 shadow-lg flex items-center justify-center transition-all hover:scale-105"
          >
            <PanelRightOpenIcon size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
