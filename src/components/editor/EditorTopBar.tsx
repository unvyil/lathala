import React, { useState, useRef, useEffect } from 'react';
import {
  EyeIcon,
  SendIcon,
  CodeIcon,
  Undo2Icon,
  Redo2Icon,
  SparklesIcon,
  ZoomInIcon,
  ZoomOutIcon,
  SettingsIcon,
  ChevronDownIcon,
  LayoutGridIcon,
  TableIcon,
  FileTextIcon,
  UserIcon,
} from 'lucide-react';
import { Department, Subscriber } from '../../types/studio';
import { useAuth } from '../../contexts/AuthContext';
import { useStudio } from '../../contexts/StudioContext';

interface EditorTopBarProps {
  title: string;
  onTitleChange: (title: string) => void;
  departments: Department[];
  segmentId: string;
  onSegmentChange: (id: string) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  subscribers: Subscriber[];
  previewSubscriberId: string | null;
  onSelectPreviewSubscriber: (id: string | null) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onBackToDashboard: () => void;
  onOpenCrm: () => void;
  onPreview: () => void;
  onExportHtml: () => void;
  onSendDispatch: () => void;
  leftSidebarOpen?: boolean;
  onToggleLeftSidebar?: () => void;
  rightSidebarOpen?: boolean;
  onToggleRightSidebar?: () => void;
  onOpenSettings?: () => void;
}

export function EditorTopBar({
  title,
  onTitleChange,
  departments,
  segmentId,
  onSegmentChange,
  zoom,
  onZoomChange,
  subscribers,
  previewSubscriberId,
  onSelectPreviewSubscriber,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onBackToDashboard,
  onOpenCrm,
  onPreview,
  onExportHtml,
  onSendDispatch,
  onOpenSettings,
}: EditorTopBarProps) {
  const { user, openAuthModal } = useAuth();
  const { setView } = useStudio();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);
  const [zoomDropdownOpen, setZoomDropdownOpen] = useState(false);
  const zoomMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTempTitle(title);
  }, [title]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (zoomMenuRef.current && !zoomMenuRef.current.contains(e.target as Node)) {
        setZoomDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const zoomPct = Math.round(zoom * 100);

  const handleZoomStep = (direction: 'in' | 'out') => {
    const delta = direction === 'in' ? 0.1 : -0.1;
    const next = Math.max(0.25, Math.min(3.0, Math.round((zoom + delta) * 10) / 10));
    onZoomChange(next);
  };

  const handleCommitTitle = () => {
    if (tempTitle.trim()) {
      onTitleChange(tempTitle.trim());
    } else {
      setTempTitle(title);
    }
    setIsEditingTitle(false);
  };

  return (
    <header className="h-12 bg-onyx px-3 border-b border-white/10 flex items-center justify-between gap-3 shrink-0 select-none z-30 font-sans">
      {/* 1. LEFT: Brand Back Button, Document Title, Undo/Redo, Left Sidebar Toggle */}
      <div className="flex items-center gap-2 min-w-0">
        {/* Lathala Icon Button (Back to Dashboard) */}
        <button
          onClick={onBackToDashboard}
          title="Back to Dashboard & Projects"
          className="h-7 w-7 rounded-lg bg-parchment flex items-center justify-center font-serif text-onyx font-bold text-sm shadow-xs hover:scale-105 active:scale-95 transition-transform shrink-0"
        >
          L
        </button>

        <span className="text-white/20 text-xs hidden sm:inline select-none">/</span>

        {/* Inline Editable Document Title */}
        <div className="relative flex items-center min-w-0 max-w-[140px] sm:max-w-[220px] md:max-w-[280px]">
          {isEditingTitle ? (
            <input
              type="text"
              value={tempTitle}
              autoFocus
              onChange={(e) => setTempTitle(e.target.value)}
              onBlur={handleCommitTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCommitTitle();
                if (e.key === 'Escape') {
                  setTempTitle(title);
                  setIsEditingTitle(false);
                }
              }}
              className="h-7 px-2 rounded-md bg-white/10 border border-accent/60 text-xs font-serif font-semibold text-parchment focus:outline-none w-full"
            />
          ) : (
            <button
              onClick={() => setIsEditingTitle(true)}
              title="Click to rename edition"
              className="h-7 px-2 rounded-md hover:bg-white/5 text-xs font-serif font-semibold text-parchment/90 hover:text-white truncate flex items-center gap-1.5 transition-colors text-left"
            >
              <span className="truncate">{title}</span>
            </button>
          )}
        </div>

        {/* Undo / Redo controls */}
        <div className="hidden sm:flex items-center gap-0.5 ml-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (⌘Z / Ctrl+Z)"
            className="h-7 w-7 flex items-center justify-center rounded-md text-parchment/70 hover:text-parchment hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
          >
            <Undo2Icon size={13} />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (⌘⇧Z / Ctrl+Y)"
            className="h-7 w-7 flex items-center justify-center rounded-md text-parchment/70 hover:text-parchment hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
          >
            <Redo2Icon size={13} />
          </button>
        </div>
      </div>

      {/* 2. CENTER: Clean Minimalist Navigation Switcher + Compact Zoom */}
      <div className="hidden md:flex items-center gap-3">
        {/* Sleek Segmented Switcher */}
        <div className="flex items-center p-0.5 rounded-lg bg-white/5 border border-white/10 text-[11px] font-medium">
          <button
            onClick={onBackToDashboard}
            className="px-2.5 py-1 rounded-md text-parchment/60 hover:text-parchment transition-colors flex items-center gap-1.5"
          >
            <LayoutGridIcon size={11} />
            <span>Dashboard</span>
          </button>
          <div className="px-2.5 py-1 rounded-md bg-white/15 text-parchment font-semibold shadow-2xs flex items-center gap-1.5">
            <FileTextIcon size={11} />
            <span>Studio</span>
          </div>
          <button
            onClick={onOpenCrm}
            className="px-2.5 py-1 rounded-md text-parchment/60 hover:text-parchment transition-colors flex items-center gap-1.5"
          >
            <TableIcon size={11} />
            <span>CRM</span>
          </button>
        </div>

        {/* Minimalist Zoom Control */}
        <div ref={zoomMenuRef} className="relative flex items-center">
          <div className="flex items-center rounded-lg bg-white/5 border border-white/10 h-7 text-xs font-mono">
            <button
              onClick={() => handleZoomStep('out')}
              title="Zoom Out"
              className="h-full px-1.5 text-parchment/60 hover:text-parchment hover:bg-white/10 rounded-l-lg transition-colors"
            >
              <ZoomOutIcon size={11} />
            </button>
            <button
              onClick={() => setZoomDropdownOpen((prev) => !prev)}
              title="Change zoom"
              className="px-2 h-full text-[11px] text-parchment/80 hover:text-parchment hover:bg-white/10 font-medium transition-colors flex items-center gap-1"
            >
              <span>{zoomPct}%</span>
              <ChevronDownIcon size={10} className="opacity-50" />
            </button>
            <button
              onClick={() => handleZoomStep('in')}
              title="Zoom In"
              className="h-full px-1.5 text-parchment/60 hover:text-parchment hover:bg-white/10 rounded-r-lg transition-colors"
            >
              <ZoomInIcon size={11} />
            </button>
          </div>

          {/* Zoom Preset Dropdown */}
          {zoomDropdownOpen && (
            <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 w-32 bg-espresso border border-white/15 rounded-xl shadow-xl p-1 z-50 text-[11px] animate-in fade-in zoom-in-95 duration-100">
              {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((preset) => (
                <button
                  key={preset}
                  onClick={() => {
                    onZoomChange(preset);
                    setZoomDropdownOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1 rounded-md flex items-center justify-between ${
                    Math.abs(zoom - preset) < 0.02
                      ? 'bg-accent text-white font-medium'
                      : 'text-parchment/80 hover:bg-white/10'
                  }`}
                >
                  <span>{Math.round(preset * 100)}%</span>
                  {preset === 1.0 && <span className="text-[9px] opacity-60">Reset</span>}
                </button>
              ))}
              <div className="px-2 pt-2 pb-1 border-t border-white/10 mt-1">
                <input
                  type="range"
                  min="0.25"
                  max="2.5"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => onZoomChange(parseFloat(e.target.value))}
                  className="w-full accent-accent h-1 cursor-pointer bg-white/20 rounded"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. RIGHT: Audience Target/Preview, Export, Preview, Dispatch, Inspector Toggle, Settings, Avatar */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Subtle Audience Preview Selector */}
        <div className="hidden lg:flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-2 h-7.5">
          <SparklesIcon size={11} className="text-accent shrink-0" />
          <select
            value={previewSubscriberId || ''}
            onChange={(e) => onSelectPreviewSubscriber(e.target.value || null)}
            className="bg-transparent text-[11px] text-parchment/80 hover:text-parchment font-medium focus:outline-none cursor-pointer max-w-[130px] truncate"
            title="Preview newsletter personalized with subscriber data"
          >
            <option value="" className="text-onyx bg-white">
              Template Preview (Default)
            </option>
            {subscribers.slice(0, 8).map((sub) => (
              <option key={sub.id} value={sub.id} className="text-onyx bg-white">
                {sub.name}
              </option>
            ))}
          </select>
        </div>

        {/* Minimalist Ghost: Export HTML */}
        <button
          onClick={onExportHtml}
          title="Export email-safe HTML"
          className="h-7.5 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-parchment/80 hover:text-parchment text-xs font-medium flex items-center gap-1.5 transition-colors border border-white/5"
        >
          <CodeIcon size={12} />
          <span className="hidden xl:inline text-[11px]">HTML</span>
        </button>

        {/* Minimalist Ghost: Preview */}
        <button
          onClick={onPreview}
          title="Preview newsletter in desktop and mobile frames"
          className="h-7.5 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-parchment text-xs font-medium flex items-center gap-1.5 transition-colors border border-white/5"
        >
          <EyeIcon size={12} />
          <span className="hidden sm:inline text-[11px]">Preview</span>
        </button>

        {/* Primary Action: Dispatch */}
        <button
          onClick={onSendDispatch}
          className="h-7.5 px-3 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs active:scale-95"
        >
          <SendIcon size={12} />
          <span className="text-[11px]">Dispatch</span>
        </button>

        {/* Global Settings */}
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            title="Workspace Settings & Backend Keys"
            className="h-7.5 w-7.5 rounded-lg text-parchment/60 hover:text-parchment hover:bg-white/5 flex items-center justify-center transition-colors"
          >
            <SettingsIcon size={13} />
          </button>
        )}

        {/* User Avatar / Profile */}
        <button
          onClick={() => openAuthModal('signin')}
          title={user?.name ? `${user.name} (${user.role})` : 'Sign In with Clerk'}
          className="h-7 w-7 rounded-full overflow-hidden ring-1 ring-white/20 hover:ring-white/40 transition-all shrink-0 ml-0.5"
        >
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-white/10 flex items-center justify-center text-parchment">
              <UserIcon size={12} />
            </div>
          )}
        </button>
      </div>
    </header>
  );
}
