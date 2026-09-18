import type { CanvasElement } from "../../types";

interface DesignCanvasProps {
  elements: CanvasElement[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export function DesignCanvas({
  elements,
  selectedId,
  onSelect,
}: DesignCanvasProps) {
  return (
    <div
      className="flex-1 bg-[#E5E4E2] overflow-auto flex flex-col items-center p-8 relative select-none"
      onClick={() => onSelect(null)}
    >
      <div className="w-[600px] mb-3 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-200">
            Newsletter Canvas
          </span>
          <span className="bg-[#2c2c2c] px-2 py-0.5 rounded text-[10px] text-slate-300">
            600 × 800
          </span>
        </div>
        <span className="text-[11px] text-slate-400">
          {elements.length} elements • click to select & edit
        </span>
      </div>

      <div
        className="w-[600px] h-[800px] bg-[#D9D9D9] shadow-2xl relative overflow-hidden border-[3px] border-[#0062FF] text-slate-900 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {elements.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <h3 className="text-xl font-bold tracking-tight text-slate-800 mb-2">
              LATHALA STUDIO
            </h3>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
              Design freely on this canvas. Add text, shapes, and link zones
              from the left sidebar to start building your campaign dispatch.
            </p>
          </div>
        ) : (
          elements.map((el) => {
            const isSelected = el.id === selectedId;

            return (
              <div
                key={el.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(el.id);
                }}
                style={{
                  position: "absolute",
                  left: `${el.x}px`,
                  top: `${el.y}px`,
                  width: `${el.width}px`,
                  height: `${el.height}px`,
                  backgroundColor: el.fill || "transparent",
                  color: el.color || "inherit",
                  fontSize: el.fontSize ? `${el.fontSize}px` : undefined,
                  fontFamily: el.fontFamily || "Inter",
                  fontWeight: el.fontWeight || "normal",
                }}
                className={`transition-shadow ${
                  isSelected
                    ? "ring-[3px] ring-[#0062FF] ring-offset-1"
                    : "hover:ring-1 hover:ring-slate-300"
                } ${el.type === "circle" ? "rounded-full" : "rounded-none"} ${
                  el.type === "link_zone"
                    ? "border-2 border-dashed border-[#0062FF] bg-[#0062FF]/10 flex items-center justify-center text-[10px] text-[#0062FF] font-mono break-all px-1 text-center"
                    : ""
                }`}
              >
                {el.type === "text" && (
                  <div className="w-full h-full whitespace-pre-wrap select-none p-1">
                    {el.text || "Double click or edit in inspector"}
                  </div>
                )}
                {el.type === "link_zone" && (
                  <span>
                    {el.url ? `🔗 ${el.url}` : "🔗 Set URL in Inspector"}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
