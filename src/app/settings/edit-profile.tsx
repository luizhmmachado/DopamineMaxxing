import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { ProfileForm, type ProfileFormHandle, type ProfileFormValues } from '@/components/profile/profile-form';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingView } from '@/components/ui/loading-view';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Spacing } from '@/constants/theme';
import { useProfile } from '@/providers/profile-provider';

export default function EditProfileScreen() {
  const router = useRouter();
  const { profile, loading, saveProfile, saveConsents } = useProfile();
  const formRef = useRef<ProfileFormHandle>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit({ input, consents }: ProfileFormValues) {
    await saveProfile(input);
    await saveConsents(consents);
    router.back();
  }

  if (loading && !profile) {
    return <LoadingView label="Carregando perfil…" />;
  }

  if (!profile) {
    return (
      <Screen>
        <EmptyState
          icon="person-circle-outline"
          title="Perfil não encontrado"
          description="Complete seu perfil para editá-lo."
          actionLabel="Criar perfil"
          onAction={() => router.replace('/(onboarding)/profile')}
        />
      </Screen>
    );
  }

  return (
    <Screen
      padded={false}
      edges={['top', 'bottom']}
      footer={
        <Button
          label={busy ? 'Salvando…' : 'Salvar alterações'}
          onPress={() => formRef.current?.submit()}
          loading={busy}
          size="lg"
          icon="checkmark"
          fullWidth
        />
      }
    >
      <ScreenHeader title="Editar perfil" />
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ProfileForm
          ref={formRef}
          initial={profile}
          mode="edit"
          submitLabel="Salvar alterações"
          hideSubmit
          onBusyChange={setBusy}
          onSubmit={handleSubmit}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: Spacing.xl,
  },
});
