import type { ComponentProps, ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import { Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

interface SettingsGroupProps {
  title?: string;
  footer?: string;
  children: ReactNode;
}

export function SettingsGroup({ title, footer, children }: SettingsGroupProps) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.group}>
      {title ? (
        <AppText variant="label" color={colors.textSecondary} style={styles.groupTitle}>
          {title}
        </AppText>
      ) : null}
      <Card padded={false}>{children}</Card>
      {footer ? (
        <AppText variant="caption" color={colors.textMuted} style={styles.footer}>
          {footer}
        </AppText>
      ) : null}
    </View>
  );
}

interface SettingsRowProps {
  icon?: ComponentProps<typeof Ionicons>['name'];
  iconColor?: string;
  title: string;
  subtitle?: string;
  right?: ReactNode;
  onPress?: () => void;
  destructive?: boolean;
  last?: boolean;
  accessibilityLabel?: string;
}

export function SettingsRow({
  icon,
  iconColor,
  title,
  subtitle,
  right,
  onPress,
  destructive = false,
  accessibilityLabel,
}: SettingsRowProps) {
  const { colors } = useAppTheme();
  const content = (
    <>
      {icon ? (
        <Ionicons
          name={icon}
          size={20}
          color={iconColor ?? (destructive ? colors.danger : colors.textSecondary)}
        />
      ) : null}
      <View style={styles.texts}>
        <AppText variant="bodyStrong" color={destructive ? colors.danger : colors.text}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" color={colors.textSecondary}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {right ?? (onPress ? (
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      ) : null)}
    </>
  );

  if (!onPress) {
    return <View style={styles.row}>{content}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        pressed && { backgroundColor: colors.surfaceAlt },
      ]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: Spacing.sm,
  },
  groupTitle: {
    marginLeft: 0,
  },
  footer: {
    marginHorizontal: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    minHeight: 60,
  },
  texts: {
    flex: 1,
    gap: 1,
  },
});
