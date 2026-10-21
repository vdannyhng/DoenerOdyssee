import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { formatRating, parseRating } from '@/features/ranking/scoring';
import { t } from '@/i18n/de';
import { fonts, radius, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

import { AppText } from './AppText';

const clamp = (v: number) => Math.min(10, Math.max(0, Math.round(v * 10) / 10));

type Props = { value: number; onChange: (value: number) => void };

/**
 * Note 0–10 mit einer Nachkommastelle, mit einer Hand bedienbar:
 * Zahl direkt eintippen (z. B. „8,7“) oder ganze Zahl antippen und mit ±0.1 feinjustieren.
 */
export function ScoreInput({ value, onChange }: Props) {
  const { colors } = useTheme();
  const [text, setText] = useState(formatRating(value));
  const [focused, setFocused] = useState(false);
  const [invalid, setInvalid] = useState(false);

  // Während des Tippens nicht überschreiben, sonst springt der Cursor
  const shown = focused ? text : formatRating(value);

  const set = (next: number) => {
    const v = clamp(next);
    setInvalid(false);
    if (v === value) return;
    void Haptics.selectionAsync();
    if (v === 10) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onChange(v);
  };

  const onType = (raw: string) => {
    setText(raw);
    const parsed = parseRating(raw);
    setInvalid(raw.trim() !== '' && parsed === null);
    if (parsed !== null && parsed !== value) onChange(parsed);
  };

  const stepButton = (delta: number) => {
    const disabled = delta < 0 ? value <= 0 : value >= 10;
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={delta < 0 ? t.score.decrease : t.score.increase}
        onPress={() => set(value + delta)}
        disabled={disabled}
        hitSlop={6}
        style={({ pressed }) => [
          styles.step,
          { backgroundColor: colors.primary, opacity: disabled ? 0.4 : pressed ? 0.8 : 1 },
        ]}
      >
        <MaterialCommunityIcons name={delta < 0 ? 'minus' : 'plus'} size={30} color={colors.onPrimary} />
      </Pressable>
    );
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {stepButton(-0.1)}
        <View style={styles.valueBox}>
          <TextInput
            value={shown}
            onChangeText={onType}
            onFocus={() => {
              setText(formatRating(value));
              setFocused(true);
            }}
            onBlur={() => {
              setFocused(false);
              setInvalid(false);
            }}
            keyboardType="decimal-pad"
            returnKeyType="done"
            selectTextOnFocus
            maxLength={4}
            accessibilityLabel={t.score.label}
            accessibilityHint={t.score.typeHint}
            accessibilityValue={{ min: 0, max: 10, now: value, text: t.score.value(formatRating(value)) }}
            style={[
              styles.value,
              {
                color: colors.text,
                borderColor: invalid ? colors.danger : focused ? colors.focus : 'transparent',
                backgroundColor: focused ? colors.surface : 'transparent',
              },
            ]}
          />
          <AppText variant="caption" tone={invalid ? 'danger' : 'muted'}>
            {invalid ? t.score.invalid : t.score.typeHint}
          </AppText>
        </View>
        {stepButton(0.1)}
      </View>
      <View style={styles.grid}>
        {Array.from({ length: 11 }, (_, n) => {
          const selected = Math.floor(value) === n;
          return (
            <Pressable
              key={n}
              accessibilityRole="button"
              accessibilityLabel={t.score.value(String(n))}
              accessibilityState={{ selected }}
              onPress={() => set(n)}
              style={({ pressed }) => [
                styles.quick,
                {
                  backgroundColor: selected ? colors.accent : colors.surface,
                  borderColor: selected ? colors.accent : colors.border,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <AppText variant="bodyStrong" tone={selected ? 'onAccent' : 'default'}>
                {n}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  step: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  valueBox: { alignItems: 'center', flex: 1, gap: 2 },
  value: {
    fontFamily: fonts.display,
    fontSize: 60,
    lineHeight: 70,
    width: 150,
    maxWidth: '100%',
    textAlign: 'center',
    borderWidth: 2,
    borderRadius: radius.md,
    paddingVertical: 0,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center' },
  quick: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
