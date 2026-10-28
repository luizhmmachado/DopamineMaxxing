import { useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { NetworkBadge } from '@/components/ui/network-badge';
import { getNetwork } from '@/constants/networks';
import { Radius, Spacing } from '@/constants/theme';
import { getErrorMessage } from '@/lib/errors';
import { openOriginal, shareNative, shareToWhatsApp } from '@/lib/share';
import { useAppTheme } from '@/hooks/use-app-theme';
import { usePerformance } from '@/hooks/use-performance';
import type { FeedPost } from '@/types/models';

interface ShareSheetProps {
  post: FeedPost | null;
  visible: boolean;
  onClose: () => void;
}

export function ShareSheet({ post, visible, onClose }: ShareSheetProps) {
  const { colors } = useAppTheme();
  const { animationsEnabled } = usePerformance();
  const insets = useSafeAreaInsets();
  const [busy, setBusy] = useState<string | null>(null);

  if (!post) {
    return null;
  }

  const meta = getNetwork(post.network);

  async function run(id: string, action: () => Promise<void>) {
    setBusy(id);
    try {
      await action();
      onClose();
    } catch (error) {
      Alert.alert('Não foi possível compartilhar', getErrorMessage(error));
    } finally {
      setBusy(null);
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType={animationsEnabled ? 'slide' : 'none'}
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fechar compartilhamento"
          style={[styles.backdrop, { backgroundColor: colors.scrim }]}
          onPress={onClose}
        />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.backgroundElevated,
              borderColor: colors.border,
              paddingBottom: Math.max(insets.bottom, Spacing.lg),
            },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: colors.borderStrong }]} />
          <View style={styles.header}>
            <NetworkBadge network={post.network} />
            <AppText variant="bodyStrong" numberOfLines={1} style={styles.headerTitle}>
              Compartilhar post de {post.author.name}
            </AppText>
          </View>

          <Option
            icon="chatbubbles-outline"
            iconColor="#25D366"
            label="WhatsApp"
            loading={busy === 'whatsapp'}
            onPress={() => run('whatsapp', () => shareToWhatsApp(post))}
          />
          <Option
            icon="share-social-outline"
            label="Mais opções"
            description="Abrir o menu de compartilhamento do sistema"
            loading={busy === 'native'}
            onPress={() => run('native', () => shareNative(post))}
          />
          <Option
            icon={meta.icon}
            iconColor={meta.color}
            label={`Abrir no ${meta.shortName}`}
            description="Ver o post original na rede social"
            loading={busy === 'original'}
            onPress={() => run('original', () => openOriginal(post))}
          />
          <Option icon="close" label="Cancelar" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

interface OptionProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  iconColor?: string;
  label: string;
  description?: string;
  loading?: boolean;
  onPress: () => void;
}

function Option({ icon, iconColor, label, description, loading, onPress }: OptionProps) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={loading ? undefined : onPress}
      style={({ pressed }) => [styles.option, pressed && { backgroundColor: colors.surfaceAlt }]}
    >
      <View style={[styles.optionIcon, { backgroundColor: colors.surfaceAlt }]}>
        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Ionicons name={icon} size={21} color={iconColor ?? colors.text} />
        )}
      </View>
      <View style={styles.optionTexts}>
        <AppText variant="bodyStrong">{label}</AppText>
        {description ? (
          <AppText variant="caption" color={colors.textSecondary}>
            {description}
          </AppText>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheet: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    gap: Spacing.xs,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  headerTitle: {
    flex: 1,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.md,
  },
  optionIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTexts: {
    flex: 1,
    gap: 2,
  },
});
