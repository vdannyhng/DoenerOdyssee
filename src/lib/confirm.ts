import { Alert, Platform } from 'react-native';

import { t } from '@/i18n/de';

/** Bestätigungsdialog, der auch im Browser funktioniert (Alert.alert ist dort ein No-op) */
export function confirm(
  title: string,
  body: string,
  ok: string,
  { destructive = false }: { destructive?: boolean } = {},
): Promise<boolean> {
  if (Platform.OS === 'web') return Promise.resolve(window.confirm(`${title}\n\n${body}`));
  return new Promise((resolve) =>
    Alert.alert(
      title,
      body,
      [
        { text: t.common.cancel, style: 'cancel', onPress: () => resolve(false) },
        { text: ok, style: destructive ? 'destructive' : 'default', onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    ),
  );
}
