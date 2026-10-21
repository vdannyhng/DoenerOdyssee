import { router } from 'expo-router';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { JollyRoger } from '@/components/art/JollyRoger';
import { AppText, Button, EmptyState, ErrorState } from '@/components/ui';
import { WantedPoster, type PosterSize } from '@/features/ranking/components/WantedPoster';
import { WoodWall } from '@/features/ranking/components/WoodWall';
import { useRanking } from '@/features/ranking/useRanking';
import { t } from '@/i18n/de';
import { errorMessage } from '@/lib/errors';
import { poster, radius, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

export default function WantedScreen() {
  const { colors } = useTheme();
  const { data, isLoading, error, refetch, isRefetching } = useRanking();

  if (error && !data) return <ErrorState message={errorMessage(error)} onRetry={() => void refetch()} />;

  const top10 = data?.ranked.slice(0, 10) ?? [];
  const openVisits = data?.openVisits ?? [];
  const firstOpen = openVisits[0];

  const posterFor = (index: number, size: PosterSize) => {
    const entry = top10[index];
    if (!entry || !data) return null;
    const summary = data.summaries.get(entry.spot.id);
    return (
      <WantedPoster
        key={entry.spot.id}
        rank={entry.rank}
        name={entry.spot.name}
        overall={entry.score.overall}
        raters={entry.score.raterCount}
        tier={summary?.tier ?? 'F'}
        photoUrl={summary?.coverPhoto}
        size={size}
        onPress={() => router.push(`/spots/${entry.spot.id}`)}
      />
    );
  };

  return (
    <ScrollView
      style={{ backgroundColor: '#5E3B1E' }}
      contentContainerStyle={styles.scroll}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={() => void refetch()}
          tintColor={colors.onWood}
        />
      }
    >
      <WoodWall>
        <View style={styles.content}>
          <View style={styles.actions}>
            <View style={styles.flex}>
              <Button
                title={t.ranking.newVisit}
                icon="feather"
                variant="accent"
                onPress={() => router.push('/visits/new')}
              />
            </View>
            <View style={styles.flex}>
              <Button
                title={t.ranking.allSpots}
                icon="format-list-bulleted"
                variant="secondary"
                onPress={() => router.push('/spots')}
              />
            </View>
          </View>

          {firstOpen ? (
            <View
              style={[styles.notice, { backgroundColor: colors.surface, borderColor: colors.goldBright }]}
            >
              <AppText variant="bodyStrong" style={styles.flex}>
                {t.ranking.openRatings(openVisits.length)}
              </AppText>
              <Button
                title={t.ranking.rateNow}
                compact
                onPress={() => router.push(`/visits/${firstOpen.id}`)}
              />
            </View>
          ) : null}

          {isLoading ? (
            <View style={styles.podium} accessibilityLabel={t.common.loading}>
              {[0, 1, 2].map((i) => (
                <View key={i} style={[styles.skeleton, i === 0 && styles.skeletonLarge]} />
              ))}
            </View>
          ) : top10.length === 0 ? (
            <View style={[styles.empty, { backgroundColor: poster.paper }]}>
              <EmptyState
                art={<JollyRoger size={120} />}
                title={t.ranking.emptyTitle}
                message={t.ranking.emptyBody}
                action={
                  <Button title={t.ranking.newSpot} icon="island" onPress={() => router.push('/spots/new')} />
                }
              />
            </View>
          ) : (
            <>
              <View style={styles.first}>{posterFor(0, 'lg')}</View>
              <View style={styles.pair}>
                <View style={styles.half}>{posterFor(1, 'md')}</View>
                <View style={styles.half}>{posterFor(2, 'md')}</View>
              </View>
              <View style={styles.grid}>
                {top10.slice(3).map((_, i) => (
                  <View key={i} style={styles.cell}>
                    {posterFor(i + 3, 'sm')}
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
      </WoodWall>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1 },
  content: { padding: spacing.md, gap: spacing.lg, maxWidth: 640, width: '100%', alignSelf: 'center' },
  actions: { flexDirection: 'row', gap: spacing.sm },
  flex: { flex: 1 },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 2,
  },
  first: { width: '70%', alignSelf: 'center' },
  pair: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  half: { flex: 1, maxWidth: '50%' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: spacing.lg, justifyContent: 'space-between' },
  cell: { width: '47%' },
  podium: { gap: spacing.lg, alignItems: 'center' },
  skeleton: { width: '46%', aspectRatio: 0.7, borderRadius: 4, backgroundColor: 'rgba(235, 217, 168, 0.25)' },
  skeletonLarge: { width: '70%' },
  empty: { borderRadius: radius.sm, paddingVertical: spacing.lg, minHeight: 360 },
});
