// src/components/editor/CanvasSidebar.tsx
import React from "react";
import {
  Type,
  Square,
  Circle as CircleIcon,
  Link2,
  Maximize2,
  Upload,
  Compass,
} from "lucide-react";
import type { ElementType } from "../../types";

interface CanvasSidebarProps {
  onAddElement: (type: ElementType) => void;
  onCustomFontUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  customFontsCount: number;
  onRasterizePreview: () => void;
}

export function CanvasSidebar({
  onAddElement,
  onCustomFontUpload,
  customFontsCount,
  onRasterizePreview,
}: CanvasSidebarProps) {
  return (
    <aside className="w-64 bg-[#2c2c2c] border-r border-[#383838] p-5 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        <div>
          <div className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-3 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-[#0d99ff]" /> Add Components
          </div>
          <div className="space-y-1.5">
            <button
              onClick={() => onAddElement("text")}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-[#383838] text-xs font-medium transition-all text-left"
            >
              <Type className="w-4 h-4 text-slate-400" /> Text Box
            </button>
            <button
              onClick={() => onAddElement("rectangle")}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-[#383838] text-xs font-medium transition-all text-left"
            >
              <Square className="w-4 h-4 text-slate-400" /> Rectangle Shape
            </button>
            <button
              onClick={() => onAddElement("circle")}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-[#383838] text-xs font-medium transition-all text-left"
            >
              <CircleIcon className="w-4 h-4 text-slate-400" /> Circle Shape
            </button>
            <button
              onClick={() => onAddElement("link_zone")}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-[#383838] text-xs font-medium transition-all text-left"
            >
              <Link2 className="w-4 h-4 text-[#0d99ff]" /> Link Zone
            </button>
          </div>
        </div>

        {/* CUSTOM FONT IMPORTER */}
        <div className="pt-4 border-t border-[#383838]">
          <div className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-2">
            Custom Fonts
          </div>
          <label className="flex items-center justify-center gap-2 w-full p-2.5 border-2 border-dashed border-[#444] hover:border-[#0d99ff] rounded-xl bg-[#222] cursor-pointer text-xs font-semibold text-slate-300 transition-all">
            <Upload className="w-3.5 h-3.5 text-[#0d99ff]" /> Upload Font
            (.ttf/.woff)
            <input
              type="file"
              accept=".ttf,.woff,.woff2"
              onChange={onCustomFontUpload}
              className="hidden"
            />
          </label>
          {customFontsCount > 0 && (
            <div className="mt-2 text-[11px] text-emerald-400 font-medium">
              ✓ {customFontsCount} custom font(s) loaded
            </div>
          )}
        </div>
      </div>

      <button
        onClick={onRasterizePreview}
        className="w-full bg-[#0d99ff] hover:bg-[#0b84db] text-white font-semibold py-3 px-4 rounded-xl shadow-sm flex items-center justify-center gap-2 text-xs transition-all"
      >
        <Maximize2 className="w-4 h-4" /> Rasterize & Preview
      </button>
    </aside>
  );
}
