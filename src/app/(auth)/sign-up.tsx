import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { getErrorMessage } from '@/lib/errors';
import { isValidEmail, passwordError } from '@/lib/validation';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useAuth } from '@/providers/auth-provider';

export default function SignUpScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [termsError, setTermsError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(null);
    setTermsError(null);
    if (!isValidEmail(email)) {
      setError('Informe um e-mail válido.');
      return;
    }
    const passwordIssue = passwordError(password);
    if (passwordIssue) {
      setError(passwordIssue);
      return;
    }
    if (password !== confirm) {
      setError('As senhas não coincidem.');
      return;
    }
    if (!accepted) {
      setTermsError('É necessário aceitar os termos e a política de privacidade.');
      return;
    }
    setLoading(true);
    try {
      const result = await signUp(email, password);
      if (result.needsEmailConfirmation) {
        Alert.alert(
          'Confirme seu e-mail',
          'Enviamos um link de confirmação. Depois de confirmar, volte e entre na sua conta.',
          [{ text: 'Entendi', onPress: () => router.replace('/(auth)/sign-in') }],
        );
        return;
      }
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
        <Button
          label="Já tenho conta. Entrar"
          onPress={() => router.replace('/(auth)/sign-in')}
          variant="ghost"
          icon="log-in-outline"
          fullWidth
        />
      }
    >
      <ScreenHeader title="Criar conta" />
      <View style={styles.content}>
        <AppText variant="heading" style={styles.intro}>
          Menos abas abertas. Mais espaço para o que importa.
        </AppText>

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
            placeholder="Crie sua senha"
            secure
            autoCapitalize="none"
            autoComplete="new-password"
            textContentType="newPassword"
            icon="lock-closed-outline"
            hint="Use pelo menos 8 caracteres."
          />
          <TextField
            label="Confirmar senha"
            value={confirm}
            onChangeText={setConfirm}
            placeholder="Digite a senha novamente"
            secure
            autoCapitalize="none"
            autoComplete="new-password"
            textContentType="newPassword"
            icon="lock-closed-outline"
          />

          {error ? (
            <AppText variant="caption" color={colors.danger}>
              {error}
            </AppText>
          ) : null}

          <Checkbox
            checked={accepted}
            onChange={(value) => {
              setAccepted(value);
              if (value) {
                setTermsError(null);
              }
            }}
            label={
              <AppText variant="caption" color={colors.textSecondary}>
                Li e aceito os{' '}
                <AppText
                  variant="caption"
                  color={colors.primary}
                  onPress={() => router.push('/(auth)/terms')}
                >
                  Termos de uso
                </AppText>{' '}
                e a{' '}
                <AppText
                  variant="caption"
                  color={colors.primary}
                  onPress={() => router.push('/settings/privacy-policy')}
                >
                  Política de privacidade
                </AppText>
                .
              </AppText>
            }
            error={termsError}
          />
          <AppText variant="caption" color={colors.textMuted}>
            Ao criar a conta, declaro ter 18 anos ou mais.
          </AppText>

          <Button
            label="Criar conta"
            onPress={handleSubmit}
            loading={loading}
            size="lg"
            icon="add"
            fullWidth
          />
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
  intro: {
    maxWidth: 330,
  },
  form: {
    gap: Spacing.lg,
  },
});
