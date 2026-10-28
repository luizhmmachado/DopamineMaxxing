import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { VideoView, type VideoPlayer } from 'expo-video';

import { AppText } from '@/components/ui/app-text';
import { FeedActions } from '@/components/feed/feed-actions';
import { NetworkBadge } from '@/components/ui/network-badge';
import { PostAuthorRow } from '@/components/feed/post-author-row';
import { Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { usePerformance } from '@/hooks/use-performance';
import type { FeedPost } from '@/types/models';

interface VideoFeedItemProps {
  post: FeedPost;
  height: number;
  active: boolean;
  playing: boolean;
  muted: boolean;
  player: VideoPlayer | null;
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onLike: () => void;
  onComment: () => void;
  onRepost: () => void;
  onShare: () => void;
}

export function VideoFeedItem({
  post,
  height,
  active,
  playing,
  muted,
  player,
  onTogglePlay,
  onToggleMute,
  onLike,
  onComment,
  onRepost,
  onShare,
}: VideoFeedItemProps) {
  const { colors } = useAppTheme();
  const { animationsEnabled, dataSaver } = usePerformance();
  const insets = useSafeAreaInsets();
  const isDemo = post.id.startsWith('demo-');

  return (
    <View style={[styles.container, { height, backgroundColor: '#000000' }]}>
      {post.thumbnailUrl ? (
        <Image
          source={{ uri: post.thumbnailUrl }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={animationsEnabled ? 250 : 0}
          cachePolicy={dataSaver ? 'memory' : 'memory-disk'}
          recyclingKey={post.id}
          accessibilityLabel={`Prévia do vídeo de ${post.author.name}`}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.surface }]} />
      )}

      {active && playing && player ? (
        <VideoView
          player={player}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          nativeControls={false}
          allowsPictureInPicture={false}
        />
      ) : null}

      <LinearGradient
        colors={['rgba(0,0,0,0.62)', 'rgba(0,0,0,0.04)', 'rgba(0,0,0,0.18)', 'rgba(0,0,0,0.94)']}
        locations={[0, 0.22, 0.55, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <View style={[styles.topBar, { top: 14 + insets.top }]} pointerEvents="box-none">
        <NetworkBadge network={post.network} overlay />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={muted ? 'Ativar som' : 'Silenciar vídeo'}
          onPress={onToggleMute}
          style={({ pressed }) => [styles.muteButton, pressed && { opacity: 0.7 }]}
          hitSlop={8}
        >
          <Ionicons name={muted ? 'volume-mute' : 'volume-high'} size={18} color="#FFFFFF" />
          <AppText variant="caption" color="#FFFFFF" style={styles.muteLabel}>
            {muted ? 'Sem som' : 'Com som'}
          </AppText>
        </Pressable>
      </View>

      {isDemo ? (
        <View style={[styles.demoLabel, { top: 14 + insets.top + 44 }]}>
          <View style={styles.statusLabel}>
            <AppText variant="overline" color="#FFFFFF">
              Demonstração · cenário ilustrado
            </AppText>
          </View>
        </View>
      ) : null}

      {playing ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Pausar vídeo"
          onPress={onTogglePlay}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Reproduzir vídeo"
          onPress={onTogglePlay}
          style={styles.playOverlay}
        >
          <View style={styles.playButton}>
            <Ionicons name="play" size={34} color="#FFFFFF" style={styles.playIcon} />
          </View>
        </Pressable>
      )}

      <View style={styles.bottomContent} pointerEvents="box-none">
        <PostAuthorRow post={post} overlay showAvatar={false} showTime={false} />
        <AppText variant="body" color="#FFFFFF" numberOfLines={3} style={styles.caption}>
          {post.caption}
        </AppText>
        <View style={styles.audioRow}>
          <Ionicons name="musical-notes-outline" size={14} color="rgba(255,255,255,0.82)" />
          <AppText variant="caption" color="rgba(255,255,255,0.82)">
            Som ambiente · original
          </AppText>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={playing ? 'Pausar vídeo' : 'Reproduzir vídeo'}
          onPress={onTogglePlay}
          style={styles.playbackRow}
        >
          <Ionicons name={playing ? 'pause' : 'play'} size={16} color="#FFFFFF" />
          <AppText variant="caption" color="#FFFFFF">
            {playing ? 'Reproduzindo · pausar' : 'Pausado · reproduzir'}
          </AppText>
        </Pressable>
      </View>

      <View style={styles.actions} pointerEvents="box-none">
        <FeedActions
          post={post}
          orientation="vertical"
          overlay
          onLike={onLike}
          onComment={onComment}
          onRepost={onRepost}
          onShare={onShare}
        />
      </View>

      <View style={styles.progressTrack} pointerEvents="none">
        <View style={styles.progressFill} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  topBar: {
    position: 'absolute',
    top: 14,
    left: Spacing.lg,
    right: Spacing.lg,
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  muteButton: {
    minWidth: 96,
    height: 44,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  muteLabel: {
    color: '#FFFFFF',
  },
  demoLabel: {
    position: 'absolute',
    left: Spacing.lg,
    zIndex: 2,
  },
  statusLabel: {
    minHeight: 22,
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  playOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 78,
    height: 78,
    borderRadius: 39,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  playIcon: {
    marginLeft: 5,
  },
  bottomContent: {
    position: 'absolute',
    left: Spacing.lg,
    right: 86,
    bottom: 36,
    gap: Spacing.sm,
  },
  caption: {
    lineHeight: 22,
  },
  audioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  playbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: 32,
  },
  actions: {
    position: 'absolute',
    right: 10,
    bottom: 150,
  },
  progressTrack: {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
    bottom: 6,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  progressFill: {
    width: '24%',
    height: 2,
    borderRadius: 1,
    backgroundColor: '#FFFFFF',
  },
});
