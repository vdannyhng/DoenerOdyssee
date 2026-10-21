import { useMemo } from 'react';

import { useCrew, useMyMember } from '@/features/crew/api';
import { useLogbook, type Logbook, type Spot, type Visit } from '@/features/logbook/api';

import {
  computeSpotScores,
  rankSpots,
  tierFor,
  type RankedSpot,
  type RatingInput,
  type SpotScore,
  type TierKey,
  type TierThresholds,
} from './scoring';

export type SpotSummary = {
  spot: Spot;
  score: SpotScore | null;
  rank: number | null;
  tier: TierKey | null;
  lastVisitedOn: string | null;
  visitCount: number;
  /** Foto vom Laden, sonst das neueste Döner-Foto */
  coverPhoto: string | null;
};

export type Ranking = {
  ranked: RankedSpot<Spot>[];
  summaries: Map<string, SpotSummary>;
  /** Besuche, bei denen ich dabei war, aber noch keine Note habe */
  openVisits: Visit[];
};

export function buildRanking(
  logbook: Logbook,
  options: { minRaters: number; thresholds: TierThresholds; myMemberId: string | null },
): Ranking {
  const visitById = new Map(logbook.visits.map((v) => [v.id, v]));
  const inputs: RatingInput[] = logbook.ratings.flatMap((r) => {
    const visit = visitById.get(r.visit_id);
    return visit
      ? [{ spotId: visit.spot_id, visitId: r.visit_id, memberId: r.member_id, score: r.taste_score }]
      : [];
  });
  const scores = computeSpotScores(inputs);
  const ranked = rankSpots(logbook.spots, scores, { minRaters: options.minRaters });
  const rankById = new Map(ranked.map((r) => [r.spot.id, r.rank]));

  const summaries = new Map<string, SpotSummary>();
  for (const spot of logbook.spots) {
    const visits = logbook.visits.filter((v) => v.spot_id === spot.id);
    const score = scores.get(spot.id) ?? null;
    summaries.set(spot.id, {
      spot,
      score,
      rank: rankById.get(spot.id) ?? null,
      tier: score ? tierFor(score.overall, options.thresholds) : null,
      // Besuche kommen nach Datum absteigend aus der Datenbank
      lastVisitedOn: visits[0]?.visited_on ?? null,
      visitCount: visits.length,
      coverPhoto: spot.photoUri ?? visits.find((v) => v.photoUri)?.photoUri ?? null,
    });
  }

  const me = options.myMemberId;
  const ratedVisitIds = new Set(logbook.ratings.filter((r) => r.member_id === me).map((r) => r.visit_id));
  const openVisits = me
    ? logbook.visits.filter((v) => v.participantIds.includes(me) && !ratedVisitIds.has(v.id))
    : [];

  return { ranked, summaries, openVisits };
}

export function useRanking() {
  const logbook = useLogbook();
  const crew = useCrew();
  const me = useMyMember();
  const settings = crew.data?.settings;

  const data = useMemo(
    () =>
      logbook.data && settings
        ? buildRanking(logbook.data, {
            minRaters: settings.minRaters,
            thresholds: settings.tierThresholds,
            myMemberId: me.data?.id ?? null,
          })
        : undefined,
    [logbook.data, settings, me.data?.id],
  );

  return {
    data,
    logbook: logbook.data,
    settings,
    isLoading: logbook.isLoading || crew.isLoading,
    error: logbook.error ?? crew.error,
    refetch: () => Promise.all([logbook.refetch(), crew.refetch()]),
    isRefetching: logbook.isRefetching,
  };
}
