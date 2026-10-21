import type { Rating, Visit } from '@/features/logbook/api';
import type { SpotSummary } from '@/features/ranking/useRanking';

import { buildQuery, parseOverpass } from '../overpass';
import { recommendForMember, wishlist } from '../recommend';

const here = { lat: 52.5, lng: 13.4 };

describe('parseOverpass', () => {
  const raw = {
    elements: [
      {
        type: 'node',
        id: 1,
        lat: 52.501,
        lon: 13.4,
        tags: { name: 'Mustafa Kebab', 'addr:street': 'Mehringdamm', 'addr:housenumber': '32' },
      },
      { type: 'way', id: 2, center: { lat: 52.51, lon: 13.4 }, tags: { name: 'Doener Palast' } },
      { type: 'node', id: 3, lat: 52.5002, lon: 13.4, tags: { name: 'Bosporus Grill' } },
      { type: 'node', id: 4, lat: 52.5003, lon: 13.4 }, // ohne Name
      { type: 'node', id: 1, lat: 52.501, lon: 13.4, tags: { name: 'Mustafa Kebab' } }, // doppelt
    ],
  };
  const known = [{ name: 'Bosporus Grill', lat: 52.5002, lng: 13.4 }];

  it('liefert benannte, unbekannte Läden nach Entfernung', () => {
    const places = parseOverpass(raw, here, known);
    expect(places.map((p) => p.name)).toEqual(['Mustafa Kebab', 'Doener Palast']);
    expect(places[0]).toMatchObject({ osmId: 'node/1', address: 'Mehringdamm 32' });
    expect(places[0]!.meters).toBeGreaterThan(100);
  });

  it('wirft bei kaputter Antwort', () => {
    expect(() => parseOverpass({ nope: true }, here, [])).toThrow();
  });

  it('baut eine Umkreis-Abfrage', () => {
    expect(buildQuery(here, 1500)).toContain('around:1500,52.5,13.4');
  });
});

const summary = (id: string, overall: number | null, raters = 2, created = '2026-10-01'): SpotSummary =>
  ({
    spot: { id, name: id, created_at: created },
    score: overall == null ? null : { overall, raterCount: raters },
  }) as unknown as SpotSummary;

describe('recommendForMember', () => {
  const summaries = [
    summary('a', 9),
    summary('b', 8.5),
    summary('c', 6),
    summary('d', null),
    summary('e', 9, 3),
  ];
  const visits = [{ id: 'v1', spot_id: 'a' }] as Visit[];
  const ratings = [{ visit_id: 'v1', member_id: 'me' }] as Rating[];

  it('empfiehlt gut bewertete Spots, die ich noch nicht kenne', () => {
    expect(recommendForMember(summaries, ratings, visits, 'me').map((s) => s.spot.id)).toEqual(['e', 'b']);
  });

  it('wunschliste enthält nur unbewertete Spots', () => {
    expect(wishlist(summaries).map((s) => s.spot.id)).toEqual(['d']);
  });
});
