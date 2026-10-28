import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { BrandMark } from '@/components/ui/brand-mark';
import { Button } from '@/components/ui/button';
import { NetworkBadge } from '@/components/ui/network-badge';
import { Radius, Spacing } from '@/constants/theme';
import { getErrorMessage } from '@/lib/errors';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useAuth } from '@/providers/auth-provider';

export default function WelcomeScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { signInDemo } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleDemo() {
    setLoading(true);
    try {
      await signInDemo();
      router.replace('/');
    } catch (error) {
      Alert.alert('Não foi possível abrir a demonstração', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.brandRow}>
          <BrandMark size={36} />
          <AppText style={styles.brandName}>DopamineMaxxing</AppText>
        </View>

        <OrbitIllustration />

        <View style={styles.promise}>
          <View style={[styles.statusLabel, { backgroundColor: colors.primarySoft }]}>
            <AppText variant="overline" color={colors.primary}>
              Mais intenção. Menos scroll.
            </AppText>
          </View>
          <AppText variant="display">Um feed.{'\n'}Todas as redes.</AppText>
          <AppText variant="body" color={colors.textSecondary}>
            Seu conteúdo em um só lugar. Escolha o que importa e volte ao seu tempo.
          </AppText>
        </View>

        <View style={styles.actions}>
          <Button
            label="Criar conta"
            onPress={() => router.push('/(auth)/sign-up')}
            size="lg"
            icon="add"
            fullWidth
          />
          <Button
            label="Entrar"
            onPress={() => router.push('/(auth)/sign-in')}
            variant="secondary"
            size="lg"
            icon="log-in-outline"
            fullWidth
          />
          <Button
            label="Explorar demonstração"
            onPress={handleDemo}
            variant="ghost"
            size="lg"
            icon="play-outline"
            loading={loading}
            fullWidth
          />
        </View>

        <View style={styles.notice}>
          <AppText variant="caption" color={colors.textMuted} align="center">
            Demonstração com conteúdo fictício. Sem conexão real.
          </AppText>
          <AppText variant="caption" color={colors.textMuted} align="center">
            Uso exclusivo para maiores de 18 anos.
          </AppText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function OrbitIllustration() {
  const { colors } = useAppTheme();
  return (
    <View style={styles.illustration} accessibilityElementsHidden>
      <View
        style={[
          styles.outerOrbit,
          { borderColor: colors.border, backgroundColor: colors.background },
        ]}
      />
      <View style={[styles.innerOrbit, { borderColor: colors.border }]} />
      <View style={[styles.orbitMarker, styles.markerOne, { backgroundColor: colors.primary }]} />
      <View style={[styles.orbitMarker, styles.markerTwo, { backgroundColor: colors.accent }]} />
      <View style={styles.brandCenter}>
        <BrandMark size={88} />
      </View>
      <View style={[styles.networkBadge, styles.badgeLeft]}>
        <NetworkBadge network="bluesky" compact />
      </View>
      <View style={[styles.networkBadge, styles.badgeRight]}>
        <NetworkBadge network="mastodon" compact />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
    gap: Spacing.xl,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    minHeight: 36,
  },
  brandName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    lineHeight: 22,
  },
  illustration: {
    width: '100%',
    maxWidth: 350,
    aspectRatio: 350 / 232,
    alignSelf: 'center',
  },
  outerOrbit: {
    position: 'absolute',
    width: '64%',
    aspectRatio: 1,
    left: '18%',
    top: '2%',
    borderWidth: 1,
    borderRadius: 999,
  },
  innerOrbit: {
    position: 'absolute',
    width: '46%',
    aspectRatio: 1,
    left: '27%',
    top: '16%',
    borderWidth: 1,
    borderRadius: 999,
  },
  brandCenter: {
    position: 'absolute',
    left: '37%',
    top: '31%',
  },
  orbitMarker: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  markerOne: {
    left: '20%',
    top: '81%',
  },
  markerTwo: {
    right: '23%',
    top: '13%',
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  networkBadge: {
    position: 'absolute',
  },
  badgeLeft: {
    left: '2%',
    top: '14%',
  },
  badgeRight: {
    right: '0%',
    top: '68%',
  },
  promise: {
    gap: Spacing.md,
  },
  statusLabel: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
  },
  actions: {
    gap: Spacing.sm,
    marginTop: 'auto',
  },
  notice: {
    gap: 0,
    paddingTop: Spacing.xs,
  },
});
