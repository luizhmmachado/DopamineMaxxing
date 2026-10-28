import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { ProfileForm, type ProfileFormHandle, type ProfileFormValues } from '@/components/profile/profile-form';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Spacing } from '@/constants/theme';
import { useProfile } from '@/providers/profile-provider';

export default function OnboardingProfileScreen() {
  const router = useRouter();
  const { profile, saveProfile, saveConsents } = useProfile();
  const formRef = useRef<ProfileFormHandle>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit({ input, consents }: ProfileFormValues) {
    await saveConsents(consents);
    await saveProfile(input);
    router.replace('/(tabs)/videos');
  }

  return (
    <Screen
      padded={false}
      edges={['top', 'bottom']}
      footer={
        <Button
          label={busy ? 'Salvando…' : 'Concluir'}
          onPress={() => formRef.current?.submit()}
          loading={busy}
          size="lg"
          icon="checkmark"
          fullWidth
        />
      }
    >
      <ScreenHeader title="Seu perfil, seu ritmo" subtitle="PASSO 2 DE 2 · SOBRE VOCÊ" />
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ProfileForm
          ref={formRef}
          initial={profile}
          mode="onboarding"
          submitLabel="Concluir e abrir meu feed"
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
