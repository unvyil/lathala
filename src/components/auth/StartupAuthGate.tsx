import React, { useState } from 'react';
import { useAuth, DEMO_PROFILES } from '../../contexts/AuthContext';
import {
  LockIcon,
  ShieldCheckIcon,
  SparklesIcon,
  KeyIcon,
  DatabaseIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
  UserIcon,
} from 'lucide-react';

export function StartupAuthGate() {
  const { login, signup, switchUser, clerkPublishableKey, isClerkConfigured } = useAuth();
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [customKey, setCustomKey] = useState(clerkPublishableKey || '');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    if (tab === 'signup') {
      signup(name || email.split('@')[0], email);
    } else {
      login(email, name || email.split('@')[0]);
    }
  };

  const handleSelectPreset = (preset: 'director' | 'designer') => {
    switchUser(preset);
  };

  const handleSaveCustomKey = () => {
    if (customKey.trim()) {
      try {
        const raw = localStorage.getItem('lathala_integrations_v2') || '{}';
        const parsed = JSON.parse(raw);
        parsed.clerkPublishableKey = customKey.trim();
        localStorage.setItem('lathala_integrations_v2', JSON.stringify(parsed));
        setStatusMessage('Clerk key updated! Sign in below.');
        setShowKeyConfig(false);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#070D0D] flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto font-sans antialiased text-parchment select-none">
      {/* Editorial Watermark / Background Texture */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#DBD6D0_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="w-full max-w-md relative z-10 my-auto">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-parchment text-onyx font-serif font-black text-2xl shadow-xl mb-3">
            L
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-white">
            Lathala Studio
          </h1>
          <p className="text-xs text-parchment/60 font-sans mt-1">
            Open-source editorial design, audience CRM & newsletter engine
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-parchment/70 font-mono">
            <DatabaseIcon size={12} className="text-emerald-400" />
            <span>Supabase: vvjsesddnbsledhwoczp</span>
          </div>
        </div>

        {/* Main Authentication Card */}
        <div className="bg-[#121818] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          {/* Clerk Brand Header & Tab Switcher */}
          <div className="p-5 pb-3 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-accent/20 border border-accent/40 flex items-center justify-center text-accent">
                <LockIcon size={13} />
              </div>
              <span className="text-xs font-semibold text-white tracking-wide uppercase font-mono">
                Clerk Secure Auth
              </span>
            </div>

            {/* Segmented Auth Mode Switch */}
            <div className="flex items-center p-0.5 rounded-lg bg-white/5 border border-white/10 text-xs">
              <button
                onClick={() => setTab('signin')}
                className={`px-3 py-1 rounded-md transition-all ${
                  tab === 'signin'
                    ? 'bg-accent text-white font-medium shadow-xs'
                    : 'text-parchment/60 hover:text-parchment'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setTab('signup')}
                className={`px-3 py-1 rounded-md transition-all ${
                  tab === 'signup'
                    ? 'bg-accent text-white font-medium shadow-xs'
                    : 'text-parchment/60 hover:text-parchment'
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          <div className="p-6">
            {statusMessage && (
              <div className="mb-4 p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2Icon size={14} className="shrink-0" />
                <span>{statusMessage}</span>
              </div>
            )}

            {/* 1-Click Fast Access / Workspace Profiles */}
            <div className="mb-5">
              <label className="text-[11px] font-mono uppercase text-parchment/50 tracking-wider block mb-2">
                Fast Workspace Login (1-Click)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectPreset('director')}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-accent text-left transition-all group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <img
                      src={DEMO_PROFILES.director.avatarUrl}
                      alt="Elena"
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    <span className="text-xs font-medium text-white truncate">Elena Rostova</span>
                  </div>
                  <span className="text-[10px] text-parchment/50 block truncate">
                    Editorial Director
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectPreset('designer')}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-accent text-left transition-all group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <img
                      src={DEMO_PROFILES.designer.avatarUrl}
                      alt="Marcus"
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    <span className="text-xs font-medium text-white truncate">Marcus Vance</span>
                  </div>
                  <span className="text-[10px] text-parchment/50 block truncate">
                    Lead Visual Designer
                  </span>
                </button>
              </div>
            </div>

            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-white/10 w-full" />
              <span className="bg-[#121818] px-2 text-[10px] uppercase font-mono text-parchment/40 shrink-0">
                Or with Email & Clerk SSO
              </span>
            </div>

            {/* Direct Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {tab === 'signup' && (
                <div>
                  <label className="block text-[11px] font-medium text-parchment/70 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Julian Hayes"
                    className="w-full h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder-parchment/30 focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-medium text-parchment/70 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="editor@lathala.studio"
                  className="w-full h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder-parchment/30 focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-parchment/70 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder-parchment/30 focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full h-10 mt-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
              >
                <span>{tab === 'signin' ? 'Sign In to Workspace' : 'Create Publisher Account'}</span>
                <ArrowRightIcon size={14} />
              </button>
            </form>

            {/* BYOK Key configuration toggle */}
            <div className="mt-5 pt-4 border-t border-white/10 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setShowKeyConfig((prev) => !prev)}
                className="text-[11px] text-parchment/50 hover:text-parchment flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <KeyIcon size={12} className="text-accent" />
                  <span>Configure Clerk Publishable Key (BYOK)</span>
                </span>
                <span className="text-[10px] font-mono">{showKeyConfig ? 'Hide' : 'Edit'}</span>
              </button>

              {showKeyConfig && (
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs space-y-2 animate-in fade-in">
                  <p className="text-[10px] text-parchment/60">
                    Paste your own Clerk key from the Clerk Dashboard:
                  </p>
                  <input
                    type="text"
                    value={customKey}
                    onChange={(e) => setCustomKey(e.target.value)}
                    placeholder="pk_test_..."
                    className="w-full h-8 px-2.5 rounded-lg bg-black/40 border border-white/10 text-[11px] font-mono text-white placeholder-parchment/30 focus:outline-none focus:border-accent"
                  />
                  <button
                    type="button"
                    onClick={handleSaveCustomKey}
                    className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-md text-[11px] font-medium transition-colors"
                  >
                    Save Key
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Security & BYOK Footnote */}
        <div className="mt-4 text-center">
          <p className="text-[11px] text-parchment/40 flex items-center justify-center gap-1.5">
            <ShieldCheckIcon size={13} className="text-emerald-400" />
            <span>Self-hostable & BYOK enabled. Session data stays in your Supabase instance.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
