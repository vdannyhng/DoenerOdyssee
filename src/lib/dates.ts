import { t } from '@/i18n/de';

const pad = (n: number) => String(n).padStart(2, '0');

/** Lokales Datum als YYYY-MM-DD (nicht UTC – sonst ist kurz nach Mitternacht noch „gestern“) */
export function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayIso(now = new Date()): string {
  return toIsoDate(now);
}

export function shiftIsoDate(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number) as [number, number, number];
  return toIsoDate(new Date(y, m - 1, d + days));
}

/** „Heute“, „Gestern“ oder „21.10.2026“ */
export function formatIsoDate(iso: string, now = new Date()): string {
  const today = todayIso(now);
  if (iso === today) return t.common.today;
  if (iso === shiftIsoDate(today, -1)) return t.common.yesterday;
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}
