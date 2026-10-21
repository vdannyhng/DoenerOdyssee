import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useMemo, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline, type Region } from 'react-native-maps';

import { AppText, Button, TierBadge } from '@/components/ui';
import { formatScore } from '@/features/ranking/scoring';
import type { SpotSummary } from '@/features/ranking/useRanking';
import { currentPoint, openRoute } from '@/features/spots/geocoding';
import type { OsmPlace } from '@/features/treasure/overpass';
import { t } from '@/i18n/de';
import { fonts, radius, spacing, tierColors } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

import { clusterPoints, regionFor } from './chart';
import { parchmentMapStyle } from './mapStyle';
import type { SeaMapProps } from './SeaMap.types';

type Item =
  | { kind: 'spot'; lat: number; lng: number; summary: SpotSummary }
  | { kind: 'osm'; lat: number; lng: number; place: OsmPlace };

const EDGE = { top: 80, right: 60, bottom: 220, left: 60 };

/** Insel-Marker: farbiger Kreis mit Tier-Buchstabe auf einer kleinen Sandbank; Wunschliste grau mit „?“ */
function IslandPin({ summary }: { summary: SpotSummary }) {
  const tier = summary.tier;
  const bg = tier ? tierColors[tier].bg : '#B9B4A6';
  const fg = tier ? tierColors[tier].fg : '#3B3B3B';
  return (
    <View style={styles.pinWrap}>
      <View style={[styles.pin, { backgroundColor: bg }]}>
        <Text style={[styles.pinText, { color: fg }]}>{tier ?? '?'}</Text>
      </View>
      <View style={styles.sand} />
    </View>
  );
}

export default function SeaMap({
  spots,
  route,
  discoveries,
  addedDiscoveries,
  onOpenSpot,
  onAddDiscovery,
}: SeaMapProps) {
  const { colors } = useTheme();
  const mapRef = useRef<MapView>(null);
  const points = useMemo(() => spots.map((s) => ({ lat: s.spot.lat, lng: s.spot.lng })), [spots]);
  const initial = useMemo(() => regionFor(points), [points]);
  const [region, setRegion] = useState<Region>(initial);
  const [selected, setSelected] = useState<Item | null>(null);
  const [showMe, setShowMe] = useState(false);
  const [locating, setLocating] = useState(false);
  const items: Item[] = useMemo(
    () => [
      ...spots.map((summary) => ({
        kind: 'spot' as const,
        lat: summary.spot.lat,
        lng: summary.spot.lng,
        summary,
      })),
      ...discoveries
        .filter((p) => !addedDiscoveries.has(p.osmId))
        .map((place) => ({ kind: 'osm' as const, lat: place.lat, lng: place.lng, place })),
    ],
    [spots, discoveries, addedDiscoveries],
  );
  const clusters = useMemo(() => clusterPoints(items, region), [items, region]);
  // Eigene Marker-Views laufend nachzeichnen kostet Leistung – nur bei wenigen Markern
  const track = clusters.length < 40;

  const fitAll = () => {
    const coords = items.map((i) => ({ latitude: i.lat, longitude: i.lng }));
    if (coords.length > 1) mapRef.current?.fitToCoordinates(coords, { edgePadding: EDGE, animated: true });
    else mapRef.current?.animateToRegion(regionFor(items), 400);
  };

  const locate = async () => {
    setLocating(true);
    try {
      const p = await currentPoint({ ask: true });
      if (p && p !== 'denied') {
        setShowMe(true);
        mapRef.current?.animateToRegion(
          { latitude: p.lat, longitude: p.lng, latitudeDelta: 0.03, longitudeDelta: 0.03 },
          500,
        );
      }
    } finally {
      setLocating(false);
    }
  };

  return (
    <View style={styles.flex}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={initial}
        onRegionChangeComplete={setRegion}
        onPress={() => setSelected(null)}
        showsUserLocation={showMe}
        showsPointsOfInterests={false}
        customMapStyle={Platform.OS === 'android' ? parchmentMapStyle : undefined}
        toolbarEnabled={false}
      >
        {route.length > 1 ? (
          <Polyline
            coordinates={route}
            strokeColor={colors.accent}
            strokeWidth={3}
            lineDashPattern={[10, 8]}
            geodesic
          />
        ) : null}
        {clusters.map((c) => {
          if (c.items.length > 1) {
            return (
              <Marker
                key={c.key}
                coordinate={{ latitude: c.lat, longitude: c.lng }}
                tracksViewChanges={track}
                onPress={(e) => {
                  e.stopPropagation();
                  mapRef.current?.fitToCoordinates(
                    c.items.map((i) => ({ latitude: i.lat, longitude: i.lng })),
                    { edgePadding: EDGE, animated: true },
                  );
                }}
                accessibilityLabel={t.chart.cluster(c.items.length)}
              >
                <View style={[styles.cluster, { backgroundColor: colors.primary }]}>
                  <Text style={styles.clusterText}>{c.items.length}</Text>
                </View>
              </Marker>
            );
          }
          const item = c.items[0]!;
          return (
            <Marker
              key={item.kind === 'spot' ? item.summary.spot.id : item.place.osmId}
              coordinate={{ latitude: item.lat, longitude: item.lng }}
              tracksViewChanges={track}
              anchor={{ x: 0.5, y: 0.9 }}
              onPress={(e) => {
                e.stopPropagation();
                setSelected(item);
              }}
              accessibilityLabel={item.kind === 'spot' ? item.summary.spot.name : item.place.name}
            >
              {item.kind === 'spot' ? (
                <IslandPin summary={item.summary} />
              ) : (
                <View style={[styles.osmPin, { borderColor: colors.primary }]}>
                  <MaterialCommunityIcons name="compass-rose" size={18} color={colors.primary} />
                </View>
              )}
            </Marker>
          );
        })}
      </MapView>

      {/* Knöpfe oben rechts */}
      <View style={styles.controls}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t.chart.myLocation}
          onPress={() => void locate()}
          style={[styles.fab, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <MaterialCommunityIcons
            name={locating ? 'progress-clock' : 'crosshairs-gps'}
            size={24}
            color={colors.primary}
          />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t.chart.showAll}
          onPress={fitAll}
          style={[styles.fab, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <MaterialCommunityIcons name="arrow-expand-all" size={24} color={colors.primary} />
        </Pressable>
      </View>

      {/* Vorschaukarte */}
      {selected ? (
        <View style={[styles.preview, { backgroundColor: colors.surface, borderColor: colors.goldBright }]}>
          {selected.kind === 'spot' ? (
            <>
              <View style={styles.row}>
                {selected.summary.tier ? <TierBadge tier={selected.summary.tier} size={30} /> : null}
                <View style={styles.flex}>
                  <AppText variant="heading" numberOfLines={1}>
                    {selected.summary.spot.name}
                  </AppText>
                  <AppText variant="caption" tone="muted" numberOfLines={1}>
                    {selected.summary.score
                      ? `${formatScore(selected.summary.score.overall)} · ${
                          selected.summary.rank
                            ? t.ranking.rank(selected.summary.rank)
                            : t.spots.statusConquered
                        }`
                      : t.spots.statusDiscovered}
                  </AppText>
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.flex}>
                  <Button
                    title={t.chart.open}
                    icon="book-open-variant"
                    compact
                    onPress={() => onOpenSpot(selected.summary.spot.id)}
                  />
                </View>
                <View style={styles.flex}>
                  <Button
                    title={t.detail.route}
                    icon="directions"
                    variant="secondary"
                    compact
                    onPress={() => void openRoute(selected.summary.spot)}
                  />
                </View>
              </View>
            </>
          ) : (
            <>
              <AppText variant="heading" numberOfLines={1}>
                {selected.place.name}
              </AppText>
              <AppText variant="caption" tone="muted">
                {t.chart.discovery}
              </AppText>
              <Button
                title={t.treasure.addWishlist}
                icon="bookmark-plus-outline"
                compact
                onPress={() => {
                  onAddDiscovery(selected.place);
                  setSelected(null);
                }}
              />
            </>
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  pinWrap: { alignItems: 'center' },
  pin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2.5,
    borderColor: '#2A1A0C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinText: { fontFamily: fonts.display, fontSize: 18 },
  sand: {
    width: 26,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#E3C27A',
    marginTop: -2,
    borderWidth: 1,
    borderColor: '#9E7A3A',
  },
  osmPin: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderStyle: 'dashed',
    backgroundColor: '#FFFFFFDD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cluster: {
    minWidth: 38,
    height: 38,
    borderRadius: 19,
    paddingHorizontal: 8,
    borderWidth: 3,
    borderColor: '#F6E8C8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clusterText: { fontFamily: fonts.display, fontSize: 18, color: '#FFFFFF' },
  controls: { position: 'absolute', top: spacing.md, right: spacing.md, gap: spacing.sm },
  fab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  preview: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 2,
    padding: spacing.md,
    gap: spacing.sm,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
});
