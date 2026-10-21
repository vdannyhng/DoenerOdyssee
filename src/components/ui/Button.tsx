import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { ComponentProps } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, type PressableProps } from 'react-native';

import { radius, spacing, touchTarget } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

import { AppText } from './AppText';

type Variant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger';
export type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  title: string;
  variant?: Variant;
  icon?: IconName;
  loading?: boolean;
  compact?: boolean;
};

export function Button({
  title,
  variant = 'primary',
  icon,
  loading = false,
  compact = false,
  disabled,
  ...rest
}: ButtonProps) {
  const { colors } = useTheme();
  const isDisabled = !!disabled || loading;

  const look: Record<
    Variant,
    { bg: string; fg: string; tone: 'onPrimary' | 'onAccent' | 'primary' | 'danger' }
  > = {
    primary: { bg: colors.primary, fg: colors.onPrimary, tone: 'onPrimary' },
    accent: { bg: colors.accent, fg: colors.onAccent, tone: 'onAccent' },
    secondary: { bg: colors.surface, fg: colors.primary, tone: 'primary' },
    ghost: { bg: 'transparent', fg: colors.primary, tone: 'primary' },
    danger: { bg: 'transparent', fg: colors.danger, tone: 'danger' },
  };
  const { bg, fg, tone } = look[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        compact && styles.compact,
        { backgroundColor: bg, opacity: isDisabled ? 0.5 : pressed ? 0.8 : 1 },
        (variant === 'secondary' || variant === 'danger') && {
          borderColor: variant === 'danger' ? colors.danger : colors.border,
          borderWidth: 1.5,
        },
        (variant === 'primary' || variant === 'accent') && styles.raised,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.row}>
          {icon ? <MaterialCommunityIcons name={icon} size={20} color={fg} /> : null}
          <AppText variant="bodyStrong" tone={tone} style={styles.label}>
            {title}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: touchTarget,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compact: { minHeight: 40, paddingHorizontal: spacing.md },
  raised: {
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  label: { textAlign: 'center' },
});
