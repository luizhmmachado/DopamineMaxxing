import { useMemo } from 'react';

import { createRepository, type Repository } from '@/lib/repository';
import { useAuth } from '@/providers/auth-provider';

export function useRepository(): Repository | null {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const email = user?.email ?? '';
  const isDemo = user?.isDemo ?? false;

  return useMemo(() => {
    if (!userId) {
      return null;
    }
    return createRepository({ id: userId, email, isDemo });
  }, [userId, email, isDemo]);
}
