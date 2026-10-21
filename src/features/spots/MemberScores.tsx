import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { PirateAvatar } from '@/components/art/PirateAvatar';
import { AppText } from '@/components/ui';
import type { Member } from '@/features/crew/api';
import type { Logbook } from '@/features/logbook/api';
import { formatRating, formatScore, type SpotScore } from '@/features/ranking/scoring';
import { t } from '@/i18n/de';
import { formatIsoDate } from '@/lib/dates';
import { radius, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

type Props = { score: SpotScore; members: Member[]; logbook: Logbook; spotId: string; myId: string | null };

/**
 * Noten aller Mitglieder nebeneinander als Balken (wer bewertet strenger/milder?).
 * Bei mehreren Besuchen aufklappbar mit den einzelnen Noten.
 */
export function MemberScores({ score, members, logbook, spotId, myId }: Props) {
  const { colors } = useTheme();
  const [open, setOpen] = useState<string | null>(null);
  const memberById = new Map(members.map((m) => [m.id, m]));
  const visits = logbook.visits.filter((v) => v.spot_id === spotId);
  const visitById = new Map(visits.map((v) => [v.id, v]));
  const avgPct = (score.overall / 10) * 100;

  const rows = [...score.members].sort((a, b) => b.average - a.average);

  return (
    <View style={styles.wrap}>
      {rows.map((row) => {
        const member = memberById.get(row.memberId);
        const name = member?.display_name ?? '?';
        const diff = row.average - score.overall;
        const expandable = row.scores.length > 1;
        const isOpen = open === row.memberId;
        const ratings = logbook.ratings
          .filter((r) => r.member_id === row.memberId && visitById.has(r.visit_id))
          .map((r) => ({ ...r, date: visitById.get(r.visit_id)!.visited_on }))
          .sort((a, b) => b.date.localeCompare(a.date));

        return (
          <View key={row.memberId} style={styles.item}>
            <Pressable
              disabled={!expandable}
              onPress={() => setOpen(isOpen ? null : row.memberId)}
              accessibilityRole={expandable ? 'button' : undefined}
              accessibilityState={expandable ? { expanded: isOpen } : undefined}
              accessibilityLabel={`${name}${row.memberId === myId ? ` (${t.common.you})` : ''}: ${formatScore(row.average)}, ${t.detail.visitsCount(row.scores.length)}`}
              style={styles.row}
            >
              <PirateAvatar avatar={member?.avatar ?? ''} color={member?.color ?? colors.primary} size={40} />
              <View style={styles.flex}>
                <View style={styles.nameRow}>
                  <AppText variant="bodyStrong" numberOfLines={1} style={styles.flex}>
                    {name}
                    {row.memberId === myId ? ` (${t.common.you})` : ''}
                  </AppText>
                  <AppText variant="caption" tone={diff >= 0 ? 'success' : 'accent'}>
                    {diff >= 0 ? '+' : '−'}
                    {formatScore(Math.abs(diff))}
                  </AppText>
                  <AppText variant="heading">{formatScore(row.average)}</AppText>
                </View>
                <View style={[styles.track, { backgroundColor: colors.surfaceMuted }]}>
                  <View
                    style={[
                      styles.bar,
                      {
                        width: `${(row.average / 10) * 100}%`,
                        backgroundColor: member?.color ?? colors.primary,
                      },
                    ]}
                  />
                  {/* Strich = Crew-Schnitt */}
                  <View style={[styles.avgMark, { left: `${avgPct}%`, backgroundColor: colors.text }]} />
                </View>
                {expandable ? (
                  <View style={styles.nameRow}>
                    <AppText variant="caption" tone="muted" style={styles.flex}>
                      {t.detail.visitsCount(row.scores.length)}
                    </AppText>
                    <MaterialCommunityIcons
                      name={isOpen ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={colors.textMuted}
                    />
                  </View>
                ) : null}
              </View>
            </Pressable>
            {isOpen ? (
              <View style={[styles.details, { borderColor: colors.border }]}>
                {ratings.map((r) => (
                  <View key={r.id} style={styles.nameRow}>
                    <AppText variant="caption" tone="muted" style={styles.flex}>
                      {formatIsoDate(r.date)}
                      {r.comment ? ` · „${r.comment}“` : ''}
                    </AppText>
                    <AppText variant="bodyStrong">{formatRating(r.taste_score)}</AppText>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        );
      })}
      <View style={styles.legend}>
        <View style={[styles.legendMark, { backgroundColor: colors.text }]} />
        <AppText variant="caption" tone="muted">
          {t.detail.crewAverage} {formatScore(score.overall)}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  item: { gap: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minHeight: 48 },
  flex: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  track: { height: 12, borderRadius: radius.pill, overflow: 'visible', marginTop: 2 },
  bar: { height: 12, borderRadius: radius.pill },
  avgMark: { position: 'absolute', top: -3, width: 3, height: 18, marginLeft: -1.5, borderRadius: 1 },
  details: { marginLeft: 48, paddingLeft: spacing.sm, borderLeftWidth: 2, gap: spacing.xs },
  legend: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  legendMark: { width: 3, height: 14, borderRadius: 1 },
});
