import { EmptyState } from '@/components/ui';
import type { GeoPoint } from '@/features/spots/duplicates';
import type { Place } from '@/features/spots/geocoding';
import { t } from '@/i18n/de';

import type { Region } from './chart';

type Props = { initial: Region; start: GeoPoint | null; onConfirm: (place: Place) => void };

/** Browser: keine Karte – dort bleibt die Adresssuche */
export default function LocationPicker(_props: Props) {
  return <EmptyState icon="map-marker-off" title={t.chart.webTitle} message={t.chart.webBody} />;
}
