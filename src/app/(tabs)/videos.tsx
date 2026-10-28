import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useVideoPlayer } from 'expo-video';
import { useCallback, useEffect, useState } from 'react';
import { AppState, FlatList, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/ui/empty-state';
import { LoadingView } from '@/components/ui/loading-view';
import { ShareSheet } from '@/components/feed/share-sheet';
import { VideoFeedItem } from '@/components/feed/video-feed-item';
import { AppText } from '@/components/ui/app-text';
import { IconButton } from '@/components/ui/icon-button';
import { Spacing } from '@/constants/theme';
import { useFeed } from '@/hooks/use-feed';
import { usePerformance } from '@/hooks/use-performance';
import { useAppTheme } from '@/hooks/use-app-theme';
import type { FeedPost } from '@/types/models';

const VIEWABILITY_CONFIG = { itemVisiblePercentThreshold: 60 };

export default function VideosScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { autoplay, performanceMode, listProps } = usePerformance();
  const { posts, loading, error, refresh, toggleLike, toggleRepost } = useFeed('video');
  const [height, setHeight] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const [userPlayOverride, setUserPlayOverride] = useState(false);
  const [focused, setFocused] = useState(true);
  const [appActive, setAppActive] = useState(AppState.currentState === 'active');
  const [sharePost, setSharePost] = useState<FeedPost | null>(null);

  const player = useVideoPlayer(null, (instance) => {
    instance.loop = true;
    instance.muted = true;
  });

  const safeActiveIndex = posts.length > 0 ? Math.min(activeIndex, posts.length - 1) : 0;
  const activePost = posts[safeActiveIndex] ?? null;
  const activePostId = activePost?.id ?? null;
  const activeMediaUrl = activePost?.mediaUrl ?? null;
  const shouldPlay =
    Boolean(activeMediaUrl) &&
    focused &&
    appActive &&
    (autoplay ? !userPlayOverride : userPlayOverride);

  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, []),
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      setAppActive(state === 'active');
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!activeMediaUrl) {
      player.pause();
      return;
    }
    player.replace(activeMediaUrl);
  }, [activePostId, activeMediaUrl, player]);

  useEffect(() => {
    if (shouldPlay) {
      player.play();
    } else {
      player.pause();
    }
  }, [shouldPlay, player]);

  useEffect(() => {
    // O player do expo-video expõe muted como propriedade mutável.
    // eslint-disable-next-line react-hooks/immutability
    player.muted = muted;
  }, [muted, player]);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: { index?: number }[] }) => {
      const first = viewableItems[0];
      if (typeof first?.index === 'number') {
        setActiveIndex(first.index);
        setUserPlayOverride(false);
      }
    },
    [],
  );

  const getItemLayout = useCallback(
    (_: ArrayLike<FeedPost> | null | undefined, index: number) => ({
      length: height,
      offset: height * index,
      index,
    }),
    [height],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: FeedPost; index: number }) => (
      <VideoFeedItem
        post={item}
        height={height}
        active={index === safeActiveIndex}
        playing={index === safeActiveIndex && shouldPlay}
        muted={muted}
        player={index === safeActiveIndex ? player : null}
        onTogglePlay={() => setUserPlayOverride((current) => !current)}
        onToggleMute={() => setMuted((current) => !current)}
        onLike={() => toggleLike(item.id)}
        onComment={() => router.push(`/post/${item.id}`)}
        onRepost={() => toggleRepost(item.id)}
        onShare={() => setSharePost(item)}
      />
    ),
    [height, muted, player, router, safeActiveIndex, shouldPlay, toggleLike, toggleRepost],
  );

  if (loading && posts.length === 0) {
    return <LoadingView label="Montando seu feed de vídeos…" />;
  }

  if (error && posts.length === 0) {
    return (
      <View style={[styles.state, { backgroundColor: colors.background }]}>
        <EmptyState
          icon="cloud-offline-outline"
          title="Não foi possível carregar o feed"
          description={error}
          actionLabel="Tentar novamente"
          onAction={refresh}
        />
      </View>
    );
  }

  if (!loading && posts.length === 0) {
    return (
      <View style={[styles.state, { backgroundColor: colors.background }]}>
        <EmptyState
          icon="videocam-off-outline"
          title="Nenhum vídeo por aqui"
          description="Conecte uma rede social para começar a montar seu feed único."
          actionLabel="Gerenciar conexões"
          onAction={() => router.push('/(tabs)/settings')}
        />
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: '#000000' }]}
      onLayout={(event) => {
        const next = event.nativeEvent.layout.height;
        if (next !== height) {
          setHeight(next);
        }
      }}
    >
      {height > 0 ? (
        <FlatList
          data={posts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          pagingEnabled
          snapToInterval={height}
          decelerationRate="fast"
          disableIntervalMomentum
          showsVerticalScrollIndicator={false}
          bounces={false}
          getItemLayout={getItemLayout}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={VIEWABILITY_CONFIG}
          extraData={`${safeActiveIndex}-${shouldPlay}-${muted}`}
          {...listProps}
        />
      ) : null}

      <View style={styles.floatingActions} pointerEvents="box-none">
        {performanceMode ? (
          <View style={styles.performancePill}>
            <Ionicons name="speedometer-outline" size={13} color="#FFFFFF" />
            <AppText variant="caption" color="#FFFFFF" style={styles.performanceText}>
              Modo desempenho
            </AppText>
          </View>
        ) : null}
        <IconButton
          name="refresh"
          accessibilityLabel="Atualizar feed"
          onPress={refresh}
          variant="overlay"
          size={18}
        />
      </View>

      <ShareSheet
        post={sharePost}
        visible={Boolean(sharePost)}
        onClose={() => setSharePost(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  state: {
    flex: 1,
  },
  floatingActions: {
    position: 'absolute',
    right: Spacing.md,
    bottom: Spacing.md,
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  performancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
  },
  performanceText: {
    fontSize: 10,
  },
});
