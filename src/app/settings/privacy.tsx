import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Switch, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SettingsGroup, SettingsRow } from '@/components/ui/settings-row';
import { Radius, Spacing } from '@/constants/theme';
import { getErrorMessage } from '@/lib/errors';
import { PRIVACY_POLICY_VERSION } from '@/lib/validation';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useProfile } from '@/providers/profile-provider';
import type { ConsentInput, ConsentPurpose } from '@/types/models';

const RIGHTS = [
  'Confirmação da existência de tratamento',
  'Acesso aos dados',
  'Correção de dados incompletos ou desatualizados',
  'Anonimização, bloqueio ou eliminação de dados desnecessários',
  'Portabilidade dos dados',
  'Eliminação dos dados tratados com consentimento',
  'Informação sobre compartilhamento de dados',
  'Revogação do consentimento a qualquer momento',
];

export default function PrivacyScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { consents, saveConsents, saveProfile, profile } = useProfile();
  const [draft, setDraft] = useState<{
    personalization: boolean;
    analytics: boolean;
    location: boolean;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  const byPurpose = new Map(consents.map((consent) => [consent.purpose, consent.granted]));
  const personalization = draft?.personalization ?? Boolean(byPurpose.get('personalization'));
  const analytics = draft?.analytics ?? Boolean(byPurpose.get('analytics'));
  const location = draft?.location ?? Boolean(byPurpose.get('location'));

  async function persist(next: { personalization: boolean; analytics: boolean; location: boolean }) {
    setSaving(true);
    const payload: ConsentInput[] = [
      { purpose: 'essential', granted: true },
      { purpose: 'personalization', granted: next.personalization },
      { purpose: 'analytics', granted: next.analytics },
      { purpose: 'location', granted: next.location },
    ];
    try {
      await saveConsents(payload);
      if (!next.location && profile?.locationConsent) {
        await saveProfile({
          displayName: profile.displayName,
          username: profile.username,
          birthDate: profile.birthDate,
          avatarUrl: profile.avatarUrl,
          locationConsent: false,
          termsAccepted: true,
          privacyPolicyVersion: PRIVACY_POLICY_VERSION,
        });
      }
      setDraft(null);
    } catch (error) {
      setDraft(null);
      Alert.alert('Não foi possível salvar o consentimento', getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  function toggle(purpose: ConsentPurpose, value: boolean) {
    if (purpose === 'essential') return;
    const next = { personalization, analytics, location, [purpose]: value };
    setDraft(next);
    persist(next);
  }

  return (
    <Screen scroll padded={false} edges={['top', 'bottom']}>
      <ScreenHeader title="Privacidade e LGPD" subtitle="Seus dados, suas escolhas" />
      <View style={styles.content}>
        <Card style={styles.introCard}>
          <View style={[styles.introIcon, { backgroundColor: colors.accentSoft }]}>
            <Ionicons name="shield-checkmark-outline" size={24} color={colors.accent} />
          </View>
          <View style={styles.introTexts}>
            <AppText variant="bodyStrong">Privacidade por design</AppText>
            <AppText variant="caption" color={colors.textSecondary}>
              Coletamos o mínimo necessário para o app funcionar. Consentimentos opcionais podem ser
              revogados a qualquer momento, sem perda de acesso às funções essenciais.
            </AppText>
          </View>
        </Card>

        <SettingsGroup title="Consentimentos" footer={`Versão da política: ${PRIVACY_POLICY_VERSION}`}>
          <SettingsRow
            icon="lock-closed-outline"
            title="Essenciais"
            subtitle="Autenticação, segurança e funcionamento do feed"
            right={
              <View style={[styles.fixedBadge, { backgroundColor: colors.accentSoft }]}>
                <AppText variant="caption" color={colors.accent} style={styles.fixedText}>
                  Sempre ativos
                </AppText>
              </View>
            }
          />
          <SettingsRow
            icon="sparkles-outline"
            title="Personalização"
            subtitle="Usar interações para ordenar seu feed"
            right={
              <Switch
                value={personalization}
                disabled={saving}
                onValueChange={(value) => toggle('personalization', value)}
                trackColor={{ false: colors.surfaceAlt, true: colors.primarySoft }}
                thumbColor={personalization ? colors.primary : colors.textMuted}
              />
            }
          />
          <SettingsRow
            icon="bar-chart-outline"
            title="Métricas anônimas"
            subtitle="Ajudar a melhorar o app sem identificar você"
            right={
              <Switch
                value={analytics}
                disabled={saving}
                onValueChange={(value) => toggle('analytics', value)}
                trackColor={{ false: colors.surfaceAlt, true: colors.primarySoft }}
                thumbColor={analytics ? colors.primary : colors.textMuted}
              />
            }
          />
          <SettingsRow
            icon="location-outline"
            title="Localização"
            subtitle={
              profile?.locationConsent && profile.locationLabel
                ? `Compartilhada: ${profile.locationLabel}`
                : 'Nenhuma localização armazenada. Ative em Editar perfil.'
            }
            right={
              <Switch
                value={location}
                disabled={saving || !location}
                onValueChange={(value) => toggle('location', value)}
                trackColor={{ false: colors.surfaceAlt, true: colors.primarySoft }}
                thumbColor={location ? colors.primary : colors.textMuted}
              />
            }
            last
          />
        </SettingsGroup>

        <View style={styles.section}>
          <AppText variant="bodyStrong">Seus direitos</AppText>
          <Card style={styles.rightsCard}>
            {RIGHTS.map((right) => (
              <View key={right} style={styles.rightRow}>
                <Ionicons name="checkmark-circle-outline" size={17} color={colors.success} />
                <AppText variant="caption" color={colors.textSecondary} style={styles.rightText}>
                  {right}
                </AppText>
              </View>
            ))}
          </Card>
        </View>

        <Card style={styles.controllerCard}>
          <AppText variant="bodyStrong">Controlador de dados</AppText>
          <AppText variant="caption" color={colors.textSecondary}>
            DopamineMaxxing · DPO: [preencher contato antes da publicação]
          </AppText>
          <AppText variant="caption" color={colors.textSecondary}>
            Você pode solicitar acesso, correção, portabilidade ou exclusão a qualquer momento pelas
            opções de exportação e exclusão em Configurações. Responderemos em até 15 dias.
          </AppText>
        </Card>

        <Button
          label="Ler política de privacidade completa"
          onPress={() => router.push('/settings/privacy-policy')}
          variant="secondary"
          fullWidth
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.lg,
    gap: Spacing.xl,
  },
  introCard: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'flex-start',
  },
  introIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  introTexts: {
    flex: 1,
    gap: 3,
  },
  fixedBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.pill,
  },
  fixedText: {
    fontSize: 10,
  },
  section: {
    gap: Spacing.sm,
  },
  rightsCard: {
    gap: Spacing.sm,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  rightText: {
    flex: 1,
  },
  controllerCard: {
    gap: Spacing.sm,
  },
});
