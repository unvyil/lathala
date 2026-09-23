import React, { useState } from 'react';
import { useStudio } from '../../contexts/StudioContext';
import { SUPABASE_MIGRATION_SQL } from '../../services/googleSheetsScript';
import {
  XIcon,
  SettingsIcon,
  CloudIcon,
  KeyIcon,
  DatabaseIcon,
  FileSpreadsheetIcon,
  MailIcon,
  CopyIcon,
  CheckIcon,
  HelpCircleIcon,
  ShieldCheckIcon,
} from 'lucide-react';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { integrations, updateIntegrations, addToast } = useStudio();
  const [activeTab, setActiveTab] = useState<'env' | 'supabase' | 'sheets' | 'email'>('env');
  const [copiedSql, setCopiedSql] = useState(false);

  // Form states
  const [supabaseUrl, setSupabaseUrl] = useState(integrations.supabaseUrl);
  const [supabaseKey, setSupabaseKey] = useState(integrations.supabaseAnonKey);
  const [clerkKey, setClerkKey] = useState(integrations.clerkPublishableKey);
  const [sheetsUrl, setSheetsUrl] = useState(integrations.googleAppsScriptUrl);
  const [smtpHost, setSmtpHost] = useState(integrations.smtpHost);
  const [smtpUser, setSmtpUser] = useState(integrations.smtpUser);

  if (!open) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateIntegrations({
      supabaseUrl,
      supabaseAnonKey: supabaseKey,
      clerkPublishableKey: clerkKey,
      googleAppsScriptUrl: sheetsUrl,
      smtpHost,
      smtpUser,
    });
    onClose();
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_MIGRATION_SQL);
    setCopiedSql(true);
    addToast('Supabase SQL migration copied to clipboard!', 'success');
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-onyx/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-base border border-sandbar rounded-2xl w-full max-w-3xl h-[85vh] shadow-artboard overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="bg-onyx text-parchment px-6 py-4 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center text-parchment">
              <SettingsIcon size={16} />
            </div>
            <div>
              <h3 className="font-serif text-base font-semibold">
                Open-Source Integrations & BYOB Settings
              </h3>
              <p className="text-[11px] text-parchment/60">
                Self-hostable architecture: Bring Your Own Backend (BYOB) or run zero-config locally
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

        {/* Tab Navigation */}
        <div className="flex border-b border-sandbar bg-sandbar/20 px-6 pt-3 gap-3 shrink-0">
          {[
            { id: 'env', label: 'Open-Source Architecture (.env)', icon: KeyIcon },
            { id: 'supabase', label: 'Supabase & SQL Schema', icon: DatabaseIcon },
            { id: 'sheets', label: 'Google Sheets CRM Sync', icon: FileSpreadsheetIcon },
            { id: 'email', label: 'SMTP / Delivery Provider', icon: MailIcon },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`pb-3 text-xs font-medium border-b-2 flex items-center gap-1.5 transition-all ${
                activeTab === id
                  ? 'border-accent text-onyx font-bold'
                  : 'border-transparent text-espresso/60 hover:text-onyx'
              }`}
            >
              <Icon size={13} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto lathala-scroll p-6">
          {activeTab === 'env' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs leading-relaxed">
                <span className="font-bold flex items-center gap-1.5 text-emerald-950 mb-1">
                  <ShieldCheckIcon size={15} />
                  How to make Supabase & Clerk work in an Open-Source repo:
                </span>
                You should <strong>never</strong> put your personal Supabase or Clerk secret keys into the GitHub code. Instead, use the <strong>Environment Placeholder Architecture</strong>:
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Ship a clean <code>.env.example</code> with placeholder keys (e.g. <code>VITE_SUPABASE_URL=your_project_url</code>).</li>
                  <li>When a user forks or clones Lathala, they create a free Supabase project, copy their own keys into their local <code>.env</code>, and their instance runs completely independently!</li>
                  <li>Alternatively, provide the in-app BYOB configuration below, so users can enter their keys directly in the browser.</li>
                </ul>
              </div>

              <div className="rounded-xl border border-sandbar bg-white p-4 space-y-3">
                <h4 className="text-xs font-bold text-onyx uppercase tracking-wider font-mono">
                  Recommended .env.example configuration
                </h4>
                <pre className="p-3 rounded-lg bg-onyx text-parchment font-mono text-xs overflow-x-auto">
{`# .env.example — Lathala Open-Source Setup

# Supabase (Self-hosted or cloud database for subscribers & projects)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...

# Clerk Auth (Optional — if you want multi-user authentication)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...

# Google Sheets Webhook (Optional Apps Script URL for 2-way spreadsheet sync)
VITE_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/.../exec

# Backend SMTP (For real email delivery via FastAPI or serverless)
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASSWORD=re_...
SMTP_FROM_EMAIL=editorial@yourdomain.com`}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'supabase' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-onyx mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="url"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    placeholder="https://xyzcompany.supabase.co"
                    className="w-full h-9 rounded-lg border border-sandbar bg-white px-3 text-xs text-onyx focus:border-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-onyx mb-1">
                    Supabase Anon Public Key
                  </label>
                  <input
                    type="password"
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                    placeholder="eyJhbGciOi..."
                    className="w-full h-9 rounded-lg border border-sandbar bg-white px-3 text-xs text-onyx focus:border-accent focus:outline-none"
                  />
                </div>
              </div>

              {/* Copyable SQL Schema */}
              <div className="border border-sandbar rounded-xl overflow-hidden bg-white">
                <div className="px-4 py-2.5 bg-sandbar/30 border-b border-sandbar flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-onyx">
                    <DatabaseIcon size={14} className="text-accent" />
                    <span>Supabase SQL Migration Schema</span>
                  </div>
                  <button
                    onClick={handleCopySql}
                    className="px-2.5 py-1 rounded bg-onyx hover:bg-espresso text-parchment text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    {copiedSql ? <CheckIcon size={12} /> : <CopyIcon size={12} />}
                    <span>{copiedSql ? 'Copied' : 'Copy SQL Schema'}</span>
                  </button>
                </div>
                <pre className="p-4 text-[11px] font-mono text-espresso/80 overflow-x-auto max-h-52 lathala-scroll leading-relaxed">
                  {SUPABASE_MIGRATION_SQL}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'sheets' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-sandbar space-y-3">
                <label className="block text-xs font-semibold text-onyx">
                  Google Apps Script Web App Deployment URL
                </label>
                <input
                  type="url"
                  value={sheetsUrl}
                  onChange={(e) => setSheetsUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                  className="w-full h-9 rounded-lg border border-sandbar bg-white px-3 text-xs text-onyx focus:border-accent focus:outline-none"
                />
                <p className="text-[11px] text-espresso/70 leading-relaxed">
                  When configured, clicking <strong>"Sync with Google Sheet"</strong> in the Spreadsheet CRM tab will execute a real-time GET/POST to your Google Drive spreadsheet.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-onyx mb-1">
                    SMTP Host / Service
                  </label>
                  <input
                    type="text"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    placeholder="smtp.resend.com or smtp.sendgrid.net"
                    className="w-full h-9 rounded-lg border border-sandbar bg-white px-3 text-xs text-onyx focus:border-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-onyx mb-1">
                    SMTP User / API Token
                  </label>
                  <input
                    type="text"
                    value={smtpUser}
                    onChange={(e) => setSmtpUser(e.target.value)}
                    placeholder="resend or apikey"
                    className="w-full h-9 rounded-lg border border-sandbar bg-white px-3 text-xs text-onyx focus:border-accent focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-sandbar/20 px-6 py-3.5 border-t border-sandbar flex items-center justify-between shrink-0">
          <span className="text-[11px] text-espresso/60">
            Keys are saved locally in browser storage and never sent to third parties.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-sandbar bg-white text-xs font-medium text-espresso hover:bg-sandbar/40"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg bg-onyx text-parchment hover:bg-espresso text-xs font-semibold shadow-sm"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
