import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { t } from '@/i18n/de';
import { errorMessage } from '@/lib/errors';
import { poster, radius, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

import { pickPhoto, type PhotoSource } from './photos';

type Props = {
  /** Anzuzeigendes Bild (lokal gewählt oder bereits hochgeladen) */
  uri: string | null;
  onPick: (localUri: string) => void;
  onRemove: () => void;
  label?: string;
  compact?: boolean;
};

/** Foto aufnehmen oder aus der Galerie wählen, mit Vorschau im Polaroid-Look */
export function PhotoField({ uri, onPick, onRemove, label = t.photos.add, compact = false }: Props) {
  const { colors } = useTheme();
  const [error, setError] = useState<string | null>(null);
  // Im Browser gibt es keine Kamera-API über den Picker – dort nur die Dateiauswahl
  const sources: PhotoSource[] = Platform.OS === 'web' ? ['library'] : ['camera', 'library'];

  const pick = async (source: PhotoSource) => {
    setError(null);
    try {
      const result = await pickPhoto(source);
      if (result === 'denied') setError(t.photos.denied);
      else if (result) onPick(result);
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  if (uri) {
    return (
      <View style={styles.previewWrap}>
        <View style={[styles.polaroid, compact && styles.polaroidCompact]}>
          <Image
            source={{ uri }}
            style={styles.image}
            contentFit="cover"
            accessibilityLabel={t.photos.preview}
          />
        </View>
        <View style={styles.previewActions}>
          {sources.map((s) => (
            <Pressable
              key={s}
              accessibilityRole="button"
              accessibilityLabel={s === 'camera' ? t.photos.retake : t.photos.replace}
              onPress={() => void pick(s)}
              style={[styles.iconButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
            >
              <MaterialCommunityIcons
                name={s === 'camera' ? 'camera-retake' : 'image-edit'}
                size={22}
                color={colors.primary}
              />
            </Pressable>
          ))}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t.photos.remove}
            onPress={onRemove}
            style={[styles.iconButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
          >
            <MaterialCommunityIcons name="trash-can-outline" size={22} color={colors.danger} />
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {sources.map((s) => (
          <Pressable
            key={s}
            accessibilityRole="button"
            accessibilityLabel={s === 'camera' ? t.photos.camera : t.photos.library}
            onPress={() => void pick(s)}
            style={({ pressed }) => [
              styles.slot,
              { borderColor: colors.border, backgroundColor: pressed ? colors.surfaceMuted : colors.surface },
            ]}
          >
            <MaterialCommunityIcons
              name={s === 'camera' ? 'camera-outline' : 'image-multiple-outline'}
              size={26}
              color={colors.primary}
            />
            <AppText variant="label" tone="primary">
              {s === 'camera' ? t.photos.camera : sources.length === 1 ? label : t.photos.library}
            </AppText>
          </Pressable>
        ))}
      </View>
      {error ? (
        <AppText variant="caption" tone="danger">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  row: { flexDirection: 'row', gap: spacing.sm },
  slot: {
    flex: 1,
    minHeight: 64,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    padding: spacing.sm,
  },
  previewWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  polaroid: {
    width: 150,
    padding: 6,
    paddingBottom: 18,
    backgroundColor: '#FFFDF6',
    borderWidth: 1,
    borderColor: poster.paperEdge,
    transform: [{ rotate: '-2deg' }],
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 1, height: 3 },
    elevation: 3,
  },
  polaroidCompact: { width: 110 },
  image: { width: '100%', aspectRatio: 1 },
  previewActions: { gap: spacing.sm },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
