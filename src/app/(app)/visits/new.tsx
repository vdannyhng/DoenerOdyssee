import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { PirateAvatar } from '@/components/art/PirateAvatar';
import { AppText, Button, Card, Chip, LoadingState, ScoreInput, Screen, TextField } from '@/components/ui';
import { useCrew, useMembers, useMyMember } from '@/features/crew/api';
import { MEAL_TYPES, useCreateVisit, useLogbook, type MealType, type Spot } from '@/features/logbook/api';
import { useLogDraft } from '@/features/logbook/draft';
import { PhotoField } from '@/features/photos/PhotoField';
import type { GeoPoint } from '@/features/spots/duplicates';
import { currentPoint } from '@/features/spots/geocoding';
import { AUTO_SELECT_METERS, formatDistance, withDistance } from '@/features/spots/nearby';
import { t } from '@/i18n/de';
import { formatIsoDate, shiftIsoDate, todayIso } from '@/lib/dates';
import { errorMessage } from '@/lib/errors';
import { radius, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

const SUGGESTIONS = 5;

/**
 * Schnell-Eintrag ins Logbuch: Laden (per Standort vorgeschlagen oder neu angelegt) → Note → fertig.
 * Foto, Mitesser und Details sind optional und stehen nicht im Weg.
 */
export default function QuickLogScreen() {
  const params = useLocalSearchParams<{ spotId?: string }>();
  const { colors } = useTheme();
  const logbook = useLogbook();
  const members = useMembers();
  const me = useMyMember();
  const crew = useCrew();
  const createVisit = useCreateVisit();
  const { createdSpotId, setCreatedSpotId } = useLogDraft();

  const myId = me.data?.id ?? null;
  const [spotId, setSpotId] = useState<string | null>(params.spotId ?? null);
  const [query, setQuery] = useState('');
  const [autoPick, setAutoPick] = useState(!params.spotId);
  const [position, setPosition] = useState<GeoPoint | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);
  const [score, setScore] = useState(7);
  const [photo, setPhoto] = useState<string | null>(null);
  const [participants, setParticipants] = useState<string[]>(myId ? [myId] : []);
  const [showDetails, setShowDetails] = useState(false);
  const [date, setDate] = useState(todayIso);
  const [meal, setMeal] = useState<MealType | null>(null);
  const [comment, setComment] = useState('');

  // Zurück aus „Neue Insel“: frisch angelegten Laden übernehmen
  useFocusEffect(
    useCallback(() => {
      if (createdSpotId) {
        setSpotId(createdSpotId);
        setQuery('');
        setCreatedSpotId(null);
      }
    }, [createdSpotId, setCreatedSpotId]),
  );

  // Bereits erteilte Standortfreigabe still nutzen – gefragt wird nur auf Knopfdruck
  useEffect(() => {
    if (params.spotId) return;
    currentPoint({ ask: false })
      .then((p) => {
        if (p && p !== 'denied') setPosition(p);
      })
      .catch(() => undefined);
  }, [params.spotId]);

  const spots = useMemo(() => logbook.data?.spots ?? [], [logbook.data]);
  const ranked = useMemo(() => withDistance(spots, position), [spots, position]);

  // Steht man praktisch vor einem bekannten Laden, ist er gleich ausgewählt (bis man „Ändern“ tippt)
  const nearest = ranked[0];
  const autoSpotId =
    autoPick && nearest?.meters != null && nearest.meters < AUTO_SELECT_METERS ? nearest.spot.id : null;
  const chosenSpotId = spotId ?? autoSpotId;

  const lastVisit = useMemo(() => {
    const map = new Map<string, string>();
    for (const v of logbook.data?.visits ?? []) if (!map.has(v.spot_id)) map.set(v.spot_id, v.visited_on);
    return map;
  }, [logbook.data]);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q) {
      return ranked.filter(
        (r) => r.spot.name.toLowerCase().includes(q) || r.spot.address.toLowerCase().includes(q),
      );
    }
    if (position) return ranked.slice(0, SUGGESTIONS);
    // Ohne Standort: zuletzt besuchte zuerst
    return [...ranked]
      .sort((a, b) => (lastVisit.get(b.spot.id) ?? '').localeCompare(lastVisit.get(a.spot.id) ?? ''))
      .slice(0, SUGGESTIONS);
  }, [ranked, query, position, lastVisit]);

  if (logbook.isLoading || members.isLoading) return <LoadingState />;

  const exactMatch = spots.some((s) => s.name.trim().toLowerCase() === query.trim().toLowerCase());
  const selected = spots.find((s) => s.id === chosenSpotId);

  const locate = async () => {
    setLocating(true);
    try {
      const p = await currentPoint({ ask: true });
      if (p === 'denied') setLocationDenied(true);
      else if (p) setPosition(p);
    } catch {
      setLocationDenied(true);
    } finally {
      setLocating(false);
    }
  };

  const toggle = (id: string) =>
    setParticipants((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));

  const submit = () => {
    if (!chosenSpotId || !crew.data) return;
    createVisit.mutate(
      {
        crewId: crew.data.id,
        spotId: chosenSpotId,
        visitedOn: date,
        mealType: meal,
        participantIds: participants,
        myRating: { score, comment: comment || null },
        photoUri: photo,
      },
      {
        onSuccess: () => {
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          if (params.spotId) router.back();
          else router.replace(`/spots/${chosenSpotId}`);
        },
      },
    );
  };

  const spotRow = (spot: Spot, meters: number | null) => (
    <Pressable
      key={spot.id}
      accessibilityRole="button"
      accessibilityLabel={`${spot.name}${meters != null ? `, ${formatDistance(meters)}` : ''}`}
      onPress={() => {
        setSpotId(spot.id);
        setQuery('');
      }}
      style={({ pressed }) => [
        styles.spotRow,
        { borderColor: colors.border, backgroundColor: pressed ? colors.surfaceMuted : colors.background },
      ]}
    >
      <MaterialCommunityIcons name="island" size={22} color={colors.primary} />
      <View style={styles.flex}>
        <AppText variant="bodyStrong" numberOfLines={1}>
          {spot.name}
        </AppText>
        {spot.address ? (
          <AppText variant="caption" tone="muted" numberOfLines={1}>
            {spot.address}
          </AppText>
        ) : null}
      </View>
      {meters != null ? (
        <AppText variant="caption" tone="muted">
          {formatDistance(meters)}
        </AppText>
      ) : null}
    </Pressable>
  );

  return (
    <Screen
      scroll
      footer={
        <Button
          title={selected ? t.visits.save : t.log.pickSpotFirst}
          icon="feather"
          variant="accent"
          disabled={!selected}
          loading={createVisit.isPending}
          onPress={submit}
        />
      }
    >
      {/* 1. Wo? */}
      {selected ? (
        <View style={[styles.selected, { backgroundColor: colors.surface, borderColor: colors.goldBright }]}>
          <MaterialCommunityIcons name="map-marker-check" size={28} color={colors.success} />
          <View style={styles.flex}>
            <AppText variant="caption" tone="muted">
              {t.log.where}
            </AppText>
            <AppText variant="heading" numberOfLines={1}>
              {selected.name}
            </AppText>
          </View>
          {!params.spotId ? (
            <Button
              title={t.spots.locationChange}
              variant="ghost"
              compact
              onPress={() => {
                setSpotId(null);
                setAutoPick(false);
              }}
            />
          ) : null}
        </View>
      ) : (
        <Card>
          <AppText variant="heading">{t.log.where}</AppText>
          <TextField
            label={t.log.searchLabel}
            placeholder={t.log.searchPlaceholder}
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
          />
          {!position && !query ? (
            <Button
              title={t.log.nearby}
              icon="crosshairs-gps"
              variant="secondary"
              compact
              loading={locating}
              onPress={() => void locate()}
            />
          ) : null}
          {locationDenied ? (
            <AppText variant="caption" tone="muted">
              {t.spots.locationDenied}
            </AppText>
          ) : null}
          {suggestions.length ? (
            <AppText variant="caption" tone="muted">
              {query ? t.log.results : position ? t.log.closest : t.log.recent}
            </AppText>
          ) : null}
          {suggestions.map((s) => spotRow(s.spot, s.meters))}
          {query.trim() && !exactMatch ? (
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                router.push({ pathname: '/spots/new', params: { name: query.trim(), from: 'log' } })
              }
              style={({ pressed }) => [
                styles.spotRow,
                styles.newRow,
                {
                  borderColor: colors.accent,
                  backgroundColor: pressed ? colors.surfaceMuted : colors.background,
                },
              ]}
            >
              <MaterialCommunityIcons name="plus-circle" size={22} color={colors.accent} />
              <AppText variant="bodyStrong" tone="accent" style={styles.flex}>
                {t.log.createSpot(query.trim())}
              </AppText>
            </Pressable>
          ) : null}
          {!spots.length && !query ? <AppText tone="muted">{t.log.noSpotsYet}</AppText> : null}
        </Card>
      )}

      {/* 2. Wie war's? */}
      <Card>
        <AppText variant="heading">{t.visits.yourScore}</AppText>
        <ScoreInput value={score} onChange={setScore} />
      </Card>

      {/* 3. Foto */}
      <Card>
        <AppText variant="heading">{t.photos.visitPhoto}</AppText>
        <PhotoField uri={photo} onPick={setPhoto} onRemove={() => setPhoto(null)} />
      </Card>

      {/* 4. Wer war dabei? */}
      <Card>
        <AppText variant="heading">{t.visits.participants}</AppText>
        <View style={styles.crew}>
          {(members.data ?? []).map((m) => {
            const on = participants.includes(m.id);
            return (
              <Pressable
                key={m.id}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on }}
                accessibilityLabel={m.display_name}
                onPress={() => toggle(m.id)}
                style={[styles.mate, { opacity: on ? 1 : 0.45 }]}
              >
                <View style={[styles.mateRing, { borderColor: on ? colors.accent : 'transparent' }]}>
                  <PirateAvatar avatar={m.avatar} color={m.color} size={52} />
                </View>
                {on ? (
                  <View style={[styles.check, { backgroundColor: colors.accent }]}>
                    <MaterialCommunityIcons name="check-bold" size={12} color={colors.onAccent} />
                  </View>
                ) : null}
                <AppText variant="caption" numberOfLines={1} style={styles.center}>
                  {m.id === myId ? t.common.you : m.display_name.split(' ')[0]}
                </AppText>
              </Pressable>
            );
          })}
        </View>
        <AppText variant="caption" tone="muted">
          {t.visits.participantsHint}
        </AppText>
      </Card>

      {/* 5. Details (eingeklappt) */}
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: showDetails }}
        onPress={() => setShowDetails(!showDetails)}
        style={styles.detailsToggle}
      >
        <AppText variant="bodyStrong" tone="primary" style={styles.flex}>
          {t.log.details}
          {!showDetails ? ` · ${formatIsoDate(date)}${meal ? ` · ${t.visits.meals[meal]}` : ''}` : ''}
        </AppText>
        <MaterialCommunityIcons
          name={showDetails ? 'chevron-up' : 'chevron-down'}
          size={24}
          color={colors.primary}
        />
      </Pressable>
      {showDetails ? (
        <Card>
          <AppText variant="label">{t.visits.date}</AppText>
          <View style={styles.row}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t.visits.dayEarlier}
              onPress={() => setDate((d) => shiftIsoDate(d, -1))}
              style={styles.dayButton}
            >
              <MaterialCommunityIcons name="chevron-left" size={32} color={colors.primary} />
            </Pressable>
            <AppText variant="heading" style={[styles.flex, styles.center]}>
              {formatIsoDate(date)}
            </AppText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t.visits.dayLater}
              disabled={date === todayIso()}
              onPress={() => setDate((d) => shiftIsoDate(d, 1))}
              style={[styles.dayButton, date === todayIso() && styles.disabled]}
            >
              <MaterialCommunityIcons name="chevron-right" size={32} color={colors.primary} />
            </Pressable>
          </View>
          <AppText variant="label">{t.visits.meal}</AppText>
          <View style={styles.wrap}>
            {MEAL_TYPES.map((m) => (
              <Chip
                key={m}
                label={t.visits.meals[m]}
                selected={meal === m}
                onPress={() => setMeal(meal === m ? null : m)}
              />
            ))}
          </View>
          <TextField
            label={t.visits.comment}
            placeholder={t.visits.commentPlaceholder}
            value={comment}
            onChangeText={setComment}
            maxLength={280}
          />
        </Card>
      ) : null}

      {createVisit.error ? (
        <AppText tone="danger" accessibilityRole="alert">
          {errorMessage(createVisit.error)}
        </AppText>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  selected: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 2,
  },
  spotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 56,
    paddingHorizontal: spacing.sm,
    borderWidth: 1.5,
    borderRadius: radius.md,
  },
  newRow: { borderStyle: 'dashed' },
  crew: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  mate: { alignItems: 'center', width: 64 },
  mateRing: { borderWidth: 3, borderRadius: 32, padding: 2 },
  check: {
    position: 'absolute',
    top: 0,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsToggle: { flexDirection: 'row', alignItems: 'center', minHeight: 48, paddingHorizontal: spacing.xs },
  dayButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.3 },
});
