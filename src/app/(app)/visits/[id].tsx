import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  AppText,
  Button,
  Card,
  ErrorState,
  LoadingState,
  ScoreInput,
  Screen,
  TextField,
} from '@/components/ui';
import { useMembers, useMyMember } from '@/features/crew/api';
import {
  useDeleteRating,
  useDeleteVisit,
  useLogbook,
  useSaveRating,
  useSetVisitPhoto,
  type MealType,
  type Rating,
  type Visit,
} from '@/features/logbook/api';
import { PhotoField } from '@/features/photos/PhotoField';
import { t } from '@/i18n/de';
import { confirm } from '@/lib/confirm';
import { formatIsoDate } from '@/lib/dates';
import { errorMessage } from '@/lib/errors';
import { radius, spacing } from '@/theme/tokens';

export default function RateVisitScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const logbook = useLogbook();
  const members = useMembers();
  const me = useMyMember();

  if (logbook.isLoading || members.isLoading) return <LoadingState />;
  const visit = logbook.data?.visits.find((v) => v.id === id);
  if (!visit || !logbook.data) return <ErrorState onRetry={() => void logbook.refetch()} />;

  const myId = me.data?.id ?? null;
  const ratings = logbook.data.ratings.filter((r) => r.visit_id === visit.id);
  const mine = ratings.find((r) => r.member_id === myId);
  const spot = logbook.data.spots.find((s) => s.id === visit.spot_id);
  const names = new Map((members.data ?? []).map((m) => [m.id, m.display_name]));
  const waiting = visit.participantIds.filter((pid) => !ratings.some((r) => r.member_id === pid));
  const canEditVisit = me.data?.role === 'captain' || visit.created_by === myId;

  return (
    <RateForm
      // Neu aufbauen, sobald die eigene Note (z. B. per Realtime) geladen ist
      key={mine?.id ?? 'new'}
      visitId={visit.id}
      title={spot?.name ?? ''}
      subtitle={`${formatIsoDate(visit.visited_on)}${visit.meal_type ? ` · ${t.visits.meals[visit.meal_type as MealType]}` : ''}`}
      waiting={waiting.map((pid) => names.get(pid) ?? '?')}
      mine={mine}
      canDeleteVisit={canEditVisit}
      photo={<VisitPhoto visit={visit} canEdit={canEditVisit} crewId={me.data?.crew_id ?? ''} />}
    />
  );
}

function RateForm(props: {
  visitId: string;
  title: string;
  subtitle: string;
  waiting: string[];
  mine: Rating | undefined;
  canDeleteVisit: boolean;
  photo: ReactNode;
}) {
  const { visitId, title, subtitle, waiting, mine, canDeleteVisit, photo } = props;
  const [score, setScore] = useState(mine?.taste_score ?? 7);
  const [comment, setComment] = useState(mine?.comment ?? '');
  const save = useSaveRating();
  const deleteRating = useDeleteRating();
  const deleteVisit = useDeleteVisit();
  const error = save.error ?? deleteRating.error ?? deleteVisit.error;

  const submit = () =>
    save.mutate(
      { existingId: mine?.id, visitId, score, comment: comment || null },
      {
        onSuccess: () => {
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          router.back();
        },
      },
    );

  const removeRating = async () => {
    if (!mine) return;
    if (
      await confirm(t.common.confirmDeleteTitle, t.common.confirmDeleteBody, t.common.delete, {
        destructive: true,
      })
    ) {
      deleteRating.mutate(mine.id, { onSuccess: () => router.back() });
    }
  };

  const removeVisit = async () => {
    if (
      await confirm(t.common.confirmDeleteTitle, t.common.confirmDeleteBody, t.common.delete, {
        destructive: true,
      })
    ) {
      deleteVisit.mutate(visitId, { onSuccess: () => router.back() });
    }
  };

  return (
    <Screen
      scroll
      footer={
        <Button title={t.visits.rateSave} icon="check-bold" loading={save.isPending} onPress={submit} />
      }
    >
      <View style={styles.header}>
        <AppText variant="title">{title}</AppText>
        <AppText tone="muted">{subtitle}</AppText>
        {waiting.length ? (
          <AppText variant="caption" tone="muted">
            {t.visits.waitingFor(waiting.join(', '))}
          </AppText>
        ) : null}
      </View>
      <Card>
        <AppText variant="heading">{t.visits.yourScore}</AppText>
        <ScoreInput value={score} onChange={setScore} />
      </Card>
      <TextField
        label={`${t.visits.comment} (${t.common.optional})`}
        placeholder={t.visits.commentPlaceholder}
        value={comment}
        onChangeText={setComment}
        maxLength={280}
      />
      {photo}
      {error ? (
        <AppText tone="danger" accessibilityRole="alert">
          {errorMessage(error)}
        </AppText>
      ) : null}
      {mine ? (
        <Button
          title={t.visits.deleteRating}
          variant="danger"
          icon="delete-outline"
          loading={deleteRating.isPending}
          onPress={() => void removeRating()}
        />
      ) : null}
      {canDeleteVisit ? (
        <Button
          title={t.visits.deleteVisit}
          variant="danger"
          icon="delete-forever-outline"
          loading={deleteVisit.isPending}
          onPress={() => void removeVisit()}
        />
      ) : null}
    </Screen>
  );
}

/** Foto vom Döner: ansehen, und für Ersteller/Captain auch hinzufügen oder ersetzen */
function VisitPhoto({ visit, canEdit, crewId }: { visit: Visit; canEdit: boolean; crewId: string }) {
  const setPhoto = useSetVisitPhoto();
  if (!canEdit && !visit.photoUri) return null;
  const change = (photo: string | null) =>
    setPhoto.mutate({ visitId: visit.id, crewId, photo, previousPath: visit.photo_url });

  return (
    <Card>
      <AppText variant="heading">{t.photos.visitPhoto}</AppText>
      {canEdit ? (
        <PhotoField uri={visit.photoUri} onPick={change} onRemove={() => change(null)} />
      ) : (
        <Image
          source={{ uri: visit.photoUri ?? undefined }}
          style={styles.image}
          contentFit="cover"
          accessibilityLabel={t.photos.visitPhoto}
        />
      )}
      {setPhoto.isPending ? (
        <AppText variant="caption" tone="muted">
          {t.common.loading}
        </AppText>
      ) : null}
      {setPhoto.error ? <AppText tone="danger">{errorMessage(setPhoto.error)}</AppText> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.xs },
  image: { width: '100%', aspectRatio: 4 / 3, borderRadius: radius.sm },
});
