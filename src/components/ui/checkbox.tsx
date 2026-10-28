import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '@/components/ui/app-text';
import { Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  description?: string;
  error?: string | null;
  disabled?: boolean;
}

export function Checkbox({ checked, onChange, label, description, error, disabled }: CheckboxProps) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.wrapper}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked, disabled }}
        onPress={disabled ? undefined : () => onChange(!checked)}
        style={({ pressed }) => [styles.row, pressed && { opacity: 0.75 }]}
      >
        <View
          style={[
            styles.box,
            {
              backgroundColor: checked ? colors.primary : 'transparent',
              borderColor: error ? colors.danger : checked ? colors.primary : colors.borderStrong,
            },
          ]}
        >
          {checked ? <Ionicons name="checkmark" size={15} color={colors.onPrimary} /> : null}
        </View>
        <View style={styles.texts}>
          <View>{typeof label === 'string' ? <AppText variant="caption">{label}</AppText> : label}</View>
          {description ? (
            <AppText variant="caption" color={colors.textMuted}>
              {description}
            </AppText>
          ) : null}
        </View>
      </Pressable>
      {error ? (
        <AppText variant="caption" color={colors.danger} style={styles.error}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: Radius.sm - 2,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  texts: {
    flex: 1,
    gap: 2,
  },
  error: {
    marginLeft: 34,
  },
});
