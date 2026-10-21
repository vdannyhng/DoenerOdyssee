import { StyleSheet, Text, type TextProps } from 'react-native';

import { fonts, type ThemeColors } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

type Variant = 'display' | 'title' | 'heading' | 'body' | 'bodyStrong' | 'caption' | 'label';
type Tone =
  | 'default'
  | 'muted'
  | 'primary'
  | 'accent'
  | 'gold'
  | 'danger'
  | 'success'
  | 'onPrimary'
  | 'onAccent'
  | 'onWood';

const toneColor: Record<Tone, keyof ThemeColors> = {
  default: 'text',
  muted: 'textMuted',
  primary: 'primary',
  accent: 'accent',
  gold: 'gold',
  danger: 'danger',
  success: 'success',
  onPrimary: 'onPrimary',
  onAccent: 'onAccent',
  onWood: 'onWood',
};

export type AppTextProps = TextProps & { variant?: Variant; tone?: Tone };

export function AppText({ variant = 'body', tone = 'default', style, ...rest }: AppTextProps) {
  const { colors } = useTheme();
  const isHeading = variant === 'display' || variant === 'title' || variant === 'heading';
  return (
    <Text
      accessibilityRole={isHeading ? 'header' : undefined}
      maxFontSizeMultiplier={1.6}
      style={[styles[variant], { color: colors[toneColor[tone]] }, style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  display: { fontFamily: fonts.display, fontSize: 40, lineHeight: 46, letterSpacing: 1 },
  title: { fontFamily: fonts.display, fontSize: 30, lineHeight: 36, letterSpacing: 0.8 },
  heading: { fontFamily: fonts.bodyHeavy, fontSize: 19, lineHeight: 25 },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 23 },
  bodyStrong: { fontFamily: fonts.bodyBold, fontSize: 16, lineHeight: 23 },
  caption: { fontFamily: fonts.bodySemiBold, fontSize: 13, lineHeight: 18 },
  label: { fontFamily: fonts.bodyBold, fontSize: 14, lineHeight: 19, letterSpacing: 0.3 },
});
