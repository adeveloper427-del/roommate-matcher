import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  AuthSession,
  getSession as fetchSession,
  login as loginService,
  logout as logoutService,
  register as registerService,
} from '../services/authService';
import { UserRole } from '../types';

interface AuthContextValue {
  session: AuthSession | null;
  isLoading: boolean;
  isHydrating: boolean;
  register: (email: string, password: string, role: UserRole, fullName: string) => Promise<AuthSession>;
  login: (email: string, password: string) => Promise<AuthSession>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setSession(await fetchSession());
      } finally {
        setIsHydrating(false);
      }
    })();

    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, authSession) => {
      if (!authSession?.user) {
        setSession(null);
        return;
      }
      setSession(await fetchSession());
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isLoading,
      isHydrating,
      register: async (email, password, role, fullName) => {
        setIsLoading(true);
        try {
          const result = await registerService(email, password, role, fullName);
          setSession(result);
          return result;
        } finally {
          setIsLoading(false);
        }
      },
      login: async (email, password) => {
        setIsLoading(true);
        try {
          const result = await loginService(email, password);
          setSession(result);
          return result;
        } finally {
          setIsLoading(false);
        }
      },
      logout: async () => {
        await logoutService();
        setSession(null);
      },
    }),
    [session, isLoading, isHydrating]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
