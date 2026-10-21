import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { JollyRoger } from '@/components/art/JollyRoger';
import { PirateAvatar } from '@/components/art/PirateAvatar';
import { AppText, Button, Card, ErrorState, LoadingState } from '@/components/ui';
import {
  useCrew,
  useMembers,
  useMyMember,
  useRegenerateInviteCode,
  useRemoveMember,
} from '@/features/crew/api';
import { useLogbook } from '@/features/logbook/api';
import { t } from '@/i18n/de';
import { confirm } from '@/lib/confirm';
import { errorMessage } from '@/lib/errors';
import { fonts, radius, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

export default function CrewScreen() {
  const { colors } = useTheme();
  const crew = useCrew();
  const members = useMembers();
  const me = useMyMember();
  const logbook = useLogbook();
  const regenerate = useRegenerateInviteCode();
  const remove = useRemoveMember();
  const [copied, setCopied] = useState(false);

  if (crew.isLoading || members.isLoading) return <LoadingState />;
  if (!crew.data)
    return <ErrorState message={errorMessage(crew.error)} onRetry={() => void crew.refetch()} />;

  const isCaptain = me.data?.role === 'captain';
  const code = crew.data.invite_code;

  const copy = async () => {
    await Clipboard.setStringAsync(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renew = async () => {
    if (await confirm(t.crew.regenerate, t.crew.regenerateConfirm, t.crew.regenerate)) regenerate.mutate();
  };

  const kick = async (id: string, name: string) => {
    if (await confirm(t.crew.remove, t.crew.removeConfirm(name), t.crew.remove, { destructive: true })) {
      remove.mutate(id);
    }
  };

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <JollyRoger size={120} />
        <AppText variant="display" style={styles.center}>
          {crew.data.name}
        </AppText>
        <AppText tone="muted">
          {t.crew.stats(logbook.data?.spots.length ?? 0, logbook.data?.visits.length ?? 0)}
        </AppText>
      </View>

      <Card>
        <AppText variant="heading">{t.crew.inviteCode}</AppText>
        <AppText tone="muted">{t.crew.inviteHint}</AppText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${t.crew.inviteCode} ${code.split('').join(' ')}, ${t.crew.copy}`}
          onPress={() => void copy()}
          style={[styles.code, { borderColor: colors.goldBright, backgroundColor: colors.surfaceMuted }]}
        >
          <AppText style={[styles.codeText, { color: colors.text }]} selectable>
            {code}
          </AppText>
          <MaterialCommunityIcons name={copied ? 'check' : 'content-copy'} size={24} color={colors.primary} />
        </Pressable>
        {copied ? (
          <AppText variant="caption" tone="success" accessibilityLiveRegion="polite">
            {t.crew.copied}
          </AppText>
        ) : null}
        {isCaptain ? (
          <Button
            title={t.crew.regenerate}
            icon="refresh"
            variant="secondary"
            loading={regenerate.isPending}
            onPress={() => void renew()}
          />
        ) : null}
      </Card>

      <Card>
        <AppText variant="heading">{t.crew.members}</AppText>
        {(members.data ?? []).map((m) => (
          <View key={m.id} style={styles.member}>
            <PirateAvatar avatar={m.avatar} color={m.color} size={44} />
            <View style={styles.flex}>
              <AppText variant="bodyStrong">
                {m.display_name}
                {m.id === me.data?.id ? ` (${t.common.you})` : ''}
              </AppText>
              <AppText variant="caption" tone="muted">
                {m.role === 'captain' ? t.crew.captain : t.crew.pirate}
              </AppText>
            </View>
            {isCaptain && m.id !== me.data?.id ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${m.display_name}: ${t.crew.remove}`}
                hitSlop={8}
                onPress={() => void kick(m.id, m.display_name)}
                style={styles.iconButton}
              >
                <MaterialCommunityIcons name="account-remove-outline" size={24} color={colors.danger} />
              </Pressable>
            ) : null}
          </View>
        ))}
        {remove.error || regenerate.error ? (
          <AppText tone="danger">{errorMessage(remove.error ?? regenerate.error)}</AppText>
        ) : null}
      </Card>

      <Button
        title={t.crew.settings}
        icon="cog-outline"
        variant="secondary"
        onPress={() => router.push('/settings')}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, gap: spacing.md, maxWidth: 640, width: '100%', alignSelf: 'center' },
  hero: { alignItems: 'center', gap: spacing.xs },
  center: { textAlign: 'center' },
  flex: { flex: 1 },
  code: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    paddingVertical: spacing.md,
  },
  codeText: { fontFamily: fonts.bodyHeavy, fontSize: 32, letterSpacing: 6 },
  member: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minHeight: 52 },
  iconButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
});
