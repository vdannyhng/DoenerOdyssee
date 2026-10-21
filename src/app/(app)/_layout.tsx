import { Stack } from 'expo-router';

import { useMyMember } from '@/features/crew/api';
import { useRealtimeSync } from '@/features/logbook/useRealtimeSync';
import { t } from '@/i18n/de';
import { headerOptions } from '@/theme/headerOptions';
import { useTheme } from '@/theme/useTheme';

export const unstable_settings = { initialRouteName: '(tabs)' };

export default function AppLayout() {
  const { colors } = useTheme();
  const me = useMyMember();
  useRealtimeSync(me.data?.crew_id);

  return (
    <Stack screenOptions={headerOptions(colors)}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="spots/index" options={{ title: t.spots.listTitle }} />
      <Stack.Screen name="spots/new" options={{ title: t.ranking.newSpot, presentation: 'modal' }} />
      <Stack.Screen name="spots/[id]/index" options={{ title: '' }} />
      <Stack.Screen name="spots/[id]/edit" options={{ title: t.spots.editTitle, presentation: 'modal' }} />
      <Stack.Screen name="visits/new" options={{ title: t.visits.newTitle, presentation: 'modal' }} />
      <Stack.Screen name="visits/[id]" options={{ title: t.visits.rateTitle, presentation: 'modal' }} />
      <Stack.Screen name="settings" options={{ title: t.settings.title }} />
    </Stack>
  );
}
