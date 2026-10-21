import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { appStorage } from '@/lib/storage';

export type ThemePreference = 'system' | 'light' | 'dark';

type DeviceSettings = {
  theme: ThemePreference;
  reduceMotion: boolean;
  setTheme: (theme: ThemePreference) => void;
  setReduceMotion: (value: boolean) => void;
};

/** Geräte-Einstellungen (nicht Crew-weit): Darstellung und Animationen */
export const useDeviceSettings = create<DeviceSettings>()(
  persist(
    (set) => ({
      theme: 'system',
      reduceMotion: false,
      setTheme: (theme) => set({ theme }),
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),
    }),
    {
      name: 'doener-device-settings',
      storage: createJSONStorage(() => appStorage),
      partialize: ({ theme, reduceMotion }) => ({ theme, reduceMotion }),
    },
  ),
);
