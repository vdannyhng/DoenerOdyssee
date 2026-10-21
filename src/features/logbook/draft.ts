import { create } from 'zustand';

/**
 * Übergabe zwischen Logbuch und „Neue Insel“: Wer beim Eintragen einen Laden neu anlegt,
 * landet danach mit genau diesem Laden wieder im Logbuch.
 */
type LogDraft = {
  createdSpotId: string | null;
  setCreatedSpotId: (id: string | null) => void;
};

export const useLogDraft = create<LogDraft>()((set) => ({
  createdSpotId: null,
  setCreatedSpotId: (createdSpotId) => set({ createdSpotId }),
}));
