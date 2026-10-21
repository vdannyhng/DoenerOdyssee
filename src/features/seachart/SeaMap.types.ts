import type { SpotSummary } from '@/features/ranking/useRanking';
import type { OsmPlace } from '@/features/treasure/overpass';

export type SeaMapProps = {
  spots: SpotSummary[];
  /** Reiseroute in zeitlicher Reihenfolge */
  route: { latitude: number; longitude: number }[];
  /** Unentdeckte Läden aus OpenStreetMap (optional eingeblendet) */
  discoveries: OsmPlace[];
  addedDiscoveries: Set<string>;
  onOpenSpot: (spotId: string) => void;
  onAddDiscovery: (place: OsmPlace) => void;
};
