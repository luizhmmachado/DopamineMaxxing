import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEYS } from '@/lib/storage';
import type { SessionUser } from '@/types/models';

const DEMO_USER_ID = 'demo-user';

export async function readDemoSession(): Promise<SessionUser | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.demoSession);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as Partial<SessionUser>;
    if (parsed.id !== DEMO_USER_ID) {
      return null;
    }
    return {
      id: DEMO_USER_ID,
      email: parsed.email ?? 'demo@dopaminemaxxing.app',
      isDemo: true,
    };
  } catch {
    return null;
  }
}

export async function writeDemoSession(email?: string): Promise<SessionUser> {
  const session: SessionUser = {
    id: DEMO_USER_ID,
    email: email?.trim() || 'demo@dopaminemaxxing.app',
    isDemo: true,
  };
  await AsyncStorage.setItem(STORAGE_KEYS.demoSession, JSON.stringify(session));
  return session;
}

export async function clearDemoSession(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.demoSession);
}
