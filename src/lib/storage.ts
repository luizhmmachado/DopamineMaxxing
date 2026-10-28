import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const CHUNK_SIZE = 1800;
const COUNT_SUFFIX = '.chunks';

export const STORAGE_KEYS = {
  demoSession: 'dm.demo.session',
  demoStatePrefix: 'dm.demo.state.',
} as const;

function chunkKey(key: string, index: number): string {
  return `${key}.${index}`;
}

async function secureGet(key: string): Promise<string | null> {
  const countRaw = await SecureStore.getItemAsync(`${key}${COUNT_SUFFIX}`);
  if (!countRaw) {
    return SecureStore.getItemAsync(key);
  }
  const count = Number.parseInt(countRaw, 10);
  if (!Number.isFinite(count) || count <= 0) {
    return null;
  }
  const parts = await Promise.all(
    Array.from({ length: count }, (_, index) => SecureStore.getItemAsync(chunkKey(key, index))),
  );
  if (parts.some((part) => part === null)) {
    return null;
  }
  return parts.join('');
}

async function secureSet(key: string, value: string): Promise<void> {
  const previousRaw = await SecureStore.getItemAsync(`${key}${COUNT_SUFFIX}`);
  const previousCount = previousRaw ? Number.parseInt(previousRaw, 10) : 0;
  const chunks: string[] = [];
  for (let index = 0; index < value.length; index += CHUNK_SIZE) {
    chunks.push(value.slice(index, index + CHUNK_SIZE));
  }
  await Promise.all(chunks.map((chunk, index) => SecureStore.setItemAsync(chunkKey(key, index), chunk)));
  await SecureStore.setItemAsync(`${key}${COUNT_SUFFIX}`, String(chunks.length));
  if (Number.isFinite(previousCount) && previousCount > chunks.length) {
    await Promise.all(
      Array.from({ length: previousCount - chunks.length }, (_, offset) =>
        SecureStore.deleteItemAsync(chunkKey(key, chunks.length + offset)),
      ),
    );
  }
}

async function secureRemove(key: string): Promise<void> {
  const countRaw = await SecureStore.getItemAsync(`${key}${COUNT_SUFFIX}`);
  const count = countRaw ? Number.parseInt(countRaw, 10) : 0;
  const deletions: Promise<void>[] = [SecureStore.deleteItemAsync(key), SecureStore.deleteItemAsync(`${key}${COUNT_SUFFIX}`)];
  if (Number.isFinite(count) && count > 0) {
    for (let index = 0; index < count; index += 1) {
      deletions.push(SecureStore.deleteItemAsync(chunkKey(key, index)));
    }
  }
  await Promise.all(deletions);
}

export const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return AsyncStorage.getItem(key);
    }
    try {
      return await secureGet(key);
    } catch {
      return AsyncStorage.getItem(key);
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(key, value);
      return;
    }
    try {
      await secureSet(key, value);
    } catch {
      await AsyncStorage.setItem(key, value);
    }
  },
  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem(key);
      return;
    }
    try {
      await secureRemove(key);
    } catch {
      await AsyncStorage.removeItem(key);
    }
  },
};

export async function readJson<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function writeJson<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function removeKey(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}
