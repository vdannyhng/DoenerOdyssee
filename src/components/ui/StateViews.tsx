import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { t } from '@/i18n/de';
import { spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

import { AppText } from './AppText';
import { Button, type IconName } from './Button';

export function LoadingState({ label }: { label?: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.center} accessible accessibilityLabel={label ?? t.common.loading}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

export function EmptyState({
  icon = 'map-marker-question-outline',
  art,
  title,
  message,
  action,
}: {
  icon?: IconName;
  art?: ReactNode;
  title: string;
  message?: string;
  action?: ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.center}>
      {art ?? <MaterialCommunityIcons name={icon} size={56} color={colors.textMuted} />}
      <AppText variant="title" style={styles.text}>
        {title}
      </AppText>
      {message ? (
        <AppText tone="muted" style={styles.text}>
          {message}
        </AppText>
      ) : null}
      {action}
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  const { colors } = useTheme();
  return (
    <View style={styles.center} accessibilityRole="alert">
      <MaterialCommunityIcons name="lifebuoy" size={56} color={colors.danger} />
      <AppText style={styles.text}>{message ?? t.errors.generic}</AppText>
      {onRetry ? <Button title={t.common.retry} variant="secondary" onPress={onRetry} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.lg },
  text: { textAlign: 'center' },
});
