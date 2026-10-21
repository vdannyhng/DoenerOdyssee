import { create } from 'zustand';

import type { Place } from '@/features/spots/geocoding';

/** Übergabe vom Karten-Picker zurück ins Spot-Formular */
type PickState = { picked: Place | null; setPicked: (p: Place | null) => void };

export const useLocationPick = create<PickState>()((set) => ({
  picked: null,
  setPicked: (picked) => set({ picked }),
}));
