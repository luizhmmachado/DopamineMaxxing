import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { NETWORK_LIST } from '@/constants/networks';
import { Radius, Spacing } from '@/constants/theme';
import { getErrorMessage } from '@/lib/errors';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useProfile } from '@/providers/profile-provider';
import type { NetworkId } from '@/types/models';

export default function ConnectedNetworksScreen() {
  const { colors } = useAppTheme();
  const { connections, connectNetwork, disconnectNetwork } = useProfile();
  const [busy, setBusy] = useState<NetworkId | null>(null);

  async function toggle(network: NetworkId, connected: boolean) {
    setBusy(network);
    try {
      if (connected) {
        await connectNetwork(network);
      } else {
        await disconnectNetwork(network);
      }
    } catch (error) {
      Alert.alert('Não foi possível atualizar a conexão', getErrorMessage(error));
    } finally {
      setBusy(null);
    }
  }

  return (
    <Screen scroll padded={false} edges={['top', 'bottom']}>
      <ScreenHeader title="Redes conectadas" subtitle="Gerencie suas conexões" />
      <View style={styles.content}>
        <View style={[styles.notice, { backgroundColor: colors.surfaceAlt }]}>
          <Ionicons name="lock-closed-outline" size={18} color={colors.textSecondary} />
          <AppText variant="caption" color={colors.textSecondary} style={styles.noticeText}>
            Nenhuma credencial de rede social é armazenada no dispositivo ou no banco. As conexões
            demonstrativas existem para validar o fluxo do produto.
          </AppText>
        </View>

        {NETWORK_LIST.map((network) => {
          const connection = connections.find((item) => item.network === network.id);
          const connected = Boolean(connection);
          return (
            <Card key={network.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconWrap, { backgroundColor: colors.surfaceAlt }]}>
                  <Ionicons name={network.icon} size={22} color={network.color} />
                </View>
                <View style={styles.texts}>
                  <View style={styles.nameRow}>
                    <AppText variant="bodyStrong">{network.name}</AppText>
                    <View
                      style={[
                        styles.badge,
                        {
                          backgroundColor:
                            network.availability === 'official'
                              ? colors.accentSoft
                              : colors.surfaceAlt,
                        },
                      ]}
                    >
                      <AppText variant="caption" color={colors.textSecondary} style={styles.badgeText}>
                        {network.availability === 'official'
                          ? 'API oficial'
                          : network.availability === 'limited'
                            ? 'Limitada'
                            : 'Demonstração'}
                      </AppText>
                    </View>
                  </View>
                  <AppText variant="caption" color={colors.textMuted}>
                    {network.note}
                  </AppText>
                </View>
              </View>
              <View style={styles.actions}>
                <View style={styles.status}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: connected ? colors.success : colors.textMuted },
                    ]}
                  />
                  <AppText variant="caption" color={colors.textSecondary}>
                    {connected ? 'Conectada' : 'Não conectada'}
                  </AppText>
                </View>
                <Button
                  label={connected ? 'Desconectar' : 'Conectar'}
                  onPress={() => toggle(network.id, !connected)}
                  variant={connected ? 'outline' : 'secondary'}
                  size="sm"
                  loading={busy === network.id}
                />
              </View>
            </Card>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  notice: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
  },
  noticeText: {
    flex: 1,
  },
  card: {
    gap: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: {
    flex: 1,
    gap: 3,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 1,
    borderRadius: Radius.pill,
  },
  badgeText: {
    fontSize: 10,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
});
