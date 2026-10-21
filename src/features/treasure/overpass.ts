import { z } from 'zod';

import { distanceMeters, nameSimilarity, type GeoPoint } from '@/features/spots/duplicates';

/**
 * Döner-Läden aus OpenStreetMap über die Overpass-API (kostenlos, kein API-Key).
 * Gesucht wird nur auf Knopfdruck, damit wir die Fair-Use-Regeln einhalten.
 */
const OVERPASS = 'https://overpass-api.de/api/interpreter';
export const NEARBY_RADIUS_M = 2000;

export type OsmPlace = GeoPoint & { osmId: string; name: string; address: string; meters: number };

const elementSchema = z.object({
  type: z.string(),
  id: z.number(),
  lat: z.number().optional(),
  lon: z.number().optional(),
  center: z.object({ lat: z.number(), lon: z.number() }).optional(),
  tags: z.record(z.string(), z.string()).optional(),
});
const responseSchema = z.object({ elements: z.array(elementSchema) });

export function buildQuery(at: GeoPoint, radius = NEARBY_RADIUS_M): string {
  const area = `(around:${radius},${at.lat},${at.lng})`;
  // Döner/Kebab als Küche oder im Namen; Imbisse und Restaurants
  const filters = [
    `["amenity"~"fast_food|restaurant"]["cuisine"~"kebab|doner|döner|turkish",i]`,
    `["amenity"~"fast_food|restaurant"]["name"~"döner|doner|kebab|kebap|dürüm",i]`,
  ];
  const parts = filters.flatMap((f) => [`node${f}${area};`, `way${f}${area};`]);
  return `[out:json][timeout:20];(${parts.join('')});out center 60;`;
}

function addressOf(tags: Record<string, string>): string {
  const street = [tags['addr:street'], tags['addr:housenumber']].filter(Boolean).join(' ');
  return [street, tags['addr:city']].filter(Boolean).join(', ');
}

/** Rohantwort → Liste nach Entfernung, ohne Läden, die schon im Logbuch stehen */
export function parseOverpass(
  raw: unknown,
  at: GeoPoint,
  known: readonly (GeoPoint & { name: string })[],
): OsmPlace[] {
  const { elements } = responseSchema.parse(raw);
  const seen = new Set<string>();
  const places: OsmPlace[] = [];
  for (const el of elements) {
    const lat = el.lat ?? el.center?.lat;
    const lng = el.lon ?? el.center?.lon;
    const name = el.tags?.name?.trim();
    if (lat == null || lng == null || !name) continue;
    const osmId = `${el.type}/${el.id}`;
    if (seen.has(osmId)) continue;
    seen.add(osmId);
    const point = { lat, lng };
    const alreadyKnown = known.some(
      (k) =>
        distanceMeters(k, point) < 60 ||
        (nameSimilarity(k.name, name) >= 0.85 && distanceMeters(k, point) < 500),
    );
    if (alreadyKnown) continue;
    places.push({
      osmId,
      name,
      lat,
      lng,
      address: addressOf(el.tags ?? {}),
      meters: distanceMeters(at, point),
    });
  }
  return places.sort((a, b) => a.meters - b.meters);
}

export async function fetchNearbyDoener(
  at: GeoPoint,
  known: readonly (GeoPoint & { name: string })[],
): Promise<OsmPlace[]> {
  const res = await fetch(OVERPASS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(buildQuery(at))}`,
  });
  if (!res.ok) throw new Error(`overpass_${res.status}`);
  return parseOverpass(await res.json(), at, known);
}

/** Link zu Google Maps (Bewertungen anderer), ohne API-Key */
export function reviewsUrl(place: { name: string; lat: number; lng: number }): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.name} ${place.lat},${place.lng}`)}`;
}
