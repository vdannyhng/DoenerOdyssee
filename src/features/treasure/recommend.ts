import type { Rating, Visit } from '@/features/logbook/api';
import type { SpotSummary } from '@/features/ranking/useRanking';

/**
 * „Die Crew empfiehlt dir“: Spots mit gutem Gesamtwert, die diese Person noch nie bewertet hat.
 * Sortiert nach Gesamtwert, bei Gleichstand nach Anzahl Bewerter.
 */
export function recommendForMember(
  summaries: readonly SpotSummary[],
  ratings: readonly Rating[],
  visits: readonly Visit[],
  memberId: string,
  { minScore = 7, limit = 5 }: { minScore?: number; limit?: number } = {},
): SpotSummary[] {
  const spotOfVisit = new Map(visits.map((v) => [v.id, v.spot_id]));
  const tried = new Set(
    ratings.filter((r) => r.member_id === memberId).flatMap((r) => spotOfVisit.get(r.visit_id) ?? []),
  );
  return summaries
    .filter((s) => s.score && s.score.overall >= minScore && !tried.has(s.spot.id))
    .sort((a, b) => b.score!.overall - a.score!.overall || b.score!.raterCount - a.score!.raterCount)
    .slice(0, limit);
}

/** Wunschliste: Spots ohne Bewertung, neueste zuerst */
export function wishlist(summaries: readonly SpotSummary[]): SpotSummary[] {
  return summaries.filter((s) => !s.score).sort((a, b) => b.spot.created_at.localeCompare(a.spot.created_at));
}
