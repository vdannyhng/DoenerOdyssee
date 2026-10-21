/** Reine Logik der Seekarte: Reiseroute, Filter, Clustering, Kartenausschnitt */
import type { SpotSummary } from '@/features/ranking/useRanking';
import type { TierKey } from '@/features/ranking/scoring';
import type { GeoPoint } from '@/features/spots/duplicates';

export type Region = { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number };

export type ChartFilter = 'all' | 'top10' | 'wishlist' | TierKey;

type RouteVisit = { spot_id: string; visited_on: string; created_at: string };

/**
 * „Unsere Odyssee“: Besuche in zeitlicher Reihenfolge als Linienzug.
 * Mehrere Besuche hintereinander beim selben Laden ergeben nur einen Punkt.
 */
export function buildRoute(visits: readonly RouteVisit[], spots: readonly (GeoPoint & { id: string })[]) {
  const byId = new Map(spots.map((s) => [s.id, s]));
  const sorted = [...visits].sort(
    (a, b) => a.visited_on.localeCompare(b.visited_on) || a.created_at.localeCompare(b.created_at),
  );
  const route: { latitude: number; longitude: number }[] = [];
  let lastSpot: string | null = null;
  for (const v of sorted) {
    const spot = byId.get(v.spot_id);
    if (!spot || v.spot_id === lastSpot) continue;
    route.push({ latitude: spot.lat, longitude: spot.lng });
    lastSpot = v.spot_id;
  }
  return route;
}

export function filterSummaries(summaries: readonly SpotSummary[], filter: ChartFilter): SpotSummary[] {
  switch (filter) {
    case 'all':
      return [...summaries];
    case 'top10':
      return summaries.filter((s) => s.rank != null && s.rank <= 10);
    case 'wishlist':
      return summaries.filter((s) => !s.score);
    default:
      return summaries.filter((s) => s.tier === filter);
  }
}

/** Ausschnitt, der alle Punkte zeigt (mit Rand); ein einzelner Punkt bekommt etwa 2 km Umkreis */
export function regionFor(
  points: readonly GeoPoint[],
  fallback: GeoPoint = { lat: 51.16, lng: 10.45 },
): Region {
  if (!points.length) {
    return { latitude: fallback.lat, longitude: fallback.lng, latitudeDelta: 8, longitudeDelta: 8 };
  }
  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  const [minLat, maxLat] = [Math.min(...lats), Math.max(...lats)];
  const [minLng, maxLng] = [Math.min(...lngs), Math.max(...lngs)];
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max((maxLat - minLat) * 1.4, 0.02),
    longitudeDelta: Math.max((maxLng - minLng) * 1.4, 0.02),
  };
}

export type Cluster<T> = { key: string; lat: number; lng: number; items: T[] };

/**
 * Einfaches Raster-Clustering: Der sichtbare Ausschnitt wird in cells×cells Felder geteilt,
 * Punkte im selben Feld werden zusammengefasst. Unterhalb von minPoints wird nichts gebündelt.
 */
export function clusterPoints<T extends GeoPoint>(
  points: readonly T[],
  region: Region,
  { cells = 7, minPoints = 25 }: { cells?: number; minPoints?: number } = {},
): Cluster<T>[] {
  const single = (p: T, i: number): Cluster<T> => ({ key: `p${i}`, lat: p.lat, lng: p.lng, items: [p] });
  if (points.length < minPoints) return points.map(single);

  const cellLat = region.latitudeDelta / cells;
  const cellLng = region.longitudeDelta / cells;
  const buckets = new Map<string, T[]>();
  for (const p of points) {
    const key = `${Math.floor(p.lat / cellLat)}:${Math.floor(p.lng / cellLng)}`;
    const list = buckets.get(key);
    if (list) list.push(p);
    else buckets.set(key, [p]);
  }
  return [...buckets].map(([key, items]) => ({
    key,
    lat: items.reduce((s, p) => s + p.lat, 0) / items.length,
    lng: items.reduce((s, p) => s + p.lng, 0) / items.length,
    items,
  }));
}
