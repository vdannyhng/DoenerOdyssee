import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { PirateAvatar } from '@/components/art/PirateAvatar';
import { AppText } from '@/components/ui';
import type { Member } from '@/features/crew/api';
import { formatRating } from '@/features/ranking/scoring';
import { t } from '@/i18n/de';
import { formatIsoDate } from '@/lib/dates';
import { radius, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

import type { MealType, Rating, Visit } from './api';

type Props = { visit: Visit; ratings: Rating[]; members: Member[]; myId: string | null };

/** Ein Logbuch-Eintrag: Datum, Gericht, Teilnehmer mit ihrer Note (oder „?“, falls noch offen) */
export function VisitCard({ visit, ratings, members, myId }: Props) {
  const { colors } = useTheme();
  const memberById = new Map(members.map((m) => [m.id, m]));
  const ratingByMember = new Map(ratings.map((r) => [r.member_id, r]));
  const participants = [...new Set([...visit.participantIds, ...ratings.map((r) => r.member_id)])];
  const missing = participants.filter((id) => !ratingByMember.has(id));
  const iMissing = !!myId && missing.includes(myId);
  const comments = ratings.filter((r) => r.comment);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint={t.visits.rateTitle}
      onPress={() => router.push(`/visits/${visit.id}`)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: iMissing ? colors.goldBright : colors.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <View style={styles.header}>
        <MaterialCommunityIcons name="book-open-variant" size={20} color={colors.textMuted} />
        <AppText variant="bodyStrong" style={styles.flex}>
          {formatIsoDate(visit.visited_on)}
          {visit.meal_type ? ` · ${t.visits.meals[visit.meal_type as MealType] ?? ''}` : ''}
        </AppText>
        {iMissing ? (
          <AppText variant="caption" tone="accent">
            {t.detail.rateMissing}
          </AppText>
        ) : (
          <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textMuted} />
        )}
      </View>
      <View style={styles.body}>
        <View style={styles.people}>
          {participants.map((id) => {
            const m = memberById.get(id);
            const r = ratingByMember.get(id);
            return (
              <View
                key={id}
                style={styles.person}
                accessible
                accessibilityLabel={`${m?.display_name ?? '?'}: ${r ? formatRating(r.taste_score) : t.detail.noRatingYet}`}
              >
                <PirateAvatar avatar={m?.avatar ?? ''} color={m?.color ?? colors.primary} size={36} />
                <AppText variant="label" tone={r ? 'default' : 'muted'}>
                  {r ? formatRating(r.taste_score) : '?'}
                </AppText>
              </View>
            );
          })}
        </View>
        {visit.photoUri ? (
          <Image
            source={{ uri: visit.photoUri }}
            style={styles.thumb}
            contentFit="cover"
            accessibilityLabel={t.photos.visitPhoto}
          />
        ) : null}
      </View>
      {comments.map((r) => (
        <AppText key={r.id} variant="caption" tone="muted">
          {memberById.get(r.member_id)?.display_name ?? '?'}: „{r.comment}“
        </AppText>
      ))}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1.5, borderRadius: radius.md, padding: spacing.md, gap: spacing.sm },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  flex: { flex: 1 },
  body: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  people: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  thumb: { width: 64, height: 64, borderRadius: radius.sm, transform: [{ rotate: '2deg' }] },
  person: { alignItems: 'center', gap: 2 },
});
