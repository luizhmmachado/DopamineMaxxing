import { Image } from 'expo-image';
import * as Linking from 'expo-linking';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import { FeedActions } from '@/components/feed/feed-actions';
import { NetworkBadge } from '@/components/ui/network-badge';
import { PostAuthorRow } from '@/components/feed/post-author-row';
import { Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { usePerformance } from '@/hooks/use-performance';
import type { FeedPost } from '@/types/models';

interface TextFeedItemProps {
  post: FeedPost;
  onLike: () => void;
  onComment: () => void;
  onRepost: () => void;
  onShare: () => void;
  onOpenNetwork?: () => void;
}

export function TextFeedItem({
  post,
  onLike,
  onComment,
  onRepost,
  onShare,
  onOpenNetwork,
}: TextFeedItemProps) {
  const { colors } = useAppTheme();
  const { animationsEnabled, dataSaver } = usePerformance();

  const handleOpenNetwork = () => {
    if (!post.originalUrl) return;
    Linking.openURL(post.originalUrl).catch(() => undefined);
  };

  return (
    <Card style={styles.card}>
      <PostAuthorRow post={post} avatarSize={40} />
      <NetworkBadge network={post.network} compact />
      <AppText variant="body" style={styles.caption}>
        {post.caption}
      </AppText>
      {post.thumbnailUrl ? (
        <Image
          source={{ uri: post.thumbnailUrl }}
          style={[styles.media, { backgroundColor: colors.surfaceAlt }]}
          contentFit="cover"
          transition={animationsEnabled ? 180 : 0}
          cachePolicy={dataSaver ? 'memory' : 'memory-disk'}
          recyclingKey={post.id}
          accessibilityLabel={`Imagem do post de ${post.author.name}`}
        />
      ) : null}
      <View style={styles.actionsRow}>
        <FeedActions
          post={post}
          orientation="horizontal"
          onLike={onLike}
          onComment={onComment}
          onRepost={onRepost}
          onShare={onShare}
          onOpenNetwork={onOpenNetwork ?? handleOpenNetwork}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.lg,
    gap: Spacing.md,
    borderRadius: Radius.lg,
  },
  caption: {
    fontSize: 15,
    lineHeight: 22,
  },
  media: {
    width: '100%',
    height: 140,
    borderRadius: Radius.md,
  },
  actionsRow: {
    paddingTop: Spacing.xs,
  },
});
