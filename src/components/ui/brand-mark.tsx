import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useAppTheme } from '@/hooks/use-app-theme';

interface BrandMarkProps {
  size?: number;
  color?: string;
  accentColor?: string;
  style?: StyleProp<ViewStyle>;
}

export function BrandMark({ size = 36, color, accentColor, style }: BrandMarkProps) {
  const { colors } = useAppTheme();
  const orbitColor = color ?? colors.primary;
  const satelliteColor = accentColor ?? colors.accent;

  return (
    <View style={[{ width: size, height: size }, style]} accessibilityElementsHidden>
      <View
        style={[
          styles.orbit,
          {
            width: size * 0.5,
            height: size * 0.61,
            left: size * 0.17,
            top: size * 0.19,
            borderWidth: Math.max(2, size * 0.055),
            borderRadius: size,
            borderColor: orbitColor,
          },
        ]}
      />
      <View
        style={[
          styles.satellite,
          {
            width: size * 0.14,
            height: size * 0.14,
            left: size * 0.67,
            top: size * 0.42,
            borderRadius: size,
            backgroundColor: satelliteColor,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  orbit: {
    position: 'absolute',
  },
  satellite: {
    position: 'absolute',
  },
});
