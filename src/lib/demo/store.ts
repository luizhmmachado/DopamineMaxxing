import * as FileSystem from 'expo-file-system/legacy';

import { readDemoSession } from '@/lib/demo/auth';
import { DEMO_COMMENTS, DEMO_POSTS } from '@/lib/demo/data';
import { readJson, removeKey, STORAGE_KEYS, writeJson } from '@/lib/storage';
import type {
  AppSettings,
  Comment,
  ConnectedAccount,
  Consent,
  ConsentInput,
  DopamineProfile,
  FeedPost,
  NetworkId,
  PostKind,
  ProfileInput,
} from '@/types/models';
import { PRIVACY_POLICY_VERSION } from '@/lib/validation';

interface DemoState {
  profile: DopamineProfile | null;
  settings: AppSettings;
  connections: ConnectedAccount[];
  consents: Consent[];
  interactions: {
    likes: string[];
    reposts: string[];
  };
  comments: Comment[];
}

export const DEFAULT_SETTINGS: AppSettings = {
  performanceMode: false,
  theme: 'system',
  reducedMotion: false,
  dataSaver: false,
  autoplay: true,
};

function stateKey(userId: string): string {
  return `${STORAGE_KEYS.demoStatePrefix}${userId}`;
}

function initialState(): DemoState {
  return {
    profile: null,
    settings: { ...DEFAULT_SETTINGS },
    connections: [],
    consents: [],
    interactions: { likes: [], reposts: [] },
    comments: DEMO_COMMENTS.map((comment) => ({ ...comment })),
  };
}

async function loadState(userId: string): Promise<DemoState> {
  const stored = await readJson<Partial<DemoState>>(stateKey(userId));
  if (!stored) {
    const fresh = initialState();
    await saveState(userId, fresh);
    return fresh;
  }
  return {
    profile: stored.profile ?? null,
    settings: { ...DEFAULT_SETTINGS, ...(stored.settings ?? {}) },
    connections: stored.connections ?? [],
    consents: stored.consents ?? [],
    interactions: {
      likes: stored.interactions?.likes ?? [],
      reposts: stored.interactions?.reposts ?? [],
    },
    comments: stored.comments ?? initialState().comments,
  };
}

async function saveState(userId: string, state: DemoState): Promise<void> {
  await writeJson(stateKey(userId), state);
}

function withInteractions(post: FeedPost, state: DemoState): FeedPost {
  const likedByMe = state.interactions.likes.includes(post.id);
  const repostedByMe = state.interactions.reposts.includes(post.id);
  return {
    ...post,
    likedByMe,
    repostedByMe,
    likes: post.likes + (likedByMe ? 1 : 0),
    reposts: post.reposts + (repostedByMe ? 1 : 0),
    comments: post.comments + state.comments.filter((comment) => comment.postId === post.id).length,
  };
}

export function createDemoRepository(userId: string) {
  return {
    async listPosts(kind: PostKind): Promise<FeedPost[]> {
      const state = await loadState(userId);
      return DEMO_POSTS.filter((post) => post.kind === kind).map((post) =>
        withInteractions(post, state),
      );
    },

    async getPost(postId: string): Promise<FeedPost | null> {
      const post = DEMO_POSTS.find((item) => item.id === postId);
      if (!post) {
        return null;
      }
      const state = await loadState(userId);
      return withInteractions(post, state);
    },

    async toggleLike(postId: string): Promise<boolean> {
      const state = await loadState(userId);
      const likes = new Set(state.interactions.likes);
      const liked = !likes.has(postId);
      if (liked) {
        likes.add(postId);
      } else {
        likes.delete(postId);
      }
      state.interactions.likes = [...likes];
      await saveState(userId, state);
      return liked;
    },

    async toggleRepost(postId: string): Promise<boolean> {
      const state = await loadState(userId);
      const reposts = new Set(state.interactions.reposts);
      const reposted = !reposts.has(postId);
      if (reposted) {
        reposts.add(postId);
      } else {
        reposts.delete(postId);
      }
      state.interactions.reposts = [...reposts];
      await saveState(userId, state);
      return reposted;
    },

    async listComments(postId: string): Promise<Comment[]> {
      const state = await loadState(userId);
      return state.comments
        .filter((comment) => comment.postId === postId)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    },

    async addComment(postId: string, body: string): Promise<Comment> {
      const state = await loadState(userId);
      const profile = state.profile;
      const comment: Comment = {
        id: `demo-comment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        postId,
        authorName: profile?.displayName ?? 'Você',
        authorHandle: profile?.username ?? 'voce',
        authorAvatarUrl: profile?.avatarUrl,
        body: body.trim(),
        createdAt: new Date().toISOString(),
        isMine: true,
      };
      state.comments.push(comment);
      await saveState(userId, state);
      return comment;
    },

    async deleteComment(commentId: string): Promise<void> {
      const state = await loadState(userId);
      state.comments = state.comments.filter((comment) => comment.id !== commentId);
      await saveState(userId, state);
    },

    async getProfile(): Promise<DopamineProfile | null> {
      const state = await loadState(userId);
      return state.profile;
    },

    async saveProfile(input: ProfileInput): Promise<DopamineProfile> {
      const state = await loadState(userId);
      const existing = state.profile;
      const now = new Date().toISOString();
      const profile: DopamineProfile = {
        id: userId,
        displayName: input.displayName.trim(),
        username: input.username.trim().toLowerCase(),
        birthDate: input.birthDate,
        avatarUrl: input.avatarUrl,
        locationLabel: input.locationConsent ? input.locationLabel : undefined,
        locationConsent: input.locationConsent,
        onboardingCompleted: true,
        privacyPolicyVersion: input.privacyPolicyVersion,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      };
      state.profile = profile;
      await saveState(userId, state);
      const base = FileSystem.documentDirectory;
      const previousAvatar = existing?.avatarUrl;
      if (
        base &&
        previousAvatar?.startsWith(`${base}avatars/`) &&
        previousAvatar !== input.avatarUrl
      ) {
        await FileSystem.deleteAsync(previousAvatar, { idempotent: true }).catch(() => undefined);
      }
      return profile;
    },

    async uploadAvatar(uri: string): Promise<string> {
      if (/^(https?:|data:)/i.test(uri)) {
        return uri;
      }
      const base = FileSystem.documentDirectory;
      if (!base) {
        return uri;
      }
      try {
        const directory = `${base}avatars`;
        await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
        const destination = `${directory}/avatar-${userId}.jpg`;
        await FileSystem.deleteAsync(destination, { idempotent: true });
        await FileSystem.copyAsync({ from: uri, to: destination });
        return destination;
      } catch {
        return uri;
      }
    },

    async listConnections(): Promise<ConnectedAccount[]> {
      const state = await loadState(userId);
      return state.connections;
    },

    async setConnection(network: NetworkId, connected: boolean): Promise<void> {
      const state = await loadState(userId);
      if (connected) {
        if (!state.connections.some((item) => item.network === network)) {
          state.connections.push({
            id: `demo-connection-${network}`,
            network,
            username: state.profile?.username,
            displayName: state.profile?.displayName,
            integrationMode: 'demo',
            connectedAt: new Date().toISOString(),
          });
        }
      } else {
        state.connections = state.connections.filter((item) => item.network !== network);
      }
      await saveState(userId, state);
    },

    async getSettings(): Promise<AppSettings> {
      const state = await loadState(userId);
      return state.settings;
    },

    async saveSettings(settings: AppSettings): Promise<AppSettings> {
      const state = await loadState(userId);
      state.settings = settings;
      await saveState(userId, state);
      return settings;
    },

    async saveConsents(consents: ConsentInput[]): Promise<void> {
      const state = await loadState(userId);
      const now = new Date().toISOString();
      const next = new Map(state.consents.map((consent) => [consent.purpose, consent]));
      for (const consent of consents) {
        next.set(consent.purpose, {
          purpose: consent.purpose,
          granted: consent.granted,
          policyVersion: PRIVACY_POLICY_VERSION,
          createdAt: now,
        });
      }
      state.consents = [...next.values()];
      await saveState(userId, state);
    },

    async getConsents(): Promise<Consent[]> {
      const state = await loadState(userId);
      return state.consents;
    },

    async exportData(): Promise<string> {
      const state = await loadState(userId);
      const session = await readDemoSession();
      return JSON.stringify(
        {
          app: 'DopamineMaxxing',
          exportedAt: new Date().toISOString(),
          policyVersion: PRIVACY_POLICY_VERSION,
          account: {
            id: userId,
            email: session?.email ?? 'demo@dopaminemaxxing.app',
          },
          ...state,
        },
        null,
        2,
      );
    },

    async deleteAccount(): Promise<void> {
      const state = await loadState(userId);
      const avatar = state.profile?.avatarUrl;
      const base = FileSystem.documentDirectory;
      if (base && avatar?.startsWith(`${base}avatars/`)) {
        await FileSystem.deleteAsync(avatar, { idempotent: true }).catch(() => undefined);
      }
      await removeKey(stateKey(userId));
    },
  };
}

export type DemoRepository = ReturnType<typeof createDemoRepository>;
