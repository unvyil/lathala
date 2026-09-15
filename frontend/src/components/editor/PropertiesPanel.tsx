// src/components/editor/PropertiesPanel.tsx
import { Trash2 } from "lucide-react";
import type { CanvasElement } from "../../types";
interface PropertiesPanelProps {
  selectedElement?: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  onDelete: () => void;
  googleFonts: string[];
  customFonts: { name: string; url: string }[];
}

export function PropertiesPanel({
  selectedElement,
  onUpdate,
  onDelete,
  googleFonts,
  customFonts,
}: PropertiesPanelProps) {
  return (
    <aside className="w-80 bg-[#2c2c2c] border-l border-[#383838] p-6 shrink-0 overflow-y-auto">
      <div className="font-bold text-slate-200 text-xs tracking-wider uppercase mb-4">
        Design Inspector
      </div>
      {selectedElement ? (
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-[#383838]">
            <span className="uppercase font-bold text-slate-400">
              {selectedElement.type}
            </span>
            <button
              onClick={onDelete}
              className="p-1 text-rose-400 hover:bg-rose-950/40 rounded flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>

          {selectedElement.type === "text" && (
            <>
              <div>
                <label className="block font-semibold text-slate-400 mb-1">
                  Text Content
                </label>
                <textarea
                  value={selectedElement.text || ""}
                  onChange={(e) => onUpdate({ text: e.target.value })}
                  className="w-full p-2 bg-[#222] text-slate-100 border border-[#444] rounded-lg focus:ring-1 focus:ring-[#0d99ff] outline-none"
                  rows={3}
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-400 mb-1">
                  Font Family
                </label>
                <select
                  value={selectedElement.fontFamily || "Inter"}
                  onChange={(e) => onUpdate({ fontFamily: e.target.value })}
                  className="w-full p-2 bg-[#222] text-slate-100 border border-[#444] rounded-lg outline-none"
                >
                  <optgroup label="Google Fonts">
                    {googleFonts.map((font) => (
                      <option key={font} value={font}>
                        {font}
                      </option>
                    ))}
                  </optgroup>
                  {customFonts.length > 0 && (
                    <optgroup label="Custom Uploaded Fonts">
                      {customFonts.map((cf) => (
                        <option key={cf.name} value={cf.name}>
                          {cf.name}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-400 mb-1">
                  Font Size (px)
                </label>
                <input
                  type="number"
                  value={selectedElement.fontSize || 16}
                  onChange={(e) =>
                    onUpdate({ fontSize: Number(e.target.value) })
                  }
                  className="w-full p-2 bg-[#222] text-slate-100 border border-[#444] rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-400 mb-1">
                  Text Color
                </label>
                <input
                  type="color"
                  value={selectedElement.color || "#000000"}
                  onChange={(e) => onUpdate({ color: e.target.value })}
                  className="w-full h-8 p-1 bg-[#222] border border-[#444] rounded-lg cursor-pointer"
                />
              </div>
            </>
          )}

          {(selectedElement.type === "rectangle" ||
            selectedElement.type === "circle") && (
            <div>
              <label className="block font-semibold text-slate-400 mb-1">
                Fill Color
              </label>
              <input
                type="color"
                value={selectedElement.fill || "#6366f1"}
                onChange={(e) => onUpdate({ fill: e.target.value })}
                className="w-full h-8 p-1 bg-[#222] border border-[#444] rounded-lg cursor-pointer"
              />
            </div>
          )}

          {selectedElement.type === "link_zone" && (
            <div>
              <label className="block font-semibold text-slate-400 mb-1">
                Target Click URL
              </label>
              <input
                type="url"
                value={selectedElement.url || ""}
                onChange={(e) => onUpdate({ url: e.target.value })}
                className="w-full p-2 bg-[#222] text-slate-100 border border-[#444] rounded-lg outline-none"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#383838]">
            <div>
              <label className="block font-semibold text-slate-400 mb-1">
                Width (px)
              </label>
              <input
                type="number"
                value={selectedElement.width}
                onChange={(e) => onUpdate({ width: Number(e.target.value) })}
                className="w-full p-1.5 bg-[#222] text-slate-100 border border-[#444] rounded"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-400 mb-1">
                Height (px)
              </label>
              <input
                type="number"
                value={selectedElement.height}
                onChange={(e) => onUpdate({ height: Number(e.target.value) })}
                className="w-full p-1.5 bg-[#222] text-slate-100 border border-[#444] rounded"
              />
            </div>
          </div>
        </div>
      ) : (
        <p className="text-xs text-slate-400">
          Select any element on the canvas to inspect dimensions and properties.
        </p>
      )}
    </aside>
  );
}
