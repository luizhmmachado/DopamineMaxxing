import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

import { getErrorMessage } from '@/lib/errors';
import { useRepository } from '@/hooks/use-repository';
import type { FeedPost, PostKind } from '@/types/models';

type LoadMode = 'initial' | 'refresh' | 'silent';

export function useFeed(kind: PostKind) {
  const repository = useRepository();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasLoaded = useRef(false);
  const pendingLikes = useRef(new Set<string>());
  const pendingReposts = useRef(new Set<string>());

  const load = useCallback(
    async (mode: LoadMode = 'initial') => {
      if (!repository) {
        setLoading(false);
        return;
      }
      if (mode === 'initial') {
        setLoading(true);
      } else if (mode === 'refresh') {
        setRefreshing(true);
      }
      try {
        const data = await repository.listPosts(kind);
        setPosts(data);
        setError(null);
      } catch (loadError) {
        setError(getErrorMessage(loadError));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [repository, kind],
  );

  useFocusEffect(
    useCallback(() => {
      const mode: LoadMode = hasLoaded.current ? 'silent' : 'initial';
      hasLoaded.current = true;
      load(mode);
    }, [load]),
  );

  const toggleLike = useCallback(
    async (postId: string) => {
      if (!repository || pendingLikes.current.has(postId)) {
        return;
      }
      const target = posts.find((post) => post.id === postId);
      if (!target) {
        return;
      }
      pendingLikes.current.add(postId);
      const nextLiked = !target.likedByMe;
      setPosts((previous) =>
        previous.map((post) =>
          post.id === postId
            ? {
                ...post,
                likedByMe: nextLiked,
                likes: Math.max(0, post.likes + (nextLiked ? 1 : -1)),
              }
            : post,
        ),
      );
      try {
        await repository.toggleLike(postId);
        setError(null);
      } catch (likeError) {
        setPosts((previous) =>
          previous.map((post) =>
            post.id === postId
              ? { ...post, likedByMe: target.likedByMe, likes: target.likes }
              : post,
          ),
        );
        setError(getErrorMessage(likeError));
      } finally {
        pendingLikes.current.delete(postId);
      }
    },
    [posts, repository],
  );

  const toggleRepost = useCallback(
    async (postId: string) => {
      if (!repository || pendingReposts.current.has(postId)) {
        return;
      }
      const target = posts.find((post) => post.id === postId);
      if (!target) {
        return;
      }
      pendingReposts.current.add(postId);
      const nextReposted = !target.repostedByMe;
      setPosts((previous) =>
        previous.map((post) =>
          post.id === postId
            ? {
                ...post,
                repostedByMe: nextReposted,
                reposts: Math.max(0, post.reposts + (nextReposted ? 1 : -1)),
              }
            : post,
        ),
      );
      try {
        await repository.toggleRepost(postId);
        setError(null);
      } catch (repostError) {
        setPosts((previous) =>
          previous.map((post) =>
            post.id === postId
              ? { ...post, repostedByMe: target.repostedByMe, reposts: target.reposts }
              : post,
          ),
        );
        setError(getErrorMessage(repostError));
      } finally {
        pendingReposts.current.delete(postId);
      }
    },
    [posts, repository],
  );

  const refresh = useCallback(() => load('refresh'), [load]);

  return {
    posts,
    loading,
    refreshing,
    error,
    refresh,
    toggleLike,
    toggleRepost,
  };
}
