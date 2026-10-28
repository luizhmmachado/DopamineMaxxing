import { Platform } from 'react-native';

export const Colors = {
  dark: {
    background: '#08080B',
    backgroundElevated: '#111118',
    surface: '#15151D',
    surfaceAlt: '#1D1D28',
    border: '#2A2A38',
    borderStrong: '#3A3A4C',
    text: '#F6F6F8',
    textSecondary: '#A3A3B4',
    textMuted: '#6F6F82',
    primary: '#FF2E88',
    primaryPressed: '#D91B6E',
    primarySoft: '#3A1025',
    accent: '#B6FF3B',
    accentSoft: '#1F2A0B',
    success: '#34D399',
    danger: '#FB7185',
    dangerSoft: '#3B121B',
    warning: '#FBBF24',
    overlay: 'rgba(8, 8, 11, 0.72)',
    scrim: 'rgba(0, 0, 0, 0.55)',
    onPrimary: '#12040B',
    skeleton: '#1F1F2B',
  },
  light: {
    background: '#F7F7FA',
    backgroundElevated: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceAlt: '#EEEFF4',
    border: '#E0E1E9',
    borderStrong: '#C9CBD6',
    text: '#111118',
    textSecondary: '#5B5B6B',
    textMuted: '#8A8A99',
    primary: '#D6006E',
    primaryPressed: '#B4005C',
    primarySoft: '#FFE3F0',
    accent: '#5C8A00',
    accentSoft: '#EDF7D2',
    success: '#047857',
    danger: '#DC2626',
    dangerSoft: '#FEE2E2',
    warning: '#B45309',
    overlay: 'rgba(247, 247, 250, 0.82)',
    scrim: 'rgba(0, 0, 0, 0.45)',
    onPrimary: '#FFFFFF',
    skeleton: '#E6E7EE',
  },
} as const;

export type ThemeScheme = keyof typeof Colors;
export type ThemeColors = (typeof Colors)[ThemeScheme];

export const Fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  mono: Platform.select({ ios: 'ui-monospace', default: 'monospace' }) ?? 'monospace',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export const FontSize = {
  xs: 11,
  sm: 12,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  display: 32,
} as const;

export const Layout = {
  maxContentWidth: 720,
  tabBarHeight: 62,
  screenPadding: 20,
} as const;

export const NetworkColors = {
  instagram: '#E1306C',
  youtube: '#FF0033',
  tiktok: '#25F4EE',
  x: '#E7E9EA',
  threads: '#C4C4C4',
  mastodon: '#6364FF',
  bluesky: '#0A7AFF',
  reddit: '#FF4500',
} as const;
