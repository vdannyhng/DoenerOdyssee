import { fonts, type ThemeColors } from './tokens';

/** Holzbalken-Kopfzeile mit Abenteuer-Schrift */
export function headerOptions(colors: ThemeColors) {
  return {
    headerStyle: { backgroundColor: colors.wood },
    headerTintColor: colors.onWood,
    headerTitleStyle: { fontFamily: fonts.display, fontSize: 24, letterSpacing: 1 },
    headerShadowVisible: false,
    headerBackButtonDisplayMode: 'minimal' as const,
    contentStyle: { backgroundColor: colors.background },
  };
}
