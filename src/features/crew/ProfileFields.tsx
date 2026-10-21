import { Pressable, StyleSheet, View } from 'react-native';

import { AVATAR_IDS, PirateAvatar } from '@/components/art/PirateAvatar';
import { AppText, TextField } from '@/components/ui';
import { t } from '@/i18n/de';
import { memberColors, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

export type ProfileValue = { displayName: string; avatar: string; color: string };

export const defaultProfile = (): ProfileValue => ({
  displayName: '',
  avatar: AVATAR_IDS[Math.floor(Math.random() * AVATAR_IDS.length)] ?? 'buccaneer',
  color: memberColors[Math.floor(Math.random() * memberColors.length)] ?? memberColors[0],
});

type Props = { value: ProfileValue; onChange: (value: ProfileValue) => void; nameError?: string | null };

/** Piratenname, Avatar und Lieblingsfarbe */
export function ProfileFields({ value, onChange, nameError }: Props) {
  const { colors } = useTheme();
  return (
    <View style={styles.wrap}>
      <TextField
        label={t.onboarding.yourName}
        placeholder={t.onboarding.yourNamePlaceholder}
        value={value.displayName}
        onChangeText={(displayName) => onChange({ ...value, displayName })}
        maxLength={30}
        error={nameError}
      />
      <View style={styles.section}>
        <AppText variant="label">{t.onboarding.avatar}</AppText>
        <View style={styles.grid}>
          {AVATAR_IDS.map((id) => {
            const selected = value.avatar === id;
            return (
              <Pressable
                key={id}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={t.avatars[id]}
                onPress={() => onChange({ ...value, avatar: id })}
                style={[styles.avatarSlot, { borderColor: selected ? colors.accent : 'transparent' }]}
              >
                <PirateAvatar avatar={id} color={value.color} size={56} label={t.avatars[id]} />
              </Pressable>
            );
          })}
        </View>
      </View>
      <View style={styles.section}>
        <AppText variant="label">{t.onboarding.color}</AppText>
        <View style={styles.grid}>
          {memberColors.map((c) => {
            const selected = value.color === c;
            return (
              <Pressable
                key={c}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={`${t.onboarding.color} ${c}`}
                onPress={() => onChange({ ...value, color: c })}
                style={[
                  styles.swatch,
                  { backgroundColor: c, borderColor: selected ? colors.text : colors.border },
                  selected && styles.swatchSelected,
                ]}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  section: { gap: spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  avatarSlot: { borderWidth: 3, borderRadius: 34, padding: 2 },
  swatch: { width: 44, height: 44, borderRadius: 22, borderWidth: 2 },
  swatchSelected: { borderWidth: 4 },
});
