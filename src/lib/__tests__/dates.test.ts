import { formatIsoDate, shiftIsoDate, todayIso } from '../dates';

const now = new Date(2026, 9, 21, 0, 30); // 21.10.2026, kurz nach Mitternacht (lokal)

describe('dates', () => {
  it('nutzt das lokale Datum', () => {
    expect(todayIso(now)).toBe('2026-10-21');
  });

  it('verschiebt über Monats- und Jahresgrenzen', () => {
    expect(shiftIsoDate('2026-03-01', -1)).toBe('2026-02-28');
    expect(shiftIsoDate('2026-12-31', 1)).toBe('2027-01-01');
  });

  it('formatiert relativ und absolut', () => {
    expect(formatIsoDate('2026-10-21', now)).toBe('Heute');
    expect(formatIsoDate('2026-10-20', now)).toBe('Gestern');
    expect(formatIsoDate('2026-01-05', now)).toBe('05.01.2026');
  });
});
