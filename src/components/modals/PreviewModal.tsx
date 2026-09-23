import React, { useState } from 'react';
import { useStudio } from '../../contexts/StudioContext';
import { generateEmailHtml, interpolateMergeTags } from '../../services/exportHtml';
import {
  XIcon,
  MonitorIcon,
  SmartphoneIcon,
  SparklesIcon,
  ExternalLinkIcon,
  CheckIcon,
} from 'lucide-react';

interface PreviewModalProps {
  open: boolean;
  onClose: () => void;
}

export function PreviewModal({ open, onClose }: PreviewModalProps) {
  const { activeProject, subscribers, departments } = useStudio();
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [selectedSubId, setSelectedSubId] = useState<string>('');

  if (!open || !activeProject) return null;

  const currentSubscriber =
    subscribers.find((s) => s.id === selectedSubId) || subscribers[0] || null;

  const rawHtml = generateEmailHtml(activeProject, currentSubscriber, departments);

  return (
    <div className="fixed inset-0 bg-onyx/75 z-50 flex items-center justify-center p-4 backdrop-blur-xs select-none">
      <div className="bg-base border border-sandbar rounded-2xl w-full max-w-4xl h-[90vh] shadow-artboard overflow-hidden flex flex-col">
        {/* Modal Top Bar */}
        <div className="bg-onyx text-parchment px-5 py-3 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <h3 className="font-serif text-base font-semibold">
              Email Client Artifact Preview
            </h3>

            {/* Desktop vs Mobile switcher */}
            <div className="flex items-center rounded-lg bg-white/10 p-0.5 border border-white/10">
              <button
                onClick={() => setDevice('desktop')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  device === 'desktop'
                    ? 'bg-parchment text-onyx shadow-xs font-semibold'
                    : 'text-parchment/60 hover:text-parchment'
                }`}
              >
                <MonitorIcon size={13} />
                <span>Desktop (600px)</span>
              </button>
              <button
                onClick={() => setDevice('mobile')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  device === 'mobile'
                    ? 'bg-parchment text-onyx shadow-xs font-semibold'
                    : 'text-parchment/60 hover:text-parchment'
                }`}
              >
                <SmartphoneIcon size={13} />
                <span>Mobile (375px)</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Recipient Persona Switcher */}
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1">
              <SparklesIcon size={13} className="text-accent" />
              <span className="text-xs text-parchment/60 hidden sm:inline">Preview Recipient:</span>
              <select
                value={selectedSubId}
                onChange={(e) => setSelectedSubId(e.target.value)}
                className="bg-transparent text-xs font-medium text-parchment cursor-pointer focus:outline-none max-w-[170px] truncate"
              >
                {subscribers.map((s) => (
                  <option key={s.id} value={s.id} className="text-onyx bg-white">
                    {s.name} ({s.role})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded text-parchment/60 hover:text-parchment hover:bg-white/10"
            >
              <XIcon size={18} />
            </button>
          </div>
        </div>

        {/* Viewport Frame */}
        <div className="flex-1 bg-warm-beige/80 overflow-auto lathala-scroll p-6 flex justify-center items-start">
          <div
            className="transition-all duration-300 bg-white rounded-xl shadow-artboard border border-sandbar overflow-hidden"
            style={{
              width: device === 'desktop' ? '600px' : '375px',
              minHeight: '680px',
            }}
          >
            {/* Email Header Mockup */}
            <div className="bg-sandbar/30 border-b border-sandbar px-4 py-2.5 text-[11px] text-espresso/80 flex items-center justify-between">
              <div className="truncate">
                <span className="text-espresso/50 font-medium">To: </span>
                <span className="font-semibold text-onyx">
                  {currentSubscriber ? `${currentSubscriber.name} <${currentSubscriber.email}>` : 'Subscriber'}
                </span>
              </div>
              <span className="text-[10px] text-espresso/50 font-mono">Today, 10:42 AM</span>
            </div>

            {/* Embedded Iframe Preview */}
            <iframe
              title="Email Preview"
              srcDoc={rawHtml}
              className="w-full border-0"
              style={{
                height: `${(activeProject.artboardHeight || 880) + 90}px`,
              }}
              sandbox="allow-same-origin allow-popups"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
