import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAppTheme } from '@/hooks/use-app-theme';

interface IconButtonProps {
  name: ComponentProps<typeof Ionicons>['name'];
  onPress?: () => void;
  size?: number;
  color?: string;
  accessibilityLabel: string;
  variant?: 'plain' | 'surface' | 'overlay';
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

export function IconButton({
  name,
  onPress,
  size = 22,
  color,
  accessibilityLabel,
  variant = 'plain',
  style,
  disabled = false,
}: IconButtonProps) {
  const { colors } = useAppTheme();
  const background =
    variant === 'surface'
      ? colors.surfaceAlt
      : variant === 'overlay'
        ? 'rgba(0, 0, 0, 0.45)'
        : 'transparent';
  const iconColor = color ?? (variant === 'overlay' ? '#FFFFFF' : colors.text);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      onPress={disabled ? undefined : onPress}
      hitSlop={10}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: background, opacity: disabled ? 0.4 : pressed ? 0.7 : 1 },
        style,
      ]}
    >
      <Ionicons name={name} size={size} color={iconColor} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
