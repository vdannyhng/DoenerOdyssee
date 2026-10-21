import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';

import { useLogbook } from '@/features/logbook/api';
import { regionFor } from '@/features/seachart/chart';
import LocationPicker from '@/features/seachart/LocationPicker';
import { useLocationPick } from '@/features/seachart/pickStore';

/** Modal: Ort für einen Spot auf der Karte antippen */
export default function PickLocationScreen() {
  const { lat, lng } = useLocalSearchParams<{ lat?: string; lng?: string }>();
  const logbook = useLogbook();
  const setPicked = useLocationPick((s) => s.setPicked);

  const start = useMemo(() => (lat && lng ? { lat: Number(lat), lng: Number(lng) } : null), [lat, lng]);
  // Startausschnitt: bisheriger Ort, sonst alle Spots der Crew
  const initial = useMemo(
    () =>
      start
        ? { latitude: start.lat, longitude: start.lng, latitudeDelta: 0.01, longitudeDelta: 0.01 }
        : regionFor(logbook.data?.spots ?? []),
    [start, logbook.data],
  );

  return (
    <LocationPicker
      initial={initial}
      start={start}
      onConfirm={(place) => {
        setPicked(place);
        router.back();
      }}
    />
  );
}
