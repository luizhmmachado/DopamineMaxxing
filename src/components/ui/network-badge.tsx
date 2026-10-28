import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '@/components/ui/app-text';
import { getNetwork } from '@/constants/networks';
import { Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import type { NetworkId } from '@/types/models';

interface NetworkBadgeProps {
  network: NetworkId;
  overlay?: boolean;
  compact?: boolean;
}

export function NetworkBadge({ network, overlay = false, compact = false }: NetworkBadgeProps) {
  const { colors } = useAppTheme();
  const meta = getNetwork(network);
  const background = overlay ? 'rgba(0, 0, 0, 0.55)' : colors.surfaceAlt;
  const textColor = overlay ? '#FFFFFF' : colors.text;

  return (
    <View
      style={[
        styles.badge,
        compact ? styles.compact : styles.full,
        { backgroundColor: background },
      ]}
    >
      <Ionicons
        name={meta.icon}
        size={compact ? 12 : 16}
        color={overlay ? '#FFFFFF' : meta.color}
      />
      <AppText
        variant="caption"
        color={textColor}
        style={[styles.label, compact ? styles.compactLabel : null]}
        numberOfLines={1}
      >
        {meta.shortName}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: Radius.sm,
  },
  compact: {
    height: 22,
    paddingHorizontal: Spacing.sm,
  },
  full: {
    height: 32,
    paddingHorizontal: Spacing.md,
  },
  label: {
    fontFamily: 'Inter_500Medium',
  },
  compactLabel: {
    fontSize: 12,
    lineHeight: 16,
  },
});
