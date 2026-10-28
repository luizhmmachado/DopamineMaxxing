import type { FeedPost, NetworkId } from '../types/models';

const NETWORK_NAMES: Record<NetworkId, string> = {
  instagram: 'Instagram',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  x: 'X',
  threads: 'Threads',
  mastodon: 'Mastodon',
  bluesky: 'Bluesky',
  reddit: 'Reddit',
};

export function buildShareText(post: Pick<FeedPost, 'author' | 'caption' | 'network' | 'originalUrl'>): string {
  const network = NETWORK_NAMES[post.network] ?? post.network;
  const caption = post.caption.trim().replace(/\s+/g, ' ');
  const excerpt = caption.length > 180 ? `${caption.slice(0, 179).trimEnd()}…` : caption;
  const author = post.author.handle ? `@${post.author.handle.replace(/^@/, '')}` : post.author.name;
  return `${author} no ${network}: ${excerpt}\n${post.originalUrl}`;
}

export function buildWhatsAppUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
