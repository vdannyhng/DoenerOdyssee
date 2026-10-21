import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { JollyRoger } from '@/components/art/JollyRoger';
import { AppText, Button, Screen, TextField } from '@/components/ui';
import { t } from '@/i18n/de';
import { errorMessage } from '@/lib/errors';
import { spacing } from '@/theme/tokens';

import { signIn, signUp } from './api';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const isSignUp = mode === 'sign-up';

  const submit = async () => {
    if (!EMAIL.test(email.trim())) return setError(t.errors.invalidEmail);
    if (password.length < 8) return setError(t.errors.weakPassword);
    setError(null);
    setBusy(true);
    try {
      await (isSignUp ? signUp : signIn)(email, password);
      // Weiterleitung übernimmt der Auth-Guard im Root-Layout
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen scroll edges={['top', 'bottom', 'left', 'right']} contentStyle={styles.content}>
      <View style={styles.hero}>
        <JollyRoger size={140} />
        <AppText variant="display" style={styles.center}>
          {isSignUp ? t.auth.signUpTitle : t.appName}
        </AppText>
        <AppText tone="muted" style={styles.center}>
          {isSignUp ? t.auth.welcome : t.auth.tagline}
        </AppText>
      </View>
      <TextField
        label={t.auth.email}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
      />
      <TextField
        label={t.auth.password}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete={isSignUp ? 'new-password' : 'current-password'}
        textContentType={isSignUp ? 'newPassword' : 'password'}
        hint={isSignUp ? t.auth.signUpHint : undefined}
        onSubmitEditing={submit}
      />
      {error ? (
        <AppText tone="danger" accessibilityRole="alert">
          {error}
        </AppText>
      ) : null}
      <Button
        title={isSignUp ? t.auth.signUp : t.auth.signIn}
        icon={isSignUp ? 'anchor' : 'login'}
        loading={busy}
        onPress={submit}
      />
      <Link href={isSignUp ? '/sign-in' : '/sign-up'} replace asChild>
        <Button title={isSignUp ? t.auth.toSignIn : t.auth.toSignUp} variant="ghost" />
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: 'center' },
  hero: { alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  center: { textAlign: 'center' },
});
