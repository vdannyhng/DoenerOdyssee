import { z } from 'zod';

import { DEFAULT_TIER_THRESHOLDS, type TierThresholds } from '@/features/ranking/scoring';

const score = z.number().min(0).max(10);

/** Crew-weite Einstellungen (crews.settings jsonb). Fehlende/kaputte Werte fallen auf Standards zurück. */
export const crewSettingsSchema = z.object({
  currency: z.string().min(1).max(5).catch('EUR'),
  minRaters: z.number().int().min(1).max(20).catch(1),
  tierThresholds: z
    .object({ S: score, A: score, B: score, C: score, D: score })
    .catch(DEFAULT_TIER_THRESHOLDS),
});

export type CrewSettings = z.infer<typeof crewSettingsSchema>;

export function parseCrewSettings(raw: unknown): CrewSettings {
  return crewSettingsSchema.parse(raw && typeof raw === 'object' ? raw : {});
}

/** Schwellen müssen von S nach D streng absteigen */
export function validThresholds(th: TierThresholds): boolean {
  return th.S > th.A && th.A > th.B && th.B > th.C && th.C > th.D;
}
