import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Share, StyleSheet, Switch, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { SettingsGroup, SettingsRow } from '@/components/ui/settings-row';
import { Spacing } from '@/constants/theme';
import { getErrorMessage } from '@/lib/errors';
import { useRepository } from '@/hooks/use-repository';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useAuth } from '@/providers/auth-provider';
import { useProfile } from '@/providers/profile-provider';
import { useSettings } from '@/providers/settings-provider';
import type { ThemePreference } from '@/types/models';

const THEME_LABEL: Record<ThemePreference, string> = {
  system: 'Sistema',
  light: 'Claro',
  dark: 'Escuro',
};

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const { settings, updateSetting } = useSettings();
  const { profile, connections } = useProfile();
  const { signOut, supabaseEnabled, isDemoMode } = useAuth();
  const repository = useRepository();
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleExport() {
    if (!repository) {
      return;
    }
    setExporting(true);
    try {
      const data = await repository.exportData();
      await Share.share({
        title: 'Meus dados — DopamineMaxxing',
        message: data,
      });
    } catch (error) {
      Alert.alert('Não foi possível exportar', getErrorMessage(error));
    } finally {
      setExporting(false);
    }
  }

  function handleSignOut() {
    Alert.alert('Sair da conta?', 'Você precisará entrar novamente neste dispositivo.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/welcome');
        },
      },
    ]);
  }

  function handleDelete() {
    Alert.alert(
      'Excluir sua conta?',
      'Esta ação é permanente. Seu perfil, conexões, interações e comentários serão removidos. Não é possível desfazer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir tudo',
          style: 'destructive',
          onPress: async () => {
            if (!repository) {
              return;
            }
            setDeleting(true);
            try {
              await repository.deleteAccount();
              await signOut();
              router.replace('/(auth)/welcome');
            } catch (error) {
              Alert.alert('Não foi possível excluir', getErrorMessage(error));
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  }

  function cycleTheme() {
    const order: ThemePreference[] = ['system', 'light', 'dark'];
    const next = order[(order.indexOf(settings.theme) + 1) % order.length] ?? 'system';
    updateSetting('theme', next);
  }

  return (
    <Screen scroll padded={false} edges={['top']} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <AppText variant="title">Ajustes</AppText>
      </View>

      <Card
        onPress={() => router.push('/settings/edit-profile')}
        accessibilityLabel="Editar perfil"
        style={styles.profileCard}
      >
        <Avatar name={profile?.displayName ?? 'Você'} uri={profile?.avatarUrl} size={48} />
        <View style={styles.profileTexts}>
          <AppText variant="bodyStrong">{profile?.displayName ?? 'Seu perfil'}</AppText>
          <AppText variant="caption" color={colors.textSecondary}>
            {profile
              ? `@${profile.username}${isDemoMode ? ' · demonstração' : ''}`
              : 'Complete seu perfil'}
          </AppText>
        </View>
      </Card>

      <SettingsGroup
        title="Experiência"
        footer="O modo desempenho desativa autoplay, animações e reduz o uso de memória em dispositivos mais antigos."
      >
        <SettingsRow
          icon="leaf-outline"
          title="Modo desempenho"
          subtitle="Prioriza fluidez e economia"
          right={
            <Switch
              value={settings.performanceMode}
              onValueChange={(value) => updateSetting('performanceMode', value)}
              trackColor={{ false: colors.surfaceAlt, true: colors.primarySoft }}
              thumbColor={settings.performanceMode ? colors.primary : colors.textMuted}
            />
          }
        />
        <SettingsRow
          icon="play-outline"
          title="Reprodução automática"
          subtitle={
            settings.performanceMode ? 'Indisponível no modo desempenho' : 'Vídeos começam sem som'
          }
          right={
            <Switch
              value={settings.autoplay && !settings.performanceMode}
              disabled={settings.performanceMode}
              onValueChange={(value) => updateSetting('autoplay', value)}
              trackColor={{ false: colors.surfaceAlt, true: colors.primarySoft }}
              thumbColor={
                settings.autoplay && !settings.performanceMode ? colors.primary : colors.textMuted
              }
            />
          }
        />
        <SettingsRow
          icon="wifi-outline"
          title="Economia de dados"
          subtitle="Evita cache de imagens em disco"
          right={
            <Switch
              value={settings.dataSaver}
              onValueChange={(value) => updateSetting('dataSaver', value)}
              trackColor={{ false: colors.surfaceAlt, true: colors.primarySoft }}
              thumbColor={settings.dataSaver ? colors.primary : colors.textMuted}
            />
          }
        />
        <SettingsRow
          icon="accessibility-outline"
          title="Reduzir animações"
          subtitle="Desativa transições e efeitos de movimento"
          right={
            <Switch
              value={settings.reducedMotion}
              onValueChange={(value) => updateSetting('reducedMotion', value)}
              trackColor={{ false: colors.surfaceAlt, true: colors.primarySoft }}
              thumbColor={settings.reducedMotion ? colors.primary : colors.textMuted}
            />
          }
        />
        <SettingsRow
          icon={isDark ? 'moon-outline' : 'sunny-outline'}
          title="Tema"
          onPress={cycleTheme}
          right={
            <View style={styles.themeValue}>
              <AppText variant="caption" color={colors.textSecondary}>
                {THEME_LABEL[settings.theme]}
              </AppText>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </View>
          }
        />
      </SettingsGroup>

      <SettingsGroup title="Conta">
        <SettingsRow
          icon="person-outline"
          title="Editar perfil"
          onPress={() => router.push('/settings/edit-profile')}
        />
        <SettingsRow
          icon="link-outline"
          title="Redes conectadas"
          right={
            <AppText variant="caption" color={colors.textSecondary}>
              {isDemoMode
                ? `${connections.length} na demo`
                : `${connections.length} ${connections.length === 1 ? 'rede' : 'redes'}`}
            </AppText>
          }
          onPress={() => router.push('/settings/connected')}
        />
      </SettingsGroup>

      <SettingsGroup title="Privacidade e LGPD">
        <SettingsRow
          icon="shield-checkmark-outline"
          title="Consentimentos"
          subtitle="Controle suas permissões"
          onPress={() => router.push('/settings/privacy')}
        />
        <SettingsRow
          icon="document-text-outline"
          title="Política de privacidade"
          onPress={() => router.push('/settings/privacy-policy')}
        />
        <SettingsRow
          icon="reader-outline"
          title="Termos de uso"
          onPress={() => router.push('/(auth)/terms')}
        />
      </SettingsGroup>

      <SettingsGroup title="Sobre">
        <SettingsRow
          icon="information-circle-outline"
          title="Versão do aplicativo"
          right={
            <AppText variant="caption" color={colors.textSecondary}>
              {Constants.expoConfig?.version ?? '1.0.0'}
            </AppText>
          }
          onPress={() => router.push('/settings/about')}
        />
        <SettingsRow
          icon="code-slash-outline"
          title="Tecnologia prevista"
          subtitle="React Native + Expo"
          onPress={() => router.push('/settings/about')}
        />
        <SettingsRow
          icon="unlink-outline"
          title="Limitações das APIs"
          subtitle="Integrações reais e demonstração"
          onPress={() => router.push('/settings/about')}
        />
      </SettingsGroup>

      <View style={styles.actions}>
        <Button
          label={exporting ? 'Exportando…' : 'Exportar meus dados'}
          onPress={exporting ? undefined : handleExport}
          loading={exporting}
          variant="secondary"
          icon="download-outline"
          fullWidth
        />
        <Button
          label={deleting ? 'Excluindo…' : 'Excluir conta'}
          onPress={deleting ? undefined : handleDelete}
          loading={deleting}
          variant="ghost"
          icon="trash-outline"
          fullWidth
        />
        <Button
          label="Sair"
          onPress={handleSignOut}
          variant="secondary"
          icon="log-out-outline"
          fullWidth
        />
      </View>

      <View style={styles.footer}>
        <AppText variant="caption" color={colors.textMuted} align="center">
          DopamineMaxxing · mais intenção, menos scroll.
        </AppText>
        <AppText variant="caption" color={colors.textMuted} align="center">
          {!isDemoMode && supabaseEnabled ? 'Supabase conectado' : 'Modo demonstração local'}
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
  },
  header: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    minHeight: 80,
  },
  profileTexts: {
    flex: 1,
    gap: 1,
  },
  themeValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  actions: {
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  footer: {
    marginTop: Spacing.xl,
    gap: Spacing.xs,
  },
});
