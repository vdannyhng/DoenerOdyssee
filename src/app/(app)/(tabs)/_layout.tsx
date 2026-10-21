import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router, Tabs } from 'expo-router';
import type { ComponentProps, ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { LambTabIcon, LogportTabIcon, WantedTabIcon } from '@/components/art/TabIcons';
import { AppText } from '@/components/ui';
import { t } from '@/i18n/de';
import { headerOptions } from '@/theme/headerOptions';
import { fonts } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

const icon = (name: IconName) =>
  function TabIcon({ color, size }: { color: unknown; size: number }) {
    return (
      <MaterialCommunityIcons name={name} color={typeof color === 'string' ? color : undefined} size={size} />
    );
  };

/** Eigene SVG-Icons (Steckbrief, Flying Lamb, Logport) in der Tab-Farbe */
const art = (Icon: (p: { color: string; size: number }) => ReactNode) =>
  function TabArt({ color, size }: { color: unknown; size: number }) {
    return <Icon color={typeof color === 'string' ? color : '#F6E8C8'} size={size + 4} />;
  };

/** Grosser runder Knopf in der Mitte: von überall in einem Tipp ins Logbuch */
function LogTabButton() {
  const { colors } = useTheme();
  return (
    <View style={styles.logSlot}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t.visits.newTitle}
        onPress={() => router.push('/visits/new')}
        style={({ pressed }) => [
          styles.logButton,
          { backgroundColor: colors.accent, borderColor: colors.goldBright, opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <MaterialCommunityIcons name="feather" size={30} color={colors.onAccent} />
      </Pressable>
      <AppText style={[styles.logLabel, { color: colors.onWood }]}>{t.tabs.log}</AppText>
    </View>
  );
}

export default function TabsLayout() {
  const { colors } = useTheme();
  const header = headerOptions(colors);

  return (
    <Tabs
      screenOptions={{
        headerStyle: header.headerStyle,
        headerTintColor: header.headerTintColor,
        headerTitleStyle: header.headerTitleStyle,
        headerShadowVisible: false,
        tabBarStyle: { backgroundColor: colors.woodDark, borderTopColor: colors.wood },
        tabBarActiveTintColor: colors.goldBright,
        tabBarInactiveTintColor: colors.onWood,
        tabBarLabelStyle: { fontFamily: fonts.bodyBold, fontSize: 12 },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: t.ranking.title, tabBarLabel: t.tabs.ranking, tabBarIcon: art(WantedTabIcon) }}
      />
      <Tabs.Screen
        name="fleet"
        options={{ title: t.fleet.title, tabBarLabel: t.tabs.fleet, tabBarIcon: art(LambTabIcon) }}
      />
      <Tabs.Screen name="log" options={{ title: t.visits.newTitle, tabBarButton: () => <LogTabButton /> }} />
      <Tabs.Screen
        name="treasure"
        options={{
          title: t.treasure.title,
          tabBarLabel: t.tabs.treasure,
          tabBarIcon: art(LogportTabIcon),
        }}
      />
      <Tabs.Screen
        name="crew"
        options={{ title: t.crew.title, tabBarLabel: t.tabs.crew, tabBarIcon: icon('pirate') }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  logSlot: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 4 },
  logButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    marginTop: -26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
  },
  logLabel: { fontFamily: fonts.bodyBold, fontSize: 12, lineHeight: 16 },
});
