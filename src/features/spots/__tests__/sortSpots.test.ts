import type { SpotSummary } from '@/features/ranking/useRanking';

import { sortSpots } from '../sortSpots';

const summary = (
  name: string,
  opts: { rank?: number; overall?: number; price?: number; last?: string } = {},
): SpotSummary =>
  ({
    spot: { id: name, name, address: `${name}strasse 1`, price: opts.price ?? null },
    score: opts.overall != null ? { overall: opts.overall } : null,
    rank: opts.rank ?? null,
    tier: null,
    lastVisitedOn: opts.last ?? null,
    visitCount: 0,
  }) as unknown as SpotSummary;

const items = [
  summary('Charlie', { rank: 2, overall: 7, price: 9, last: '2026-10-01' }),
  summary('Anton'),
  summary('Berta', { rank: 1, overall: 9, last: '2026-10-10' }),
  summary('Dora', { price: 6 }),
];

const names = (list: SpotSummary[]) => list.map((s) => s.spot.name);

describe('sortSpots', () => {
  it('nach Gesamtwert: Rangliste zuerst, Unbewertete alphabetisch dahinter', () => {
    expect(names(sortSpots(items, 'score'))).toEqual(['Berta', 'Charlie', 'Anton', 'Dora']);
  });

  it('nach Preis aufsteigend, ohne Preis am Ende', () => {
    expect(names(sortSpots(items, 'price'))).toEqual(['Dora', 'Charlie', 'Anton', 'Berta']);
  });

  it('nach letztem Besuch', () => {
    expect(names(sortSpots(items, 'recent'))).toEqual(['Berta', 'Charlie', 'Anton', 'Dora']);
  });

  it('filtert nach Name und Adresse', () => {
    expect(names(sortSpots(items, 'name', 'ber'))).toEqual(['Berta']);
    expect(names(sortSpots(items, 'name', 'dorastr'))).toEqual(['Dora']);
  });
});
