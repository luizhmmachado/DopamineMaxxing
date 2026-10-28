import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '@/components/ui/app-text';
import { BrandMark } from '@/components/ui/brand-mark';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { TextField } from '@/components/ui/text-field';
import { Radius, Spacing } from '@/constants/theme';
import { getErrorMessage } from '@/lib/errors';
import { isValidEmail } from '@/lib/validation';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useAuth } from '@/providers/auth-provider';

export default function SignInScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { signIn, supabaseEnabled } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(null);
    if (!isValidEmail(email)) {
      setError('Informe um e-mail válido.');
      return;
    }
    if (!password) {
      setError('Informe sua senha.');
      return;
    }
    setLoading(true);
    try {
      await signIn(email, password);
      router.replace('/');
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen
      scroll
      keyboardAvoiding
      padded={false}
      edges={['top', 'bottom']}
      contentContainerStyle={styles.scrollContent}
      footer={
        <AppText variant="caption" color={colors.textMuted} align="center">
          Seu tempo merece escolhas melhores.
        </AppText>
      }
    >
      <ScreenHeader title="Entrar" />
      <View style={styles.content}>
        <View style={styles.introduction}>
          <BrandMark size={56} />
          <View style={styles.introTexts}>
            <AppText variant="title">Bom ter você aqui.</AppText>
            <AppText variant="body" color={colors.textSecondary}>
              Entre para retomar seu feed, no seu ritmo.
            </AppText>
          </View>
        </View>

        <View style={styles.form}>
          <TextField
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            placeholder="voce@exemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            icon="mail-outline"
          />
          <TextField
            label="Senha"
            value={password}
            onChangeText={setPassword}
            placeholder="Sua senha"
            secure
            autoCapitalize="none"
            autoComplete="password"
            textContentType="password"
            icon="lock-closed-outline"
          />

          {error ? (
            <AppText variant="caption" color={colors.danger}>
              {error}
            </AppText>
          ) : null}

          <Button
            label="Entrar"
            onPress={handleSubmit}
            loading={loading}
            size="lg"
            icon="log-in-outline"
            fullWidth
          />
        </View>

        <Button
          label="Ainda não tem conta? Criar conta"
          onPress={() => router.replace('/(auth)/sign-up')}
          variant="ghost"
          icon="add"
          fullWidth
        />

        <View style={[styles.notice, { backgroundColor: colors.surface }]}>
          <Ionicons name="information-circle-outline" size={18} color={colors.textSecondary} />
          <AppText variant="caption" color={colors.textSecondary} style={styles.noticeText}>
            {supabaseEnabled
              ? 'Acesso protegido. Nenhuma senha é armazenada em texto claro.'
              : 'Este é um exemplo de interface. Nenhum acesso foi realizado.'}
          </AppText>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: Spacing.sm,
    gap: Spacing.xl,
  },
  introduction: {
    gap: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  introTexts: {
    gap: Spacing.sm,
  },
  form: {
    gap: Spacing.lg,
  },
  notice: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginTop: 'auto',
  },
  noticeText: {
    flex: 1,
  },
});
