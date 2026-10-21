import {
  bountyFor,
  computeSpotScores,
  formatBounty,
  formatRating,
  formatScore,
  parseRating,
  rankSpots,
  roundScore,
  tierFor,
  type RatingInput,
} from '../scoring';

const r = (spotId: string, memberId: string, score: number, visitId = `${spotId}-v`): RatingInput => ({
  spotId,
  memberId,
  score,
  visitId,
});

describe('computeSpotScores', () => {
  it('liefert eine leere Map ohne Bewertungen', () => {
    expect(computeSpotScores([]).size).toBe(0);
  });

  it('nimmt bei einem Besuch die Note direkt', () => {
    const score = computeSpotScores([r('a', 'anna', 8.5)]).get('a');
    expect(score).toMatchObject({ overall: 8.5, raterCount: 1, minScore: 8.5 });
  });

  it('gewichtet jede Person gleich, auch bei unterschiedlich vielen Besuchen', () => {
    const score = computeSpotScores([
      // Anna war dreimal dort: Schnitt 6
      r('a', 'anna', 5, 'v1'),
      r('a', 'anna', 6, 'v2'),
      r('a', 'anna', 7, 'v3'),
      // Ben einmal: 10
      r('a', 'ben', 10, 'v1'),
    ]).get('a');
    // (6 + 10) / 2 = 8 – nicht (5+6+7+10)/4 = 7
    expect(score?.overall).toBe(8);
    expect(score?.raterCount).toBe(2);
    expect(score?.minScore).toBe(6);
    expect(score?.members.find((m) => m.memberId === 'anna')).toMatchObject({
      average: 6,
      scores: [5, 6, 7],
    });
  });

  it('trennt Spots sauber', () => {
    const scores = computeSpotScores([r('a', 'anna', 9), r('b', 'anna', 3)]);
    expect(scores.get('a')?.overall).toBe(9);
    expect(scores.get('b')?.overall).toBe(3);
  });

  it('rechnet intern ungerundet', () => {
    const score = computeSpotScores([r('a', 'anna', 8), r('a', 'ben', 8.5), r('a', 'cem', 8.5)]).get('a');
    expect(score?.overall).toBeCloseTo(8.3333333, 6);
  });
});

describe('rankSpots', () => {
  const spots = [
    { id: 'a', name: 'Antalya Grill' },
    { id: 'b', name: 'Bosporus' },
    { id: 'c', name: 'Charlie Kebab' },
    { id: 'd', name: 'Dürüm Palast' },
  ];

  it('lässt Spots ohne Bewertung weg', () => {
    const ranked = rankSpots(spots, computeSpotScores([r('b', 'anna', 7)]));
    expect(ranked.map((x) => x.spot.id)).toEqual(['b']);
    expect(ranked[0]?.rank).toBe(1);
  });

  it('sortiert absteigend nach Gesamtwert', () => {
    const ranked = rankSpots(
      spots,
      computeSpotScores([r('a', 'anna', 6), r('b', 'anna', 9), r('c', 'anna', 7.5)]),
    );
    expect(ranked.map((x) => [x.rank, x.spot.id])).toEqual([
      [1, 'b'],
      [2, 'c'],
      [3, 'a'],
    ]);
  });

  it('Tie-Break 1: mehr Bewerter gewinnen', () => {
    const ranked = rankSpots(
      spots,
      computeSpotScores([r('a', 'anna', 8), r('b', 'anna', 8), r('b', 'ben', 8)]),
    );
    expect(ranked.map((x) => x.spot.id)).toEqual(['b', 'a']);
  });

  it('Tie-Break 2: höhere Minimalnote gewinnt', () => {
    const ranked = rankSpots(
      spots,
      computeSpotScores([
        r('a', 'anna', 6),
        r('a', 'ben', 10), // Schnitt 8, Minimum 6
        r('b', 'anna', 7.5),
        r('b', 'ben', 8.5), // Schnitt 8, Minimum 7.5
      ]),
    );
    expect(ranked.map((x) => x.spot.id)).toEqual(['b', 'a']);
  });

  it('Tie-Break 3: Name alphabetisch', () => {
    const ranked = rankSpots(spots, computeSpotScores([r('d', 'anna', 8), r('c', 'anna', 8)]));
    expect(ranked.map((x) => x.spot.id)).toEqual(['c', 'd']);
  });

  it('erkennt Gleichstand trotz Fliesskomma-Rundungsfehlern', () => {
    // 0.1 + 0.2 ≠ 0.3: (7.1 + 8.2) / 2 und (7.2 + 8.1) / 2 sind mathematisch gleich
    const ranked = rankSpots(
      spots,
      computeSpotScores([r('d', 'anna', 7.1), r('d', 'ben', 8.2), r('a', 'anna', 7.2), r('a', 'ben', 8.1)]),
    );
    // Gleicher Schnitt, gleiche Bewerterzahl → Minimum entscheidet (7.2 > 7.1)
    expect(ranked.map((x) => x.spot.id)).toEqual(['a', 'd']);
  });

  it('beachtet die Mindestanzahl Bewerter', () => {
    const scores = computeSpotScores([r('a', 'anna', 9), r('b', 'anna', 7), r('b', 'ben', 7)]);
    expect(rankSpots(spots, scores, { minRaters: 2 }).map((x) => x.spot.id)).toEqual(['b']);
    // Werte < 1 werden wie 1 behandelt
    expect(rankSpots(spots, scores, { minRaters: 0 })).toHaveLength(2);
  });
});

describe('tierFor', () => {
  it.each([
    [10, 'S'],
    [9, 'S'],
    [8.996, 'S'], // wird als 9.00 angezeigt
    [8.994, 'A'],
    [8, 'A'],
    [7.9, 'B'],
    [7, 'B'],
    [5.5, 'C'],
    [5.4, 'D'],
    [4, 'D'],
    [3.9, 'F'],
    [0, 'F'],
  ] as const)('%p → %s', (score, tier) => {
    expect(tierFor(score)).toBe(tier);
  });

  it('nutzt eigene Schwellen', () => {
    expect(tierFor(8.5, { S: 8.5, A: 7, B: 6, C: 5, D: 4 })).toBe('S');
  });
});

describe('Rundung und Kopfgeld', () => {
  it('rundet Durchschnitte auf zwei Nachkommastellen', () => {
    expect(roundScore(8.125)).toBe(8.13);
    expect(roundScore(8.3333)).toBe(8.33);
    expect(formatScore(8)).toBe('8.00');
    expect(formatScore(9.4166)).toBe('9.42');
  });

  it('zeigt Einzelnoten mit einer Nachkommastelle', () => {
    expect(formatRating(8)).toBe('8.0');
    expect(formatRating(7.3)).toBe('7.3');
  });

  it('liest getippte Noten', () => {
    expect(parseRating('8,7')).toBe(8.7);
    expect(parseRating('8.')).toBe(8);
    expect(parseRating('10')).toBe(10);
    expect(parseRating(' 0.5 ')).toBe(0.5);
    expect(parseRating('10.5')).toBeNull();
    expect(parseRating('8.75')).toBeNull();
    expect(parseRating('abc')).toBeNull();
    expect(parseRating('')).toBeNull();
  });

  it('berechnet das Kopfgeld aus dem angezeigten Wert', () => {
    expect(bountyFor(8.7)).toBe(870_000_000);
    expect(bountyFor(8.3333)).toBe(833_000_000);
    expect(bountyFor(10)).toBe(1_000_000_000);
    expect(bountyFor(0)).toBe(0);
    expect(formatBounty(870_000_000)).toBe('870.000.000');
  });
});
