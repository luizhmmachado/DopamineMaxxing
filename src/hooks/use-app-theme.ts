import { useColorScheme } from 'react-native';

import { Colors, type ThemeColors, type ThemeScheme } from '@/constants/theme';
import { useSettings } from '@/providers/settings-provider';

export interface AppTheme {
  scheme: ThemeScheme;
  isDark: boolean;
  colors: ThemeColors;
}

export function useAppTheme(): AppTheme {
  const systemScheme = useColorScheme();
  const { settings } = useSettings();
  const scheme: ThemeScheme =
    settings.theme === 'system' ? (systemScheme === 'light' ? 'light' : 'dark') : settings.theme;
  return {
    scheme,
    isDark: scheme === 'dark',
    colors: Colors[scheme],
  };
}
