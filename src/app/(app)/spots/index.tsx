import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';

import { DoenerIcon } from '@/components/art/DoenerIcon';
import {
  AppText,
  Button,
  Chip,
  EmptyState,
  ErrorState,
  LoadingState,
  TextField,
  TierBadge,
} from '@/components/ui';
import { useRanking } from '@/features/ranking/useRanking';
import { formatScore } from '@/features/ranking/scoring';
import { sortSpots, type SpotSort } from '@/features/spots/sortSpots';
import { t } from '@/i18n/de';
import { formatIsoDate } from '@/lib/dates';
import { errorMessage } from '@/lib/errors';
import { radius, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

const SORTS: SpotSort[] = ['score', 'price', 'recent', 'name'];

export default function AllSpotsScreen() {
  const { colors } = useTheme();
  const { data, settings, isLoading, error, refetch, isRefetching } = useRanking();
  const [sort, setSort] = useState<SpotSort>('score');
  const [query, setQuery] = useState('');

  const items = useMemo(
    () => (data ? sortSpots([...data.summaries.values()], sort, query) : []),
    [data, sort, query],
  );

  if (isLoading) return <LoadingState />;
  if (error && !data) return <ErrorState message={errorMessage(error)} onRetry={() => void refetch()} />;

  const total = data?.summaries.size ?? 0;
  const currency = settings?.currency ?? 'EUR';

  return (
    <FlatList
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.list}
      data={items}
      keyExtractor={(item) => item.spot.id}
      keyboardShouldPersistTaps="handled"
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />}
      ListHeaderComponent={
        total > 0 ? (
          <View style={styles.header}>
            <TextField
              label={t.spots.search}
              placeholder={t.spots.search}
              value={query}
              onChangeText={setQuery}
            />
            <View style={styles.chips} accessibilityLabel={t.spots.sortBy}>
              {SORTS.map((s) => (
                <Chip key={s} label={t.spots.sort[s]} selected={sort === s} onPress={() => setSort(s)} />
              ))}
            </View>
          </View>
        ) : undefined
      }
      ListEmptyComponent={
        total === 0 ? (
          <EmptyState
            icon="island"
            title={t.spots.emptyTitle}
            message={t.spots.emptyBody}
            action={
              <Button title={t.ranking.newSpot} icon="island" onPress={() => router.push('/spots/new')} />
            }
          />
        ) : (
          <AppText tone="muted" style={styles.center}>
            {t.spots.noResults}
          </AppText>
        )
      }
      ListFooterComponent={
        total > 0 ? (
          <Button
            title={t.ranking.newSpot}
            icon="plus"
            variant="secondary"
            onPress={() => router.push('/spots/new')}
          />
        ) : undefined
      }
      renderItem={({ item }) => {
        const { spot, score, rank, tier } = item;
        const meta = [
          score ? t.ranking.raters(score.raterCount) : t.spots.statusDiscovered,
          spot.price != null ? t.spots.priceValue(spot.price.toFixed(2), currency) : null,
          item.lastVisitedOn ? formatIsoDate(item.lastVisitedOn) : null,
        ]
          .filter(Boolean)
          .join(' · ');
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${spot.name}, ${score ? `${t.detail.overall} ${formatScore(score.overall)}` : t.spots.statusDiscovered}`}
            onPress={() => router.push(`/spots/${spot.id}`)}
            style={({ pressed }) => [
              styles.row,
              { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <View style={[styles.rank, { backgroundColor: rank ? colors.accent : colors.surfaceMuted }]}>
              {rank ? (
                <AppText variant="bodyStrong" tone="onAccent">
                  {rank}
                </AppText>
              ) : (
                <MaterialCommunityIcons name="map-marker-question" size={20} color={colors.textMuted} />
              )}
            </View>
            <DoenerIcon size={36} />
            <View style={styles.flex}>
              <AppText variant="bodyStrong" numberOfLines={1}>
                {spot.name}
              </AppText>
              <AppText variant="caption" tone="muted" numberOfLines={1}>
                {meta}
              </AppText>
            </View>
            {score && tier ? (
              <View style={styles.score}>
                <AppText variant="heading">{formatScore(score.overall)}</AppText>
                <TierBadge tier={tier} size={26} />
              </View>
            ) : null}
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: spacing.md,
    gap: spacing.sm,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
    flexGrow: 1,
  },
  header: { gap: spacing.sm, marginBottom: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  center: { textAlign: 'center', padding: spacing.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderWidth: 1.5,
    borderRadius: radius.md,
    minHeight: 64,
  },
  rank: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1 },
  score: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
});
