import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { NETWORK_LIST } from '@/constants/networks';
import { Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

const AVAILABILITY_LABEL = {
  official: 'Integração oficial viável',
  limited: 'Integração limitada',
  demo: 'Somente demonstração',
} as const;

export default function AboutScreen() {
  const { colors } = useAppTheme();
  return (
    <Screen scroll padded={false} edges={['top', 'bottom']}>
      <ScreenHeader title="Sobre" subtitle="Versão, arquitetura e limites" />
      <View style={styles.content}>
        <Card style={styles.hero}>
          <View style={[styles.logo, { backgroundColor: colors.primary }]}>
            <AppText variant="heading" color={colors.onPrimary}>
              D
            </AppText>
          </View>
          <View style={styles.heroTexts}>
            <AppText variant="heading">DopamineMaxxing</AppText>
            <AppText variant="caption" color={colors.textSecondary}>
              Versão {Constants.expoConfig?.version ?? '1.0.0'} · Android e iOS
            </AppText>
          </View>
        </Card>

        <View style={styles.section}>
          <AppText variant="bodyStrong">Por que nem toda rede é conectável?</AppText>
          <AppText variant="caption" color={colors.textSecondary} style={styles.paragraph}>
            Instagram, TikTok, X e Threads não oferecem APIs gratuitas que permitam ler o feed
            pessoal de um usuário e agir em posts de terceiros. Tentar contornar isso com scraping
            violaria os termos das plataformas e criaria riscos jurídicos. Por isso, o app entrega
            uma experiência completa em modo demonstração e prepara conectores oficiais para as
            redes que permitem integração gratuita.
          </AppText>
        </View>

        <View style={styles.section}>
          <AppText variant="bodyStrong">Compatibilidade das APIs</AppText>
          <Card style={styles.networkList}>
            {NETWORK_LIST.map((network) => (
              <View key={network.id} style={styles.networkRow}>
                <View style={[styles.networkIcon, { backgroundColor: colors.surfaceAlt }]}>
                  <Ionicons name={network.icon} size={18} color={network.color} />
                </View>
                <View style={styles.networkTexts}>
                  <AppText variant="bodyStrong">{network.name}</AppText>
                  <AppText variant="caption" color={colors.textMuted}>
                    {AVAILABILITY_LABEL[network.availability]}
                  </AppText>
                </View>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor:
                        network.availability === 'official'
                          ? colors.success
                          : network.availability === 'limited'
                            ? colors.warning
                            : colors.textMuted,
                    },
                  ]}
                />
              </View>
            ))}
          </Card>
        </View>

        <View style={styles.section}>
          <AppText variant="bodyStrong">Stack</AppText>
          <Card style={styles.stackCard}>
            <StackRow label="Aplicativo" value="Expo + React Native + TypeScript" />
            <StackRow label="Backend" value="Supabase (Postgres, Auth, Storage)" />
            <StackRow label="Segurança" value="RLS, SecureStore e minimização de dados" />
            <StackRow label="Design" value="Componentes reutilizáveis + design tokens" />
            <StackRow label="Protótipo" value="Figma via API (scripts/figma-sync.mjs)" last />
          </Card>
        </View>

        <View style={styles.section}>
          <AppText variant="bodyStrong">Créditos</AppText>
          <AppText variant="caption" color={colors.textSecondary} style={styles.paragraph}>
            Vídeos de demonstração: Google Sample Media. Avatares de demonstração: pravatar.cc.
            Imagens de demonstração: picsum.photos. Nenhum conteúdo de rede social real é exibido no
            modo demonstração.
          </AppText>
        </View>

        <AppText variant="caption" color={colors.textMuted} align="center">
          Feito com foco em privacidade, desempenho e acessibilidade.
        </AppText>
      </View>
    </Screen>
  );
}

function StackRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  const { colors } = useAppTheme();
  return (
    <View
      style={[
        styles.stackRow,
        !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
      ]}
    >
      <AppText variant="caption" color={colors.textMuted}>
        {label}
      </AppText>
      <AppText variant="caption" style={styles.stackValue}>
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.lg,
    gap: Spacing.xl,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  logo: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTexts: {
    gap: 2,
  },
  section: {
    gap: Spacing.sm,
  },
  paragraph: {
    lineHeight: 20,
  },
  networkList: {
    gap: Spacing.md,
  },
  networkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  networkIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  networkTexts: {
    flex: 1,
    gap: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stackCard: {
    gap: 0,
    paddingVertical: 0,
  },
  stackRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  stackValue: {
    flex: 1,
    textAlign: 'right',
  },
});
