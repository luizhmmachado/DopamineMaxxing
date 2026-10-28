import type { Session, User } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AppState, Platform } from 'react-native';
import * as Linking from 'expo-linking';

import { clearDemoSession, readDemoSession, writeDemoSession } from '@/lib/demo/auth';
import { isSupabaseConfigured, supabase } from '@/lib/supabase/client';
import type { SessionUser } from '@/types/models';

type AuthStatus = 'loading' | 'signedOut' | 'signedIn';

interface AuthResult {
  needsEmailConfirmation: boolean;
}

interface AuthContextValue {
  status: AuthStatus;
  user: SessionUser | null;
  isDemoMode: boolean;
  supabaseEnabled: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  signInDemo: (email?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function mapUser(user: User | null | undefined): SessionUser | null {
  if (!user) {
    return null;
  }
  return {
    id: user.id,
    email: user.email ?? '',
    isDemo: false,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<SessionUser | null>(null);
  const demoActive = useRef(false);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      const demo = await readDemoSession();
      if (!active) {
        return;
      }
      if (demo) {
        demoActive.current = true;
        setUser(demo);
        setStatus('signedIn');
        return;
      }
      if (!supabase) {
        setStatus('signedOut');
        return;
      }
      try {
        const { data } = await supabase.auth.getSession();
        if (!active) {
          return;
        }
        const mapped = mapUser(data.session?.user);
        setUser(mapped);
        setStatus(mapped ? 'signedIn' : 'signedOut');
      } catch {
        if (active) {
          setStatus('signedOut');
        }
      }
    }

    bootstrap();

    let subscription: { unsubscribe: () => void } | null = null;
    if (supabase) {
      const { data } = supabase.auth.onAuthStateChange((_event, session: Session | null) => {
        if (!active || demoActive.current) {
          return;
        }
        const mapped = mapUser(session?.user);
        setUser(mapped);
        setStatus(mapped ? 'signedIn' : 'signedOut');
      });
      subscription = data.subscription;
    }

    return () => {
      active = false;
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const client = supabase;
    if (!client || Platform.OS === 'web') {
      return;
    }
    const listener = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        client.auth.startAutoRefresh();
      } else {
        client.auth.stopAutoRefresh();
      }
    });
    if (AppState.currentState === 'active') {
      client.auth.startAutoRefresh();
    }
    return () => {
      listener.remove();
      client.auth.stopAutoRefresh();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        throw error;
      }
      if (!data.session) {
        throw new Error('Confirme seu e-mail antes de entrar.');
      }
      await clearDemoSession().catch(() => undefined);
      demoActive.current = false;
      setUser(mapUser(data.user));
      setStatus('signedIn');
      return { needsEmailConfirmation: false };
    }
    const demo = await writeDemoSession(email);
    demoActive.current = true;
    setUser(demo);
    setStatus('signedIn');
    return { needsEmailConfirmation: false };
  }, []);

  const signUp = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    if (supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: Linking.createURL('/'),
        },
      });
      if (error) {
        throw error;
      }
      if (data.session) {
        await clearDemoSession();
        demoActive.current = false;
        setUser(mapUser(data.user));
        setStatus('signedIn');
        return { needsEmailConfirmation: false };
      }
      return { needsEmailConfirmation: true };
    }
    const demo = await writeDemoSession(email);
    demoActive.current = true;
    setUser(demo);
    setStatus('signedIn');
    return { needsEmailConfirmation: false };
  }, []);

  const signInDemo = useCallback(async (email?: string) => {
    const demo = await writeDemoSession(email);
    demoActive.current = true;
    setUser(demo);
    setStatus('signedIn');
  }, []);

  const signOut = useCallback(async () => {
    demoActive.current = false;
    await clearDemoSession().catch(() => undefined);
    if (supabase) {
      await supabase.auth.signOut().catch(() => undefined);
    }
    setUser(null);
    setStatus('signedOut');
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      isDemoMode: Boolean(user?.isDemo) || !isSupabaseConfigured,
      supabaseEnabled: isSupabaseConfigured,
      signIn,
      signUp,
      signInDemo,
      signOut,
    }),
    [status, user, signIn, signUp, signInDemo, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
