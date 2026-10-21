import { distanceMeters, type GeoPoint } from './duplicates';

/** Ab dieser Entfernung wird der nächste Spot beim Eintragen automatisch vorgeschlagen */
export const AUTO_SELECT_METERS = 75;

export function withDistance<S extends GeoPoint>(spots: readonly S[], from: GeoPoint | null) {
  return spots
    .map((spot) => ({ spot, meters: from ? distanceMeters(from, spot) : null }))
    .sort((a, b) => (a.meters ?? Infinity) - (b.meters ?? Infinity));
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.max(10, Math.round(meters / 10) * 10)} m`;
  return `${(meters / 1000).toFixed(meters < 10_000 ? 1 : 0).replace('.', ',')} km`;
}
