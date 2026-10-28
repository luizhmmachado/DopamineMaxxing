import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingView } from '@/components/ui/loading-view';
import { ShareSheet } from '@/components/feed/share-sheet';
import { TextFeedItem } from '@/components/feed/text-feed-item';
import { getNetwork } from '@/constants/networks';
import { Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useFeed } from '@/hooks/use-feed';
import type { FeedPost, NetworkId } from '@/types/models';

type Filter = 'all' | NetworkId;

export default function TextsScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { posts, loading, refreshing, error, refresh, toggleLike, toggleRepost } = useFeed('text');
  const [filter, setFilter] = useState<Filter>('all');
  const [sharePost, setSharePost] = useState<FeedPost | null>(null);

  const networks = useMemo(() => {
    const unique = new Set<NetworkId>();
    posts.forEach((post) => unique.add(post.network));
    return [...unique];
  }, [posts]);

  const filtered = useMemo(
    () => (filter === 'all' ? posts : posts.filter((post) => post.network === filter)),
    [filter, posts],
  );

  if (loading && posts.length === 0) {
    return <LoadingView label="Montando seu feed de textos…" />;
  }

  if (error && posts.length === 0) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
        <EmptyState
          icon="cloud-offline-outline"
          title="Não foi possível carregar o feed"
          description={error}
          actionLabel="Tentar novamente"
          onAction={refresh}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TextFeedItem
            post={item}
            onLike={() => toggleLike(item.id)}
            onComment={() => router.push(`/post/${item.id}`)}
            onRepost={() => toggleRepost(item.id)}
            onShare={() => setSharePost(item)}
          />
        )}
        contentContainerStyle={styles.content}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <View>
              <AppText variant="title">Textos</AppText>
              <AppText variant="caption" color={colors.textSecondary}>
                Novas ideias, no seu ritmo.
              </AppText>
            </View>
            {error ? (
              <View style={[styles.errorBanner, { backgroundColor: colors.dangerSoft }]}>
                <Ionicons name="alert-circle-outline" size={16} color={colors.danger} />
                <AppText variant="caption" color={colors.danger} style={styles.errorText}>
                  {error}
                </AppText>
              </View>
            ) : null}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filters}
            >
              <FilterChip
                label="Todas"
                active={filter === 'all'}
                onPress={() => setFilter('all')}
              />
              {networks.map((network) => (
                <FilterChip
                  key={network}
                  label={getNetwork(network).shortName}
                  active={filter === network}
                  onPress={() => setFilter(network)}
                />
              ))}
            </ScrollView>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="chatbox-ellipses-outline"
            title={filter === 'all' ? 'Nenhum texto por aqui' : 'Nada nesta rede ainda'}
            description={
              filter === 'all'
                ? 'Conecte uma rede social ou puxe para atualizar.'
                : 'Tente outro filtro ou puxe para atualizar.'
            }
            actionLabel={filter === 'all' ? 'Gerenciar conexões' : 'Ver todos'}
            onAction={
              filter === 'all'
                ? () => router.push('/(tabs)/settings')
                : () => setFilter('all')
            }
          />
        }
      />
      <ShareSheet post={sharePost} visible={Boolean(sharePost)} onClose={() => setSharePost(null)} />
    </SafeAreaView>
  );
}

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: active ? colors.primary : colors.surface,
          borderColor: active ? colors.primary : colors.border,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <AppText variant="caption" color={active ? colors.onPrimary : colors.textSecondary} style={styles.chipText}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxxl,
  },
  header: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  filters: {
    gap: Spacing.sm,
    paddingVertical: 0,
  },
  chip: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  chipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    lineHeight: 16,
  },
  separator: {
    height: Spacing.md,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
  },
  errorText: {
    flex: 1,
  },
});
