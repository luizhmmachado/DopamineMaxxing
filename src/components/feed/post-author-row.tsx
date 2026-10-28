import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '@/components/ui/app-text';
import { Avatar } from '@/components/ui/avatar';
import { Spacing } from '@/constants/theme';
import { formatRelativeTime } from '@/lib/format';
import { useAppTheme } from '@/hooks/use-app-theme';
import type { FeedPost } from '@/types/models';

interface PostAuthorRowProps {
  post: FeedPost;
  overlay?: boolean;
  avatarSize?: number;
  showAvatar?: boolean;
  showTime?: boolean;
}

export function PostAuthorRow({
  post,
  overlay = false,
  avatarSize = 40,
  showAvatar = true,
  showTime = true,
}: PostAuthorRowProps) {
  const { colors } = useAppTheme();
  const textColor = overlay ? '#FFFFFF' : colors.text;
  const secondary = overlay ? 'rgba(255,255,255,0.78)' : colors.textSecondary;

  return (
    <View style={styles.row}>
      {showAvatar ? (
        <Avatar
          name={post.author.name}
          uri={post.author.avatarUrl}
          size={avatarSize}
          ringColor={overlay ? 'rgba(255,255,255,0.4)' : colors.border}
        />
      ) : null}
      <View style={styles.texts}>
        <View style={styles.nameRow}>
          <AppText variant="bodyStrong" color={textColor} numberOfLines={1}>
            {post.author.name}
          </AppText>
          {post.author.verified ? (
            <Ionicons name="checkmark-circle" size={15} color={overlay ? '#7DD3FC' : colors.primary} />
          ) : null}
        </View>
        <AppText variant="caption" color={secondary} numberOfLines={1}>
          {`@${post.author.handle}${showTime ? ` · ${formatRelativeTime(post.postedAt)}` : ''}`}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  texts: {
    flex: 1,
    gap: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
});
