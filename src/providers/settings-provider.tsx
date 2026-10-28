import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { DEFAULT_SETTINGS } from '@/lib/demo/store';
import { useRepository } from '@/hooks/use-repository';
import { useAuth } from '@/providers/auth-provider';
import type { AppSettings } from '@/types/models';

interface SettingsContextValue {
  settings: AppSettings;
  loading: boolean;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  reload: () => Promise<void>;
}

interface SettingsState {
  userId: string | null;
  settings: AppSettings;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const repository = useRepository();
  const userId = user?.id ?? null;
  const [state, setState] = useState<SettingsState>({
    userId: null,
    settings: { ...DEFAULT_SETTINGS },
  });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!repository || !userId) {
      return;
    }
    setLoading(true);
    try {
      const loaded = await repository.getSettings();
      setState({ userId, settings: { ...DEFAULT_SETTINGS, ...loaded } });
    } catch {
      setState({ userId, settings: { ...DEFAULT_SETTINGS } });
    } finally {
      setLoading(false);
    }
  }, [repository, userId]);

  useEffect(() => {
    let active = true;
    if (!repository || !userId) {
      return;
    }
    repository
      .getSettings()
      .then((loaded) => {
        if (active) {
          setState({ userId, settings: { ...DEFAULT_SETTINGS, ...loaded } });
        }
      })
      .catch(() => {
        if (active) {
          setState({ userId, settings: { ...DEFAULT_SETTINGS } });
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [repository, userId]);

  const updateSetting = useCallback(
    <K extends keyof AppSettings,>(key: K, value: AppSettings[K]) => {
      if (!userId) {
        return;
      }
      setState((previous) => {
        const base =
          previous.userId === userId ? previous.settings : { ...DEFAULT_SETTINGS };
        const next = { ...base, [key]: value };
        repository?.saveSettings(next).catch(() => undefined);
        return { userId, settings: next };
      });
    },
    [repository, userId],
  );

  const value = useMemo<SettingsContextValue>(() => {
    const matchesUser = Boolean(user) && state.userId === userId;
    return {
      settings: matchesUser ? state.settings : { ...DEFAULT_SETTINGS },
      loading: user ? !matchesUser || loading : false,
      updateSetting,
      reload: load,
    };
  }, [state, loading, user, userId, updateSetting, load]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings deve ser usado dentro de SettingsProvider');
  }
  return context;
}
