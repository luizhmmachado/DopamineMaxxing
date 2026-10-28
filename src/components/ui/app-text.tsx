import { Text, type TextProps, type TextStyle } from 'react-native';

import { FontSize, Fonts } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

export type TextVariant =
  | 'display'
  | 'title'
  | 'heading'
  | 'body'
  | 'bodyStrong'
  | 'caption'
  | 'label'
  | 'overline'
  | 'mono';

interface AppTextProps extends TextProps {
  variant?: TextVariant;
  color?: string;
  align?: TextStyle['textAlign'];
}

const VARIANTS: Record<TextVariant, TextStyle> = {
  display: {
    fontFamily: Fonts.bold,
    fontSize: FontSize.display,
    lineHeight: 38,
    letterSpacing: -0.6,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: FontSize.xxl,
    lineHeight: 30,
    letterSpacing: -0.4,
  },
  heading: {
    fontFamily: Fonts.semibold,
    fontSize: FontSize.xl,
    lineHeight: 26,
    letterSpacing: -0.2,
  },
  body: {
    fontFamily: Fonts.regular,
    fontSize: FontSize.md,
    lineHeight: 22,
  },
  bodyStrong: {
    fontFamily: Fonts.semibold,
    fontSize: FontSize.md,
    lineHeight: 22,
  },
  caption: {
    fontFamily: Fonts.regular,
    fontSize: FontSize.sm,
    lineHeight: 16,
  },
  label: {
    fontFamily: Fonts.semibold,
    fontSize: FontSize.sm,
    lineHeight: 16,
  },
  overline: {
    fontFamily: Fonts.semibold,
    fontSize: FontSize.xs,
    lineHeight: 14,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  mono: {
    fontFamily: Fonts.mono,
    fontSize: FontSize.sm,
    lineHeight: 16,
  },
};

export function AppText({
  variant = 'body',
  color,
  align,
  style,
  children,
  ...rest
}: AppTextProps) {
  const { colors } = useAppTheme();
  return (
    <Text
      {...rest}
      style={[
        VARIANTS[variant],
        { color: color ?? colors.text },
        align ? { textAlign: align } : null,
        style,
      ]}
    >
      {children}
    </Text>
  );
}
