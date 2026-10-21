import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DoenerIcon } from '@/components/art/DoenerIcon';
import { BerrySign } from '@/components/art/BerrySign';
import { AppText, Button, Card, Chip, ErrorState, LoadingState, Screen, TierBadge } from '@/components/ui';
import { useMembers, useMyMember } from '@/features/crew/api';
import { useDeleteSpot } from '@/features/logbook/api';
import { VisitCard } from '@/features/logbook/VisitCard';
import { useRanking } from '@/features/ranking/useRanking';
import { bountyFor, formatBounty, formatScore } from '@/features/ranking/scoring';
import { openRoute } from '@/features/spots/geocoding';
import { MemberScores } from '@/features/spots/MemberScores';
import { t } from '@/i18n/de';
import { confirm } from '@/lib/confirm';
import { formatIsoDate } from '@/lib/dates';
import { errorMessage } from '@/lib/errors';
import { fonts, poster, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

export default function SpotDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { data, logbook, settings, isLoading, error, refetch } = useRanking();
  const members = useMembers();
  const me = useMyMember();
  const deleteSpot = useDeleteSpot();

  if (isLoading || members.isLoading) return <LoadingState />;
  const summary = data?.summaries.get(id);
  if (error || !summary || !logbook) {
    return <ErrorState message={error ? errorMessage(error) : undefined} onRetry={() => void refetch()} />;
  }

  const { spot, score, rank, tier } = summary;
  const myId = me.data?.id ?? null;
  const isCaptain = me.data?.role === 'captain';
  const canEdit = isCaptain || spot.created_by === myId;
  const visits = logbook.visits.filter((v) => v.spot_id === spot.id);
  const photos = visits.filter((v) => v.photoUri);
  const ratingsByVisit = (visitId: string) => logbook.ratings.filter((r) => r.visit_id === visitId);
  const currency = settings?.currency ?? 'EUR';

  const remove = async () => {
    const ok = await confirm(t.common.confirmDeleteTitle, t.common.confirmDeleteBody, t.common.delete, {
      destructive: true,
    });
    if (ok) deleteSpot.mutate(spot.id, { onSuccess: () => router.back() });
  };

  return (
    <Screen
      scroll
      footer={
        <View style={styles.actions}>
          <View style={styles.flex}>
            <Button
              title={t.detail.newVisit}
              icon="feather"
              variant="accent"
              onPress={() => router.push({ pathname: '/visits/new', params: { spotId: spot.id } })}
            />
          </View>
          <View style={styles.flex}>
            <Button
              title={t.detail.route}
              icon="directions"
              variant="secondary"
              onPress={() => void openRoute(spot)}
            />
          </View>
        </View>
      }
    >
      <Stack.Screen
        options={{
          title: spot.name,
          headerRight: canEdit
            ? () => (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t.common.edit}
                  hitSlop={12}
                  onPress={() => router.push(`/spots/${spot.id}/edit`)}
                >
                  <MaterialCommunityIcons name="pencil" size={24} color={colors.onWood} />
                </Pressable>
              )
            : undefined,
        }}
      />

      {/* Kopfbereich im Poster-Look */}
      <View style={styles.hero}>
        <View style={styles.photo}>
          {summary.coverPhoto ? (
            <Image source={{ uri: summary.coverPhoto }} style={StyleSheet.absoluteFill} contentFit="cover" />
          ) : (
            <DoenerIcon size={96} />
          )}
        </View>
        <Text style={styles.heroName}>{spot.name}</Text>
        {spot.address ? <Text style={styles.heroAddress}>{spot.address}</Text> : null}
        {score ? (
          <>
            <View
              style={styles.scoreRow}
              accessible
              accessibilityLabel={`${t.detail.overall} ${formatScore(score.overall)} von 10`}
            >
              <Text style={styles.bigScore}>{formatScore(score.overall)}</Text>
              <View style={styles.scoreMeta}>
                {tier ? (
                  <View style={styles.inline}>
                    <TierBadge tier={tier} size={30} />
                    <Text style={styles.metaText}>{t.tiers.names[tier]}</Text>
                  </View>
                ) : null}
                <Text style={styles.metaText}>
                  {rank ? `${t.ranking.rank(rank)} · ` : ''}
                  {t.ranking.raters(score.raterCount)}
                </Text>
              </View>
            </View>
            <View style={styles.inline}>
              <BerrySign size={22} color={poster.ink} />
              <Text style={styles.bounty}>
                {formatBounty(bountyFor(score.overall))}- {t.ranking.currency}
              </Text>
            </View>
          </>
        ) : (
          <Text style={styles.metaText}>{t.detail.unratedBody}</Text>
        )}
        <View style={styles.inline}>
          <Chip
            label={score ? t.spots.statusConquered : t.spots.statusDiscovered}
            selected={!!score}
            leading={
              <MaterialCommunityIcons
                name={score ? 'flag' : 'map-marker-question'}
                size={16}
                color={score ? colors.onPrimary : colors.text}
              />
            }
          />
          {spot.price != null ? <Chip label={t.spots.priceValue(spot.price.toFixed(2), currency)} /> : null}
        </View>
      </View>

      {spot.note ? (
        <Card>
          <AppText>{spot.note}</AppText>
        </Card>
      ) : null}

      {score ? (
        <Card>
          <AppText variant="heading">{t.detail.ratings}</AppText>
          <MemberScores
            score={score}
            members={members.data ?? []}
            logbook={logbook}
            spotId={spot.id}
            myId={myId}
          />
        </Card>
      ) : null}

      {photos.length ? (
        <>
          <AppText variant="title">{t.photos.gallery}</AppText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.album}>
            {photos.map((v, i) => (
              <Pressable
                key={v.id}
                accessibilityRole="button"
                accessibilityLabel={`${t.photos.visitPhoto}, ${formatIsoDate(v.visited_on)}`}
                onPress={() => router.push(`/visits/${v.id}`)}
                style={[styles.polaroid, { transform: [{ rotate: `${i % 2 ? 2 : -2}deg` }] }]}
              >
                <Image
                  source={{ uri: v.photoUri ?? undefined }}
                  style={styles.albumImage}
                  contentFit="cover"
                />
                <Text style={styles.albumDate}>{formatIsoDate(v.visited_on)}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </>
      ) : null}

      <AppText variant="title">{t.detail.visits}</AppText>
      {visits.length === 0 ? (
        <AppText tone="muted">{t.detail.noVisits}</AppText>
      ) : (
        visits.map((v) => (
          <VisitCard
            key={v.id}
            visit={v}
            ratings={ratingsByVisit(v.id)}
            members={members.data ?? []}
            myId={myId}
          />
        ))
      )}

      {isCaptain ? (
        <Button
          title={t.spots.deleteSpot}
          icon="delete-outline"
          variant="danger"
          loading={deleteSpot.isPending}
          onPress={() => void remove()}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  actions: { flexDirection: 'row', gap: spacing.sm },
  hero: {
    backgroundColor: poster.paper,
    borderColor: poster.paperEdge,
    borderWidth: 1.5,
    borderRadius: 4,
    padding: spacing.md,
    gap: spacing.sm,
    alignItems: 'center',
  },
  photo: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderWidth: 2,
    borderColor: poster.ink,
    backgroundColor: '#D9C38E',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heroName: {
    fontFamily: fonts.display,
    fontSize: 34,
    lineHeight: 40,
    color: poster.ink,
    textAlign: 'center',
  },
  heroAddress: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: poster.inkMuted, textAlign: 'center' },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  bigScore: { fontFamily: fonts.display, fontSize: 72, lineHeight: 80, color: poster.ink },
  scoreMeta: { gap: spacing.xs },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  metaText: { fontFamily: fonts.bodyBold, fontSize: 15, color: poster.ink, textAlign: 'center' },
  bounty: { fontFamily: fonts.bodyHeavy, fontSize: 18, color: poster.ink },
  album: { gap: spacing.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.xs },
  polaroid: {
    width: 140,
    padding: 6,
    paddingBottom: 4,
    backgroundColor: '#FFFDF6',
    borderWidth: 1,
    borderColor: poster.paperEdge,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 1, height: 2 },
  },
  albumImage: { width: '100%', aspectRatio: 1 },
  albumDate: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: poster.inkMuted,
    textAlign: 'center',
    marginTop: 2,
  },
});
