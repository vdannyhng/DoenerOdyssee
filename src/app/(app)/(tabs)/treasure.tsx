import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import { useMemo, useState, type ReactNode } from 'react';
import { Linking, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { DoenerIcon } from '@/components/art/DoenerIcon';
import { AppText, Button, Card, Chip, ErrorState, LoadingState, TierBadge } from '@/components/ui';
import { useCrew, useMyMember } from '@/features/crew/api';
import { useSaveSpot } from '@/features/logbook/api';
import { TIER_KEYS, formatScore } from '@/features/ranking/scoring';
import { useRanking, type SpotSummary } from '@/features/ranking/useRanking';
import type { GeoPoint } from '@/features/spots/duplicates';
import { currentPoint } from '@/features/spots/geocoding';
import { formatDistance } from '@/features/spots/nearby';
import { fetchNearbyDoener, reviewsUrl, type OsmPlace } from '@/features/treasure/overpass';
import { buildRoute, filterSummaries, type ChartFilter } from '@/features/seachart/chart';
import SeaMap from '@/features/seachart/SeaMap';
import { recommendForMember, wishlist } from '@/features/treasure/recommend';
import { t } from '@/i18n/de';
import { errorMessage } from '@/lib/errors';
import { radius, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

const FILTERS: ChartFilter[] = ['all', 'top10', 'wishlist', ...TIER_KEYS];

/**
 * Seekarte: alle Inseln auf der Karte mit Reiseroute – oder als Liste mit der Schatzsuche
 * (Empfehlungen der Crew, Wunschliste, unentdeckte Läden in der Nähe).
 */
export default function TreasureScreen() {
  const { colors } = useTheme();
  const { data, logbook, isLoading, error, refetch, isRefetching } = useRanking();
  const me = useMyMember();
  const crew = useCrew();
  const saveSpot = useSaveSpot();

  const [nearby, setNearby] = useState<OsmPlace[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [added, setAdded] = useState<Set<string>>(new Set());
  const [view, setView] = useState<'map' | 'list'>('map');
  const [filter, setFilter] = useState<ChartFilter>('all');

  const summaries = useMemo(() => (data ? [...data.summaries.values()] : []), [data]);
  const forYou = useMemo(
    () =>
      logbook && me.data ? recommendForMember(summaries, logbook.ratings, logbook.visits, me.data.id) : [],
    [summaries, logbook, me.data],
  );
  const wish = useMemo(() => wishlist(summaries), [summaries]);
  const shown = useMemo(() => filterSummaries(summaries, filter), [summaries, filter]);
  const route = useMemo(() => (logbook ? buildRoute(logbook.visits, logbook.spots) : []), [logbook]);

  if (isLoading) return <LoadingState />;
  if (error && !data) return <ErrorState message={errorMessage(error)} onRetry={() => void refetch()} />;

  const search = async () => {
    setSearching(true);
    setSearchError(null);
    try {
      const at: GeoPoint | 'denied' | null = await currentPoint({ ask: true });
      if (at === 'denied' || !at) {
        setSearchError(t.spots.locationDenied);
        return;
      }
      setNearby(await fetchNearbyDoener(at, logbook?.spots ?? []));
    } catch {
      setSearchError(t.treasure.failed);
    } finally {
      setSearching(false);
    }
  };

  const addToWishlist = (place: OsmPlace) => {
    if (!crew.data) return;
    saveSpot.mutate(
      {
        crewId: crew.data.id,
        input: {
          name: place.name,
          address: place.address,
          lat: place.lat,
          lng: place.lng,
          price: null,
          note: null,
        },
      },
      { onSuccess: () => setAdded((prev) => new Set(prev).add(place.osmId)) },
    );
  };

  const spotRow = (s: SpotSummary, right: ReactNode) => (
    <Pressable
      key={s.spot.id}
      accessibilityRole="button"
      onPress={() => router.push(`/spots/${s.spot.id}`)}
      style={({ pressed }) => [
        styles.row,
        { borderColor: colors.border, backgroundColor: pressed ? colors.surfaceMuted : colors.background },
      ]}
    >
      <DoenerIcon size={34} />
      <View style={styles.flex}>
        <AppText variant="bodyStrong" numberOfLines={1}>
          {s.spot.name}
        </AppText>
        {s.spot.address ? (
          <AppText variant="caption" tone="muted" numberOfLines={1}>
            {s.spot.address}
          </AppText>
        ) : null}
      </View>
      {right}
    </Pressable>
  );

  const toggle = (
    <View style={[styles.toggle, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {(['map', 'list'] as const).map((v) => (
        <Pressable
          key={v}
          accessibilityRole="tab"
          accessibilityState={{ selected: view === v }}
          onPress={() => setView(v)}
          style={[styles.toggleItem, view === v && { backgroundColor: colors.primary }]}
        >
          <MaterialCommunityIcons
            name={v === 'map' ? 'map-legend' : 'format-list-bulleted'}
            size={18}
            color={view === v ? colors.onPrimary : colors.primary}
          />
          <AppText variant="label" tone={view === v ? 'onPrimary' : 'primary'}>
            {v === 'map' ? t.chart.map : t.chart.list}
          </AppText>
        </Pressable>
      ))}
    </View>
  );

  if (view === 'map') {
    return (
      <View style={[styles.flex, { backgroundColor: colors.background }]}>
        <View style={[styles.mapBar, { borderBottomColor: colors.border }]}>
          {toggle}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filters}
          >
            {FILTERS.map((f) => (
              <Chip
                key={f}
                label={t.chart.filters[f as keyof typeof t.chart.filters] ?? t.tiers.names[f as 'S']}
                selected={filter === f}
                onPress={() => setFilter(f)}
              />
            ))}
            <Chip
              label={searching ? t.common.loading : nearby ? t.treasure.searchAgain : t.treasure.search}
              onPress={() => void search()}
              leading={<MaterialCommunityIcons name="compass-rose" size={16} color={colors.primary} />}
            />
          </ScrollView>
          {searchError ? (
            <AppText variant="caption" tone="danger">
              {searchError}
            </AppText>
          ) : nearby && !nearby.length ? (
            <AppText variant="caption" tone="muted">
              {t.treasure.noneFound}
            </AppText>
          ) : null}
        </View>
        <SeaMap
          spots={shown}
          route={filter === 'all' ? route : []}
          discoveries={nearby ?? []}
          addedDiscoveries={added}
          onOpenSpot={(id) => router.push(`/spots/${id}`)}
          onAddDiscovery={addToWishlist}
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />}
    >
      {toggle}
      <Card>
        <View style={styles.head}>
          <MaterialCommunityIcons name="star-shooting" size={26} color={colors.gold} />
          <AppText variant="heading" style={styles.flex}>
            {t.treasure.forYou}
          </AppText>
        </View>
        <AppText variant="caption" tone="muted">
          {forYou.length ? t.treasure.forYouHint : t.treasure.forYouEmpty}
        </AppText>
        {forYou.map((s) =>
          spotRow(
            s,
            <View style={styles.score}>
              <AppText variant="bodyStrong">{formatScore(s.score!.overall)}</AppText>
              {s.tier ? <TierBadge tier={s.tier} size={24} /> : null}
            </View>,
          ),
        )}
      </Card>

      <Card>
        <View style={styles.head}>
          <MaterialCommunityIcons name="map-marker-star" size={26} color={colors.accent} />
          <AppText variant="heading" style={styles.flex}>
            {t.treasure.wishlist}
          </AppText>
        </View>
        <AppText variant="caption" tone="muted">
          {wish.length ? t.treasure.wishlistHint : t.treasure.wishlistEmpty}
        </AppText>
        {wish.map((s) =>
          spotRow(s, <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textMuted} />),
        )}
      </Card>

      <Card>
        <View style={styles.head}>
          <MaterialCommunityIcons name="compass-rose" size={26} color={colors.primary} />
          <AppText variant="heading" style={styles.flex}>
            {t.treasure.nearby}
          </AppText>
        </View>
        <AppText variant="caption" tone="muted">
          {t.treasure.nearbyHint}
        </AppText>
        <Button
          title={nearby ? t.treasure.searchAgain : t.treasure.search}
          icon="crosshairs-gps"
          variant={nearby ? 'secondary' : 'primary'}
          loading={searching}
          onPress={() => void search()}
        />
        {searchError ? (
          <AppText variant="caption" tone="danger">
            {searchError}
          </AppText>
        ) : null}
        {nearby && !nearby.length ? <AppText tone="muted">{t.treasure.noneFound}</AppText> : null}
        {nearby?.map((p) => {
          const isAdded = added.has(p.osmId);
          return (
            <View key={p.osmId} style={[styles.place, { borderColor: colors.border }]}>
              <View style={styles.placeHead}>
                <MaterialCommunityIcons name="island" size={22} color={colors.primary} />
                <View style={styles.flex}>
                  <AppText variant="bodyStrong">{p.name}</AppText>
                  <AppText variant="caption" tone="muted">
                    {[formatDistance(p.meters), p.address].filter(Boolean).join(' · ')}
                  </AppText>
                </View>
              </View>
              <View style={styles.placeActions}>
                <View style={styles.flex}>
                  <Button
                    title={isAdded ? t.treasure.added : t.treasure.addWishlist}
                    icon={isAdded ? 'check' : 'bookmark-plus-outline'}
                    compact
                    disabled={isAdded || saveSpot.isPending}
                    onPress={() => addToWishlist(p)}
                  />
                </View>
                <View style={styles.flex}>
                  <Button
                    title={t.treasure.reviews}
                    icon="star-outline"
                    variant="secondary"
                    compact
                    onPress={() => void Linking.openURL(reviewsUrl(p))}
                  />
                </View>
              </View>
            </View>
          );
        })}
        {saveSpot.error ? <AppText tone="danger">{errorMessage(saveSpot.error)}</AppText> : null}
        {nearby ? (
          <AppText variant="caption" tone="muted" style={styles.attribution}>
            {t.treasure.attribution}
          </AppText>
        ) : null}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, gap: spacing.md, maxWidth: 640, width: '100%', alignSelf: 'center' },
  flex: { flex: 1 },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 56,
    paddingHorizontal: spacing.sm,
    borderWidth: 1.5,
    borderRadius: radius.md,
  },
  score: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  place: { borderWidth: 1.5, borderRadius: radius.md, padding: spacing.sm, gap: spacing.sm },
  placeHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  placeActions: { flexDirection: 'row', gap: spacing.sm },
  attribution: { textAlign: 'right' },
  mapBar: { padding: spacing.sm, gap: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth },
  filters: { gap: spacing.sm, paddingRight: spacing.md },
  toggle: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderRadius: radius.pill,
    padding: 3,
    alignSelf: 'center',
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 40,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
  },
});
