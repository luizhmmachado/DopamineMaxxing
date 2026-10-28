import { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase/client';

const REMOTE_RE = /^(https?:|file:|content:|data:|blob:)/i;

export function useAvatarUri(path?: string | null): string | null {
  const [signed, setSigned] = useState<{ path: string; uri: string | null } | null>(null);
  const direct = path && REMOTE_RE.test(path) ? path : null;

  useEffect(() => {
    let active = true;
    if (!path || REMOTE_RE.test(path) || !supabase) {
      return;
    }
    supabase.storage
      .from('avatars')
      .createSignedUrl(path, 3600)
      .then(({ data }) => {
        if (active) {
          setSigned({ path, uri: data?.signedUrl ?? null });
        }
      })
      .catch(() => {
        if (active) {
          setSigned({ path, uri: null });
        }
      });
    return () => {
      active = false;
    };
  }, [path]);

  return direct ?? (signed && signed.path === path ? signed.uri : null);
}
