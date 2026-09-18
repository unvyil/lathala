import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { UserButton } from "@clerk/clerk-react";
import lathalaLogo from "./assets/lathala-logo.svg";
import {
  Type,
  Square,
  Circle,
  Link as LinkIcon,
  Search,
  Send,
  Trash2,
  CheckCircle2,
  XCircle,
  SlidersHorizontal,
  Triangle,
  Minus,
  Star,
  Shapes,
  Plus
} from "lucide-react";
import type { Subscriber, CanvasElement, ElementType } from "./types";

const GOOGLE_FONTS = [
  "Inter",
  "Playfair Display",
  "Montserrat",
  "Fira Code",
  "Geist",
];

export default function App() {
  const [activeTab, setActiveTab] = useState<"project" | "database">("project");

  // Global Keydown (Delete/Backspace)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (
          document.activeElement?.tagName === "INPUT" ||
          document.activeElement?.tagName === "TEXTAREA" ||
          document.activeElement?.tagName === "SELECT"
        ) {
          return;
        }
        deleteSelected();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Custom Fonts State
  const [customFonts, setCustomFonts] = useState<{family: string, url: string}[]>([]);
  const [fontInput, setFontInput] = useState("");
  const [fontUrlInput, setFontUrlInput] = useState("");

  const handleAddFont = () => {
    if (!fontInput || !fontUrlInput) return;
    const newFont = { family: fontInput, url: fontUrlInput };
    setCustomFonts(prev => [...prev, newFont]);
    
    // Inject font
    if (fontUrlInput.includes("fonts.googleapis.com")) {
      const link = document.createElement("link");
      link.href = fontUrlInput;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    } else {
      const style = document.createElement("style");
      style.innerHTML = `
        @font-face {
          font-family: '${fontInput}';
          src: url('${fontUrlInput}');
        }
      `;
      document.head.appendChild(style);
    }
    setFontInput("");
    setFontUrlInput("");
  };

  const allFonts = [...customFonts.map(f => f.family), ...GOOGLE_FONTS];

  // Canvas State
  const [isCanvasSelected, setIsCanvasSelected] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 800 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const [elements, setElements] = useState<CanvasElement[]>([
    {
      id: "elem-1",
      type: "text",
      x: 140,
      y: 120,
      width: 320,
      height: 60,
      top: 120,
      text: "LATHALA DISPATCH",
      fontSize: 32,
      fontWeight: "bold",
      fontFamily: "Playfair Display",
      color: "#0A0A0A",
    },
    {
      id: "elem-2",
      type: "rectangle",
      x: 100,
      y: 220,
      width: 400,
      height: 240,
      top: 220,
      fill: "#D9D9D9",
    },
  ]);
  const [selectedId, setSelectedId] = useState<string | null>("elem-1");

  const [isShapesDrawerOpen, setIsShapesDrawerOpen] = useState(false);

  // Dragging State
  const [dragState, setDragState] = useState<{id: string, startX: number, startY: number, initialElX: number, initialElY: number} | null>(null);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState) return;
    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;
    setElements(prev => prev.map(el => {
      if (el.id === dragState.id) {
        return { ...el, x: dragState.initialElX + dx, y: dragState.initialElY + dy };
      }
      return el;
    }));
  }, [dragState]);

  const handleMouseUp = useCallback(() => {
    setDragState(null);
  }, []);

  useEffect(() => {
    if (dragState) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragState, handleMouseMove, handleMouseUp]);

  // CRM State
  const [departments, setDepartments] = useState(["Office of the VP", "Publications", "Creative Studio"]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([
    {
      id: "sub-1",
      name: "Juan Dela Cruz",
      email: "juan.delacruz@cvsu.edu.ph",
      role: "Executive Admin",
      department: "Office of the VP",
      type: "Core",
      is_sent: true,
      status: "Sent",
    },
    {
      id: "sub-2",
      name: "Maria Santos",
      email: "maria.santos@up.edu.ph",
      role: "Editor-in-Chief",
      department: "Publications",
      type: "VIP",
      is_sent: false,
      status: "Pending",
    },
    {
      id: "sub-3",
      name: "Jose Rizal",
      email: "j.rizal@ateneo.edu",
      role: "Lead Designer",
      department: "Creative Studio",
      type: "Core",
      is_sent: false,
      status: "Pending",
    },
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [manageDeptsModal, setManageDeptsModal] = useState(false);
  const [newDeptName, setNewDeptName] = useState("");

  const selectedElement = useMemo(
    () => elements.find((e) => e.id === selectedId),
    [elements, selectedId],
  );

  const handleAddElement = (type: string) => {
    let w = 180, h = 120, text: string | undefined = undefined, fill: string = "#1E1E1E";
    if (type === "text") {
      w = 280; h = 50; text = "Headline Block"; fill = "transparent";
    } else if (type === "line") {
      w = 200; h = 4;
    } else if (type === "link_zone") {
      fill = "transparent";
    }

    const newEl: CanvasElement = {
      id: crypto.randomUUID(),
      type: type as ElementType,
      x: canvasSize.width / 2 - w / 2,
      y: canvasSize.height / 2 - h / 2,
      width: w,
      height: h,
      top: 0,
      text,
      fill,
      color: "#0A0A0A",
      fontSize: 20,
      fontFamily: "Inter",
    };
    setElements((prev) => [...prev, newEl]);
    setSelectedId(newEl.id);
    setIsCanvasSelected(false);
    setIsShapesDrawerOpen(false);
  };

  const updateSelected = (updates: Partial<CanvasElement>) => {
    if (!selectedId) return;
    setElements((prev) =>
      prev.map((el) => (el.id === selectedId ? { ...el, ...updates } : el)),
    );
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    setElements((prev) => prev.filter((el) => el.id !== selectedId));
    setSelectedId(null);
  };

  // CRM Functions
  const toggleSent = (id: string) => {
    setSubscribers((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const nextSent = !s.is_sent;
          return {
            ...s,
            is_sent: nextSent,
            status: nextSent ? "Sent" : "Pending",
          };
        }
        return s;
      }),
    );
  };

  const handleSendAll = async () => {
    setIsProcessing(true);
    setTimeout(() => {
      setSubscribers((prev) =>
        prev.map((s) => ({ ...s, is_sent: true, status: "Sent" })),
      );
      setIsProcessing(false);
      alert("Dispatch triggered to all pending subscribers!");
    }, 1200);
  };

  const addRecipient = () => {
    const newSub: Subscriber = {
      id: crypto.randomUUID(),
      name: "New Recipient",
      email: "email@example.com",
      role: "Member",
      department: departments[0] || "",
      type: "Core",
      is_sent: false,
      status: "Pending"
    };
    setSubscribers(prev => [newSub, ...prev]);
  };

  const deleteRecipient = (id: string) => {
    if (confirm("Are you sure you want to delete this recipient?")) {
      setSubscribers(prev => prev.filter(s => s.id !== id));
    }
  };

  const updateSubscriber = (id: string, field: keyof Subscriber, value: string) => {
    if (field === "department" && value === "_manage_") {
      setManageDeptsModal(true);
      return;
    }
    setSubscribers(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  
  const renameDepartment = (oldName: string, newName: string) => {
    if (!newName || oldName === newName || departments.includes(newName)) return;
    setDepartments(prev => prev.map(d => d === oldName ? newName : d));
    setSubscribers(prev => prev.map(s => s.department === oldName ? { ...s, department: newName } : s));
  };

  const addDepartment = () => {
    if (newDeptName && !departments.includes(newDeptName)) {
      setDepartments(prev => [...prev, newDeptName]);
      setNewDeptName("");
    }
  };

  const removeDepartment = (dept: string) => {
    if (confirm(`Delete department '${dept}'? Recipients will lose this department.`)) {
      setDepartments(prev => prev.filter(d => d !== dept));
      setSubscribers(prev => prev.map(s => s.department === dept ? { ...s, department: "" } : s));
    }
  };

  const filteredSubscribers = subscribers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.role.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex h-screen w-screen bg-[#E5E4E2] text-zinc-900 font-sans select-none overflow-hidden">
      {/* 1. LEFT UTILITY RAIL (88px, #0A0A0A) - Isolated to PROJECT tab */}
      {activeTab === "project" && (
        <aside className="w-[88px] bg-[#0A0A0A] flex flex-col items-center py-6 justify-between z-30 shrink-0 shadow-2xl relative">
          {/* Brand Crest */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-[32px] h-[32px] rounded-lg border border-white/20 flex items-center justify-center overflow-hidden">
              <img src={lathalaLogo} alt="Lathala" className="w-full h-full object-cover" />
            </div>
            <div className="w-10 h-[1px] bg-[rgba(255,255,255,0.2)] my-1" />

            {/* Quick Action Tools */}
            <div className="flex flex-col gap-3 relative">
              <button
                onClick={() => handleAddElement("text")}
                className="w-[54px] h-[64px] rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white flex flex-col items-center justify-center gap-1 transition-all border border-zinc-800"
                title="Add Typography"
              >
                <Type size={18} />
                <span className="text-[9px] font-mono tracking-widest uppercase">
                  Text
                </span>
              </button>

              {/* Shapes Drawer Toggle */}
              <button
                onClick={() => setIsShapesDrawerOpen(!isShapesDrawerOpen)}
                className={`w-[54px] h-[64px] rounded-lg ${isShapesDrawerOpen ? 'bg-zinc-800 text-white' : 'bg-zinc-900 text-zinc-300'} hover:bg-zinc-800 hover:text-white flex flex-col items-center justify-center gap-1 transition-all border border-zinc-800`}
                title="Shapes Library"
              >
                <Shapes size={18} />
                <span className="text-[9px] font-mono tracking-widest uppercase">
                  Shapes
                </span>
              </button>

              {isShapesDrawerOpen && (
                <div className="absolute left-[70px] top-[76px] w-[180px] bg-[#303030] border border-white/10 rounded-lg shadow-2xl p-2 grid grid-cols-2 gap-2 z-50">
                  <button onClick={() => handleAddElement("rectangle")} className="flex flex-col items-center justify-center p-3 hover:bg-white/10 rounded text-white gap-2"><Square size={20}/><span className="text-[10px]">Rect</span></button>
                  <button onClick={() => handleAddElement("circle")} className="flex flex-col items-center justify-center p-3 hover:bg-white/10 rounded text-white gap-2"><Circle size={20}/><span className="text-[10px]">Oval</span></button>
                  <button onClick={() => handleAddElement("polygon")} className="flex flex-col items-center justify-center p-3 hover:bg-white/10 rounded text-white gap-2"><Triangle size={20}/><span className="text-[10px]">Triangle</span></button>
                  <button onClick={() => handleAddElement("star")} className="flex flex-col items-center justify-center p-3 hover:bg-white/10 rounded text-white gap-2"><Star size={20}/><span className="text-[10px]">Star</span></button>
                  <button onClick={() => handleAddElement("line")} className="flex flex-col items-center justify-center p-3 hover:bg-white/10 rounded text-white gap-2 col-span-2"><Minus size={20}/><span className="text-[10px]">Line</span></button>
                </div>
              )}

              <button
                onClick={() => handleAddElement("link_zone")}
                className="w-[54px] h-[64px] rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white flex flex-col items-center justify-center gap-1 transition-all border border-zinc-800"
                title="Add Link Hotspot"
              >
                <LinkIcon size={18} />
                <span className="text-[9px] font-mono tracking-widest uppercase">
                  Link
                </span>
              </button>
            </div>
          </div>

          {/* User Profile & Config */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-[1px] bg-[rgba(255,255,255,0.2)] my-1" />
            <UserButton afterSignOutUrl="/" />
          </div>
        </aside>
      )}

      {/* 2. MAIN APPLICATION COLUMN */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* TOP SYSTEM NAV BAR (Height: 80px, #0A0A0A) */}
        <header className="h-[80px] bg-[#0A0A0A] flex items-center justify-between px-8 z-20 shrink-0 border-b border-white/10">
          {/* Tab Capsules */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setActiveTab("project"); setSelectedId(null); setIsCanvasSelected(false); }}
              className={`px-8 py-3 rounded-t-[10px] text-xs tracking-widest uppercase font-bold transition-all ${
                activeTab === "project"
                  ? "bg-[#E5E4E2] text-[#0A0A0A] shadow-md"
                  : "bg-[#E5E4E2]/20 text-zinc-400 hover:text-white hover:bg-[#E5E4E2]/30"
              }`}
            >
              PROJECT
            </button>
            <button
              onClick={() => { setActiveTab("database"); setSelectedId(null); setIsCanvasSelected(false); }}
              className={`px-8 py-3 rounded-t-[10px] text-xs tracking-widest uppercase font-bold transition-all ${
                activeTab === "database"
                  ? "bg-[#E5E4E2] text-[#0A0A0A] shadow-md"
                  : "bg-[#E5E4E2]/20 text-zinc-400 hover:text-white hover:bg-[#E5E4E2]/30"
              }`}
            >
              DATABASE
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              CANVAS LIVE
            </span>
          </div>
        </header>

        {/* 3. WORKSPACE VIEWPORT */}
        {activeTab === "project" ? (
          <div className="flex-1 flex overflow-hidden">
            {/* Canvas Artboard Well */}
            <div
              className="flex-1 overflow-auto flex flex-col items-center justify-start p-12 relative"
              onMouseDown={() => {
                setSelectedId(null);
                setIsCanvasSelected(false);
              }}
            >
              {/* Artboard Dimension Label */}
              {isCanvasSelected && (
                <div className="mb-3 flex items-center justify-between text-xs font-mono text-[#0062FF]" style={{ width: canvasSize.width }}>
                  <span className="font-semibold tracking-wider text-[#0062FF]">
                    NEWSLETTER ARTBOARD
                  </span>
                  <span>{canvasSize.width} × {canvasSize.height}</span>
                </div>
              )}

              {/* Core Canvas Container */}
              <div
                ref={canvasRef}
                className={`bg-[#D9D9D9] relative shadow-2xl overflow-hidden transition-colors ${
                  isCanvasSelected ? "border-[3px] border-[#0062FF]" : ""
                }`}
                style={{ width: canvasSize.width, height: canvasSize.height, marginTop: isCanvasSelected ? 0 : 28 }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setIsCanvasSelected(true);
                  setSelectedId(null);
                }}
              >
                {elements.map((el) => {
                  const isSelected = el.id === selectedId;
                  
                  // Render SVGs for shapes
                  let content = null;
                  if (el.type === "text") {
                    content = <div className="w-full h-full p-2 select-none overflow-hidden">{el.text}</div>;
                  } else if (el.type === "link_zone") {
                    content = <span>{el.url ? `🔗 ${el.url}` : "🔗 Hotspot Link"}</span>;
                  } else if (el.type === "polygon") {
                    content = (
                      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <polygon points="50,0 100,100 0,100" fill={el.fill} />
                      </svg>
                    );
                  } else if (el.type === "star") {
                    content = (
                      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <polygon points="50,5 61,40 98,40 68,62 79,96 50,75 21,96 32,62 2,40 39,40" fill={el.fill} />
                      </svg>
                    );
                  }

                  return (
                    <div
                      key={el.id}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setSelectedId(el.id);
                        setIsCanvasSelected(false);
                        setDragState({
                          id: el.id,
                          startX: e.clientX,
                          startY: e.clientY,
                          initialElX: el.x || 0,
                          initialElY: el.y || 0
                        });
                      }}
                      style={{
                        position: "absolute",
                        left: `${el.x}px`,
                        top: `${el.y}px`,
                        width: `${el.width}px`,
                        height: `${el.height}px`,
                        backgroundColor: (el.type === "polygon" || el.type === "star" || el.type === "line") ? "transparent" : (el.fill || "transparent"),
                        color: el.color || "#0A0A0A",
                        fontSize: el.fontSize ? `${el.fontSize}px` : undefined,
                        fontWeight: el.fontWeight || "normal",
                        fontFamily: el.fontFamily || "Inter",
                      }}
                      className={`cursor-move ${
                        isSelected
                          ? "ring-[3px] ring-[#0062FF] ring-offset-0"
                          : ""
                      } ${el.type === "circle" ? "rounded-full" : "rounded-none"} ${
                        el.type === "link_zone"
                          ? "border-2 border-dashed border-[#0062FF] bg-[#0062FF]/15 flex items-center justify-center text-[10px] text-[#0062FF] font-mono px-2"
                          : ""
                      }`}
                    >
                      {content}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT PROPERTY INSPECTOR DOCK */}
            <aside className="w-[374px] bg-[#303030] text-[#E5E4E2] p-6 flex flex-col gap-6 shadow-2xl rounded-[8px] border border-white/10 m-4 overflow-y-auto shrink-0">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                  {isCanvasSelected ? "Canvas Inspector" : "Element Inspector"}
                </span>
                {selectedElement && (
                  <button
                    onClick={deleteSelected}
                    className="text-rose-400 hover:text-rose-300 transition-colors p-1"
                    title="Delete Element"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              {isCanvasSelected ? (
                <div className="flex flex-col gap-6 text-xs">
                  <div className="flex flex-col gap-2">
                    <span className="text-[11px] font-mono text-zinc-400 uppercase">
                      Canvas Geometry
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="flex items-center bg-[#242424] px-3 py-2 rounded-lg border border-zinc-700">
                        <span className="text-zinc-500 w-5">W</span>
                        <input
                          type="number"
                          value={canvasSize.width}
                          onChange={(e) => setCanvasSize(prev => ({ ...prev, width: Number(e.target.value) }))}
                          className="bg-transparent w-full text-right outline-none text-white font-mono"
                        />
                      </label>
                      <label className="flex items-center bg-[#242424] px-3 py-2 rounded-lg border border-zinc-700">
                        <span className="text-zinc-500 w-5">H</span>
                        <input
                          type="number"
                          value={canvasSize.height}
                          onChange={(e) => setCanvasSize(prev => ({ ...prev, height: Number(e.target.value) }))}
                          className="bg-transparent w-full text-right outline-none text-white font-mono"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              ) : selectedElement ? (
                <div className="flex flex-col gap-6 text-xs">
                  {/* Position Coordinates */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[11px] font-mono text-zinc-400 uppercase">
                      Geometry
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="flex items-center bg-[#242424] px-3 py-2 rounded-lg border border-zinc-700">
                        <span className="text-zinc-500 w-5">X</span>
                        <input
                          type="number"
                          value={selectedElement.x}
                          onChange={(e) =>
                            updateSelected({ x: Number(e.target.value) })
                          }
                          className="bg-transparent w-full text-right outline-none text-white font-mono"
                        />
                      </label>
                      <label className="flex items-center bg-[#242424] px-3 py-2 rounded-lg border border-zinc-700">
                        <span className="text-zinc-500 w-5">Y</span>
                        <input
                          type="number"
                          value={selectedElement.y}
                          onChange={(e) =>
                            updateSelected({ y: Number(e.target.value) })
                          }
                          className="bg-transparent w-full text-right outline-none text-white font-mono"
                        />
                      </label>
                      <label className="flex items-center bg-[#242424] px-3 py-2 rounded-lg border border-zinc-700">
                        <span className="text-zinc-500 w-5">W</span>
                        <input
                          type="number"
                          value={selectedElement.width}
                          onChange={(e) =>
                            updateSelected({ width: Number(e.target.value) })
                          }
                          className="bg-transparent w-full text-right outline-none text-white font-mono"
                        />
                      </label>
                      <label className="flex items-center bg-[#242424] px-3 py-2 rounded-lg border border-zinc-700">
                        <span className="text-zinc-500 w-5">H</span>
                        <input
                          type="number"
                          value={selectedElement.height}
                          onChange={(e) =>
                            updateSelected({ height: Number(e.target.value) })
                          }
                          className="bg-transparent w-full text-right outline-none text-white font-mono"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Text Controls */}
                  {selectedElement.type === "text" && (
                    <div className="flex flex-col gap-3">
                      <span className="text-[11px] font-mono text-zinc-400 uppercase">
                        Typography
                      </span>
                      <textarea
                        value={selectedElement.text || ""}
                        onChange={(e) =>
                          updateSelected({ text: e.target.value })
                        }
                        rows={3}
                        className="w-full bg-[#242424] border border-zinc-700 rounded-lg p-3 text-white outline-none font-sans resize-none"
                      />

                      <div className="grid grid-cols-2 gap-3">
                        <select
                          value={selectedElement.fontFamily || "Inter"}
                          onChange={(e) =>
                            updateSelected({ fontFamily: e.target.value })
                          }
                          className="bg-[#242424] border border-zinc-700 rounded-lg px-2 py-2 text-white outline-none"
                        >
                          {allFonts.map((font) => (
                            <option key={font} value={font}>
                              {font}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          value={selectedElement.fontSize || 16}
                          onChange={(e) =>
                            updateSelected({ fontSize: Number(e.target.value) })
                          }
                          className="bg-[#242424] border border-zinc-700 rounded-lg px-3 py-2 text-white text-right outline-none font-mono"
                        />
                      </div>
                      
                      {/* Custom Font Importer */}
                      <div className="mt-2 p-3 bg-white/5 rounded-lg border border-white/10 flex flex-col gap-2">
                        <span className="text-[10px] uppercase text-zinc-400 font-bold">Import Custom Font</span>
                        <input type="text" placeholder="Font Family (e.g. Roboto)" value={fontInput} onChange={e=>setFontInput(e.target.value)} className="bg-[#1a1a1a] p-1.5 rounded outline-none text-xs" />
                        <input type="text" placeholder="URL (.woff2, Google Fonts)" value={fontUrlInput} onChange={e=>setFontUrlInput(e.target.value)} className="bg-[#1a1a1a] p-1.5 rounded outline-none text-xs" />
                        <button onClick={handleAddFont} className="bg-zinc-700 hover:bg-zinc-600 p-1.5 rounded text-[10px] font-bold uppercase transition-colors">Inject Font</button>
                      </div>
                    </div>
                  )}

                  {/* Color & Fill */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[11px] font-mono text-zinc-400 uppercase">
                      Fill & Style
                    </span>
                    <div className="flex items-center gap-3 bg-[#242424] p-2 rounded-lg border border-zinc-700">
                      <input
                        type="color"
                        value={selectedElement.fill || "#0A0A0A"}
                        onChange={(e) =>
                          updateSelected({ fill: e.target.value })
                        }
                        className="w-8 h-8 rounded border-none cursor-pointer bg-transparent"
                      />
                      <span className="font-mono text-xs uppercase text-zinc-300">
                        {selectedElement.fill || "Transparent"}
                      </span>
                    </div>
                  </div>

                  {/* Link Hotspot Configuration */}
                  {selectedElement.type === "link_zone" && (
                    <div className="flex flex-col gap-2">
                      <span className="text-[11px] font-mono text-zinc-400 uppercase">
                        Target Redirect URL
                      </span>
                      <input
                        type="text"
                        placeholder="https://example.com/action"
                        value={selectedElement.url || ""}
                        onChange={(e) =>
                          updateSelected({ url: e.target.value })
                        }
                        className="bg-[#242424] border border-zinc-700 rounded-lg px-3 py-2 text-white outline-none font-mono text-xs"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-center text-zinc-500 gap-2">
                  <SlidersHorizontal size={24} />
                  <p className="text-xs max-w-[180px]">
                    Select an element on the canvas to inspect and edit its
                    styles.
                  </p>
                </div>
              )}
            </aside>
          </div>
        ) : (
          /* 4. DATABASE & CRM VIEWPORT */
          <div className="flex-1 p-10 overflow-y-auto flex flex-col gap-6 relative">
            {/* Header Metrics & Dispatch Bar */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-zinc-900 uppercase">
                  Audience Matrix
                </h2>
                <p className="text-xs font-mono text-zinc-500">
                  {subscribers.length} TOTAL RECIPIENTS •{" "}
                  {subscribers.filter((s) => s.is_sent).length} DELIVERED
                </p>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-3">
                {/* Search Capsule */}
                <div className="w-80 h-[32px] bg-[#D1D1D1] rounded-[10px] flex items-center px-3.5 gap-2 border border-zinc-400/30">
                  <Search size={16} className="text-zinc-600" />
                  <input
                    type="text"
                    placeholder="Search name, email, department..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent w-full outline-none text-xs text-zinc-900 placeholder-zinc-600 font-sans"
                  />
                </div>
                
                <button
                  onClick={addRecipient}
                  className="h-[32px] px-4 rounded-[10px] bg-white border border-zinc-300 hover:bg-zinc-100 text-zinc-800 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all"
                >
                  <Plus size={15} />
                  <span>ADD SUBSCRIBER</span>
                </button>

                {/* Dispatch Button */}
                <button
                  onClick={handleSendAll}
                  disabled={isProcessing}
                  className="h-[32px] px-6 rounded-[10px] bg-[#5BADFF] hover:bg-[#489feb] text-[#0A0A0A] font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all disabled:opacity-50"
                >
                  <Send size={15} />
                  <span>
                    {isProcessing ? "DISPATCHING..." : "SEND DISPATCH"}
                  </span>
                </button>
              </div>
            </div>

            {/* Structured Table */}
            <div className="w-full bg-[#FFFFFF]/50 rounded-[10px] border border-[#666666] overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0A0A0A] text-white text-[11px] font-mono uppercase tracking-widest h-12">
                    <th className="px-6">NAME</th>
                    <th className="px-6">EMAIL</th>
                    <th className="px-6">ROLE</th>
                    <th className="px-6">DEPARTMENT</th>
                    <th className="px-6 text-center">STATUS</th>
                    <th className="px-6 text-center">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y-[1.5px] divide-[#666666] text-xs text-zinc-800">
                  {filteredSubscribers.map((sub) => (
                    <tr
                      key={sub.id}
                      className="hover:bg-zinc-200/50 transition-colors h-14"
                    >
                      <td className="px-6 font-semibold">
                        <input
                          type="text"
                          value={sub.name}
                          onChange={e => updateSubscriber(sub.id, "name", e.target.value)}
                          className="bg-transparent border-none outline-none focus:ring-1 focus:ring-zinc-400 rounded px-1 w-full font-semibold"
                        />
                      </td>
                      <td className="px-6 font-mono text-zinc-600">
                        <input
                          type="text"
                          value={sub.email}
                          onChange={e => updateSubscriber(sub.id, "email", e.target.value)}
                          className="bg-transparent border-none outline-none focus:ring-1 focus:ring-zinc-400 rounded px-1 w-full"
                        />
                      </td>
                      <td className="px-6">
                        <input
                          type="text"
                          value={sub.role}
                          onChange={e => updateSubscriber(sub.id, "role", e.target.value)}
                          className="px-3 py-1 bg-[#F8E77C] text-[#0A0A0A] font-bold text-[10px] rounded-full uppercase tracking-wider outline-none focus:ring-2 focus:ring-zinc-400 max-w-[140px]"
                        />
                      </td>
                      <td className="px-6 text-zinc-700">
                        <select
                          value={sub.department}
                          onChange={e => updateSubscriber(sub.id, "department", e.target.value)}
                          className="bg-transparent outline-none border border-transparent focus:border-zinc-300 rounded p-1 cursor-pointer"
                        >
                          {departments.map(d => <option key={d} value={d}>{d}</option>)}
                          <option value="_manage_">+ Manage Departments</option>
                        </select>
                      </td>
                      <td className="px-6 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            sub.is_sent
                              ? "bg-emerald-200 text-emerald-900"
                              : "bg-zinc-300 text-zinc-700"
                          }`}
                        >
                          {sub.is_sent ? (
                            <>
                              <CheckCircle2 size={12} /> Sent
                            </>
                          ) : (
                            <>
                              <XCircle size={12} /> Pending
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 text-center flex justify-center items-center gap-2 h-14">
                        <button
                          onClick={() => toggleSent(sub.id)}
                          className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all ${
                            sub.is_sent
                              ? "bg-[#0A0A0A] text-white"
                              : "bg-[#C8C8C8] text-zinc-700 hover:bg-zinc-400"
                          }`}
                          title="Toggle Dispatch Status"
                        >
                          ✓
                        </button>
                        <button onClick={() => deleteRecipient(sub.id)} className="text-zinc-400 hover:text-red-500 transition-colors p-1" title="Delete Recipient">
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Manage Departments Modal */}
            {manageDeptsModal && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-50 backdrop-blur-sm">
                <div className="bg-[#303030] border border-white/10 rounded-xl shadow-2xl p-6 w-[400px] text-[#E5E4E2] flex flex-col gap-4">
                  <div className="flex justify-between items-center border-b border-white/10 pb-3">
                    <h3 className="font-bold uppercase tracking-wider text-sm">Manage Departments</h3>
                    <button onClick={() => setManageDeptsModal(false)} className="text-zinc-400 hover:text-white"><XCircle size={18} /></button>
                  </div>
                  <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto pr-2">
                    {departments.map(d => (
                      <div key={d} className="flex justify-between items-center bg-[#242424] p-2 rounded">
                        <input 
                          type="text" 
                          defaultValue={d} 
                          onBlur={(e) => renameDepartment(d, e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                          className="bg-transparent border-none outline-none focus:ring-1 focus:ring-zinc-400 rounded px-1 text-sm text-white w-full mr-2"
                        />
                        <button onClick={() => removeDepartment(d)} className="text-rose-400 hover:text-rose-300"><Trash2 size={14}/></button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <input type="text" value={newDeptName} onChange={e=>setNewDeptName(e.target.value)} placeholder="New Department Name" className="flex-1 bg-[#242424] rounded px-3 py-2 text-sm outline-none" />
                    <button onClick={addDepartment} className="bg-[#5BADFF] text-[#0A0A0A] px-4 py-2 rounded font-bold text-xs uppercase">Add</button>
                  </div>
                </div>
              </div>
            )}
            
          </div>
        )}
      </div>
    </div>
  );
}
