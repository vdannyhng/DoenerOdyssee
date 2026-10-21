/** Duplikat-Erkennung für neue Spots (Anforderungen 4.1): ähnlicher Name oder < 50 m entfernt. */

export type GeoPoint = { lat: number; lng: number };

const EARTH_RADIUS_M = 6_371_000;
export const DUPLICATE_DISTANCE_M = 50;
const NAME_SIMILARITY = 0.8;

export function distanceMeters(a: GeoPoint, b: GeoPoint): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

export function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function levenshtein(a: string, b: string): number {
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j]! + 1, curr[j - 1]! + 1, prev[j - 1]! + cost);
    }
    prev = curr;
  }
  return prev[b.length]!;
}

/** Ähnlichkeit 0..1 der normalisierten Namen (1 = identisch) */
export function nameSimilarity(a: string, b: string): number {
  const na = normalizeName(a);
  const nb = normalizeName(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  return 1 - levenshtein(na, nb) / Math.max(na.length, nb.length);
}

export function findDuplicates<S extends GeoPoint & { id: string; name: string }>(
  candidate: { name: string; location: GeoPoint | null },
  existing: readonly S[],
  ignoreId?: string,
): S[] {
  return existing.filter((spot) => {
    if (spot.id === ignoreId) return false;
    if (nameSimilarity(candidate.name, spot.name) >= NAME_SIMILARITY) return true;
    return candidate.location !== null && distanceMeters(candidate.location, spot) < DUPLICATE_DISTANCE_M;
  });
}
