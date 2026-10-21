import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { JollyRoger } from '@/components/art/JollyRoger';
import { AppText, Button, Card, Chip, Screen, TextField } from '@/components/ui';
import { signOut } from '@/features/auth/api';
import { useCreateCrew, useJoinCrew } from '@/features/crew/api';
import { defaultProfile, ProfileFields } from '@/features/crew/ProfileFields';
import { t } from '@/i18n/de';
import { errorMessage } from '@/lib/errors';
import { spacing } from '@/theme/tokens';

export default function OnboardingScreen() {
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [crewName, setCrewName] = useState('');
  const [code, setCode] = useState('');
  const [profile, setProfile] = useState(defaultProfile);
  const [touched, setTouched] = useState(false);
  const createCrew = useCreateCrew();
  const joinCrew = useJoinCrew();
  const mutation = mode === 'create' ? createCrew : joinCrew;

  const missingName = !profile.displayName.trim();
  const missingCrew = mode === 'create' ? !crewName.trim() : code.trim().length < 6;

  const submit = () => {
    setTouched(true);
    if (missingName || missingCrew) return;
    // Nach Erfolg schaltet der Guard im Root-Layout automatisch zur App
    if (mode === 'create') createCrew.mutate({ ...profile, crewName });
    else joinCrew.mutate({ ...profile, code });
  };

  return (
    <Screen
      scroll
      edges={['top', 'bottom', 'left', 'right']}
      footer={
        <Button
          title={mode === 'create' ? t.onboarding.createSubmit : t.onboarding.joinSubmit}
          icon={mode === 'create' ? 'flag' : 'ferry'}
          variant="accent"
          loading={mutation.isPending}
          onPress={submit}
        />
      }
    >
      <View style={styles.hero}>
        <JollyRoger size={96} />
        <AppText variant="title">{t.onboarding.title}</AppText>
        <AppText tone="muted" style={styles.center}>
          {t.onboarding.intro}
        </AppText>
      </View>
      <View style={styles.row} accessibilityRole="radiogroup">
        <Chip label={t.onboarding.create} selected={mode === 'create'} onPress={() => setMode('create')} />
        <Chip label={t.onboarding.join} selected={mode === 'join'} onPress={() => setMode('join')} />
      </View>
      <Card>
        {mode === 'create' ? (
          <TextField
            label={t.onboarding.crewName}
            placeholder={t.onboarding.crewNamePlaceholder}
            value={crewName}
            onChangeText={setCrewName}
            maxLength={60}
            error={touched && missingCrew ? t.errors.required : null}
          />
        ) : (
          <TextField
            label={t.onboarding.inviteCode}
            placeholder={t.onboarding.inviteCodePlaceholder}
            value={code}
            onChangeText={(v) => setCode(v.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={6}
            error={touched && missingCrew ? t.errors.required : null}
          />
        )}
      </Card>
      <Card>
        <ProfileFields
          value={profile}
          onChange={setProfile}
          nameError={touched && missingName ? t.errors.required : null}
        />
      </Card>
      {mutation.error ? (
        <AppText tone="danger" accessibilityRole="alert">
          {errorMessage(mutation.error)}
        </AppText>
      ) : null}
      <Button title={t.auth.signOut} variant="ghost" onPress={() => void signOut()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: spacing.sm },
  center: { textAlign: 'center' },
  row: { flexDirection: 'row', gap: spacing.sm, justifyContent: 'center' },
});
