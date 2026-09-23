import React, { useState } from 'react';
import { GOOGLE_APPS_SCRIPT_SAMPLE } from '../../services/googleSheetsScript';
import {
  XIcon,
  CopyIcon,
  CheckIcon,
  Code2Icon,
  ExternalLinkIcon,
  FileSpreadsheetIcon,
} from 'lucide-react';
import { useStudio } from '../../contexts/StudioContext';

interface GoogleAppsScriptModalProps {
  open: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
}

export function GoogleAppsScriptModal({ open, onClose, onOpenSettings }: GoogleAppsScriptModalProps) {
  const { addToast } = useStudio();
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_SAMPLE);
    setCopied(true);
    addToast('Google Apps Script copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-onyx/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-base border border-sandbar rounded-2xl w-full max-w-3xl h-[85vh] shadow-artboard overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-onyx text-parchment px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-emerald-900/80 border border-emerald-700/60 flex items-center justify-center text-emerald-300">
              <FileSpreadsheetIcon size={16} />
            </div>
            <div>
              <h3 className="font-serif text-base font-semibold">
                Google Sheets + Apps Script Sync Template
              </h3>
              <p className="text-[11px] text-parchment/60">
                Connect your Google Sheet as a live backend for the Lathala CRM
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-parchment/60 hover:text-parchment transition-colors"
          >
            <XIcon size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto lathala-scroll p-6 space-y-5">
          {/* Quick Step by step guide */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 bg-white border border-sandbar rounded-xl">
              <span className="h-5 w-5 rounded-full bg-onyx text-parchment text-[11px] font-bold flex items-center justify-center mb-2">
                1
              </span>
              <h4 className="text-xs font-bold text-onyx mb-1">Open Google Sheet</h4>
              <p className="text-[11px] text-espresso/70 leading-normal">
                Create a sheet with headers: <code>Name</code>, <code>Email</code>, <code>Role</code>, <code>Department</code>, <code>Status</code>.
              </p>
            </div>

            <div className="p-3.5 bg-white border border-sandbar rounded-xl">
              <span className="h-5 w-5 rounded-full bg-onyx text-parchment text-[11px] font-bold flex items-center justify-center mb-2">
                2
              </span>
              <h4 className="text-xs font-bold text-onyx mb-1">Paste Apps Script</h4>
              <p className="text-[11px] text-espresso/70 leading-normal">
                Click <strong>Extensions &gt; Apps Script</strong>, paste the code below into <code>Code.gs</code>, and click Save.
              </p>
            </div>

            <div className="p-3.5 bg-white border border-sandbar rounded-xl">
              <span className="h-5 w-5 rounded-full bg-onyx text-parchment text-[11px] font-bold flex items-center justify-center mb-2">
                3
              </span>
              <h4 className="text-xs font-bold text-onyx mb-1">Deploy as Web App</h4>
              <p className="text-[11px] text-espresso/70 leading-normal">
                Click <strong>Deploy &gt; New deployment &gt; Web app</strong>. Set access to "Anyone", copy URL, and paste in Settings!
              </p>
            </div>
          </div>

          {/* Code Viewer */}
          <div className="rounded-xl overflow-hidden border border-gray-800 bg-[#1A1A1A]">
            <div className="px-4 py-2 bg-[#252526] border-b border-gray-800 flex items-center justify-between text-xs text-gray-300">
              <span className="font-mono text-[11px]">Code.gs (Ready to Copy)</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-accent hover:bg-accent-hover text-white text-[11px] font-semibold transition-colors"
              >
                {copied ? <CheckIcon size={12} /> : <CopyIcon size={12} />}
                <span>{copied ? 'Copied!' : 'Copy Code.gs'}</span>
              </button>
            </div>
            <pre className="p-4 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-80 lathala-scroll leading-relaxed">
              {GOOGLE_APPS_SCRIPT_SAMPLE}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-sandbar/20 px-6 py-3.5 border-t border-sandbar flex items-center justify-between shrink-0">
          <span className="text-xs text-espresso/70">
            Have your Web App URL ready?
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenSettings();
              }}
              className="px-4 py-1.5 rounded-lg bg-onyx text-parchment hover:bg-espresso text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span>Paste URL in Sync Settings →</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
