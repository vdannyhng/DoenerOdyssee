import { router } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ShipArt } from '@/components/art/ShipArt';
import { AppText, EmptyState, ErrorState, LoadingState, TierBadge } from '@/components/ui';
import { TIER_KEYS, formatScore, type TierKey } from '@/features/ranking/scoring';
import { useRanking } from '@/features/ranking/useRanking';
import { t } from '@/i18n/de';
import { errorMessage } from '@/lib/errors';
import { fonts, poster, radius, spacing, tierColors } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

/**
 * Die Flotte (statt klassischer Tier List): Jeder Tier ist ein Schiff, jeder Spot ein Wimpel an Bord.
 * Je besser der Döner, desto stolzer das Schiff.
 */
export default function FleetScreen() {
  const { colors } = useTheme();
  const { data, settings, isLoading, error, refetch, isRefetching } = useRanking();

  if (isLoading) return <LoadingState />;
  if (error && !data) return <ErrorState message={errorMessage(error)} onRetry={() => void refetch()} />;
  if (!data?.ranked.length) {
    return <EmptyState icon="sail-boat" title={t.fleet.empty} message={t.ranking.emptyBody} />;
  }

  const byTier = new Map<TierKey, typeof data.ranked>();
  for (const entry of data.ranked) {
    const tier = data.summaries.get(entry.spot.id)?.tier ?? 'F';
    byTier.set(tier, [...(byTier.get(tier) ?? []), entry]);
  }
  const th = settings?.tierThresholds;

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />}
    >
      <AppText tone="muted" style={styles.intro}>
        {t.fleet.intro}
      </AppText>
      {TIER_KEYS.map((tier) => {
        const entries = byTier.get(tier) ?? [];
        const from = tier === 'F' ? null : th?.[tier];
        const { bg, fg } = tierColors[tier];
        return (
          <View
            key={tier}
            style={[
              styles.dock,
              { backgroundColor: colors.surface, borderColor: entries.length ? bg : colors.border },
              !entries.length && styles.dockEmpty,
            ]}
          >
            <View style={styles.dockHead}>
              <ShipArt tier={tier} width={entries.length ? 110 : 72} />
              <View style={styles.flex}>
                <View style={styles.titleRow}>
                  <TierBadge tier={tier} size={28} />
                  <AppText variant="title" style={styles.shipName}>
                    {t.tiers.names[tier]}
                  </AppText>
                </View>
                <AppText variant="caption" tone="muted">
                  {from != null ? t.fleet.from(formatScore(from)) : t.fleet.below(formatScore(th?.D ?? 4))}
                  {' · '}
                  {t.fleet.aboard(entries.length)}
                </AppText>
              </View>
            </View>
            {entries.length ? (
              <View style={styles.pennants}>
                {entries.map(({ spot, score, rank }) => (
                  <Pressable
                    key={spot.id}
                    accessibilityRole="button"
                    accessibilityLabel={`${spot.name}, ${t.ranking.rank(rank)}, ${formatScore(score.overall)}`}
                    onPress={() => router.push(`/spots/${spot.id}`)}
                    style={({ pressed }) => [styles.pennant, pressed && styles.pressed]}
                  >
                    {/* Wimpel-Spitze in Tier-Farbe */}
                    <View style={[styles.flag, { backgroundColor: bg }]}>
                      <Text style={[styles.flagRank, { color: fg }]}>{rank}</Text>
                    </View>
                    <Text style={styles.pennantName} numberOfLines={1}>
                      {spot.name}
                    </Text>
                    <Text style={styles.pennantScore}>{formatScore(score.overall)}</Text>
                  </Pressable>
                ))}
              </View>
            ) : (
              <AppText variant="caption" tone="muted">
                {t.fleet.emptyShip}
              </AppText>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, gap: spacing.md, maxWidth: 640, width: '100%', alignSelf: 'center' },
  intro: { textAlign: 'center' },
  flex: { flex: 1 },
  dock: { borderWidth: 2, borderRadius: radius.lg, padding: spacing.sm, gap: spacing.sm },
  dockEmpty: { opacity: 0.75 },
  dockHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  shipName: { fontSize: 26, lineHeight: 32, flexShrink: 1 },
  pennants: { gap: spacing.xs },
  pennant: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 44,
    backgroundColor: poster.paper,
    borderColor: poster.paperEdge,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingRight: spacing.sm,
    overflow: 'hidden',
  },
  pressed: { opacity: 0.8 },
  flag: {
    width: 40,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopRightRadius: 22,
    borderBottomRightRadius: 22,
  },
  flagRank: { fontFamily: fonts.display, fontSize: 20 },
  pennantName: { flex: 1, fontFamily: fonts.display, fontSize: 18, color: poster.ink },
  pennantScore: { fontFamily: fonts.bodyHeavy, fontSize: 15, color: poster.ink },
});
