import { useColorScheme } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { useDeviceSettings } from '@/features/settings/store';

import { palette, type ColorScheme, type ThemeColors } from './tokens';

export function useTheme(): { scheme: ColorScheme; colors: ThemeColors } {
  const system = useColorScheme();
  const preference = useDeviceSettings((s) => s.theme);
  const scheme: ColorScheme = preference === 'system' ? (system === 'dark' ? 'dark' : 'light') : preference;
  return { scheme, colors: palette[scheme] };
}

/** Animationen aus, wenn in der App oder im Betriebssystem „Bewegung reduzieren“ aktiv ist */
export function useReduceMotion(): boolean {
  const system = useReducedMotion();
  const app = useDeviceSettings((s) => s.reduceMotion);
  return system || app;
}
