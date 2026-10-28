import { Image } from 'expo-image';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { useAvatarUri } from '@/hooks/use-avatar-uri';
import { useAppTheme } from '@/hooks/use-app-theme';
import { usePerformance } from '@/hooks/use-performance';
import { initials } from '@/lib/format';

interface AvatarProps {
  name: string;
  uri?: string | null;
  size?: number;
  style?: StyleProp<ViewStyle>;
  ringColor?: string;
}

export function Avatar({ name, uri, size = 40, style, ringColor }: AvatarProps) {
  const { colors } = useAppTheme();
  const { animationsEnabled, dataSaver } = usePerformance();
  const resolved = useAvatarUri(uri);

  return (
    <View
      style={[
        styles.wrapper,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.surfaceAlt,
          borderColor: ringColor ?? colors.border,
        },
        style,
      ]}
    >
      {resolved ? (
        <Image
          source={{ uri: resolved }}
          style={{ width: size, height: size }}
          contentFit="cover"
          transition={animationsEnabled ? 180 : 0}
          cachePolicy={dataSaver ? 'memory' : 'memory-disk'}
          recyclingKey={uri ?? undefined}
          accessibilityLabel={`Foto de ${name}`}
        />
      ) : (
        <AppText
          variant="bodyStrong"
          color={colors.textSecondary}
          style={{ fontSize: Math.max(12, size * 0.34) }}
        >
          {initials(name)}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
  },
});
