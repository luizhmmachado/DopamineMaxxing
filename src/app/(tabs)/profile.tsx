import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingView } from '@/components/ui/loading-view';
import { NetworkBadge } from '@/components/ui/network-badge';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { getNetwork } from '@/constants/networks';
import { Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useAuth } from '@/providers/auth-provider';
import { useProfile } from '@/providers/profile-provider';

export default function ProfileScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { profile, connections, loading } = useProfile();
  const { isDemoMode } = useAuth();

  if (loading && !profile) {
    return <LoadingView label="Carregando seu perfil…" />;
  }

  if (!profile) {
    return (
      <Screen>
        <EmptyState
          icon="person-circle-outline"
          title="Perfil não encontrado"
          description="Complete seu perfil Dopamine para continuar."
          actionLabel="Criar perfil"
          onAction={() => router.replace('/(onboarding)/profile')}
        />
      </Screen>
    );
  }

  return (
    <Screen
      scroll
      padded={false}
      edges={['top']}
      contentContainerStyle={styles.content}
    >
      <ScreenHeader
        title="Perfil"
        back={false}
        right={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Editar perfil"
            onPress={() => router.push('/settings/edit-profile')}
            hitSlop={8}
            style={styles.editAction}
          >
            <AppText variant="caption" color={colors.textSecondary}>
              Editar
            </AppText>
          </Pressable>
        }
      />

      <View style={styles.identity}>
        <Avatar
          name={profile.displayName}
          uri={profile.avatarUrl}
          size={64}
          ringColor={colors.border}
        />
        <View style={styles.identityTexts}>
          <AppText variant="title" align="center">
            {profile.displayName}
          </AppText>
          <AppText variant="caption" color={colors.textSecondary} align="center">
            @{profile.username}
          </AppText>
          <View style={[styles.statusLabel, { backgroundColor: colors.surfaceAlt }]}>
            <AppText variant="overline" color={colors.textSecondary}>
              {isDemoMode ? 'Perfil de demonstração' : 'Perfil privado'}
            </AppText>
          </View>
        </View>
      </View>

      <View style={styles.statsRow}>
        <Stat value={String(connections.length)} label={isDemoMode ? 'redes na demo' : 'redes conectadas'} />
        <Stat value="Privado" label="seu perfil" />
        <Stat value="LGPD" label="seus direitos" />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <AppText variant="heading">Suas redes</AppText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Gerenciar redes conectadas"
            onPress={() => router.push('/settings/connected')}
            hitSlop={8}
          >
            <AppText variant="caption" color={colors.primary}>
              Gerenciar
            </AppText>
          </Pressable>
        </View>
        <Card padded={false} style={styles.connectionsCard}>
          {connections.length === 0 ? (
            <View style={styles.emptyConnections}>
              <AppText variant="caption" color={colors.textSecondary} align="center">
                Nenhuma rede conectada. Conecte uma para montar seu feed.
              </AppText>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push('/settings/connected')}
                style={styles.inlineAction}
              >
                <AppText variant="caption" color={colors.primary}>
                  Conectar redes
                </AppText>
              </Pressable>
            </View>
          ) : (
            <View style={styles.connectionsList}>
              {connections.map((connection) => {
                const meta = getNetwork(connection.network);
                return (
                  <View key={connection.id} style={styles.connectionRow}>
                    <NetworkBadge network={connection.network} compact />
                    <View style={styles.connectionTexts}>
                      <AppText variant="caption" color={colors.textSecondary}>
                        {meta.name}
                      </AppText>
                    </View>
                    <View style={[styles.connectionStatus, { backgroundColor: colors.surfaceAlt }]}>
                      <AppText variant="overline" color={colors.textSecondary}>
                        {connection.integrationMode === 'demo' ? 'Simulado' : 'Oficial'}
                      </AppText>
                    </View>
                  </View>
                );
              })}
              {isDemoMode ? (
                <AppText variant="caption" color={colors.textMuted}>
                  Nenhuma conexão real neste exemplo.
                </AppText>
              ) : null}
            </View>
          )}
        </Card>
      </View>

      <Card style={styles.privacyCard}>
        <Ionicons name="shield-checkmark-outline" size={24} color={colors.accent} />
        <View style={styles.privacyTexts}>
          <AppText variant="heading">Seu feed. Seus dados.</AppText>
          <AppText variant="caption" color={colors.textSecondary}>
            Você decide o que compartilhar. Revise permissões e conheça seus direitos.
          </AppText>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Central de privacidade e LGPD"
          onPress={() => router.push('/settings/privacy')}
          style={styles.privacyLink}
        >
          <Ionicons name="shield-outline" size={20} color={colors.textSecondary} />
          <AppText variant="bodyStrong" style={styles.privacyLinkText}>
            Central de privacidade e LGPD
          </AppText>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </Pressable>
      </Card>
    </Screen>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.stat, { backgroundColor: colors.surface }]}>
      <AppText variant="heading" color={colors.primary}>
        {value}
      </AppText>
      <AppText variant="caption" color={colors.textSecondary} align="center">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
  },
  editAction: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  identity: {
    alignItems: 'center',
    gap: Spacing.md,
    paddingTop: Spacing.sm,
  },
  identityTexts: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statusLabel: {
    minHeight: 22,
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.pill,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  stat: {
    flex: 1,
    minHeight: 80,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.lg,
  },
  section: {
    gap: Spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  connectionsCard: {
    padding: Spacing.lg,
  },
  connectionsList: {
    gap: Spacing.md,
  },
  connectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: 22,
  },
  connectionTexts: {
    flex: 1,
  },
  connectionStatus: {
    minHeight: 22,
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.pill,
  },
  emptyConnections: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  inlineAction: {
    minHeight: 44,
    justifyContent: 'center',
  },
  privacyCard: {
    gap: Spacing.md,
  },
  privacyTexts: {
    gap: Spacing.xs,
  },
  privacyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: 60,
    marginTop: Spacing.xs,
  },
  privacyLinkText: {
    flex: 1,
  },
});
