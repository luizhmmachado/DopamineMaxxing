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
import { requireSupabase } from '@/lib/supabase/client';
import {
  mapComment,
  mapConnection,
  mapConsent,
  mapPost,
  mapProfile,
  mapSettings,
} from '@/lib/supabase/mappers';
import { PRIVACY_POLICY_VERSION } from '@/lib/validation';

const POST_SELECT = '*, post_interactions(type)';
const EXTERNAL_URI_RE = /^(https?:|file:|content:|data:|blob:)/i;

export function createSupabaseRepository(userId: string) {
  async function fetchPosts(kind: PostKind): Promise<FeedPost[]> {
    const supabase = requireSupabase();
    const { data, error } = await supabase
      .from('posts')
      .select(POST_SELECT)
      .eq('user_id', userId)
      .eq('kind', kind)
      .order('posted_at', { ascending: false });
    if (error) {
      throw error;
    }
    return (data ?? []).map((row) => mapPost(row as Record<string, unknown>));
  }

  async function ensureSeed(): Promise<void> {
    const supabase = requireSupabase();
    const { count, error } = await supabase
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);
    if (error) {
      throw error;
    }
    if ((count ?? 0) > 0) {
      return;
    }
    const { error: seedError } = await supabase.rpc('seed_demo_posts');
    if (seedError) {
      throw seedError;
    }
  }

  return {
    async listPosts(kind: PostKind): Promise<FeedPost[]> {
      await ensureSeed();
      return fetchPosts(kind);
    },

    async getPost(postId: string): Promise<FeedPost | null> {
      const supabase = requireSupabase();
      const { data, error } = await supabase
        .from('posts')
        .select(POST_SELECT)
        .eq('id', postId)
        .eq('user_id', userId)
        .maybeSingle();
      if (error) {
        throw error;
      }
      return data ? mapPost(data as Record<string, unknown>) : null;
    },

    async toggleLike(postId: string): Promise<boolean> {
      const supabase = requireSupabase();
      const { data, error } = await supabase
        .from('post_interactions')
        .select('id')
        .eq('user_id', userId)
        .eq('post_id', postId)
        .eq('type', 'like')
        .maybeSingle();
      if (error) {
        throw error;
      }
      if (data) {
        const { error: deleteError } = await supabase
          .from('post_interactions')
          .delete()
          .eq('id', data.id);
        if (deleteError) {
          throw deleteError;
        }
        return false;
      }
      const { error: insertError } = await supabase.from('post_interactions').insert({
        user_id: userId,
        post_id: postId,
        type: 'like',
      });
      if (insertError) {
        throw insertError;
      }
      return true;
    },

    async toggleRepost(postId: string): Promise<boolean> {
      const supabase = requireSupabase();
      const { data, error } = await supabase
        .from('post_interactions')
        .select('id')
        .eq('user_id', userId)
        .eq('post_id', postId)
        .eq('type', 'repost')
        .maybeSingle();
      if (error) {
        throw error;
      }
      if (data) {
        const { error: deleteError } = await supabase
          .from('post_interactions')
          .delete()
          .eq('id', data.id);
        if (deleteError) {
          throw deleteError;
        }
        return false;
      }
      const { error: insertError } = await supabase.from('post_interactions').insert({
        user_id: userId,
        post_id: postId,
        type: 'repost',
      });
      if (insertError) {
        throw insertError;
      }
      return true;
    },

    async listComments(postId: string): Promise<Comment[]> {
      const supabase = requireSupabase();
      const { data, error } = await supabase
        .from('comments')
        .select('id, post_id, user_id, body, created_at, profiles(display_name, username, avatar_url)')
        .eq('post_id', postId)
        .is('deleted_at', null)
        .order('created_at', { ascending: true });
      if (error) {
        throw error;
      }
      return (data ?? []).map((row) => mapComment(row as Record<string, unknown>, userId));
    },

    async addComment(postId: string, body: string): Promise<Comment> {
      const supabase = requireSupabase();
      const { data, error } = await supabase
        .from('comments')
        .insert({ post_id: postId, user_id: userId, body: body.trim() })
        .select('id, post_id, user_id, body, created_at, profiles(display_name, username, avatar_url)')
        .single();
      if (error) {
        throw error;
      }
      return mapComment(data as Record<string, unknown>, userId);
    },

    async deleteComment(commentId: string): Promise<void> {
      const supabase = requireSupabase();
      const { error } = await supabase
        .from('comments')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', commentId)
        .eq('user_id', userId);
      if (error) {
        throw error;
      }
    },

    async getProfile(): Promise<DopamineProfile | null> {
      const supabase = requireSupabase();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      if (error) {
        throw error;
      }
      return data ? mapProfile(data as Record<string, unknown>) : null;
    },

    async saveProfile(input: ProfileInput): Promise<DopamineProfile> {
      const supabase = requireSupabase();
      const now = new Date().toISOString();
      const { data: previous } = await supabase
        .from('profiles')
        .select('avatar_url, terms_accepted_at')
        .eq('id', userId)
        .maybeSingle();
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          display_name: input.displayName.trim(),
          username: input.username.trim().toLowerCase(),
          birth_date: input.birthDate,
          avatar_url: input.avatarUrl ?? null,
          location_label: input.locationConsent ? input.locationLabel ?? null : null,
          location_consent: input.locationConsent,
          onboarding_completed: true,
          privacy_policy_version: input.privacyPolicyVersion || PRIVACY_POLICY_VERSION,
          terms_accepted_at: input.termsAccepted ? previous?.terms_accepted_at ?? now : null,
          updated_at: now,
        })
        .select('*')
        .single();
      if (error) {
        throw error;
      }
      const previousAvatar = previous?.avatar_url;
      if (
        previousAvatar &&
        previousAvatar !== input.avatarUrl &&
        !EXTERNAL_URI_RE.test(previousAvatar)
      ) {
        await supabase.storage
          .from('avatars')
          .remove([previousAvatar])
          .catch(() => undefined);
      }
      return mapProfile(data as Record<string, unknown>);
    },

    async uploadAvatar(uri: string): Promise<string> {
      const supabase = requireSupabase();
      const response = await fetch(uri);
      const arrayBuffer = await response.arrayBuffer();
      const contentType = response.headers.get('content-type') ?? 'image/jpeg';
      const extension = contentType.includes('png')
        ? 'png'
        : contentType.includes('webp')
          ? 'webp'
          : 'jpg';
      const path = `${userId}/avatar-${Date.now()}.${extension}`;
      const { error } = await supabase.storage.from('avatars').upload(path, arrayBuffer, {
        contentType,
        upsert: true,
      });
      if (error) {
        throw error;
      }
      return path;
    },

    async listConnections(): Promise<ConnectedAccount[]> {
      const supabase = requireSupabase();
      const { data, error } = await supabase
        .from('connected_accounts')
        .select('*')
        .eq('user_id', userId)
        .is('revoked_at', null)
        .order('connected_at', { ascending: true });
      if (error) {
        throw error;
      }
      return (data ?? []).map((row) => mapConnection(row as Record<string, unknown>));
    },

    async setConnection(network: NetworkId, connected: boolean): Promise<void> {
      const supabase = requireSupabase();
      if (connected) {
        const { error } = await supabase.from('connected_accounts').upsert(
          {
            user_id: userId,
            network,
            integration_mode: 'demo',
            revoked_at: null,
          },
          { onConflict: 'user_id,network' },
        );
        if (error) {
          throw error;
        }
        return;
      }
      const { error } = await supabase
        .from('connected_accounts')
        .delete()
        .eq('user_id', userId)
        .eq('network', network);
      if (error) {
        throw error;
      }
    },

    async getSettings(): Promise<AppSettings> {
      const supabase = requireSupabase();
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      if (error) {
        throw error;
      }
      if (!data) {
        const defaults = {
          performanceMode: false,
          theme: 'system' as const,
          reducedMotion: false,
          dataSaver: false,
          autoplay: true,
        };
        return defaults;
      }
      return mapSettings(data as Record<string, unknown>);
    },

    async saveSettings(settings: AppSettings): Promise<AppSettings> {
      const supabase = requireSupabase();
      const { error } = await supabase.from('user_settings').upsert({
        user_id: userId,
        performance_mode: settings.performanceMode,
        theme: settings.theme,
        reduced_motion: settings.reducedMotion,
        data_saver: settings.dataSaver,
        autoplay: settings.autoplay,
        updated_at: new Date().toISOString(),
      });
      if (error) {
        throw error;
      }
      return settings;
    },

    async saveConsents(consents: ConsentInput[]): Promise<void> {
      const supabase = requireSupabase();
      const rows = consents.map((consent) => ({
        user_id: userId,
        purpose: consent.purpose,
        granted: consent.granted,
        policy_version: PRIVACY_POLICY_VERSION,
      }));
      const { error } = await supabase
        .from('consents')
        .upsert(rows, { onConflict: 'user_id,purpose,policy_version' });
      if (error) {
        throw error;
      }
    },

    async getConsents(): Promise<Consent[]> {
      const supabase = requireSupabase();
      const { data, error } = await supabase
        .from('consents')
        .select('purpose, granted, policy_version, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) {
        throw error;
      }
      const latest = new Map<string, Consent>();
      for (const row of data ?? []) {
        const consent = mapConsent(row as Record<string, unknown>);
        if (!latest.has(consent.purpose)) {
          latest.set(consent.purpose, consent);
        }
      }
      return [...latest.values()];
    },

    async exportData(): Promise<string> {
      const supabase = requireSupabase();
      const { data, error } = await supabase.rpc('export_my_data');
      if (error) {
        throw error;
      }
      return JSON.stringify(data, null, 2);
    },

    async deleteAccount(): Promise<void> {
      const supabase = requireSupabase();
      try {
        const { data: files } = await supabase.storage.from('avatars').list(userId, {
          limit: 1000,
        });
        const paths = (files ?? [])
          .map((file) => `${userId}/${file.name}`)
          .filter((path) => path.length > userId.length + 1);
        if (paths.length > 0) {
          await supabase.storage.from('avatars').remove(paths);
        }
      } catch {
        // A exclusão da conta não deve falhar por causa de um avatar órfão.
      }
      const { error } = await supabase.rpc('delete_my_account');
      if (error) {
        throw error;
      }
    },
  };
}

export type SupabaseRepository = ReturnType<typeof createSupabaseRepository>;
