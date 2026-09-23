import React, { useState } from 'react';
import {
  CanvasElement,
  ImportedFont,
  Project,
  TextElement,
  ShapeElement,
  DividerElement,
  CustomFieldColumn,
  ShapeKind,
  TextHierarchyRole,
  LineEndpoint,
} from '../../types/studio';
import { COLOR_SWATCHES } from '../../data/defaultData';
import { ScrubbableNumberInput } from '../common/ScrubbableNumberInput';
import {
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
  Trash2Icon,
  CopyIcon,
  LockIcon,
  UnlockIcon,
  EyeIcon,
  EyeOffIcon,
  PlusIcon,
  PaletteIcon,
  SparklesIcon,
  FrameIcon,
  TypeIcon,
  ShapesIcon,
  MinusIcon,
  SlidersIcon,
  VariableIcon,
  AlignHorizontalJustifyCenterIcon,
  AlignHorizontalJustifyStartIcon,
  AlignHorizontalJustifyEndIcon,
  AlignVerticalJustifyCenterIcon,
  AlignVerticalJustifyStartIcon,
  AlignVerticalJustifyEndIcon,
} from 'lucide-react';

interface InspectorProps {
  element: CanvasElement | null;
  selectedElements: CanvasElement[];
  isFrameSelected: boolean;
  activeProject: Project;
  fonts: ImportedFont[];
  customColumns: CustomFieldColumn[];
  onPatch: (id: string, patch: Partial<CanvasElement>) => void;
  onPatchMultiple: (patches: { id: string; patch: Partial<CanvasElement> }[]) => void;
  onDelete: (id: string) => void;
  onDeleteMultiple: (ids: string[]) => void;
  onDuplicate: (element: CanvasElement) => void;
  onPatchProject: (patch: Partial<Project>) => void;
  onOpenFontModal: () => void;
}

export function Inspector({
  element,
  selectedElements,
  isFrameSelected,
  activeProject,
  fonts,
  customColumns,
  onPatch,
  onPatchMultiple,
  onDelete,
  onDeleteMultiple,
  onDuplicate,
  onPatchProject,
  onOpenFontModal,
}: InspectorProps) {
  const [activeTab, setActiveTab] = useState<'style' | 'tags'>('style');

  // Multi-Selection Inspector with Alignment Tools
  if (selectedElements.length > 1) {
    const handleAlign = (type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
      if (selectedElements.length < 2) return;

      const minX = Math.min(...selectedElements.map((el) => el.x));
      const maxX = Math.max(...selectedElements.map((el) => el.x + el.width));
      const minY = Math.min(...selectedElements.map((el) => el.y));
      const maxY = Math.max(...selectedElements.map((el) => el.y + el.height));
      const midX = (minX + maxX) / 2;
      const midY = (minY + maxY) / 2;

      const patches = selectedElements.map((el) => {
        let newX = el.x;
        let newY = el.y;

        if (type === 'left') newX = minX;
        else if (type === 'right') newX = maxX - el.width;
        else if (type === 'center') newX = Math.round(midX - el.width / 2);
        else if (type === 'top') newY = minY;
        else if (type === 'bottom') newY = maxY - el.height;
        else if (type === 'middle') newY = Math.round(midY - el.height / 2);

        return { id: el.id, patch: { x: newX, y: newY } };
      });

      onPatchMultiple(patches);
    };

    return (
      <div className="flex-1 flex flex-col p-4 text-parchment overflow-y-auto lathala-scroll space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <SlidersIcon size={14} className="text-accent" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-parchment font-mono">
              Multiple Layers ({selectedElements.length})
            </h3>
          </div>
          <button
            onClick={() => onDeleteMultiple(selectedElements.map((el) => el.id))}
            title="Delete all selected layers"
            className="p-1 rounded text-red-400 hover:bg-white/10 transition-colors"
          >
            <Trash2Icon size={14} />
          </button>
        </div>

        {/* Alignment Controls */}
        <div className="space-y-2">
          <label className="block text-[10px] font-mono uppercase tracking-widest text-parchment/50">
            Figma Alignment Tools
          </label>
          <div className="grid grid-cols-6 gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
            <button
              onClick={() => handleAlign('left')}
              title="Align Left"
              className="p-1.5 rounded hover:bg-white/10 text-parchment/70 hover:text-parchment flex justify-center"
            >
              <AlignHorizontalJustifyStartIcon size={14} />
            </button>
            <button
              onClick={() => handleAlign('center')}
              title="Align Horizontal Center"
              className="p-1.5 rounded hover:bg-white/10 text-parchment/70 hover:text-parchment flex justify-center"
            >
              <AlignHorizontalJustifyCenterIcon size={14} />
            </button>
            <button
              onClick={() => handleAlign('right')}
              title="Align Right"
              className="p-1.5 rounded hover:bg-white/10 text-parchment/70 hover:text-parchment flex justify-center"
            >
              <AlignHorizontalJustifyEndIcon size={14} />
            </button>
            <button
              onClick={() => handleAlign('top')}
              title="Align Top"
              className="p-1.5 rounded hover:bg-white/10 text-parchment/70 hover:text-parchment flex justify-center"
            >
              <AlignVerticalJustifyStartIcon size={14} />
            </button>
            <button
              onClick={() => handleAlign('middle')}
              title="Align Vertical Middle"
              className="p-1.5 rounded hover:bg-white/10 text-parchment/70 hover:text-parchment flex justify-center"
            >
              <AlignVerticalJustifyCenterIcon size={14} />
            </button>
            <button
              onClick={() => handleAlign('bottom')}
              title="Align Bottom"
              className="p-1.5 rounded hover:bg-white/10 text-parchment/70 hover:text-parchment flex justify-center"
            >
              <AlignVerticalJustifyEndIcon size={14} />
            </button>
          </div>
        </div>

        {/* Bulk Selected Layers List */}
        <div className="space-y-1 pt-2">
          <label className="block text-[10px] font-mono uppercase tracking-widest text-parchment/50">
            Selected Layers
          </label>
          <div className="space-y-1">
            {selectedElements.map((el) => (
              <div
                key={el.id}
                className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs text-parchment flex items-center justify-between"
              >
                <span className="truncate">{el.name}</span>
                <span className="text-[10px] font-mono text-parchment/40">
                  {el.width}×{el.height}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Canvas Frame Inspector (when frame selected or nothing selected)
  if (!element || isFrameSelected) {
    const framePresets = [
      { name: 'Standard Email', width: 600, height: 880 },
      { name: 'Wide Digest', width: 640, height: 960 },
      { name: 'Mobile Preview', width: 375, height: 667 },
      { name: 'Compact Card', width: 480, height: 720 },
    ];

    return (
      <div className="flex-1 flex flex-col p-4 text-parchment overflow-y-auto lathala-scroll space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-white/10">
          <FrameIcon size={14} className="text-accent" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-parchment font-mono">
            Canvas Frame Properties
          </h3>
        </div>

        {/* Figma Scrubbable Canvas Dimensions */}
        <div className="space-y-2">
          <label className="block text-[10px] font-mono uppercase tracking-widest text-parchment/50">
            Dimensions (Figma Scrubbing)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <ScrubbableNumberInput
              label="W"
              value={activeProject.artboardWidth || 600}
              onChange={(w) => onPatchProject({ artboardWidth: Math.max(320, w) })}
              min={320}
              max={2400}
              suffix="px"
              title="Canvas Width (drag to scrub)"
            />
            <ScrubbableNumberInput
              label="H"
              value={activeProject.artboardHeight || 880}
              onChange={(h) => onPatchProject({ artboardHeight: Math.max(400, h) })}
              min={400}
              max={5000}
              suffix="px"
              title="Canvas Height (drag to scrub)"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <ScrubbableNumberInput
              label="R"
              value={activeProject.artboardBorderRadius || 0}
              onChange={(r) => onPatchProject({ artboardBorderRadius: Math.max(0, r) })}
              min={0}
              max={48}
              suffix="px"
              title="Frame Corner Radius"
            />
          </div>
        </div>

        {/* Quick Frame Presets */}
        <div className="space-y-1.5 pt-1">
          <label className="block text-[10px] font-mono uppercase tracking-widest text-parchment/50">
            Frame Presets
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {framePresets.map((preset) => (
              <button
                key={preset.name}
                onClick={() =>
                  onPatchProject({
                    artboardWidth: preset.width,
                    artboardHeight: preset.height,
                  })
                }
                className={`p-2 rounded-lg text-left text-xs border transition-colors ${
                  activeProject.artboardWidth === preset.width &&
                  activeProject.artboardHeight === preset.height
                    ? 'bg-accent/20 border-accent text-parchment font-semibold'
                    : 'bg-white/5 border-white/5 text-parchment/70 hover:bg-white/10 hover:text-parchment'
                }`}
              >
                <div className="font-medium truncate">{preset.name}</div>
                <div className="text-[10px] font-mono text-parchment/40">
                  {preset.width} × {preset.height} px
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Canvas Background Color */}
        <div className="space-y-2 pt-2 border-t border-white/10">
          <label className="block text-[10px] font-mono uppercase tracking-widest text-parchment/50">
            Frame Background
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={activeProject.artboardBackground || '#F1EEE9'}
              onChange={(e) => onPatchProject({ artboardBackground: e.target.value })}
              className="h-8 w-10 rounded-lg bg-transparent border border-white/20 cursor-pointer shrink-0"
            />
            <input
              type="text"
              value={activeProject.artboardBackground || '#F1EEE9'}
              onChange={(e) => onPatchProject({ artboardBackground: e.target.value })}
              className="flex-1 h-8 rounded-lg bg-onyx/70 border border-white/10 px-2.5 text-xs font-mono text-parchment focus:border-accent focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {COLOR_SWATCHES.map((swatch) => (
              <button
                key={swatch}
                onClick={() => onPatchProject({ artboardBackground: swatch })}
                className={`h-6 w-6 rounded-md border transition-transform hover:scale-110 ${
                  activeProject.artboardBackground === swatch
                    ? 'border-accent ring-2 ring-accent/50'
                    : 'border-white/15'
                }`}
                style={{ backgroundColor: swatch }}
              />
            ))}
          </div>
        </div>

        {/* Tip */}
        <div className="pt-4 border-t border-white/10">
          <div className="rounded-xl bg-white/5 p-3 text-[11px] text-parchment/70 leading-relaxed border border-white/5">
            <span className="font-semibold text-parchment block mb-1">Frame Sizing Tip</span>
            You can drag the right and bottom handles on the canvas frame to resize smoothly at any time!
          </div>
        </div>
      </div>
    );
  }

  const patch = (p: Partial<CanvasElement>) => onPatch(element.id, p);

  // Standard merge tags
  const baseMergeTags = [
    { tag: '{{name}}', desc: 'Subscriber Name' },
    { tag: '{{role}}', desc: 'Role / Position' },
    { tag: '{{email}}', desc: 'Email Address' },
    { tag: '{{department}}', desc: 'Department Name' },
    { tag: '{{date}}', desc: "Today's Date" },
  ];

  return (
    <div className="flex-1 flex flex-col p-4 text-parchment overflow-y-auto lathala-scroll">
      {/* Top Bar for Selected Element */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <input
          type="text"
          value={element.name}
          onChange={(e) => patch({ name: e.target.value })}
          className="bg-transparent text-xs font-semibold text-parchment focus:outline-none focus:border-b focus:border-accent max-w-[140px] truncate"
        />

        <div className="flex items-center gap-1">
          <button
            onClick={() => onDuplicate(element)}
            title="Duplicate Layer"
            className="p-1 rounded text-parchment/60 hover:text-parchment hover:bg-white/10 transition-colors"
          >
            <CopyIcon size={13} />
          </button>
          <button
            onClick={() => patch({ visible: !element.visible })}
            title={element.visible ? 'Hide' : 'Show'}
            className="p-1 rounded text-parchment/60 hover:text-parchment hover:bg-white/10 transition-colors"
          >
            {element.visible ? <EyeIcon size={13} /> : <EyeOffIcon size={13} />}
          </button>
          <button
            onClick={() => patch({ locked: !element.locked })}
            title={element.locked ? 'Unlock' : 'Lock'}
            className="p-1 rounded text-parchment/60 hover:text-parchment hover:bg-white/10 transition-colors"
          >
            {element.locked ? <LockIcon size={13} /> : <UnlockIcon size={13} />}
          </button>
          <button
            onClick={() => onDelete(element.id)}
            title="Delete Layer"
            className="p-1 rounded text-parchment/60 hover:text-red-400 hover:bg-white/10 transition-colors"
          >
            <Trash2Icon size={13} />
          </button>
        </div>
      </div>

      {/* Tabs if Text */}
      {element.kind === 'text' && (
        <div className="flex border-b border-white/10 my-3">
          <button
            onClick={() => setActiveTab('style')}
            className={`pb-2 text-xs font-medium border-b-2 flex items-center gap-1.5 transition-colors mr-3 ${
              activeTab === 'style'
                ? 'border-accent text-white font-bold'
                : 'border-transparent text-parchment/50 hover:text-parchment'
            }`}
          >
            <PaletteIcon size={12} />
            <span>Typography & Style</span>
          </button>
          <button
            onClick={() => setActiveTab('tags')}
            className={`pb-2 text-xs font-medium border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'tags'
                ? 'border-accent text-white font-bold'
                : 'border-transparent text-parchment/50 hover:text-parchment'
            }`}
          >
            <SparklesIcon size={12} className="text-accent" />
            <span>Personalization Tags</span>
          </button>
        </div>
      )}

      {/* Transform / Geometry Section (Figma Scrubbing X, Y, W, H) */}
      <div className="my-3 space-y-2">
        <label className="block text-[10px] font-mono uppercase tracking-widest text-parchment/50">
          Transform
        </label>
        <div className="grid grid-cols-2 gap-2">
          <ScrubbableNumberInput
            label="X"
            value={Math.round(element.x)}
            onChange={(x) => patch({ x })}
            title="X Position"
          />
          <ScrubbableNumberInput
            label="Y"
            value={Math.round(element.y)}
            onChange={(y) => patch({ y })}
            title="Y Position"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <ScrubbableNumberInput
            label="W"
            value={Math.round(element.width)}
            onChange={(width) => patch({ width: Math.max(12, width) })}
            min={12}
            title="Width (px)"
          />
          <ScrubbableNumberInput
            label="H"
            value={Math.round(element.height)}
            onChange={(height) => patch({ height: Math.max(12, height) })}
            min={12}
            title="Height (px)"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <ScrubbableNumberInput
            label="O"
            value={Math.round((element.opacity !== undefined ? element.opacity : 1) * 100)}
            onChange={(op) => patch({ opacity: Math.max(0, Math.min(100, op)) / 100 })}
            min={0}
            max={100}
            step={5}
            suffix="%"
            title="Opacity (%)"
          />
          <ScrubbableNumberInput
            label="∠"
            value={element.rotation || 0}
            onChange={(rotation) => patch({ rotation })}
            min={-360}
            max={360}
            suffix="°"
            title="Rotation Angle"
          />
        </div>
      </div>

      {/* TEXT SPECIFIC PROPERTIES */}
      {element.kind === 'text' && activeTab === 'style' && (
        <div className="space-y-4 pt-2 border-t border-white/10">
          {/* Hierarchy Role (Google Docs + Figma naming) */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-parchment/50 mb-1.5">
              Hierarchy Role
            </label>
            <div className="grid grid-cols-3 gap-1 bg-white/5 p-1 rounded-xl border border-white/5 text-[11px]">
              {(['title', 'heading', 'subheading', 'body', 'caption'] as TextHierarchyRole[]).map(
                (role) => (
                  <button
                    key={role}
                    onClick={() => {
                      let font = element.fontFamily;
                      let size = element.fontSize;
                      let weight = element.fontWeight;
                      if (role === 'title') {
                        font = 'Instrument Serif';
                        size = 38;
                        weight = 400;
                      } else if (role === 'heading') {
                        font = 'Instrument Serif';
                        size = 26;
                        weight = 400;
                      } else if (role === 'subheading') {
                        font = 'Instrument Sans';
                        size = 17;
                        weight = 500;
                      } else if (role === 'body') {
                        font = 'Instrument Sans';
                        size = 14;
                        weight = 400;
                      } else if (role === 'caption') {
                        font = 'Instrument Sans';
                        size = 11;
                        weight = 500;
                      }
                      patch({
                        textRole: role,
                        fontFamily: font,
                        fontSize: size,
                        fontWeight: weight,
                      });
                    }}
                    className={`py-1 rounded capitalize font-medium transition-colors ${
                      element.textRole === role
                        ? 'bg-accent text-white font-semibold'
                        : 'text-parchment/60 hover:text-parchment'
                    }`}
                  >
                    {role}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* Editable Text Area */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-parchment/50 mb-1.5">
              Content (Supports Merge Tags)
            </label>
            <textarea
              value={element.text}
              onChange={(e) => patch({ text: e.target.value })}
              rows={4}
              className="w-full bg-onyx/70 border border-white/10 rounded-xl p-2.5 text-xs text-parchment focus:border-accent focus:outline-none resize-none leading-relaxed font-sans"
            />
          </div>

          {/* Font Family */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-mono uppercase tracking-widest text-parchment/50">
                Font Family
              </label>
              <button
                onClick={onOpenFontModal}
                className="text-[10px] text-accent hover:underline flex items-center gap-0.5"
              >
                <PlusIcon size={11} />
                <span>Import Font</span>
              </button>
            </div>
            <select
              value={element.fontFamily}
              onChange={(e) => patch({ fontFamily: e.target.value })}
              className="w-full h-8 rounded-lg bg-onyx/70 border border-white/10 px-2.5 text-xs text-parchment focus:border-accent focus:outline-none"
            >
              <option value="Instrument Serif">Instrument Serif (Editorial)</option>
              <option value="Instrument Sans">Instrument Sans (Clean Modern)</option>
              <option value="Newsreader">Newsreader (Literary)</option>
              <option value="JetBrains Mono">JetBrains Mono (Code/Technical)</option>
              {fonts.map((f) => (
                <option key={f.family} value={f.family}>
                  {f.family}
                </option>
              ))}
            </select>
          </div>

          {/* Typography Scrubbable inputs */}
          <div className="grid grid-cols-2 gap-2">
            <ScrubbableNumberInput
              label="Size"
              value={element.fontSize}
              onChange={(fontSize) => patch({ fontSize })}
              min={8}
              max={144}
              suffix="px"
            />
            <ScrubbableNumberInput
              label="Weight"
              value={element.fontWeight}
              onChange={(fontWeight) => patch({ fontWeight })}
              min={100}
              max={900}
              step={100}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <ScrubbableNumberInput
              label="Line"
              value={Math.round((element.lineHeight || 1.4) * 10) / 10}
              onChange={(lh) => patch({ lineHeight: Math.max(0.8, lh) })}
              min={0.8}
              max={3.0}
              step={0.1}
            />
            <ScrubbableNumberInput
              label="Space"
              value={element.letterSpacing || 0}
              onChange={(letterSpacing) => patch({ letterSpacing })}
              min={-5}
              max={20}
              step={0.5}
              suffix="px"
            />
          </div>

          {/* Alignment */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-parchment/50 mb-1.5">
              Alignment
            </label>
            <div className="grid grid-cols-3 gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
              {(['left', 'center', 'right'] as const).map((align) => (
                <button
                  key={align}
                  onClick={() => patch({ align })}
                  className={`py-1 rounded flex justify-center transition-colors ${
                    element.align === align
                      ? 'bg-accent text-white'
                      : 'text-parchment/60 hover:text-parchment'
                  }`}
                >
                  {align === 'left' && <AlignLeftIcon size={14} />}
                  {align === 'center' && <AlignCenterIcon size={14} />}
                  {align === 'right' && <AlignRightIcon size={14} />}
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-parchment/50 mb-1.5">
                Text Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={element.color}
                  onChange={(e) => patch({ color: e.target.value })}
                  className="h-8 w-10 rounded-lg bg-transparent border border-white/20 cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  value={element.color}
                  onChange={(e) => patch({ color: e.target.value })}
                  className="flex-1 h-8 rounded-lg bg-onyx/70 border border-white/10 px-2.5 text-xs font-mono text-parchment focus:border-accent focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-parchment/50 mb-1.5">
                Background Fill (Optional)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={element.backgroundColor || '#070D0D'}
                  onChange={(e) => patch({ backgroundColor: e.target.value })}
                  className="h-8 w-10 rounded-lg bg-transparent border border-white/20 cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  placeholder="transparent"
                  value={element.backgroundColor || ''}
                  onChange={(e) => patch({ backgroundColor: e.target.value })}
                  className="flex-1 h-8 rounded-lg bg-onyx/70 border border-white/10 px-2.5 text-xs font-mono text-parchment focus:border-accent focus:outline-none"
                />
                {element.backgroundColor && (
                  <button
                    onClick={() => patch({ backgroundColor: undefined })}
                    className="px-2 py-1 text-[10px] text-parchment/60 hover:text-parchment"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MERGE TAGS TAB FOR TEXT */}
      {element.kind === 'text' && activeTab === 'tags' && (
        <div className="space-y-4 pt-2 border-t border-white/10">
          <p className="text-[11px] text-parchment/70 leading-relaxed">
            Click any tag to insert it into your copy. It dynamically resolves with each subscriber's data.
          </p>

          <div className="space-y-1.5">
            {baseMergeTags.map(({ tag, desc }) => (
              <button
                key={tag}
                onClick={() => patch({ text: `${element.text} ${tag}` })}
                className="w-full text-left p-2 rounded-xl bg-white/5 hover:bg-accent/20 border border-white/5 hover:border-accent/40 flex items-center justify-between group transition-colors"
              >
                <div>
                  <span className="font-mono text-xs text-accent font-semibold">{tag}</span>
                  <p className="text-[10px] text-parchment/50">{desc}</p>
                </div>
                <PlusIcon size={12} className="text-parchment/40 group-hover:text-parchment" />
              </button>
            ))}

            {/* Custom CRM Spreadsheet Columns */}
            {customColumns.map((col) => (
              <button
                key={col.id}
                onClick={() => patch({ text: `${element.text} {{${col.key}}}` })}
                className="w-full text-left p-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/40 flex items-center justify-between group transition-colors"
              >
                <div>
                  <span className="font-mono text-xs text-emerald-400 font-semibold">
                    {`{{${col.key}}}`}
                  </span>
                  <p className="text-[10px] text-parchment/50">Custom CRM: {col.label}</p>
                </div>
                <PlusIcon size={12} className="text-emerald-400" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* SHAPE SPECIFIC PROPERTIES */}
      {element.kind === 'shape' && (
        <div className="space-y-4 pt-2 border-t border-white/10">
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-parchment/50 mb-1.5">
              Vector Shape Geometry
            </label>
            <div className="grid grid-cols-3 gap-1 bg-white/5 p-1 rounded-xl border border-white/5 text-[11px]">
              {(['rect', 'ellipse', 'pill', 'triangle', 'star'] as ShapeKind[]).map((shape) => (
                <button
                  key={shape}
                  onClick={() => patch({ shape })}
                  className={`py-1 rounded capitalize font-medium transition-colors ${
                    element.shape === shape
                      ? 'bg-accent text-white font-semibold'
                      : 'text-parchment/60 hover:text-parchment'
                  }`}
                >
                  {shape}
                </button>
              ))}
            </div>
          </div>

          {/* Corner Radius (if rect) */}
          {element.shape === 'rect' && (
            <ScrubbableNumberInput
              label="Radius"
              value={element.radius || 0}
              onChange={(radius) => patch({ radius })}
              min={0}
              max={100}
              suffix="px"
              title="Corner Radius"
            />
          )}

          {/* Fill Color */}
          <div className="space-y-2">
            <label className="block text-[10px] font-mono uppercase tracking-widest text-parchment/50">
              Fill Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={element.fill}
                onChange={(e) => patch({ fill: e.target.value })}
                className="h-8 w-10 rounded-lg bg-transparent border border-white/20 cursor-pointer shrink-0"
              />
              <input
                type="text"
                value={element.fill}
                onChange={(e) => patch({ fill: e.target.value })}
                className="flex-1 h-8 rounded-lg bg-onyx/70 border border-white/10 px-2.5 text-xs font-mono text-parchment focus:border-accent focus:outline-none"
              />
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {COLOR_SWATCHES.map((swatch) => (
                <button
                  key={swatch}
                  onClick={() => patch({ fill: swatch })}
                  className="h-5 w-5 rounded-md border border-white/10 hover:scale-110 transition-transform"
                  style={{ backgroundColor: swatch }}
                />
              ))}
            </div>
          </div>

          {/* Stroke / Border */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <label className="block text-[10px] font-mono uppercase tracking-widest text-parchment/50">
              Stroke & Border
            </label>
            <div className="grid grid-cols-2 gap-2">
              <ScrubbableNumberInput
                label="Stroke"
                value={element.borderWidth || 0}
                onChange={(borderWidth) => patch({ borderWidth })}
                min={0}
                max={40}
                suffix="px"
              />
              <input
                type="color"
                value={element.borderColor || '#DBD6D0'}
                onChange={(e) => patch({ borderColor: e.target.value })}
                className="h-8 w-full rounded-lg bg-transparent border border-white/20 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* LINE WIDGET SPECIFIC PROPERTIES */}
      {(element.kind === 'line' || element.kind === 'divider') && (
        <div className="space-y-4 pt-2 border-t border-white/10">
          {/* Stroke Thickness */}
          <ScrubbableNumberInput
            label="Stroke"
            value={(element as DividerElement).thickness || 2}
            onChange={(thickness) => patch({ thickness: Math.max(1, thickness) })}
            min={1}
            max={32}
            suffix="px"
            title="Line Stroke Width"
          />

          {/* Line Style */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-parchment/50 mb-1.5">
              Stroke Style
            </label>
            <div className="grid grid-cols-3 gap-1 bg-white/5 p-1 rounded-xl border border-white/5 text-[11px]">
              {(['solid', 'dashed', 'dotted'] as const).map((style) => (
                <button
                  key={style}
                  onClick={() => patch({ style })}
                  className={`py-1 rounded capitalize font-medium transition-colors ${
                    (element as DividerElement).style === style
                      ? 'bg-accent text-white font-semibold'
                      : 'text-parchment/60 hover:text-parchment'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Endpoints / Arrowheads */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-parchment/50 mb-1">
                Start Endpoint
              </label>
              <select
                value={(element as DividerElement).startEndpoint || 'none'}
                onChange={(e) => patch({ startEndpoint: e.target.value as LineEndpoint })}
                className="w-full h-8 rounded-lg bg-onyx/70 border border-white/10 px-2 text-xs text-parchment focus:border-accent focus:outline-none"
              >
                <option value="none">None (—)</option>
                <option value="circle">Circle (●—)</option>
                <option value="square">Square (■—)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-parchment/50 mb-1">
                End Endpoint
              </label>
              <select
                value={(element as DividerElement).endEndpoint || 'none'}
                onChange={(e) => patch({ endEndpoint: e.target.value as LineEndpoint })}
                className="w-full h-8 rounded-lg bg-onyx/70 border border-white/10 px-2 text-xs text-parchment focus:border-accent focus:outline-none"
              >
                <option value="none">None (—)</option>
                <option value="arrow">Arrow (—&gt;)</option>
                <option value="circle">Circle (—●)</option>
                <option value="square">Square (—■)</option>
              </select>
            </div>
          </div>

          {/* Line Color */}
          <div className="space-y-2">
            <label className="block text-[10px] font-mono uppercase tracking-widest text-parchment/50">
              Stroke Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={(element as DividerElement).color}
                onChange={(e) => patch({ color: e.target.value })}
                className="h-8 w-10 rounded-lg bg-transparent border border-white/20 cursor-pointer shrink-0"
              />
              <input
                type="text"
                value={(element as DividerElement).color}
                onChange={(e) => patch({ color: e.target.value })}
                className="flex-1 h-8 rounded-lg bg-onyx/70 border border-white/10 px-2.5 text-xs font-mono text-parchment focus:border-accent focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* IMAGE PROPERTIES */}
      {element.kind === 'image' && (
        <div className="space-y-4 pt-2 border-t border-white/10">
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-parchment/50 mb-1.5">
              Image Source URL
            </label>
            <input
              type="url"
              value={element.src}
              onChange={(e) => patch({ src: e.target.value })}
              className="w-full h-8 rounded-lg bg-onyx/70 border border-white/10 px-2.5 text-xs text-parchment focus:border-accent focus:outline-none"
            />
          </div>

          <ScrubbableNumberInput
            label="Radius"
            value={element.radius || 0}
            onChange={(radius) => patch({ radius })}
            min={0}
            max={64}
            suffix="px"
          />

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-parchment/50 mb-1.5">
              Fitting Mode
            </label>
            <div className="grid grid-cols-3 gap-1 bg-white/5 p-1 rounded-xl border border-white/5 text-[11px]">
              {(['cover', 'contain', 'fill'] as const).map((fit) => (
                <button
                  key={fit}
                  onClick={() => patch({ objectFit: fit })}
                  className={`py-1 rounded capitalize font-medium transition-colors ${
                    element.objectFit === fit
                      ? 'bg-accent text-white font-semibold'
                      : 'text-parchment/60 hover:text-parchment'
                  }`}
                >
                  {fit}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* HOTSPOT PROPERTIES */}
      {element.kind === 'hotspot' && (
        <div className="space-y-4 pt-2 border-t border-white/10">
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-parchment/50 mb-1.5">
              Target Link URL
            </label>
            <input
              type="url"
              value={element.href}
              onChange={(e) => patch({ href: e.target.value })}
              placeholder="https://yourbrand.com/special-issue"
              className="w-full h-8 rounded-lg bg-onyx/70 border border-white/10 px-2.5 text-xs text-parchment focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-parchment/50 mb-1.5">
              Link Label (for preview)
            </label>
            <input
              type="text"
              value={element.label}
              onChange={(e) => patch({ label: e.target.value })}
              className="w-full h-8 rounded-lg bg-onyx/70 border border-white/10 px-2.5 text-xs text-parchment focus:border-accent focus:outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
