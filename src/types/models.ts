export type NetworkId =
  | 'instagram'
  | 'youtube'
  | 'tiktok'
  | 'x'
  | 'threads'
  | 'mastodon'
  | 'bluesky'
  | 'reddit';

export type PostKind = 'video' | 'text';

export type NetworkAvailability = 'official' | 'limited' | 'demo';

export type IntegrationMode = 'oauth' | 'demo' | 'manual';

export type ConsentPurpose = 'essential' | 'personalization' | 'analytics' | 'location';

export type ThemePreference = 'system' | 'light' | 'dark';

export interface Author {
  id: string;
  name: string;
  handle: string;
  avatarUrl?: string;
  verified?: boolean;
}

export interface FeedPost {
  id: string;
  network: NetworkId;
  kind: PostKind;
  author: Author;
  caption: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  likes: number;
  comments: number;
  reposts: number;
  postedAt: string;
  originalUrl: string;
  likedByMe: boolean;
  repostedByMe: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  authorName: string;
  authorHandle: string;
  authorAvatarUrl?: string;
  body: string;
  createdAt: string;
  isMine: boolean;
}

export interface DopamineProfile {
  id: string;
  displayName: string;
  username: string;
  birthDate: string;
  avatarUrl?: string;
  locationLabel?: string;
  locationConsent: boolean;
  onboardingCompleted: boolean;
  privacyPolicyVersion: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileInput {
  displayName: string;
  username: string;
  birthDate: string;
  avatarUrl?: string;
  locationLabel?: string;
  locationConsent: boolean;
  termsAccepted: boolean;
  privacyPolicyVersion: string;
}

export interface AppSettings {
  performanceMode: boolean;
  theme: ThemePreference;
  reducedMotion: boolean;
  dataSaver: boolean;
  autoplay: boolean;
}

export interface ConnectedAccount {
  id: string;
  network: NetworkId;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  integrationMode: IntegrationMode;
  connectedAt: string;
}

export interface Consent {
  purpose: ConsentPurpose;
  granted: boolean;
  policyVersion: string;
  createdAt: string;
}

export interface ConsentInput {
  purpose: ConsentPurpose;
  granted: boolean;
}

export interface SessionUser {
  id: string;
  email: string;
  isDemo: boolean;
}
