/**
 * Berechnung von Gesamtwert, Rang, Tier und Kopfgeld – reine Funktionen, siehe Anforderungen 4.3.
 *
 * - Pro Person und Spot: Durchschnitt über alle Besuche dieser Person.
 * - Gesamtwert eines Spots: Durchschnitt der Personen-Werte (jede Person zählt gleich).
 * - Intern ungerundet; gerundet wird erst für die Anzeige (roundScore, 2 Nachkommastellen).
 * - Einzelnoten werden mit einer Nachkommastelle erfasst (formatRating).
 */

export type RatingInput = {
  spotId: string;
  visitId: string;
  memberId: string;
  score: number;
};

export type MemberSpotScore = {
  memberId: string;
  /** Durchschnitt über alle Besuche dieser Person */
  average: number;
  /** Einzelnoten in Eingabereihenfolge */
  scores: number[];
};

export type SpotScore = {
  spotId: string;
  overall: number;
  raterCount: number;
  /** Niedrigster Personen-Wert (für den Tie-Break) */
  minScore: number;
  members: MemberSpotScore[];
};

export type RankedSpot<S extends { id: string; name: string }> = {
  rank: number;
  spot: S;
  score: SpotScore;
};

export const TIER_KEYS = ['S', 'A', 'B', 'C', 'D', 'F'] as const;
export type TierKey = (typeof TIER_KEYS)[number];
/** Untergrenze (inklusive) je Tier; F ist alles darunter */
export type TierThresholds = Record<Exclude<TierKey, 'F'>, number>;

export const DEFAULT_TIER_THRESHOLDS: TierThresholds = { S: 9, A: 8, B: 7, C: 5.5, D: 4 };

const EPSILON = 1e-9;

const mean = (values: number[]): number => values.reduce((sum, v) => sum + v, 0) / values.length;

export function computeSpotScores(ratings: readonly RatingInput[]): Map<string, SpotScore> {
  const bySpot = new Map<string, Map<string, number[]>>();
  for (const r of ratings) {
    let byMember = bySpot.get(r.spotId);
    if (!byMember) {
      byMember = new Map();
      bySpot.set(r.spotId, byMember);
    }
    const list = byMember.get(r.memberId);
    if (list) list.push(r.score);
    else byMember.set(r.memberId, [r.score]);
  }

  const result = new Map<string, SpotScore>();
  for (const [spotId, byMember] of bySpot) {
    const members: MemberSpotScore[] = [...byMember].map(([memberId, scores]) => ({
      memberId,
      scores,
      average: mean(scores),
    }));
    const averages = members.map((m) => m.average);
    result.set(spotId, {
      spotId,
      overall: mean(averages),
      raterCount: members.length,
      minScore: Math.min(...averages),
      members,
    });
  }
  return result;
}

/**
 * Sortiert bewertete Spots absteigend nach Gesamtwert.
 * Tie-Break: 1. mehr Bewerter, 2. höhere Minimalnote, 3. Name alphabetisch.
 * Spots ohne Bewertung oder mit zu wenigen Bewertern fallen heraus.
 */
export function rankSpots<S extends { id: string; name: string }>(
  spots: readonly S[],
  scores: ReadonlyMap<string, SpotScore>,
  options: { minRaters?: number } = {},
): RankedSpot<S>[] {
  const minRaters = Math.max(1, options.minRaters ?? 1);
  return spots
    .flatMap((spot) => {
      const score = scores.get(spot.id);
      return score && score.raterCount >= minRaters ? [{ spot, score }] : [];
    })
    .sort((a, b) => {
      const diff = b.score.overall - a.score.overall;
      if (Math.abs(diff) > EPSILON) return diff;
      if (a.score.raterCount !== b.score.raterCount) return b.score.raterCount - a.score.raterCount;
      const minDiff = b.score.minScore - a.score.minScore;
      if (Math.abs(minDiff) > EPSILON) return minDiff;
      return a.spot.name.localeCompare(b.spot.name, 'de', { sensitivity: 'base' });
    })
    .map((entry, index) => ({ rank: index + 1, ...entry }));
}

export function tierFor(overall: number, thresholds: TierThresholds = DEFAULT_TIER_THRESHOLDS): TierKey {
  // Auf die angezeigten Nachkommastellen runden, damit z. B. 8.996 („9.00“) auch als S gilt
  const value = roundScore(overall);
  for (const key of ['S', 'A', 'B', 'C', 'D'] as const) {
    if (value >= thresholds[key] - EPSILON) return key;
  }
  return 'F';
}

/** Auf zwei Nachkommastellen runden (kaufmännisch, ohne Fliesskomma-Ausreisser wie 8.125 → 8.12) */
export function roundScore(value: number): number {
  return Math.round((value + 1e-9) * 100) / 100;
}

/** Berechnete Werte (Durchschnitte): zwei Nachkommastellen */
export function formatScore(value: number): string {
  return roundScore(value).toFixed(2);
}

/** Einzelne, eingegebene Note: eine Nachkommastelle */
export function formatRating(value: number): string {
  return (Math.round(value * 10) / 10).toFixed(1);
}

/** Eingabe wie „8,7“ oder „8.7“ → 8.7; ungültig oder ausserhalb 0–10 → null */
export function parseRating(raw: string): number | null {
  const v = raw.trim().replace(',', '.');
  if (!/^\d{1,2}(\.\d?)?$/.test(v)) return null;
  const n = Math.round(Number(v) * 10) / 10;
  return n >= 0 && n <= 10 ? n : null;
}

/** Fiktives Kopfgeld: gerundeter Gesamtwert × 100 Mio. Berries */
export function bountyFor(overall: number): number {
  return Math.round(roundScore(overall) * 100) * 1_000_000;
}

export function formatBounty(bounty: number): string {
  // Manuell statt toLocaleString: liefert auf allen Plattformen dasselbe Ergebnis
  return String(bounty).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
