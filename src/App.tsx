import React, { useState } from 'react';
import { StudioProvider, useStudio } from './contexts/StudioContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Header } from './components/common/Header';
import { StartupAuthGate } from './components/auth/StartupAuthGate';
import { EditorView } from './components/editor/EditorView';
import { CrmSpreadsheetView } from './components/crm/CrmSpreadsheetView';
import { DashboardView } from './components/dashboard/DashboardView';
import { ArchitectureAuditView } from './components/views/ArchitectureAuditView';
import { SettingsModal } from './components/modals/SettingsModal';
import { PreviewModal } from './components/modals/PreviewModal';
import { ExportHtmlModal } from './components/modals/ExportHtmlModal';
import { DispatchModal } from './components/modals/DispatchModal';
import { FontImportModal } from './components/modals/FontImportModal';
import { GoogleAppsScriptModal } from './components/modals/GoogleAppsScriptModal';
import { CheckCircle2Icon, InfoIcon, AlertCircleIcon, XIcon } from 'lucide-react';

function StudioWorkspace() {
  const { view, setView, toasts, dismissToast } = useStudio();
  const { isSignedIn } = useAuth();

  // Modals state
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [exportHtmlOpen, setExportHtmlOpen] = useState(false);
  const [dispatchOpen, setDispatchOpen] = useState(false);
  const [fontImportOpen, setFontImportOpen] = useState(false);
  const [appsScriptOpen, setAppsScriptOpen] = useState(false);

  // Strict startup authentication: lock dashboard and editor behind Clerk auth
  if (!isSignedIn) {
    return <StartupAuthGate />;
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-parchment text-onyx font-sans antialiased">
      {/* Top Application Navigation (only in Dashboard and CRM views) */}
      {view !== 'editor' && (
        <Header
          onOpenSettings={() => setSettingsOpen(true)}
        />
      )}

      {/* Main Dynamic View */}
      <main className="flex-1 flex min-h-0 overflow-hidden relative">
        {view === 'editor' && (
          <EditorView
            onOpenPreview={() => setPreviewOpen(true)}
            onOpenExportHtml={() => setExportHtmlOpen(true)}
            onOpenDispatch={() => setDispatchOpen(true)}
            onOpenFontModal={() => setFontImportOpen(true)}
            onOpenSettings={() => setSettingsOpen(true)}
          />
        )}

        {view === 'crm' && (
          <CrmSpreadsheetView
            onOpenSettings={() => setSettingsOpen(true)}
            onOpenScriptModal={() => setAppsScriptOpen(true)}
            onOpenPreview={() => setPreviewOpen(true)}
          />
        )}

        {view === 'dashboard' && <DashboardView />}
      </main>

      {/* Modals */}
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <PreviewModal open={previewOpen} onClose={() => setPreviewOpen(false)} />
      <ExportHtmlModal open={exportHtmlOpen} onClose={() => setExportHtmlOpen(false)} />
      <DispatchModal open={dispatchOpen} onClose={() => setDispatchOpen(false)} />
      <FontImportModal open={fontImportOpen} onClose={() => setFontImportOpen(false)} />
      <GoogleAppsScriptModal
        open={appsScriptOpen}
        onClose={() => setAppsScriptOpen(false)}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {/* Floating Toast Notification Stack */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl shadow-lg border text-xs font-medium animate-in fade-in slide-in-from-bottom-2 duration-200 ${
              toast.type === 'success'
                ? 'bg-emerald-900 text-white border-emerald-700'
                : toast.type === 'error'
                ? 'bg-red-900 text-white border-red-700'
                : 'bg-onyx text-parchment border-white/15'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2Icon size={14} className="text-emerald-300 shrink-0" />}
            {toast.type === 'error' && <AlertCircleIcon size={14} className="text-red-300 shrink-0" />}
            {toast.type === 'info' && <InfoIcon size={14} className="text-accent shrink-0" />}
            <span className="flex-1">{toast.text}</span>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-white/60 hover:text-white p-0.5 rounded"
            >
              <XIcon size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StudioProvider>
        <StudioWorkspace />
      </StudioProvider>
    </AuthProvider>
  );
}
