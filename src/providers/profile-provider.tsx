import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { useRepository } from '@/hooks/use-repository';
import { useAuth } from '@/providers/auth-provider';
import type {
  ConnectedAccount,
  Consent,
  ConsentInput,
  DopamineProfile,
  NetworkId,
  ProfileInput,
} from '@/types/models';

interface ProfileContextValue {
  profile: DopamineProfile | null;
  connections: ConnectedAccount[];
  consents: Consent[];
  loading: boolean;
  isOnboarded: boolean;
  saveProfile: (input: ProfileInput) => Promise<DopamineProfile>;
  connectNetwork: (network: NetworkId) => Promise<void>;
  disconnectNetwork: (network: NetworkId) => Promise<void>;
  saveConsents: (consents: ConsentInput[]) => Promise<void>;
  uploadAvatar: (uri: string) => Promise<string>;
  refresh: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const repository = useRepository();
  const userId = user?.id ?? null;
  const [profile, setProfile] = useState<DopamineProfile | null>(null);
  const [connections, setConnections] = useState<ConnectedAccount[]>([]);
  const [consents, setConsents] = useState<Consent[]>([]);
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!repository || !userId) {
      setProfile(null);
      setConnections([]);
      setConsents([]);
      setLoadedUserId(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [nextProfile, nextConnections, nextConsents] = await Promise.all([
        repository.getProfile(),
        repository.listConnections(),
        repository.getConsents(),
      ]);
      setProfile(nextProfile);
      setConnections(nextConnections);
      setConsents(nextConsents);
      setLoadedUserId(userId);
    } finally {
      setLoading(false);
    }
  }, [repository, userId]);

  useEffect(() => {
    let active = true;
    if (!repository) {
      return;
    }
    Promise.all([
      repository.getProfile(),
      repository.listConnections(),
      repository.getConsents(),
    ])
      .then(([nextProfile, nextConnections, nextConsents]) => {
        if (active) {
          setProfile(nextProfile);
          setConnections(nextConnections);
          setConsents(nextConsents);
          setLoadedUserId(userId);
        }
      })
      .catch(() => {
        if (active) {
          setProfile(null);
          setConnections([]);
          setConsents([]);
          setLoadedUserId(userId);
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

  const saveProfile = useCallback(
    async (input: ProfileInput) => {
      if (!repository) {
        throw new Error('Sessão indisponível.');
      }
      const next = await repository.saveProfile(input);
      setProfile(next);
      return next;
    },
    [repository],
  );

  const connectNetwork = useCallback(
    async (network: NetworkId) => {
      if (!repository) {
        throw new Error('Sessão indisponível.');
      }
      await repository.setConnection(network, true);
      setConnections(await repository.listConnections());
    },
    [repository],
  );

  const disconnectNetwork = useCallback(
    async (network: NetworkId) => {
      if (!repository) {
        throw new Error('Sessão indisponível.');
      }
      await repository.setConnection(network, false);
      setConnections(await repository.listConnections());
    },
    [repository],
  );

  const saveConsents = useCallback(
    async (nextConsents: ConsentInput[]) => {
      if (!repository) {
        throw new Error('Sessão indisponível.');
      }
      await repository.saveConsents(nextConsents);
      setConsents(await repository.getConsents());
    },
    [repository],
  );

  const uploadAvatar = useCallback(
    async (uri: string) => {
      if (!repository) {
        throw new Error('Sessão indisponível.');
      }
      return repository.uploadAvatar(uri);
    },
    [repository],
  );

  const value = useMemo<ProfileContextValue>(() => {
    const matchesUser = Boolean(user) && loadedUserId === user?.id;
    const visibleProfile = matchesUser && profile?.id === user?.id ? profile : null;
    return {
      profile: visibleProfile,
      connections: matchesUser ? connections : [],
      consents: matchesUser ? consents : [],
      loading: user ? !matchesUser || loading : false,
      isOnboarded: Boolean(visibleProfile?.onboardingCompleted && visibleProfile.username),
      saveProfile,
      connectNetwork,
      disconnectNetwork,
      saveConsents,
      uploadAvatar,
      refresh,
    };
  }, [
    profile,
    connections,
    consents,
    loading,
    user,
    loadedUserId,
    saveProfile,
    connectNetwork,
    disconnectNetwork,
    saveConsents,
    uploadAvatar,
    refresh,
  ]);

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileContextValue {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile deve ser usado dentro de ProfileProvider');
  }
  return context;
}
