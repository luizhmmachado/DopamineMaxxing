import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { NETWORK_LIST } from '@/constants/networks';
import { Radius, Spacing } from '@/constants/theme';
import { getErrorMessage } from '@/lib/errors';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useProfile } from '@/providers/profile-provider';
import type { NetworkAvailability, NetworkId } from '@/types/models';

const AVAILABILITY_LABEL: Record<NetworkAvailability, string> = {
  official: 'Disponível API',
  limited: 'Limitado API',
  demo: 'Demonstração',
};

function statusLine(network: NetworkId, selected: boolean) {
  const meta = NETWORK_LIST.find((item) => item.id === network);
  if (!meta) {
    return '';
  }
  const mode =
    meta.availability === 'official'
      ? network === 'bluesky'
        ? 'AT Protocol'
        : 'OAuth'
      : meta.availability === 'limited'
        ? network === 'reddit'
          ? 'acesso sujeito a regras'
          : 'vídeos públicos'
        : 'Simulado';
  return `${AVAILABILITY_LABEL[meta.availability]} · ${mode} · ${selected ? 'Selecionada' : 'Não conectada'}`;
}

export default function ConnectNetworksScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { connections, connectNetwork, disconnectNetwork, loading } = useProfile();
  const [selected, setSelected] = useState<NetworkId[]>([]);
  const [saving, setSaving] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (!loading && !initialized.current) {
      initialized.current = true;
      setSelected(connections.map((connection) => connection.network));
    }
  }, [connections, loading]);

  function toggle(network: NetworkId) {
    setSelected((current) =>
      current.includes(network) ? current.filter((item) => item !== network) : [...current, network],
    );
  }

  async function handleContinue() {
    if (selected.length === 0) {
      Alert.alert('Conecte pelo menos uma rede', 'Escolha uma rede para montar seu primeiro feed.');
      return;
    }
    setSaving(true);
    try {
      const current = new Set(connections.map((connection) => connection.network));
      const next = new Set(selected);
      for (const network of current) {
        if (!next.has(network)) {
          await disconnectNetwork(network);
        }
      }
      for (const network of next) {
        if (!current.has(network)) {
          await connectNetwork(network);
        }
      }
      router.push('/(onboarding)/profile');
    } catch (error) {
      Alert.alert('Não foi possível salvar as conexões', getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen
      padded={false}
      edges={['top', 'bottom']}
      footer={
        <>
          <AppText variant="caption" color={colors.textSecondary} align="center">
            {selected.length === 0
              ? 'Selecione pelo menos uma rede para continuar.'
              : `${selected.length} ${selected.length === 1 ? 'rede selecionada' : 'redes selecionadas'} · modo demonstração`}
          </AppText>
          <Button
            label="Continuar"
            onPress={handleContinue}
            loading={saving}
            size="lg"
            icon="arrow-forward"
            iconPosition="right"
            fullWidth
          />
        </>
      }
    >
      <ScreenHeader title="Conecte suas redes" subtitle="PASSO 1 DE 2 · SUAS CONEXÕES" />
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <AppText variant="heading">
          Escolha de onde vêm as suas próximas boas ideias.
        </AppText>

        <View style={[styles.notice, { backgroundColor: colors.surface }]}>
          <Ionicons name="information-circle-outline" size={18} color={colors.textSecondary} />
          <View style={styles.noticeTexts}>
            <AppText variant="bodyStrong">Conexões com transparência</AppText>
            <AppText variant="caption" color={colors.textSecondary}>
              Instagram, TikTok, X e Threads não oferecem API gratuita de feed pessoal. Aqui, são
              demonstrações. Não fazemos scraping.
            </AppText>
          </View>
        </View>

        <View style={styles.list}>
          {NETWORK_LIST.map((network) => {
            const isSelected = selected.includes(network.id);
            const actionLabel = isSelected
              ? '✓ Selecionada'
              : network.availability === 'demo'
                ? 'Ver demo'
                : 'Conectar';
            return (
              <Pressable
                key={network.id}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isSelected }}
                accessibilityLabel={`Conectar ${network.name}`}
                onPress={() => toggle(network.id)}
                style={({ pressed }) => [
                  styles.networkCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: isSelected ? colors.primary : colors.border,
                    opacity: pressed ? 0.86 : 1,
                  },
                ]}
              >
                <Ionicons name={network.icon} size={20} color={network.color} />
                <View style={styles.networkTexts}>
                  <AppText variant="bodyStrong">{network.name}</AppText>
                  <AppText variant="caption" color={colors.textSecondary} numberOfLines={2}>
                    {statusLine(network.id, isSelected)}
                  </AppText>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={actionLabel}
                  onPress={() => toggle(network.id)}
                  hitSlop={8}
                  style={[
                    styles.connectionAction,
                    { borderColor: isSelected ? colors.primary : colors.border },
                  ]}
                >
                  <AppText
                    variant="caption"
                    color={isSelected ? colors.primary : colors.textSecondary}
                    style={styles.actionLabel}
                  >
                    {actionLabel}
                  </AppText>
                </Pressable>
              </Pressable>
            );
          })}
        </View>

        <View style={[styles.notice, { backgroundColor: colors.surface }]}>
          <Ionicons name="information-circle-outline" size={18} color={colors.textSecondary} />
          <AppText variant="caption" color={colors.textSecondary} style={styles.noticeText}>
            Mastodon e Bluesky permitem integração. YouTube e Reddit têm acesso limitado e sujeito
            às regras de cada API. Nenhuma conta foi conectada neste exemplo.
          </AppText>
        </View>
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
    gap: Spacing.lg,
  },
  notice: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
  },
  noticeTexts: {
    flex: 1,
    gap: Spacing.xs,
  },
  noticeText: {
    flex: 1,
  },
  list: {
    gap: Spacing.sm,
  },
  networkCard: {
    minHeight: 100,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  networkTexts: {
    flex: 1,
    gap: 3,
  },
  connectionAction: {
    width: 88,
    minHeight: 44,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xs,
  },
  actionLabel: {
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
  },
});
