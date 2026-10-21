import * as Location from 'expo-location';
import { Linking, Platform } from 'react-native';
import { z } from 'zod';

import type { GeoPoint } from './duplicates';

export type Place = GeoPoint & { address: string };

// Nominatim (OpenStreetMap): kostenlos, kein API-Key. Nutzungsregeln verlangen einen
// aussagekräftigen User-Agent und höchstens 1 Anfrage/Sekunde – wir suchen nur auf Knopfdruck.
const NOMINATIM = 'https://nominatim.openstreetmap.org';
const HEADERS = { 'User-Agent': 'DoenerOdyssee/0.1 (private Freundes-App)', 'Accept-Language': 'de' };

const resultSchema = z.object({
  lat: z.coerce.number(),
  lon: z.coerce.number(),
  display_name: z.string(),
});

/** „Bosporus, Hauptstrasse 5, 10115, Berlin, Deutschland“ → kürzer ohne Land/Postleitzahl-Doppelungen */
function shortAddress(displayName: string): string {
  const parts = displayName.split(',').map((p) => p.trim());
  return parts.slice(0, Math.min(parts.length, 4)).join(', ');
}

export async function searchAddress(query: string): Promise<Place[]> {
  const url = `${NOMINATIM}/search?format=jsonv2&limit=5&q=${encodeURIComponent(query.trim())}`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`geocoding_${res.status}`);
  const parsed = z.array(resultSchema).parse(await res.json());
  return parsed.map((r) => ({ lat: r.lat, lng: r.lon, address: shortAddress(r.display_name) }));
}

/** Adresse zu einem Punkt (leer, wenn nichts gefunden oder offline) */
export async function addressFor(point: GeoPoint): Promise<string> {
  try {
    const url = `${NOMINATIM}/reverse?format=jsonv2&lat=${point.lat}&lon=${point.lng}`;
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) return '';
    return shortAddress(resultSchema.parse(await res.json()).display_name);
  } catch {
    return '';
  }
}

/** Standort nur auf ausdrücklichen Wunsch abfragen; es wird nur die Spot-Position gespeichert. */
export async function currentPlace(): Promise<Place | 'denied'> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== Location.PermissionStatus.GRANTED) return 'denied';
  const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  const point = { lat: pos.coords.latitude, lng: pos.coords.longitude };
  return { ...point, address: await addressFor(point) };
}

/**
 * Nur die Position (ohne Adresse), z. B. für „Spots in der Nähe“.
 * ask=false fragt nicht nach, sondern nutzt eine bereits erteilte Freigabe.
 */
export async function currentPoint({ ask }: { ask: boolean }): Promise<GeoPoint | 'denied' | null> {
  const permission = ask
    ? await Location.requestForegroundPermissionsAsync()
    : await Location.getForegroundPermissionsAsync();
  if (permission.status !== Location.PermissionStatus.GRANTED) return ask ? 'denied' : null;
  const last = await Location.getLastKnownPositionAsync({ maxAge: 2 * 60_000 }).catch(() => null);
  const pos = last ?? (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
  return { lat: pos.coords.latitude, lng: pos.coords.longitude };
}

/** Öffnet die Karten-App des Handys mit Route zum Spot */
export async function openRoute(spot: GeoPoint & { name: string }): Promise<void> {
  const label = encodeURIComponent(spot.name);
  const native =
    Platform.OS === 'ios'
      ? `maps://?daddr=${spot.lat},${spot.lng}&q=${label}`
      : Platform.OS === 'android'
        ? `geo:0,0?q=${spot.lat},${spot.lng}(${label})`
        : null;
  const web = `https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}`;
  // Kein canOpenURL: iOS meldet nicht deklarierte Schemes als „nicht öffnbar“, obwohl es geht
  if (native) {
    try {
      await Linking.openURL(native);
      return;
    } catch {
      // weiter mit der Web-Variante
    }
  }
  await Linking.openURL(web);
}
