import { Redirect, Stack } from 'expo-router';

import { LoadingView } from '@/components/ui/loading-view';
import { useAuth } from '@/providers/auth-provider';
import { useProfile } from '@/providers/profile-provider';

export default function OnboardingLayout() {
  const { status } = useAuth();
  const { loading, isOnboarded } = useProfile();

  if (status === 'loading' || loading) {
    return <LoadingView label="Preparando seu perfil…" />;
  }

  if (status === 'signedOut') {
    return <Redirect href="/(auth)/welcome" />;
  }

  if (isOnboarded) {
    return <Redirect href="/(tabs)/videos" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
