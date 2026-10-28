import type {
  AppSettings,
  Comment,
  ConnectedAccount,
  Consent,
  DopamineProfile,
  FeedPost,
  NetworkId,
  PostKind,
  ThemePreference,
} from '@/types/models';

type Row = Record<string, unknown>;

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function asBoolean(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function asRecord(value: unknown): Row {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Row) : {};
}

export function mapProfile(row: Row): DopamineProfile {
  return {
    id: asString(row.id),
    displayName: asString(row.display_name),
    username: asString(row.username),
    birthDate: asString(row.birth_date),
    avatarUrl: asString(row.avatar_url) || undefined,
    locationLabel: asString(row.location_label) || undefined,
    locationConsent: asBoolean(row.location_consent),
    onboardingCompleted: asBoolean(row.onboarding_completed),
    privacyPolicyVersion: asString(row.privacy_policy_version),
    createdAt: asString(row.created_at),
    updatedAt: asString(row.updated_at),
  };
}

export function mapSettings(row: Row): AppSettings {
  const theme = asString(row.theme, 'system') as ThemePreference;
  return {
    performanceMode: asBoolean(row.performance_mode),
    theme: theme === 'light' || theme === 'dark' ? theme : 'system',
    reducedMotion: asBoolean(row.reduced_motion),
    dataSaver: asBoolean(row.data_saver),
    autoplay: asBoolean(row.autoplay, true),
  };
}

export function mapConnection(row: Row): ConnectedAccount {
  const mode = asString(row.integration_mode, 'demo');
  return {
    id: asString(row.id),
    network: asString(row.network) as NetworkId,
    username: asString(row.username) || undefined,
    displayName: asString(row.display_name) || undefined,
    avatarUrl: asString(row.avatar_url) || undefined,
    integrationMode: mode === 'oauth' || mode === 'manual' ? mode : 'demo',
    connectedAt: asString(row.connected_at),
  };
}

export function mapConsent(row: Row): Consent {
  return {
    purpose: asString(row.purpose) as Consent['purpose'],
    granted: asBoolean(row.granted),
    policyVersion: asString(row.policy_version),
    createdAt: asString(row.created_at),
  };
}

export function mapPost(row: Row): FeedPost {
  const interactions = Array.isArray(row.post_interactions) ? row.post_interactions : [];
  const interactionTypes = interactions.map((item) => asString(asRecord(item).type));
  return {
    id: asString(row.id),
    network: asString(row.network) as NetworkId,
    kind: asString(row.kind, 'text') as PostKind,
    author: {
      id: `${asString(row.network)}:${asString(row.author_handle)}`,
      name: asString(row.author_name),
      handle: asString(row.author_handle),
      avatarUrl: asString(row.author_avatar_url) || undefined,
      verified: asBoolean(row.author_verified),
    },
    caption: asString(row.caption),
    mediaUrl: asString(row.media_url) || undefined,
    thumbnailUrl: asString(row.thumbnail_url) || undefined,
    likes: asNumber(row.likes_count),
    comments: asNumber(row.comments_count),
    reposts: asNumber(row.reposts_count),
    postedAt: asString(row.posted_at),
    originalUrl: asString(row.source_url),
    likedByMe: interactionTypes.includes('like'),
    repostedByMe: interactionTypes.includes('repost'),
  };
}

export function mapComment(row: Row, currentUserId?: string): Comment {
  const profileValue = row.profiles;
  const profile = Array.isArray(profileValue) ? asRecord(profileValue[0]) : asRecord(profileValue);
  return {
    id: asString(row.id),
    postId: asString(row.post_id),
    authorName: asString(profile.display_name, 'Você'),
    authorHandle: asString(profile.username, 'voce'),
    authorAvatarUrl: asString(profile.avatar_url) || undefined,
    body: asString(row.body),
    createdAt: asString(row.created_at),
    isMine: currentUserId ? asString(row.user_id) === currentUserId : true,
  };
}
