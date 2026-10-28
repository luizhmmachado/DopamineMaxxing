import { useCallback, useEffect, useState } from 'react';

import { getErrorMessage } from '@/lib/errors';
import { useRepository } from '@/hooks/use-repository';
import type { Comment } from '@/types/models';

export function useComments(postId: string) {
  const repository = useRepository();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadedPostId, setLoadedPostId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!repository) {
      return;
    }
    try {
      const data = await repository.listComments(postId);
      setComments(data);
      setError(null);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoadedPostId(postId);
    }
  }, [repository, postId]);

  useEffect(() => {
    let active = true;
    if (!repository) {
      return;
    }
    repository
      .listComments(postId)
      .then((data) => {
        if (active) {
          setComments(data);
          setError(null);
        }
      })
      .catch((loadError) => {
        if (active) {
          setError(getErrorMessage(loadError));
        }
      })
      .finally(() => {
        if (active) {
          setLoadedPostId(postId);
        }
      });
    return () => {
      active = false;
    };
  }, [repository, postId]);

  const loading = Boolean(repository) && loadedPostId !== postId;

  const addComment = useCallback(
    async (body: string) => {
      if (!repository) {
        return null;
      }
      setSubmitting(true);
      try {
        const comment = await repository.addComment(postId, body);
        setComments((previous) => [...previous, comment]);
        setError(null);
        return comment;
      } catch (submitError) {
        setError(getErrorMessage(submitError));
        return null;
      } finally {
        setSubmitting(false);
      }
    },
    [repository, postId],
  );

  const deleteComment = useCallback(
    async (commentId: string): Promise<boolean> => {
      if (!repository) {
        return false;
      }
      const previous = comments;
      setComments((current) => current.filter((comment) => comment.id !== commentId));
      try {
        await repository.deleteComment(commentId);
        return true;
      } catch (deleteError) {
        setComments(previous);
        setError(getErrorMessage(deleteError));
        return false;
      }
    },
    [comments, repository],
  );

  return { comments, loading, submitting, error, addComment, deleteComment, reload: load };
}
