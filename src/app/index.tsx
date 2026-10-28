import { Redirect } from 'expo-router';

import { LoadingView } from '@/components/ui/loading-view';
import { useAuth } from '@/providers/auth-provider';
import { useProfile } from '@/providers/profile-provider';

export default function IndexScreen() {
  const { status } = useAuth();
  const { loading, isOnboarded } = useProfile();

  if (status === 'loading' || loading) {
    return <LoadingView label="Preparando seu feed…" />;
  }

  if (status === 'signedOut') {
    return <Redirect href="/(auth)/welcome" />;
  }

  if (!isOnboarded) {
    return <Redirect href="/(onboarding)/connect" />;
  }

  return <Redirect href="/(tabs)/videos" />;
}
