import React, { useState, useEffect } from "react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useAuth,
} from "@clerk/clerk-react";
import { Header } from "./components/Header";
import { CanvasSidebar } from "./components/editor/CanvasSidebar";
import { DesignCanvas } from "./components/editor/DesignCanvas";
import { PropertiesPanel } from "./components/editor/PropertiesPanel";
import { AudienceTable } from "./components/audience/AudienceTable";
import type { Subscriber, CanvasElement, LinkZone, ElementType } from "./types";

const GOOGLE_FONTS = [
  "Inter",
  "Roboto",
  "Montserrat",
  "Playfair Display",
  "Fira Code",
];
const DEFAULT_DEPARTMENTS = [
  "Engineering",
  "Executive",
  "Design",
  "Marketing",
  "Operations",
  "Sales",
];
const DEFAULT_TIER_TYPES = ["Core", "VIP", "Premium", "Trial"];

export default function App() {
  const { getToken } = useAuth();
  const [activeTab, setActiveTab] = useState<"editor" | "crm">("editor");
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(
    null,
  );
  const [customFonts, setCustomFonts] = useState<
    { name: string; url: string }[]
  >([]);
  const [linkZones] = useState<LinkZone[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fetchSubscribers = async () => {
    try {
      const token = await getToken();
      const res = await fetch("http://localhost:8000/api/subscribers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSubscribers(data);
    } catch (err) {
      console.error("Failed to fetch subscribers:", err);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleAddElement = (type: ElementType) => {
    const newElement: CanvasElement = {
      id: crypto.randomUUID(),
      type,
      x: 50,
      y: 50,
      width: 200,
      height: 50,
      top: 50,
      text: type === "text" ? "New Text Block" : undefined,
      fill: type === "rectangle" || type === "circle" ? "#6366f1" : undefined,
      color: "#ffffff",
      fontSize: 16,
      fontFamily: "Inter",
    };
    setElements((prev) => [...prev, newElement]);
    setSelectedElementId(newElement.id);
  };

  const handleCustomFontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fontName = file.name.replace(/\.[^/.]+$/, "");
    const fontUrl = URL.createObjectURL(file);
    const newFontFace = new FontFace(fontName, `url(${fontUrl})`);
    newFontFace.load().then((loaded) => {
      document.fonts.add(loaded);
      setCustomFonts((prev) => [...prev, { name: fontName, url: fontUrl }]);
    });
  };

  const handleUpdateElement = (updates: Partial<CanvasElement>) => {
    if (!selectedElementId) return;
    setElements((prev) =>
      prev.map((el) =>
        el.id === selectedElementId ? { ...el, ...updates } : el,
      ),
    );
  };

  const handleDeleteElement = () => {
    if (!selectedElementId) return;
    setElements((prev) => prev.filter((el) => el.id !== selectedElementId));
    setSelectedElementId(null);
  };

  const handleToggleSent = async (sub: Subscriber) => {
    const updatedStatus = !sub.is_sent;
    setSubscribers((prev) =>
      prev.map((s) =>
        s.id === sub.id
          ? {
              ...s,
              is_sent: updatedStatus,
              status: updatedStatus ? "Sent" : "Unsent",
            }
          : s,
      ),
    );
  };

  const handleSendAll = async () => {
    setIsProcessing(true);
    try {
      const token = await getToken();
      const res = await fetch("http://localhost:8000/api/dispatch/all", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          image_base64:
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
          link_zones: linkZones,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchSubscribers();
        alert(`Dispatched to ${data.sent_count} recipients.`);
      }
    } catch (err) {
      console.error("Batch dispatch error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedElement = elements.find((e) => e.id === selectedElementId);

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-slate-100 flex flex-col font-sans">
      <Header />

      <SignedOut>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Lathala Studio
          </h2>
          <p className="text-sm text-slate-400 max-w-md">
            Sign in to access your newsletter canvas, configure dynamic link
            zones, and manage your subscriber CRM.
          </p>
          <SignInButton mode="modal">
            <button className="px-6 py-2.5 bg-[#0d99ff] hover:bg-[#0b84db] text-white font-medium rounded-xl shadow-sm transition-all">
              Sign In / Register
            </button>
          </SignInButton>
        </div>
      </SignedOut>

      <SignedIn>
        {/* Navigation Sub-bar */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-[#252525] border-b border-[#383838]">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("editor")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "editor"
                  ? "bg-[#383838] text-white"
                  : "text-slate-400 hover:text-white hover:bg-[#2e2e2e]"
              }`}
            >
              Editor
            </button>
            <button
              onClick={() => setActiveTab("crm")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "crm"
                  ? "bg-[#383838] text-white"
                  : "text-slate-400 hover:text-white hover:bg-[#2e2e2e]"
              }`}
            >
              Audience ({subscribers.length})
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 rounded-full text-[11px] font-semibold">
              Executive Admin
            </span>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>

        {/* Workspace Panels */}
        <main className="flex-1 flex overflow-hidden">
          {activeTab === "editor" ? (
            <div className="flex-1 flex w-full h-[calc(100vh-105px)] overflow-hidden">
              <CanvasSidebar
                onAddElement={handleAddElement}
                onCustomFontUpload={handleCustomFontUpload}
                customFontsCount={customFonts.length}
                onRasterizePreview={() => alert("Rasterize triggered")}
              />
              <DesignCanvas
                elements={elements}
                selectedId={selectedElementId}
                onSelect={setSelectedElementId}
              />
              <PropertiesPanel
                selectedElement={selectedElement}
                onUpdate={handleUpdateElement}
                onDelete={handleDeleteElement}
                googleFonts={GOOGLE_FONTS}
                customFonts={customFonts}
              />
            </div>
          ) : (
            <div className="flex-1 p-6 overflow-y-auto">
              <AudienceTable
                subscribers={subscribers}
                setSubscribers={setSubscribers}
                departments={DEFAULT_DEPARTMENTS}
                tierTypes={DEFAULT_TIER_TYPES}
                onOpenModal={() => alert("Add subscriber modal")}
                onToggleSent={handleToggleSent}
                onSendAll={handleSendAll}
                isProcessing={isProcessing}
              />
            </div>
          )}
        </main>
      </SignedIn>
    </div>
  );
}
