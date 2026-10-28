import { createDemoRepository } from '@/lib/demo/store';
import { createSupabaseRepository } from '@/lib/supabase/repository';
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
  SessionUser,
} from '@/types/models';

export interface Repository {
  listPosts(kind: PostKind): Promise<FeedPost[]>;
  getPost(postId: string): Promise<FeedPost | null>;
  toggleLike(postId: string): Promise<boolean>;
  toggleRepost(postId: string): Promise<boolean>;
  listComments(postId: string): Promise<Comment[]>;
  addComment(postId: string, body: string): Promise<Comment>;
  deleteComment(commentId: string): Promise<void>;
  getProfile(): Promise<DopamineProfile | null>;
  saveProfile(input: ProfileInput): Promise<DopamineProfile>;
  uploadAvatar(uri: string): Promise<string>;
  listConnections(): Promise<ConnectedAccount[]>;
  setConnection(network: NetworkId, connected: boolean): Promise<void>;
  getSettings(): Promise<AppSettings>;
  saveSettings(settings: AppSettings): Promise<AppSettings>;
  saveConsents(consents: ConsentInput[]): Promise<void>;
  getConsents(): Promise<Consent[]>;
  exportData(): Promise<string>;
  deleteAccount(): Promise<void>;
}

export function createRepository(user: SessionUser): Repository {
  return user.isDemo ? createDemoRepository(user.id) : createSupabaseRepository(user.id);
}
