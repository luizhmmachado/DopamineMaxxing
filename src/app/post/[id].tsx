import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingView } from '@/components/ui/loading-view';
import { NetworkBadge } from '@/components/ui/network-badge';
import { PostAuthorRow } from '@/components/feed/post-author-row';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Radius, Spacing } from '@/constants/theme';
import { getErrorMessage } from '@/lib/errors';
import { formatRelativeTime } from '@/lib/format';
import { commentError, MAX_COMMENT_LENGTH } from '@/lib/validation';
import { useComments } from '@/hooks/use-comments';
import { useRepository } from '@/hooks/use-repository';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useProfile } from '@/providers/profile-provider';
import type { Comment, FeedPost } from '@/types/models';

export default function CommentsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useAppTheme();
  const repository = useRepository();
  const { profile } = useProfile();
  const { comments, loading: commentsLoading, submitting, error, addComment, deleteComment } =
    useComments(id);
  const [post, setPost] = useState<FeedPost | null>(null);
  const [loadedPostId, setLoadedPostId] = useState<string | null>(null);
  const [postError, setPostError] = useState<string | null>(null);
  const [body, setBody] = useState('');
  const [composerError, setComposerError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!repository) {
      return;
    }
    repository
      .getPost(id)
      .then((data) => {
        if (active) {
          setPost(data);
          setPostError(data ? null : 'Post não encontrado.');
        }
      })
      .catch((loadError) => {
        if (active) {
          setPostError(getErrorMessage(loadError));
        }
      })
      .finally(() => {
        if (active) {
          setLoadedPostId(id);
        }
      });
    return () => {
      active = false;
    };
  }, [id, repository]);

  const postLoading = Boolean(repository) && loadedPostId !== id;

  const handleSend = useCallback(async () => {
    const issue = commentError(body);
    if (issue) {
      setComposerError(issue);
      return;
    }
    setComposerError(null);
    const created = await addComment(body);
    if (created) {
      setBody('');
      setPost((current) =>
        current ? { ...current, comments: current.comments + 1 } : current,
      );
    }
  }, [addComment, body]);

  function handleDelete(comment: Comment) {
    Alert.alert('Excluir comentário?', 'Ele será removido do seu feed.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          const deleted = await deleteComment(comment.id);
          if (deleted) {
            setPost((current) =>
              current ? { ...current, comments: Math.max(0, current.comments - 1) } : current,
            );
          }
        },
      },
    ]);
  }

  if (postLoading) {
    return <LoadingView label="Abrindo post…" />;
  }

  if (!post) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
        <ScreenHeader title="Comentários" />
        <EmptyState
          icon="alert-circle-outline"
          title="Post indisponível"
          description={postError ?? 'Não encontramos este post.'}
          actionLabel="Voltar"
          onAction={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}
    >
      <ScreenHeader
        title="Comentários"
        subtitle={`${post.comments} ${post.comments === 1 ? 'comentário' : 'comentários'}`}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Card style={styles.postCard}>
                <View style={styles.postTopRow}>
                  <PostAuthorRow post={post} avatarSize={32} showTime={false} />
                  <NetworkBadge network={post.network} compact />
                </View>
                <AppText variant="caption" color={colors.textSecondary} numberOfLines={2}>
                  {post.caption}
                </AppText>
              </Card>
              {commentsLoading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : null}
              {error ? (
                <View style={[styles.errorBanner, { backgroundColor: colors.dangerSoft }]}>
                  <AppText variant="caption" color={colors.danger}>
                    {error}
                  </AppText>
                </View>
              ) : null}
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.commentRow}>
              <Avatar name={item.authorName} uri={item.authorAvatarUrl} size={32} />
              <View style={styles.commentBody}>
                <View style={styles.commentHeader}>
                  <View style={styles.commentMeta}>
                    <AppText variant="bodyStrong" numberOfLines={1}>
                      {item.authorName}
                    </AppText>
                    <AppText variant="caption" color={colors.textSecondary}>
                      {`@${item.authorHandle} · ${formatRelativeTime(item.createdAt)}`}
                    </AppText>
                  </View>
                  {item.isMine ? (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Excluir comentário"
                      onPress={() => handleDelete(item)}
                      hitSlop={8}
                      style={styles.deleteButton}
                    >
                      <Ionicons name="trash-outline" size={15} color={colors.textMuted} />
                    </Pressable>
                  ) : null}
                </View>
                <AppText variant="body" style={styles.commentText}>
                  {item.body}
                </AppText>
                <AppText variant="caption" color={colors.textMuted} style={styles.commentAction}>
                  ♡ Curtir · Responder
                </AppText>
              </View>
            </View>
          )}
          ListEmptyComponent={
            commentsLoading ? undefined : (
              <View style={styles.emptyComments}>
                <AppText variant="caption" color={colors.textSecondary} align="center">
                  Nenhum comentário ainda. Comece a conversa.
                </AppText>
              </View>
            )
          }
        />

        <View
          style={[
            styles.composer,
            { borderTopColor: colors.border, backgroundColor: colors.backgroundElevated },
          ]}
        >
          {composerError ? (
            <AppText variant="caption" color={colors.danger} style={styles.composerError}>
              {composerError}
            </AppText>
          ) : null}
          <View style={styles.composerRow}>
            <Avatar
              name={profile?.displayName ?? 'Você'}
              uri={profile?.avatarUrl}
              size={32}
            />
            <View
              style={[
                styles.inputWrap,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <TextInput
                value={body}
                onChangeText={(value) => {
                  setBody(value);
                  if (composerError) {
                    setComposerError(null);
                  }
                }}
                placeholder="Escreva um comentário…"
                placeholderTextColor={colors.textMuted}
                multiline
                maxLength={MAX_COMMENT_LENGTH}
                style={[styles.input, { color: colors.text }]}
                accessibilityLabel="Escreva um comentário"
              />
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Enviar comentário"
              accessibilityState={{ disabled: submitting || !body.trim() }}
              onPress={submitting || !body.trim() ? undefined : handleSend}
              style={({ pressed }) => [
                styles.sendButton,
                { opacity: pressed ? 0.6 : body.trim() ? 1 : 0.35 },
              ]}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Ionicons name="send" size={19} color={colors.primary} />
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: Spacing.xl,
  },
  listHeader: {
    gap: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  postCard: {
    gap: Spacing.sm,
    padding: Spacing.lg,
  },
  postTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  errorBanner: {
    padding: Spacing.md,
    borderRadius: Radius.md,
  },
  commentRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  commentBody: {
    flex: 1,
    gap: Spacing.xs,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  commentMeta: {
    flex: 1,
    gap: 1,
  },
  deleteButton: {
    marginLeft: 'auto',
    minWidth: 28,
    minHeight: 28,
    alignItems: 'flex-end',
  },
  commentText: {
    fontSize: 15,
    lineHeight: 22,
  },
  commentAction: {
    minHeight: 32,
  },
  separator: {
    height: Spacing.xl,
  },
  emptyComments: {
    paddingVertical: Spacing.xl,
  },
  composer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 20,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  composerError: {
    marginLeft: 0,
  },
  composerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  inputWrap: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderWidth: 1,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
  },
  input: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
    paddingVertical: 10,
  },
  sendButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
