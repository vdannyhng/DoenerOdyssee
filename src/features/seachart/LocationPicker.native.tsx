import { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import MapView, { Marker, type Region } from 'react-native-maps';

import { AppText, Button } from '@/components/ui';
import type { GeoPoint } from '@/features/spots/duplicates';
import { addressFor, type Place } from '@/features/spots/geocoding';
import { t } from '@/i18n/de';
import { radius, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

import { parchmentMapStyle } from './mapStyle';

type Props = { initial: Region; start: GeoPoint | null; onConfirm: (place: Place) => void };

/** Ort per Antippen auf der Karte wählen; die Adresse wird beim Bestätigen nachgeschlagen */
export default function LocationPicker({ initial, start, onConfirm }: Props) {
  const { colors } = useTheme();
  const [point, setPoint] = useState<GeoPoint | null>(start);
  const [busy, setBusy] = useState(false);

  const confirm = async () => {
    if (!point) return;
    setBusy(true);
    try {
      onConfirm({ ...point, address: await addressFor(point) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.flex}>
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={initial}
        onPress={(e) =>
          setPoint({ lat: e.nativeEvent.coordinate.latitude, lng: e.nativeEvent.coordinate.longitude })
        }
        customMapStyle={Platform.OS === 'android' ? parchmentMapStyle : undefined}
        showsPointsOfInterests={false}
        toolbarEnabled={false}
      >
        {point ? (
          <Marker
            coordinate={{ latitude: point.lat, longitude: point.lng }}
            draggable
            onDragEnd={(e) =>
              setPoint({ lat: e.nativeEvent.coordinate.latitude, lng: e.nativeEvent.coordinate.longitude })
            }
            pinColor={colors.accent}
          />
        ) : null}
      </MapView>
      <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <AppText variant="caption" tone="muted">
          {point ? `${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}` : t.chart.pickHint}
        </AppText>
        <Button
          title={t.chart.pickConfirm}
          icon="map-marker-check"
          disabled={!point}
          loading={busy}
          onPress={() => void confirm()}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  panel: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.lg,
    padding: spacing.md,
    gap: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    elevation: 4,
  },
});
