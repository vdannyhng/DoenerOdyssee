import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/nunito';
import { AbrilFatface_400Regular } from '@expo-google-fonts/abril-fatface';
import { Bangers_400Regular } from '@expo-google-fonts/bangers';
import { QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, type Theme } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ErrorState } from '@/components/ui';
import { AuthProvider, useAuth } from '@/features/auth/AuthProvider';
import { useMyMember } from '@/features/crew/api';
import { errorMessage } from '@/lib/errors';
import { queryClient } from '@/lib/queryClient';
import { useTheme } from '@/theme/useTheme';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Bangers_400Regular,
    AbrilFatface_400Regular,
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <RootNavigator fontsReady={fontsLoaded || !!fontError} />
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function RootNavigator({ fontsReady }: { fontsReady: boolean }) {
  const { session, initializing } = useAuth();
  const me = useMyMember();
  const { scheme, colors } = useTheme();

  const ready = fontsReady && !initializing && (!session || !me.isLoading);
  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  const navTheme = useMemo<Theme>(() => {
    const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.primary,
        background: colors.background,
        card: colors.wood,
        text: colors.onWood,
        border: colors.woodDark,
      },
    };
  }, [scheme, colors]);

  if (!ready) return null;

  const signedIn = !!session;
  const hasCrew = !!me.data;

  return (
    <ThemeProvider value={navTheme}>
      <StatusBar style="light" />
      {signedIn && me.error && !me.data ? (
        <ErrorState message={errorMessage(me.error)} onRetry={() => void me.refetch()} />
      ) : (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Protected guard={!signedIn}>
            <Stack.Screen name="sign-in" />
            <Stack.Screen name="sign-up" />
          </Stack.Protected>
          <Stack.Protected guard={signedIn && !hasCrew}>
            <Stack.Screen name="onboarding" />
          </Stack.Protected>
          <Stack.Protected guard={signedIn && hasCrew}>
            <Stack.Screen name="(app)" />
          </Stack.Protected>
        </Stack>
      )}
    </ThemeProvider>
  );
}
