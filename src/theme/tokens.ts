import type { TierKey } from '@/features/ranking/scoring';

// Pergament, Ozeanblau, Rot, Gold, Holzbraun. Textfarben gegen ihre Hintergründe auf ≥ 4.5:1 geprüft.
export const palette = {
  light: {
    background: '#F1E4C3',
    surface: '#FBF4E2',
    surfaceMuted: '#E8D7AE',
    border: '#C4A872',
    text: '#2A1A0C',
    textMuted: '#5E4528',
    primary: '#1D4E89',
    primaryPressed: '#163C6A',
    onPrimary: '#FFFFFF',
    accent: '#A8261D',
    accentPressed: '#861E17',
    onAccent: '#FFFFFF',
    gold: '#8A6200',
    goldBright: '#D9A521',
    wood: '#6B4423',
    woodDark: '#3B2412',
    onWood: '#F6E8C8',
    danger: '#A1251B',
    success: '#2E6B34',
    focus: '#1D4E89',
  },
  // „Nachtfahrt“
  dark: {
    background: '#0D1726',
    surface: '#15233A',
    surfaceMuted: '#1E3150',
    border: '#3A5277',
    text: '#F2E6C9',
    textMuted: '#BCAF90',
    primary: '#86B8EA',
    primaryPressed: '#A6CBF0',
    onPrimary: '#0B1A2C',
    accent: '#EE7A6E',
    accentPressed: '#F39A90',
    onAccent: '#2A0705',
    gold: '#E8BC4F',
    goldBright: '#E8BC4F',
    wood: '#3A2414',
    woodDark: '#21140A',
    onWood: '#F2E6C9',
    danger: '#F08A80',
    success: '#7CC785',
    focus: '#A6CBF0',
  },
} as const;

export type ColorScheme = keyof typeof palette;
export type ThemeColors = { [K in keyof (typeof palette)['light']]: string };

/** Wanted-Poster bleiben in beiden Modi Papier */
export const poster = {
  paper: '#EBD9A8',
  paperEdge: '#C9AE6E',
  ink: '#3A2511',
  inkMuted: '#6A4B26',
  nail: '#5B5B5B',
} as const;

/** Tier-Farben mit dunkler Schrift (Tier zusätzlich immer als Buchstabe, nie nur Farbe) */
export const tierColors: Record<TierKey, { bg: string; fg: string }> = {
  S: { bg: '#E8695E', fg: '#2A0705' },
  A: { bg: '#EE9B4E', fg: '#2A1405' },
  B: { bg: '#EBCB5C', fg: '#2A1F05' },
  C: { bg: '#A3C96B', fg: '#14240A' },
  D: { bg: '#7DB7D6', fg: '#0A1E2A' },
  F: { bg: '#A7A3B3', fg: '#1A1822' },
};

export const fonts = {
  /** Comic-Abenteuer-Schrift für Überschriften */
  display: 'Bangers_400Regular',
  /** Fette Serife im Steckbrief-Stil (Wanted-Poster, Kopfgeld) */
  poster: 'AbrilFatface_400Regular',
  body: 'Nunito_400Regular',
  bodySemiBold: 'Nunito_600SemiBold',
  bodyBold: 'Nunito_700Bold',
  bodyHeavy: 'Nunito_800ExtraBold',
} as const;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 } as const;
export const radius = { sm: 6, md: 10, lg: 16, pill: 999 } as const;
/** Mindestgrösse für Touch-Ziele (pt) */
export const touchTarget = 48;

export const memberColors = [
  '#1D4E89',
  '#A8261D',
  '#2E6B34',
  '#8A6200',
  '#6B3FA0',
  '#0F7C80',
  '#B5479B',
  '#5A3A1F',
] as const;
