import React, { useState } from 'react';
import {
  FileTextIcon,
  TableIcon,
  LayoutGridIcon,
  SettingsIcon,
  PlusIcon,
  RotateCcwIcon,
  UserIcon,
} from 'lucide-react';
import { useStudio } from '../../contexts/StudioContext';
import { useAuth } from '../../contexts/AuthContext';
import { AppView } from '../../types/studio';

interface HeaderProps {
  onOpenSettings: () => void;
}

export function Header({ onOpenSettings }: HeaderProps) {
  const {
    view,
    setView,
    createProject,
    resetAllData,
  } = useStudio();

  const { user, openAuthModal } = useAuth();
  const [confirmReset, setConfirmReset] = useState(false);

  const navItems: { id: AppView; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGridIcon },
    { id: 'editor', label: 'Studio', icon: FileTextIcon },
    { id: 'crm', label: 'CRM', icon: TableIcon },
  ];

  return (
    <header className="h-12 bg-onyx border-b border-white/10 px-4 flex items-center justify-between shrink-0 select-none z-30 font-sans">
      {/* 1. Left: Brand Mark */}
      <div className="flex items-center gap-3">
        <div
          onClick={() => setView('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="h-7 w-7 rounded-lg bg-parchment flex items-center justify-center font-serif text-onyx font-bold text-sm shadow-xs group-hover:scale-105 transition-transform">
            L
          </div>
          <span className="font-serif tracking-tight text-parchment text-base font-semibold">
            Lathala
          </span>
        </div>
      </div>

      {/* 2. Center: Sleek Segmented View Switcher */}
      <nav className="flex items-center p-0.5 rounded-lg bg-white/5 border border-white/10 text-[11px] font-medium">
        {navItems.map(({ id, label, icon: Icon }) => {
          const isActive = view === id;
          return (
            <button
              key={id}
              onClick={() => setView(id)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
                isActive
                  ? 'bg-white/15 text-parchment font-semibold shadow-2xs'
                  : 'text-parchment/60 hover:text-parchment hover:bg-white/5'
              }`}
            >
              <Icon size={12} strokeWidth={isActive ? 2 : 1.5} />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      {/* 3. Right: New Dispatch, Settings, User Profile */}
      <div className="flex items-center gap-2">
        {/* Quick New Project Button */}
        <button
          onClick={() => createProject()}
          className="h-7.5 px-3 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs active:scale-95"
        >
          <PlusIcon size={13} />
          <span>New Dispatch</span>
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          title="Configure Supabase, Clerk, Google Sheets, SMTP"
          className="h-7.5 w-7.5 rounded-lg text-parchment/60 hover:text-parchment hover:bg-white/5 flex items-center justify-center transition-colors"
        >
          <SettingsIcon size={14} />
        </button>

        {/* User Account / Clerk SSO Trigger */}
        <button
          onClick={() => openAuthModal('signin')}
          title={user?.name ? `${user.name} (${user.role})` : 'Sign In with Clerk'}
          className="h-7 w-7 rounded-full overflow-hidden ring-1 ring-white/20 hover:ring-white/40 transition-all shrink-0 ml-0.5"
        >
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-white/10 flex items-center justify-center text-parchment">
              <UserIcon size={12} />
            </div>
          )}
        </button>

        {/* Reset Demo Data Button */}
        {confirmReset ? (
          <div className="flex items-center gap-1 bg-red-950/80 border border-red-800/80 px-2 py-0.5 rounded-lg text-xs text-red-200 animate-in fade-in">
            <span className="text-[10px]">Reset?</span>
            <button
              onClick={() => {
                resetAllData();
                setConfirmReset(false);
              }}
              className="px-1.5 py-0.5 bg-red-700 hover:bg-red-600 rounded text-white font-bold text-[9px]"
            >
              Yes
            </button>
            <button
              onClick={() => setConfirmReset(false)}
              className="px-1.5 py-0.5 bg-white/10 hover:bg-white/20 rounded text-white text-[9px]"
            >
              No
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmReset(true)}
            title="Reset workspace to clean editorial demo data"
            className="h-7.5 w-7.5 rounded-lg text-parchment/40 hover:text-parchment hover:bg-white/5 flex items-center justify-center transition-colors"
          >
            <RotateCcwIcon size={12} />
          </button>
        )}
      </div>
    </header>
  );
}
