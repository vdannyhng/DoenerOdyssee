import { parseCrewSettings, validThresholds } from '../settings';

describe('parseCrewSettings', () => {
  it('liefert Standardwerte für leere Einstellungen', () => {
    expect(parseCrewSettings({})).toEqual({
      currency: 'EUR',
      minRaters: 1,
      tierThresholds: { S: 9, A: 8, B: 7, C: 5.5, D: 4 },
    });
    expect(parseCrewSettings(null).currency).toBe('EUR');
  });

  it('übernimmt gültige Werte und ersetzt ungültige', () => {
    const s = parseCrewSettings({ currency: 'CHF', minRaters: 0, tierThresholds: { S: 'x' } });
    expect(s.currency).toBe('CHF');
    expect(s.minRaters).toBe(1);
    expect(s.tierThresholds.S).toBe(9);
  });
});

describe('validThresholds', () => {
  it('verlangt absteigende Schwellen', () => {
    expect(validThresholds({ S: 9, A: 8, B: 7, C: 5.5, D: 4 })).toBe(true);
    expect(validThresholds({ S: 9, A: 9, B: 7, C: 5.5, D: 4 })).toBe(false);
  });
});
