import type { SpotSummary } from '@/features/ranking/useRanking';

export type SpotSort = 'score' | 'price' | 'recent' | 'name';

const byName = (a: SpotSummary, b: SpotSummary) =>
  a.spot.name.localeCompare(b.spot.name, 'de', { sensitivity: 'base' });

/** Sortierung der „Alle Spots“-Liste; Einträge ohne Wert landen jeweils am Ende */
export function sortSpots(items: readonly SpotSummary[], sort: SpotSort, query = ''): SpotSummary[] {
  const q = query.trim().toLowerCase();
  const filtered = items.filter(
    (s) => !q || s.spot.name.toLowerCase().includes(q) || s.spot.address.toLowerCase().includes(q),
  );
  const compare: Record<SpotSort, (a: SpotSummary, b: SpotSummary) => number> = {
    score: (a, b) => {
      if (a.rank != null && b.rank != null) return a.rank - b.rank;
      if (a.score && b.score) return b.score.overall - a.score.overall || byName(a, b);
      if (a.rank != null || a.score) return -1;
      if (b.rank != null || b.score) return 1;
      return byName(a, b);
    },
    price: (a, b) => {
      if (a.spot.price == null && b.spot.price == null) return byName(a, b);
      if (a.spot.price == null) return 1;
      if (b.spot.price == null) return -1;
      return a.spot.price - b.spot.price || byName(a, b);
    },
    recent: (a, b) => {
      if (!a.lastVisitedOn && !b.lastVisitedOn) return byName(a, b);
      if (!a.lastVisitedOn) return 1;
      if (!b.lastVisitedOn) return -1;
      return b.lastVisitedOn.localeCompare(a.lastVisitedOn) || byName(a, b);
    },
    name: byName,
  };
  return [...filtered].sort(compare[sort]);
}
