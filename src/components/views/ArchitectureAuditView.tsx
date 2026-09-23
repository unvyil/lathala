import React, { useState } from 'react';
import {
  ShieldCheckIcon,
  BugIcon,
  SparklesIcon,
  DatabaseIcon,
  Code2Icon,
  CpuIcon,
  WorkflowIcon,
  CheckCircle2Icon,
  AlertTriangleIcon,
  CopyIcon,
  CheckIcon,
  ExternalLinkIcon,
  BookOpenIcon,
  FileSpreadsheetIcon,
} from 'lucide-react';
import { useStudio } from '../../contexts/StudioContext';

export function ArchitectureAuditView() {
  const { setView } = useStudio();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col bg-parchment overflow-y-auto lathala-scroll p-6 md:p-10">
      <div className="max-w-5xl mx-auto w-full space-y-10">
        {/* Hero Header */}
        <div className="border-b border-sandbar pb-6">
          <div className="flex items-center gap-2 text-accent font-mono text-xs uppercase tracking-wider mb-2">
            <BookOpenIcon size={14} />
            <span>Open-Source Architectural Audit & Blueprint</span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-onyx leading-tight">
            Lathala Architecture & Repository Refactoring Report
          </h1>
          <p className="text-sm md:text-base text-espresso/80 mt-2 max-w-3xl leading-relaxed">
            Detailed engineering insights addressing your questions regarding open-source Supabase/Clerk deployment, the Google Sheets CRM architecture, and the performance bugs identified in{' '}
            <code className="bg-sandbar/50 px-1.5 py-0.5 rounded text-onyx font-mono text-xs">
              github.com/unvyil/lathala
            </code>.
          </p>
        </div>

        {/* Section 1: Supabase & Clerk in Open Source */}
        <section className="bg-base border border-sandbar rounded-2xl p-6 md:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-onyx text-parchment flex items-center justify-center">
              <DatabaseIcon size={20} />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-onyx">
                1. How to Handle Supabase & Clerk in an Open-Source Project
              </h2>
              <p className="text-xs text-espresso/60">
                Preventing personal account lock-in & enabling seamless community self-hosting
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-xl border border-sandbar space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-accent font-mono">
                The Problem You Encountered
              </h3>
              <p className="text-xs text-espresso/80 leading-relaxed">
                If you hardcode Supabase credentials or Clerk keys in the repository, any user running the project writes directly to <strong>your personal database</strong>. Furthermore, committing keys to a public GitHub repo is a security risk.
              </p>
            </div>

            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900 font-mono">
                The Solution: "Bring Your Own Backend" (BYOB)
              </h3>
              <p className="text-xs text-emerald-950 leading-relaxed">
                Ship the code with <strong>Zero-Config LocalStorage mode by default</strong> so anyone can run it instantly without signing up. For cloud persistence, provide an <code>.env.example</code> with instructions for users to supply their own free Supabase keys.
              </p>
            </div>
          </div>

          {/* Strategic Recommendation */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-950 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <AlertTriangleIcon size={14} />
              <span>Architectural Recommendation: Prefer Supabase Auth over Clerk + Supabase</span>
            </div>
            <p className="leading-relaxed">
              In your original concept, you considered using both Clerk and Supabase. In modern open-source software, combining Clerk with Supabase creates <strong>two separate authentication tokens</strong>, requiring webhook synchronization to mirror Clerk user IDs into PostgreSQL.
            </p>
            <p className="leading-relaxed">
              <strong>Simpler, cleaner alternative:</strong> Use <strong>Supabase Auth directly</strong>. Supabase has built-in authentication (Email/Password, Magic Link, GitHub, Google OAuth) that integrates seamlessly with PostgreSQL Row Level Security (RLS) with <strong>zero extra dependencies</strong>.
            </p>
          </div>

          {/* Code snippet */}
          <div>
            <div className="flex items-center justify-between pb-2 text-xs text-espresso/70">
              <span className="font-mono text-[11px] font-semibold">
                Recommended client initialization pattern (src/services/supabase.ts)
              </span>
              <button
                onClick={() =>
                  copyToClipboard(
                    `import { createClient } from '@supabase/supabase-js';

// Reads from client environment or falls back to in-app configured BYOB keys
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('lathala_supabase_url');
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('lathala_supabase_key');

// Only instantiate if configured; otherwise gracefully degrade to LocalStorage
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;`,
                    'supabase-code',
                  )
                }
                className="flex items-center gap-1 text-[11px] text-accent hover:underline"
              >
                {copiedKey === 'supabase-code' ? <CheckIcon size={12} /> : <CopyIcon size={12} />}
                <span>{copiedKey === 'supabase-code' ? 'Copied' : 'Copy snippet'}</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-onyx text-parchment font-mono text-xs overflow-x-auto leading-relaxed">
{`import { createClient } from '@supabase/supabase-js';

// Reads from environment variables or falls back to browser BYOB settings
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('lathala_supabase_url');
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('lathala_supabase_key');

// If keys exist, connect to user's database. If null, use local workspace mode!
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;`}
            </pre>
          </div>
        </section>

        {/* Section 2: Google Sheets & Apps Script CRM */}
        <section className="bg-base border border-sandbar rounded-2xl p-6 md:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-900 text-emerald-200 flex items-center justify-center">
              <FileSpreadsheetIcon size={20} />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-onyx">
                2. The Google Sheets & Apps Script CRM Integration
              </h2>
              <p className="text-xs text-espresso/60">
                How to turn a Google Spreadsheet into a reactive newsletter CRM
              </p>
            </div>
          </div>

          <p className="text-xs md:text-sm text-espresso/80 leading-relaxed">
            You mentioned: <em>"for the CRM idea, i want it to be accessible in the app, pretty much like a google sheet that is like connected to the apps script you know? But in this way, the design tool and the crm are both integrated into one system."</em>
          </p>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-xl border border-sandbar">
                <span className="font-mono text-xs text-accent font-bold block mb-1">
                  1. In-App Spreadsheet
                </span>
                <p className="text-[11px] text-espresso/70 leading-normal">
                  Users can edit subscribers, add custom columns (like <code>Company</code>, <code>City</code>, <code>Tier</code>), and filter by status right inside Lathala.
                </p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-sandbar">
                <span className="font-mono text-xs text-accent font-bold block mb-1">
                  2. Dynamic Personalization
                </span>
                <p className="text-[11px] text-espresso/70 leading-normal">
                  Any column created in the spreadsheet immediately turns into a usable merge tag like <code>{'{{tier}}'}</code> or <code>{'{{city}}'}</code> in the design studio!
                </p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-sandbar">
                <span className="font-mono text-xs text-accent font-bold block mb-1">
                  3. Apps Script Webhook
                </span>
                <p className="text-[11px] text-espresso/70 leading-normal">
                  A lightweight Google Apps Script deployed as a Web App allows Lathala to fetch rows via <code>doGet()</code> and push updates (e.g. marking sent) via <code>doPost()</code>.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Repository Bug Audit & Performance Fixes */}
        <section className="bg-base border border-sandbar rounded-2xl p-6 md:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-red-950 text-red-300 flex items-center justify-center">
              <BugIcon size={20} />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-onyx">
                3. Bugs Identified in unvyil/lathala & How We Fixed Them
              </h2>
              <p className="text-xs text-espresso/60">
                Root causes of "rough look" and visual glitches in the repository
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              {
                title: 'Bug 1: Jumpy Canvas Element Resizing',
                severity: 'Critical UX',
                cause:
                  'In the original CanvasStage.tsx, the pointer drag calculations for NW, NE, and SW handles modified both coordinates and width without anchoring to the opposite fixed corner, causing shapes to invert or jump by hundreds of pixels.',
                fix:
                  'Fixed in our refactored CanvasStage by maintaining an immutable origin bounding box during the pointer session and clamping minimum dimensions to 12px.',
              },
              {
                title: 'Bug 2: Missing Undo / Redo (Lost User Work)',
                severity: 'High',
                cause:
                  'State mutations in StudioContext.tsx directly replaced the elements array without keeping a historical stack. Accidental deletions or movements were irreversible.',
                fix:
                  'Implemented a 30-step immutable undo/redo history stack with standard Ctrl+Z / Ctrl+Y keyboard shortcuts and toolbar controls.',
              },
              {
                title: 'Bug 3: Fragile Email HTML Generation',
                severity: 'High',
                cause:
                  'The original export rendered simple div structures that break in Outlook, Apple Mail, and Gmail. Furthermore, clickable link hotspots were not converted to genuine <a> tags.',
                fix:
                  'Created exportHtml.ts which produces XHTML Strict table-based layouts with percentage-relative positioning, inline styles, fallback web-safe font stacks, and real interactive hotspot links.',
              },
              {
                title: 'Bug 4: State Loss on Refresh',
                severity: 'Medium',
                cause:
                  'Subscribers and canvas elements were stored only in transient React component state without persistence.',
                fix:
                  'Added StorageService with automatic LocalStorage synchronization, versioned schemas, and instant demo data restore.',
              },
              {
                title: 'Bug 5: Inverted Layer Stack & Z-Index Glitches',
                severity: 'Medium',
                cause:
                  'The layers list order matched the DOM array (bottom first), confusing users who expected the top layer to appear at the top of the layers list.',
                fix:
                  'Reversed display hierarchy in LayersPanel.tsx with explicit Bring Forward / Send Backward actions.',
              },
            ].map((bug) => (
              <div key={bug.title} className="p-4 bg-white rounded-xl border border-sandbar space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-onyx flex items-center gap-1.5">
                    <AlertTriangleIcon size={13} className="text-accent" />
                    <span>{bug.title}</span>
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sandbar/40 text-espresso font-semibold">
                    {bug.severity}
                  </span>
                </div>
                <p className="text-xs text-espresso/70">
                  <strong className="text-onyx font-medium">Cause:</strong> {bug.cause}
                </p>
                <p className="text-xs text-emerald-800 font-medium">
                  <strong>Fix Applied:</strong> {bug.fix}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: Recommended Repository Refactoring Steps */}
        <section className="bg-onyx text-parchment rounded-2xl p-6 md:p-8 shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-accent text-white flex items-center justify-center">
              <WorkflowIcon size={20} />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-parchment">
                4. Actionable Steps to Update your GitHub Repository
              </h2>
              <p className="text-xs text-parchment/60">
                How to integrate these improvements into your local git repository
              </p>
            </div>
          </div>

          <ol className="space-y-3 text-xs text-parchment/80 list-decimal pl-5 leading-relaxed">
            <li>
              <strong className="text-white">Adopt the Unified State Structure:</strong> Replace the fragmented states with our centralized <code>StudioContext.tsx</code> and <code>studio.ts</code> types.
            </li>
            <li>
              <strong className="text-white">Implement the Zero-Config LocalStorage Pattern:</strong> Allow new contributors to run <code>npm install &amp;&amp; npm run dev</code> and start designing immediately without requiring Supabase or Clerk keys.
            </li>
            <li>
              <strong className="text-white">Update CanvasStage.tsx:</strong> Replace the resizing math with our anchored 8-point resize logic to eliminate jitter.
            </li>
            <li>
              <strong className="text-white">Include Google Apps Script in /docs:</strong> Add the <code>Code.gs</code> file to your repo's <code>/docs/google-apps-script.js</code> so users can easily copy it into their Google Sheets.
            </li>
            <li>
              <strong className="text-white">Ship .env.example with Clear Comments:</strong> Document each environment variable and its optionality.
            </li>
          </ol>

          <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-parchment/60">
              Ready to test the refactored design studio and CRM?
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setView('crm')}
                className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-parchment transition-colors"
              >
                Test Spreadsheet CRM
              </button>
              <button
                onClick={() => setView('editor')}
                className="px-4 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-xs font-semibold text-white transition-colors"
              >
                Launch Design Studio →
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
