import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ActivityIndicator, Platform, Pressable, StyleSheet, View } from 'react-native';

import { AppText, Button, Card, Screen, TextField } from '@/components/ui';
import { useCrew } from '@/features/crew/api';
import { useLogbook, useSaveSpot, type PhotoChange, type Spot } from '@/features/logbook/api';
import { PhotoField } from '@/features/photos/PhotoField';
import { useLocationPick } from '@/features/seachart/pickStore';
import { t } from '@/i18n/de';
import { confirm } from '@/lib/confirm';
import { errorMessage } from '@/lib/errors';
import { radius, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

import { findDuplicates } from './duplicates';
import { currentPlace, searchAddress, type Place } from './geocoding';

function parsePrice(raw: string): number | null | 'invalid' {
  const v = raw.trim().replace(',', '.');
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 && n < 10000 ? Math.round(n * 100) / 100 : 'invalid';
}

type Props = {
  spot?: Spot;
  initialName?: string;
  /** Aus dem Logbuch geöffnet: statt zur Detailseite zurück ins Logbuch */
  onCreated?: (spotId: string) => void;
};

export function SpotForm({ spot, initialName, onCreated }: Props) {
  const { colors } = useTheme();
  const crew = useCrew();
  const logbook = useLogbook();
  const save = useSaveSpot();

  const [name, setName] = useState(spot?.name ?? initialName ?? '');
  const [photo, setPhoto] = useState<PhotoChange>(undefined);
  const [price, setPrice] = useState(spot?.price != null ? String(spot.price) : '');
  const [note, setNote] = useState(spot?.note ?? '');
  const [place, setPlace] = useState<Place | null>(
    spot ? { lat: spot.lat, lng: spot.lng, address: spot.address } : null,
  );
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Place[] | null>(null);
  const [locating, setLocating] = useState<'search' | 'gps' | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const { picked, setPicked } = useLocationPick();

  // Zurück vom Karten-Picker: gewählten Ort übernehmen
  useFocusEffect(
    useCallback(() => {
      if (picked) {
        setPlace(picked);
        setResults(null);
        setPicked(null);
      }
    }, [picked, setPicked]),
  );

  const currency = crew.data?.settings.currency ?? 'EUR';
  const parsedPrice = parsePrice(price);

  const runSearch = async () => {
    if (!query.trim()) return;
    setLocating('search');
    setLocationError(null);
    try {
      const found = await searchAddress(query);
      setResults(found);
      if (!found.length) setLocationError(t.spots.locationNoResults);
    } catch (e) {
      setLocationError(errorMessage(e));
    } finally {
      setLocating(null);
    }
  };

  const locateMe = async () => {
    setLocating('gps');
    setLocationError(null);
    try {
      const result = await currentPlace();
      if (result === 'denied') setLocationError(t.spots.locationDenied);
      else {
        setPlace(result);
        setResults(null);
      }
    } catch (e) {
      setLocationError(errorMessage(e));
    } finally {
      setLocating(null);
    }
  };

  const submit = async () => {
    setTouched(true);
    if (!name.trim() || !place || parsedPrice === 'invalid' || !crew.data) return;

    const dupes = findDuplicates({ name, location: place }, logbook.data?.spots ?? [], spot?.id);
    if (dupes.length) {
      const ok = await confirm(
        t.spots.duplicateTitle,
        t.spots.duplicateBody(dupes.map((d) => d.name).join(', ')),
        t.spots.duplicateConfirm,
      );
      if (!ok) return;
    }

    save.mutate(
      {
        id: spot?.id,
        crewId: crew.data.id,
        photo,
        previousPhotoPath: spot?.photo_url,
        input: {
          name,
          address: place.address,
          lat: place.lat,
          lng: place.lng,
          price: parsedPrice,
          note: note || null,
        },
      },
      {
        onSuccess: (saved) => {
          if (spot) router.back();
          else if (onCreated) onCreated(saved.id);
          else router.replace(`/spots/${saved.id}`);
        },
      },
    );
  };

  return (
    <Screen
      scroll
      footer={
        <Button
          title={t.common.save}
          icon="flag-checkered"
          loading={save.isPending}
          onPress={() => void submit()}
        />
      }
    >
      <TextField
        label={t.spots.name}
        placeholder={t.spots.namePlaceholder}
        value={name}
        onChangeText={setName}
        maxLength={80}
        error={touched && !name.trim() ? t.errors.required : null}
      />

      <Card>
        <AppText variant="label">{t.spots.location}</AppText>
        {place ? (
          <View style={styles.picked}>
            <MaterialCommunityIcons name="map-marker-check" size={28} color={colors.success} />
            <View style={styles.flex}>
              <AppText variant="bodyStrong">
                {place.address || `${place.lat.toFixed(5)}, ${place.lng.toFixed(5)}`}
              </AppText>
              <AppText variant="caption" tone="muted">
                {t.spots.locationPicked}
              </AppText>
            </View>
            <Button title={t.spots.locationChange} variant="ghost" compact onPress={() => setPlace(null)} />
          </View>
        ) : (
          <>
            <View style={styles.searchRow}>
              <View style={styles.flex}>
                <TextField
                  label={t.spots.locationSearch}
                  placeholder={t.spots.locationSearchPlaceholder}
                  value={query}
                  onChangeText={setQuery}
                  onSubmitEditing={() => void runSearch()}
                  returnKeyType="search"
                />
              </View>
              <View style={styles.searchButton}>
                <Button
                  title={t.spots.locationSearchButton}
                  compact
                  loading={locating === 'search'}
                  onPress={() => void runSearch()}
                />
              </View>
            </View>
            {results?.map((r) => (
              <Pressable
                key={`${r.lat},${r.lng}`}
                accessibilityRole="button"
                onPress={() => {
                  setPlace(r);
                  setResults(null);
                }}
                style={({ pressed }) => [
                  styles.result,
                  {
                    borderColor: colors.border,
                    backgroundColor: pressed ? colors.surfaceMuted : colors.background,
                  },
                ]}
              >
                <MaterialCommunityIcons name="map-marker" size={20} color={colors.accent} />
                <AppText style={styles.flex}>{r.address}</AppText>
              </Pressable>
            ))}
            <Button
              title={t.spots.locationCurrent}
              icon="crosshairs-gps"
              variant="secondary"
              loading={locating === 'gps'}
              onPress={() => void locateMe()}
            />
            {Platform.OS !== 'web' ? (
              <Button
                title={t.chart.pickOnMap}
                icon="map-marker-plus"
                variant="secondary"
                onPress={() =>
                  router.push({
                    pathname: '/spots/pick-location',
                    params: spot ? { lat: String(spot.lat), lng: String(spot.lng) } : {},
                  })
                }
              />
            ) : null}
            {locating === 'gps' ? <ActivityIndicator color={colors.primary} /> : null}
          </>
        )}
        {locationError ? (
          <AppText variant="caption" tone="danger">
            {locationError}
          </AppText>
        ) : touched && !place ? (
          <AppText variant="caption" tone="danger">
            {t.spots.locationRequired}
          </AppText>
        ) : null}
      </Card>

      <Card>
        <AppText variant="label">
          {t.photos.spotPhoto} ({t.common.optional})
        </AppText>
        <PhotoField
          uri={photo === undefined ? (spot?.photoUri ?? null) : photo}
          onPick={setPhoto}
          onRemove={() => setPhoto(null)}
          compact
        />
      </Card>

      <TextField
        label={`${t.spots.price} (${currency}, ${t.common.optional})`}
        placeholder="7.50"
        value={price}
        onChangeText={setPrice}
        keyboardType="decimal-pad"
        error={touched && parsedPrice === 'invalid' ? t.errors.invalidPrice : null}
      />
      <TextField
        label={`${t.spots.note} (${t.common.optional})`}
        placeholder={t.spots.notePlaceholder}
        value={note}
        onChangeText={setNote}
        multiline
        maxLength={500}
      />
      {save.error ? (
        <AppText tone="danger" accessibilityRole="alert">
          {errorMessage(save.error)}
        </AppText>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  picked: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  searchRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  searchButton: { paddingBottom: 4 },
  result: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    minHeight: 48,
    borderWidth: 1,
    borderRadius: radius.md,
  },
});
