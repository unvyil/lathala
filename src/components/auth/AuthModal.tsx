import React, { useState } from 'react';
import { useAuth, DEMO_PROFILES } from '../../contexts/AuthContext';
import {
  UserIcon,
  LockIcon,
  MailIcon,
  KeyRoundIcon,
  SparklesIcon,
  CheckCircle2Icon,
  ExternalLinkIcon,
  ArrowRightIcon,
} from 'lucide-react';

export function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    login,
    signup,
    switchUser,
    isClerkConfigured,
    clerkPublishableKey,
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>(authModalMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'signup') {
      if (!name.trim() || !email.trim()) return;
      signup(name.trim(), email.trim());
      setStatusMsg('Account created successfully!');
    } else {
      if (!email.trim()) return;
      login(email.trim(), name.trim());
      setStatusMsg('Signed in successfully!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-onyx/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-espresso text-parchment border border-white/10 rounded-2xl w-full max-w-md shadow-artboard overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-white/10 relative">
          <button
            onClick={closeAuthModal}
            className="absolute right-4 top-4 text-parchment/50 hover:text-parchment p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            ✕
          </button>

          <div className="flex items-center gap-2 text-accent text-xs font-mono uppercase tracking-wider mb-1.5">
            <SparklesIcon size={14} />
            <span>Open-Source Authentication</span>
          </div>

          <h2 className="font-serif text-2xl font-bold text-parchment">
            {mode === 'signin' ? 'Sign In to Lathala' : 'Create Publisher Account'}
          </h2>
          <p className="text-xs text-parchment/60 mt-1">
            Access your projects, folders, and audience rosters synced per user session.
          </p>

          {/* Mode Switch Tabs */}
          <div className="flex bg-onyx/70 p-1 rounded-xl mt-4 border border-white/10">
            <button
              onClick={() => setMode('signin')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                mode === 'signin'
                  ? 'bg-parchment text-onyx shadow-xs font-semibold'
                  : 'text-parchment/60 hover:text-parchment'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                mode === 'signup'
                  ? 'bg-parchment text-onyx shadow-xs font-semibold'
                  : 'text-parchment/60 hover:text-parchment'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Clerk Status Callout */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs flex items-start gap-2.5">
            <KeyRoundIcon size={16} className={isClerkConfigured ? 'text-emerald-400' : 'text-accent'} />
            <div className="flex-1 text-[11px] leading-relaxed">
              <span className="font-semibold text-parchment block">
                {isClerkConfigured ? 'Clerk Authentication Active' : 'Self-Hostable BYOK Ready'}
              </span>
              <span className="text-parchment/60">
                {isClerkConfigured
                  ? 'Your custom Clerk publishable key is connected for secure session verification.'
                  : 'Configure VITE_CLERK_PUBLISHABLE_KEY in your .env or Settings for Clerk SSO, or use zero-config local accounts below.'}
              </span>
            </div>
          </div>

          {/* 1-Click Demo Switcher */}
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-parchment/50 mb-2">
              Fast Demo Accounts (1-Click)
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  switchUser('director');
                  closeAuthModal();
                }}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-colors group flex items-center gap-2"
              >
                <img
                  src={DEMO_PROFILES.director.avatarUrl}
                  alt="Elena"
                  className="w-7 h-7 rounded-full object-cover shrink-0"
                />
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-parchment truncate group-hover:text-accent">
                    Elena Rostova
                  </div>
                  <div className="text-[10px] text-parchment/50 truncate">Director</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  switchUser('designer');
                  closeAuthModal();
                }}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-colors group flex items-center gap-2"
              >
                <img
                  src={DEMO_PROFILES.designer.avatarUrl}
                  alt="Marcus"
                  className="w-7 h-7 rounded-full object-cover shrink-0"
                />
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-parchment truncate group-hover:text-accent">
                    Marcus Vance
                  </div>
                  <div className="text-[10px] text-parchment/50 truncate">Design Lead</div>
                </div>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-parchment/30 text-[11px] font-mono">
            <div className="flex-1 h-px bg-white/10" />
            <span>OR CONTINUE WITH EMAIL</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <div>
                <label className="block text-[11px] font-medium text-parchment/70 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-parchment/40" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sophia Lin"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-9 pl-9 pr-3 rounded-xl bg-onyx/70 border border-white/10 text-xs text-parchment focus:border-accent focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-medium text-parchment/70 mb-1">
                Email Address
              </label>
              <div className="relative">
                <MailIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-parchment/40" />
                <input
                  type="email"
                  required
                  placeholder="publisher@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 rounded-xl bg-onyx/70 border border-white/10 text-xs text-parchment focus:border-accent focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-parchment/70 mb-1">
                Password
              </label>
              <div className="relative">
                <LockIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-parchment/40" />
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 rounded-xl bg-onyx/70 border border-white/10 text-xs text-parchment focus:border-accent focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-10 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md mt-2"
            >
              <span>{mode === 'signin' ? 'Sign In & Load Workspace' : 'Create Account'}</span>
              <ArrowRightIcon size={14} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
