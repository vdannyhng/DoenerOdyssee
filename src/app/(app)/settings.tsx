import { useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import { AppText, Button, Card, Chip, LoadingState, Screen, TextField } from '@/components/ui';
import { signOut } from '@/features/auth/api';
import {
  useCrew,
  useMyMember,
  useUpdateCrew,
  useUpdateProfile,
  type Crew,
  type Member,
} from '@/features/crew/api';
import { ProfileFields } from '@/features/crew/ProfileFields';
import { validThresholds } from '@/features/crew/settings';
import type { TierThresholds } from '@/features/ranking/scoring';
import { useDeviceSettings, type ThemePreference } from '@/features/settings/store';
import { t } from '@/i18n/de';
import { errorMessage } from '@/lib/errors';
import { spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

const CURRENCIES = ['EUR', 'CHF', 'USD', 'GBP', 'TRY'];
const THEMES: ThemePreference[] = ['system', 'light', 'dark'];
const TIER_INPUTS = ['S', 'A', 'B', 'C', 'D'] as const;

export default function SettingsScreen() {
  const crew = useCrew();
  const me = useMyMember();
  if (!crew.data || !me.data) return <LoadingState />;
  return (
    <Screen scroll>
      <ProfileSection member={me.data} />
      <CrewSection crew={crew.data} isCaptain={me.data.role === 'captain'} />
      <DeviceSection />
      <Button title={t.auth.signOut} icon="logout" variant="danger" onPress={() => void signOut()} />
    </Screen>
  );
}

function SavedHint({ visible }: { visible: boolean }) {
  return visible ? (
    <AppText variant="caption" tone="success" accessibilityLiveRegion="polite">
      {t.settings.saved}
    </AppText>
  ) : null;
}

function ProfileSection({ member }: { member: Member }) {
  const update = useUpdateProfile();
  const [profile, setProfile] = useState({
    displayName: member.display_name,
    avatar: member.avatar,
    color: member.color,
  });
  const missing = !profile.displayName.trim();

  return (
    <Card>
      <AppText variant="heading">{t.settings.profile}</AppText>
      <ProfileFields value={profile} onChange={setProfile} nameError={missing ? t.errors.required : null} />
      {update.error ? <AppText tone="danger">{errorMessage(update.error)}</AppText> : null}
      <SavedHint visible={update.isSuccess} />
      <Button
        title={t.common.save}
        disabled={missing}
        loading={update.isPending}
        onPress={() => update.mutate({ memberId: member.id, ...profile })}
      />
    </Card>
  );
}

function CrewSection({ crew, isCaptain }: { crew: Crew; isCaptain: boolean }) {
  const update = useUpdateCrew();
  const [name, setName] = useState(crew.name);
  const [currency, setCurrency] = useState(crew.settings.currency);
  const [minRaters, setMinRaters] = useState(crew.settings.minRaters);
  const [thresholds, setThresholds] = useState<Record<keyof TierThresholds, string>>(
    () =>
      Object.fromEntries(TIER_INPUTS.map((k) => [k, String(crew.settings.tierThresholds[k])])) as Record<
        keyof TierThresholds,
        string
      >,
  );

  const parsed = Object.fromEntries(
    TIER_INPUTS.map((k) => [k, Number(thresholds[k].replace(',', '.'))]),
  ) as TierThresholds;
  const thresholdsOk =
    TIER_INPUTS.every((k) => Number.isFinite(parsed[k]) && parsed[k] >= 0 && parsed[k] <= 10) &&
    validThresholds(parsed);

  const save = () =>
    update.mutate({ id: crew.id, name, settings: { currency, minRaters, tierThresholds: parsed } });

  return (
    <Card>
      <AppText variant="heading">{t.settings.crewSettings}</AppText>
      {!isCaptain ? (
        <AppText variant="caption" tone="muted">
          {t.settings.crewSettingsCaptainOnly}
        </AppText>
      ) : null}
      <View
        pointerEvents={isCaptain ? 'auto' : 'none'}
        style={[styles.section, !isCaptain && styles.readOnly]}
      >
        <TextField
          label={t.settings.crewName}
          value={name}
          onChangeText={setName}
          maxLength={60}
          editable={isCaptain}
        />
        <AppText variant="label">{t.settings.currency}</AppText>
        <View style={styles.wrap}>
          {CURRENCIES.map((c) => (
            <Chip key={c} label={c} selected={currency === c} onPress={() => setCurrency(c)} />
          ))}
        </View>
        <AppText variant="label">{t.settings.minRaters}</AppText>
        <View style={styles.wrap}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Chip key={n} label={String(n)} selected={minRaters === n} onPress={() => setMinRaters(n)} />
          ))}
        </View>
        <AppText variant="label">{t.settings.tierThresholds}</AppText>
        <View style={styles.wrap}>
          {TIER_INPUTS.map((k) => (
            <View key={k} style={styles.threshold}>
              <TextField
                label={`${k} · ${t.tiers.names[k]}`}
                value={thresholds[k]}
                onChangeText={(v) => setThresholds((prev) => ({ ...prev, [k]: v }))}
                keyboardType="decimal-pad"
                editable={isCaptain}
              />
            </View>
          ))}
        </View>
        {!thresholdsOk ? (
          <AppText variant="caption" tone="danger">
            {t.settings.invalidThresholds}
          </AppText>
        ) : null}
      </View>
      {update.error ? <AppText tone="danger">{errorMessage(update.error)}</AppText> : null}
      <SavedHint visible={update.isSuccess} />
      {isCaptain ? (
        <Button
          title={t.common.save}
          disabled={!thresholdsOk || !name.trim()}
          loading={update.isPending}
          onPress={save}
        />
      ) : null}
    </Card>
  );
}

function DeviceSection() {
  const { colors } = useTheme();
  const { theme, setTheme, reduceMotion, setReduceMotion } = useDeviceSettings();
  return (
    <Card>
      <AppText variant="heading">{t.settings.device}</AppText>
      <AppText variant="label">{t.settings.theme}</AppText>
      <View style={styles.wrap}>
        {THEMES.map((th) => (
          <Chip key={th} label={t.settings.themes[th]} selected={theme === th} onPress={() => setTheme(th)} />
        ))}
      </View>
      <View style={styles.switchRow}>
        <AppText style={styles.flex}>{t.settings.reduceMotion}</AppText>
        <Switch
          accessibilityLabel={t.settings.reduceMotion}
          value={reduceMotion}
          onValueChange={setReduceMotion}
          trackColor={{ true: colors.primary, false: colors.border }}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.sm },
  readOnly: { opacity: 0.7 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  threshold: { width: 120 },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minHeight: 48 },
  flex: { flex: 1 },
});
