import { formatDistance, withDistance } from '../nearby';

describe('withDistance', () => {
  const spots = [
    { id: 'far', lat: 52.6, lng: 13.4 },
    { id: 'near', lat: 52.5001, lng: 13.4 },
  ];

  it('sortiert nach Entfernung', () => {
    const result = withDistance(spots, { lat: 52.5, lng: 13.4 });
    expect(result.map((r) => r.spot.id)).toEqual(['near', 'far']);
    expect(result[0]?.meters).toBeLessThan(20);
  });

  it('funktioniert ohne Standort', () => {
    expect(withDistance(spots, null).every((r) => r.meters === null)).toBe(true);
  });
});

describe('formatDistance', () => {
  it('zeigt Meter und Kilometer', () => {
    expect(formatDistance(3)).toBe('10 m');
    expect(formatDistance(347)).toBe('350 m');
    expect(formatDistance(1520)).toBe('1,5 km');
    expect(formatDistance(23_400)).toBe('23 km');
  });
});
