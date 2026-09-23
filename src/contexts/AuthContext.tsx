import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../types/studio';

export interface AuthContextValue {
  user: UserProfile | null;
  isSignedIn: boolean;
  isClerkConfigured: boolean;
  clerkPublishableKey: string;
  login: (email: string, name?: string) => void;
  signup: (name: string, email: string) => void;
  logout: () => void;
  switchUser: (preset: 'director' | 'designer') => void;
  isAuthModalOpen: boolean;
  openAuthModal: (mode?: 'signin' | 'signup') => void;
  closeAuthModal: () => void;
  authModalMode: 'signin' | 'signup';
}

export const DEMO_PROFILES: Record<'director' | 'designer', UserProfile> = {
  director: {
    id: 'user_director_01',
    name: 'Elena Rostova',
    email: 'elena.rostova@lathala.studio',
    role: 'Editorial Director',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    isClerkAuthenticated: false,
  },
  designer: {
    id: 'user_designer_02',
    name: 'Marcus Vance',
    email: 'marcus.vance@lathala.studio',
    role: 'Lead Visual Designer',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    isClerkAuthenticated: false,
  },
};

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_AUTH_KEY = 'lathala_current_user_v2';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Check Clerk config from env or storage
  const [clerkKey, setClerkKey] = useState<string>(() => {
    const envKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';
    if (envKey && !envKey.includes('YOUR_')) return envKey;
    try {
      const raw = localStorage.getItem('lathala_integrations_v2');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.clerkPublishableKey) return parsed.clerkPublishableKey;
      }
    } catch {}
    return '';
  });

  const isClerkConfigured = clerkKey.startsWith('pk_') && !clerkKey.includes('placeholder');

  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_AUTH_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    // Strict startup auth: require sign-up or login immediately
    return null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_AUTH_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_AUTH_KEY);
    }
  }, [user]);

  const login = useCallback((email: string, name?: string) => {
    const newUser: UserProfile = {
      id: `usr_${Math.random().toString(36).slice(2, 9)}`,
      name: name || email.split('@')[0],
      email,
      role: 'Editor',
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(email)}`,
      isClerkAuthenticated: false,
    };
    setUser(newUser);
    setIsAuthModalOpen(false);
  }, []);

  const signup = useCallback((name: string, email: string) => {
    const newUser: UserProfile = {
      id: `usr_${Math.random().toString(36).slice(2, 9)}`,
      name,
      email,
      role: 'Publisher',
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      isClerkAuthenticated: false,
    };
    setUser(newUser);
    setIsAuthModalOpen(false);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const switchUser = useCallback((preset: 'director' | 'designer') => {
    setUser(DEMO_PROFILES[preset]);
  }, []);

  const openAuthModal = useCallback((mode: 'signin' | 'signup' = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isSignedIn: !!user,
        isClerkConfigured,
        clerkPublishableKey: clerkKey,
        login,
        signup,
        logout,
        switchUser,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        authModalMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
