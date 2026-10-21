import type { SpotSummary } from '@/features/ranking/useRanking';

import { buildRoute, clusterPoints, filterSummaries, regionFor } from '../chart';

const spots = [
  { id: 'a', lat: 52.5, lng: 13.4 },
  { id: 'b', lat: 52.6, lng: 13.5 },
  { id: 'c', lat: 48.1, lng: 11.6 },
];

describe('buildRoute', () => {
  it('verbindet Besuche chronologisch und überspringt Wiederholungen direkt hintereinander', () => {
    const route = buildRoute(
      [
        { spot_id: 'b', visited_on: '2026-10-02', created_at: '1' },
        { spot_id: 'a', visited_on: '2026-10-01', created_at: '1' },
        { spot_id: 'a', visited_on: '2026-10-01', created_at: '2' },
        { spot_id: 'c', visited_on: '2026-10-03', created_at: '1' },
        { spot_id: 'a', visited_on: '2026-10-04', created_at: '1' },
        { spot_id: 'gone', visited_on: '2026-10-05', created_at: '1' },
      ],
      spots,
    );
    expect(route.map((p) => p.latitude)).toEqual([52.5, 52.6, 48.1, 52.5]);
  });
});

describe('filterSummaries', () => {
  const s = (id: string, rank: number | null, tier: string | null, scored = true) =>
    ({ spot: { id }, rank, tier, score: scored ? {} : null }) as unknown as SpotSummary;
  const all = [s('1', 1, 'S'), s('2', 11, 'A'), s('3', null, null, false), s('4', 4, 'A')];

  it('filtert Top 10, Wunschliste und Tier', () => {
    expect(filterSummaries(all, 'top10').map((x) => x.spot.id)).toEqual(['1', '4']);
    expect(filterSummaries(all, 'wishlist').map((x) => x.spot.id)).toEqual(['3']);
    expect(filterSummaries(all, 'A').map((x) => x.spot.id)).toEqual(['2', '4']);
    expect(filterSummaries(all, 'all')).toHaveLength(4);
  });
});

describe('regionFor', () => {
  it('umfasst alle Punkte mit Rand', () => {
    const r = regionFor(spots);
    expect(r.latitude).toBeCloseTo(50.35);
    expect(r.latitudeDelta).toBeGreaterThan(52.6 - 48.1);
  });

  it('gibt einzelnen Punkten einen Mindestausschnitt und hat einen Standard', () => {
    expect(regionFor([spots[0]!]).latitudeDelta).toBe(0.02);
    expect(regionFor([]).latitudeDelta).toBe(8);
  });
});

describe('clusterPoints', () => {
  const region = { latitude: 52.5, longitude: 13.4, latitudeDelta: 0.7, longitudeDelta: 0.7 };

  it('bündelt erst ab vielen Punkten', () => {
    expect(clusterPoints(spots, region)).toHaveLength(3);
  });

  it('fasst nahe Punkte zusammen', () => {
    const many = Array.from({ length: 30 }, (_, i) => ({ lat: 52.5 + (i % 2) * 0.0001, lng: 13.4 }));
    const clusters = clusterPoints(many, region);
    expect(clusters).toHaveLength(1);
    expect(clusters[0]!.items).toHaveLength(30);
  });
});
