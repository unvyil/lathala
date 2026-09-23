import React, { useState } from 'react';
import { useStudio } from '../../contexts/StudioContext';
import { generateEmailHtml } from '../../services/exportHtml';
import {
  XIcon,
  CopyIcon,
  CheckIcon,
  DownloadIcon,
  Code2Icon,
  FileCodeIcon,
} from 'lucide-react';

interface ExportHtmlModalProps {
  open: boolean;
  onClose: () => void;
}

export function ExportHtmlModal({ open, onClose }: ExportHtmlModalProps) {
  const { activeProject, previewSubscriber, departments, addToast } = useStudio();
  const [copied, setCopied] = useState(false);

  if (!open || !activeProject) return null;

  const htmlContent = generateEmailHtml(activeProject, previewSubscriber, departments);

  const handleCopy = () => {
    navigator.clipboard.writeText(htmlContent);
    setCopied(true);
    addToast('HTML email code copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeProject.title.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'dispatch'}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast('Downloaded newsletter HTML file', 'success');
  };

  return (
    <div className="fixed inset-0 bg-onyx/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-base border border-sandbar rounded-2xl w-full max-w-3xl h-[80vh] shadow-artboard overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-onyx text-parchment px-5 py-4 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Code2Icon size={16} className="text-accent" />
            <div>
              <h3 className="font-serif text-base font-semibold">Responsive HTML Email Export</h3>
              <p className="text-[11px] text-parchment/60">
                Email-client compliant with inline CSS, responsive viewport rules & mapped hotspot links
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

        {/* Code Editor Preview */}
        <div className="flex-1 p-4 bg-[#1E1E1E] overflow-hidden flex flex-col font-mono text-xs text-gray-200">
          <div className="flex items-center justify-between pb-2 border-b border-gray-800 text-[11px] text-gray-400">
            <span>newsletter.html ({Math.round(htmlContent.length / 1024)} KB)</span>
            <span>UTF-8 · XHTML Strict compatible</span>
          </div>
          <textarea
            readOnly
            value={htmlContent}
            className="flex-1 w-full bg-transparent border-0 resize-none pt-3 text-gray-300 focus:outline-none font-mono text-xs leading-relaxed overflow-y-auto lathala-scroll"
          />
        </div>

        {/* Actions Footer */}
        <div className="bg-sandbar/20 px-5 py-3.5 border-t border-sandbar flex items-center justify-between shrink-0">
          <span className="text-xs text-espresso/70">
            Paste directly into Mailchimp, Resend, SendGrid, Postmark, or custom email scripts.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-3.5 py-1.5 rounded-lg border border-sandbar bg-white text-xs font-medium text-onyx hover:bg-sandbar/40 flex items-center gap-1.5 transition-colors"
            >
              <DownloadIcon size={13} />
              <span>Download .html</span>
            </button>
            <button
              onClick={handleCopy}
              className="px-4 py-1.5 rounded-lg bg-onyx text-parchment hover:bg-espresso text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              {copied ? <CheckIcon size={13} className="text-emerald-400" /> : <CopyIcon size={13} />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy HTML Code'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
