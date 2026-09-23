import React, { useState, useRef, useEffect } from 'react';
import {
  TypeIcon,
  ShapesIcon,
  MinusIcon,
  ImageIcon,
  MousePointerClickIcon,
  LinkIcon,
  SquareIcon,
  CircleIcon,
  TriangleIcon,
  StarIcon,
  ChevronRightIcon,
  ArrowRightIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  SparklesIcon,
} from 'lucide-react';
import { ShapeKind, TextHierarchyRole, LineEndpoint } from '../../types/studio';

export type TextToolOption = TextHierarchyRole;
export type ShapeToolOption = ShapeKind;
export type LineToolOption = {
  style: 'solid' | 'dashed' | 'dotted';
  startEndpoint?: LineEndpoint;
  endEndpoint?: LineEndpoint;
};

export type AddElementPayload =
  | { kind: 'text'; role: TextToolOption }
  | { kind: 'shape'; shape: ShapeToolOption }
  | { kind: 'line'; lineOptions: LineToolOption }
  | { kind: 'image' }
  | { kind: 'button' }
  | { kind: 'hotspot' };

interface ToolDockProps {
  onAddElement: (payload: AddElementPayload) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function ToolDock({
  onAddElement,
  collapsed,
  onToggleCollapse,
}: ToolDockProps) {
  const [activeMenu, setActiveMenu] = useState<'text' | 'shapes' | 'lines' | null>(null);
  const dockRef = useRef<HTMLDivElement>(null);

  // Close flyout menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dockRef.current && !dockRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <aside
      ref={dockRef}
      aria-label="Design Tools"
      className={`bg-espresso border-r border-white/5 flex flex-col items-center pt-9 pb-3 shrink-0 select-none z-30 transition-all duration-200 relative ${
        collapsed ? 'w-12' : 'w-16'
      }`}
    >
      {/* Collapse Toggle Button positioned at inner top-right corner */}
      <button
        onClick={onToggleCollapse}
        title={collapsed ? 'Expand Tools Sidebar' : 'Collapse Tools Sidebar'}
        className="absolute top-2 right-2 p-1 rounded-md text-parchment/50 hover:text-parchment hover:bg-white/10 transition-colors z-10"
      >
        {collapsed ? <PanelLeftOpenIcon size={14} /> : <PanelLeftCloseIcon size={14} />}
      </button>

      <div className="text-[9px] font-mono text-parchment/40 uppercase tracking-widest mb-2">
        {collapsed ? '•' : 'Tools'}
      </div>

      <div className="flex flex-col gap-1.5 w-full px-1.5 relative">
        {/* 1. Unified Text Widget (Google Docs hierarchy + Figma properties) */}
        <div className="relative group">
          <button
            onClick={() => setActiveMenu(activeMenu === 'text' ? null : 'text')}
            title="Text Tool (Title, Heading, Subheading, Body, Caption)"
            className={`flex flex-col items-center justify-center h-12 w-full rounded-xl transition-all border ${
              activeMenu === 'text'
                ? 'bg-accent text-white border-accent shadow-sm'
                : 'text-parchment/75 hover:text-parchment hover:bg-white/10 border-transparent hover:border-white/10'
            }`}
          >
            <TypeIcon size={18} strokeWidth={1.75} />
            {!collapsed && (
              <span className="text-[9px] mt-1 font-medium tracking-tight leading-none">Text</span>
            )}
          </button>

          {/* Text Flyout Menu */}
          {activeMenu === 'text' && (
            <div className="absolute left-full top-0 ml-2 w-56 bg-onyx border border-white/15 rounded-xl shadow-artboard p-2 text-parchment z-50 animate-in fade-in slide-in-from-left-2 duration-150">
              <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-parchment/50 border-b border-white/10 mb-1 flex items-center justify-between">
                <span>Text Hierarchy</span>
                <span className="text-[9px] text-accent">Figma / Docs</span>
              </div>

              {[
                {
                  role: 'title' as TextHierarchyRole,
                  label: 'Title',
                  font: 'Instrument Serif',
                  size: '38px',
                  desc: 'Major newsletter headline',
                },
                {
                  role: 'heading' as TextHierarchyRole,
                  label: 'Heading',
                  font: 'Instrument Serif',
                  size: '26px',
                  desc: 'Section editorial header',
                },
                {
                  role: 'subheading' as TextHierarchyRole,
                  label: 'Subheading',
                  font: 'Instrument Sans',
                  size: '17px',
                  desc: 'Lead paragraph / subtitle',
                },
                {
                  role: 'body' as TextHierarchyRole,
                  label: 'Body Text',
                  font: 'Instrument Sans',
                  size: '14px',
                  desc: 'Standard paragraph with merge tags',
                },
                {
                  role: 'caption' as TextHierarchyRole,
                  label: 'Caption / Footnote',
                  font: 'Instrument Sans',
                  size: '11px',
                  desc: 'Metadata, timestamps, tags',
                },
              ].map((item) => (
                <button
                  key={item.role}
                  onClick={() => {
                    onAddElement({ kind: 'text', role: item.role });
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 flex items-center justify-between group/item transition-colors"
                >
                  <div>
                    <div
                      className="text-xs text-parchment group-hover/item:text-accent font-medium transition-colors"
                      style={{ fontFamily: item.font }}
                    >
                      {item.label}
                    </div>
                    <div className="text-[10px] text-parchment/40">{item.desc}</div>
                  </div>
                  <span className="text-[10px] font-mono text-parchment/30">{item.size}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 2. Unified Shapes Widget (Rect, Ellipse, Pill, Triangle, Star) */}
        <div className="relative group">
          <button
            onClick={() => setActiveMenu(activeMenu === 'shapes' ? null : 'shapes')}
            title="Shapes Tool (Rectangle, Ellipse, Pill, Triangle, Star)"
            className={`flex flex-col items-center justify-center h-12 w-full rounded-xl transition-all border ${
              activeMenu === 'shapes'
                ? 'bg-accent text-white border-accent shadow-sm'
                : 'text-parchment/75 hover:text-parchment hover:bg-white/10 border-transparent hover:border-white/10'
            }`}
          >
            <ShapesIcon size={18} strokeWidth={1.75} />
            {!collapsed && (
              <span className="text-[9px] mt-1 font-medium tracking-tight leading-none">Shapes</span>
            )}
          </button>

          {/* Shapes Flyout Menu */}
          {activeMenu === 'shapes' && (
            <div className="absolute left-full top-0 ml-2 w-52 bg-onyx border border-white/15 rounded-xl shadow-artboard p-2 text-parchment z-50 animate-in fade-in slide-in-from-left-2 duration-150">
              <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-parchment/50 border-b border-white/10 mb-1 flex items-center justify-between">
                <span>Geometric Shapes</span>
                <span className="text-[9px] text-accent">Vectors</span>
              </div>

              {[
                { shape: 'rect' as ShapeKind, label: 'Rectangle / Card', icon: SquareIcon, desc: 'Box or container' },
                { shape: 'ellipse' as ShapeKind, label: 'Oval / Circle', icon: CircleIcon, desc: 'Circular frame or badge' },
                { shape: 'pill' as ShapeKind, label: 'Pill / Capsule', icon: CircleIcon, desc: 'Rounded tag accent' },
                { shape: 'triangle' as ShapeKind, label: 'Triangle', icon: TriangleIcon, desc: 'Geometric indicator' },
                { shape: 'star' as ShapeKind, label: 'Star / Badge', icon: StarIcon, desc: 'Feature highlight badge' },
              ].map(({ shape, label, icon: Icon, desc }) => (
                <button
                  key={shape}
                  onClick={() => {
                    onAddElement({ kind: 'shape', shape });
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 flex items-center gap-2.5 group/item transition-colors"
                >
                  <Icon size={15} className="text-parchment/60 group-hover/item:text-accent transition-colors" />
                  <div>
                    <div className="text-xs font-medium text-parchment group-hover/item:text-accent transition-colors">
                      {label}
                    </div>
                    <div className="text-[10px] text-parchment/40">{desc}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 3. Customizable Line Widget (Dividers, Dashed, Arrowheads) */}
        <div className="relative group">
          <button
            onClick={() => setActiveMenu(activeMenu === 'lines' ? null : 'lines')}
            title="Line Tool (Solid, Dashed, Dotted, Arrowheads)"
            className={`flex flex-col items-center justify-center h-12 w-full rounded-xl transition-all border ${
              activeMenu === 'lines'
                ? 'bg-accent text-white border-accent shadow-sm'
                : 'text-parchment/75 hover:text-parchment hover:bg-white/10 border-transparent hover:border-white/10'
            }`}
          >
            <MinusIcon size={18} strokeWidth={2} />
            {!collapsed && (
              <span className="text-[9px] mt-1 font-medium tracking-tight leading-none">Line</span>
            )}
          </button>

          {/* Lines Flyout Menu */}
          {activeMenu === 'lines' && (
            <div className="absolute left-full top-0 ml-2 w-52 bg-onyx border border-white/15 rounded-xl shadow-artboard p-2 text-parchment z-50 animate-in fade-in slide-in-from-left-2 duration-150">
              <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-parchment/50 border-b border-white/10 mb-1 flex items-center justify-between">
                <span>Line Dividers</span>
                <span className="text-[9px] text-accent">Canva/Figma</span>
              </div>

              {[
                {
                  label: 'Solid Rule',
                  desc: 'Clean continuous line',
                  options: { style: 'solid' as const, startEndpoint: 'none' as const, endEndpoint: 'none' as const },
                },
                {
                  label: 'Broken / Dashed',
                  desc: 'Dashed editorial divider',
                  options: { style: 'dashed' as const, startEndpoint: 'none' as const, endEndpoint: 'none' as const },
                },
                {
                  label: 'Dotted Line',
                  desc: 'Subtle dotted spacer',
                  options: { style: 'dotted' as const, startEndpoint: 'none' as const, endEndpoint: 'none' as const },
                },
                {
                  label: 'Arrow Line →',
                  desc: 'Directional line with arrowhead',
                  options: { style: 'solid' as const, startEndpoint: 'none' as const, endEndpoint: 'arrow' as const },
                },
                {
                  label: 'Point to Point —●',
                  desc: 'Terminal circle endpoint',
                  options: { style: 'solid' as const, startEndpoint: 'none' as const, endEndpoint: 'circle' as const },
                },
              ].map(({ label, desc, options }) => (
                <button
                  key={label}
                  onClick={() => {
                    onAddElement({ kind: 'line', lineOptions: options });
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 flex flex-col group/item transition-colors"
                >
                  <span className="text-xs font-medium text-parchment group-hover/item:text-accent transition-colors">
                    {label}
                  </span>
                  <span className="text-[10px] text-parchment/40">{desc}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 4. Photograph / Image Element */}
        <button
          onClick={() => onAddElement({ kind: 'image' })}
          title="Image or Graphic photograph"
          className="flex flex-col items-center justify-center h-12 w-full rounded-xl text-parchment/75 hover:text-parchment hover:bg-white/10 transition-all border border-transparent hover:border-white/10"
        >
          <ImageIcon size={18} strokeWidth={1.75} />
          {!collapsed && (
            <span className="text-[9px] mt-1 font-medium tracking-tight leading-none">Image</span>
          )}
        </button>

        {/* 5. CTA Button Widget */}
        <button
          onClick={() => onAddElement({ kind: 'button' })}
          title="Interactive CTA Button"
          className="flex flex-col items-center justify-center h-12 w-full rounded-xl text-parchment/75 hover:text-parchment hover:bg-white/10 transition-all border border-transparent hover:border-white/10"
        >
          <MousePointerClickIcon size={18} strokeWidth={1.75} />
          {!collapsed && (
            <span className="text-[9px] mt-1 font-medium tracking-tight leading-none">Button</span>
          )}
        </button>

        {/* 6. Link Hotspot Widget */}
        <button
          onClick={() => onAddElement({ kind: 'hotspot' })}
          title="Interactive Clickable Link Hotspot"
          className="flex flex-col items-center justify-center h-12 w-full rounded-xl text-parchment/75 hover:text-parchment hover:bg-white/10 transition-all border border-transparent hover:border-white/10"
        >
          <LinkIcon size={18} strokeWidth={1.75} />
          {!collapsed && (
            <span className="text-[9px] mt-1 font-medium tracking-tight leading-none">Hotspot</span>
          )}
        </button>
      </div>
    </aside>
  );
}
