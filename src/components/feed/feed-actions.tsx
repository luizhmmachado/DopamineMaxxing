import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '@/components/ui/app-text';
import { getNetwork } from '@/constants/networks';
import { Spacing } from '@/constants/theme';
import { formatCount } from '@/lib/format';
import { useAppTheme } from '@/hooks/use-app-theme';
import type { FeedPost } from '@/types/models';

interface FeedActionsProps {
  post: FeedPost;
  orientation?: 'vertical' | 'horizontal';
  overlay?: boolean;
  onLike: () => void;
  onComment: () => void;
  onRepost: () => void;
  onShare: () => void;
  onOpenNetwork?: () => void;
}

export function FeedActions({
  post,
  orientation = 'horizontal',
  overlay = false,
  onLike,
  onComment,
  onRepost,
  onShare,
  onOpenNetwork,
}: FeedActionsProps) {
  const { colors } = useAppTheme();
  const meta = getNetwork(post.network);
  const baseColor = overlay ? '#FFFFFF' : colors.text;
  const mutedColor = overlay ? 'rgba(255,255,255,0.86)' : colors.textSecondary;
  const likeCount = post.likes;
  const repostCount = post.reposts;

  return (
    <View style={orientation === 'vertical' ? styles.vertical : styles.horizontal}>
      <Action
        icon={post.likedByMe ? 'heart' : 'heart-outline'}
        color={post.likedByMe ? '#FF4D6D' : baseColor}
        mutedColor={mutedColor}
        label="Curtir"
        count={formatCount(likeCount)}
        orientation={orientation}
        overlay={overlay}
        active={post.likedByMe}
        onPress={onLike}
      />
      {meta.supportsComment ? (
        <Action
          icon="chatbubble-outline"
          color={baseColor}
          mutedColor={mutedColor}
          label="Comentários"
          count={formatCount(post.comments)}
          orientation={orientation}
          overlay={overlay}
          onPress={onComment}
        />
      ) : null}
      {meta.supportsRepost ? (
        <Action
          icon="repeat"
          color={post.repostedByMe ? '#34D399' : baseColor}
          mutedColor={mutedColor}
          label="Repostar"
          count={formatCount(repostCount)}
          orientation={orientation}
          overlay={overlay}
          active={post.repostedByMe}
          onPress={onRepost}
        />
      ) : null}
      {onOpenNetwork ? (
        <Action
          icon="open-outline"
          color={baseColor}
          mutedColor={mutedColor}
          label="Abrir na rede"
          count=""
          orientation={orientation}
          overlay={overlay}
          onPress={onOpenNetwork}
        />
      ) : null}
      <Action
        icon="paper-plane-outline"
        color={baseColor}
        mutedColor={mutedColor}
        label="Compartilhar"
        count=""
        orientation={orientation}
        overlay={overlay}
        onPress={onShare}
      />
    </View>
  );
}

interface ActionProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  mutedColor: string;
  label: string;
  count: string;
  orientation: 'vertical' | 'horizontal';
  overlay: boolean;
  active?: boolean;
  onPress: () => void;
}

function Action({
  icon,
  color,
  mutedColor,
  label,
  count,
  orientation,
  overlay,
  active = false,
  onPress,
}: ActionProps) {
  const vertical = orientation === 'vertical';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={count ? `${label}, ${count}` : label}
      accessibilityState={active ? { selected: true } : undefined}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [
        vertical ? styles.actionVertical : styles.actionHorizontal,
        pressed && { opacity: 0.65 },
      ]}
    >
      <Ionicons
        name={icon}
        size={vertical ? 26 : 18}
        color={color}
        style={overlay ? styles.iconShadow : undefined}
      />
      {count ? (
        <AppText
          variant="caption"
          color={vertical ? mutedColor : mutedColor}
          style={[
            vertical ? styles.countVertical : styles.countHorizontal,
            overlay ? styles.textShadow : undefined,
          ]}
        >
          {count}
        </AppText>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  vertical: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  horizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionVertical: {
    alignItems: 'center',
    gap: 4,
    minWidth: 44,
  },
  actionHorizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 60,
  },
  countVertical: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    lineHeight: 16,
  },
  countHorizontal: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    lineHeight: 16,
  },
  iconShadow: {
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  textShadow: {
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
