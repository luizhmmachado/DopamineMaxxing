import { Linking, Share } from 'react-native';

import type { FeedPost } from '@/types/models';
import { buildShareText, buildWhatsAppUrl } from '@/lib/share-utils';

export async function shareNative(post: FeedPost): Promise<void> {
  await Share.share({
    message: buildShareText(post),
    title: `Post de ${post.author.name}`,
  });
}

export async function shareToWhatsApp(post: FeedPost): Promise<void> {
  const url = buildWhatsAppUrl(buildShareText(post));
  try {
    await Linking.openURL(url);
  } catch {
    await shareNative(post);
  }
}

export async function openOriginal(post: FeedPost): Promise<void> {
  try {
    await Linking.openURL(post.originalUrl);
  } catch {
    await Share.share({ message: post.originalUrl });
  }
}
