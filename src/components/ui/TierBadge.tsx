import { StyleSheet, View } from 'react-native';

import type { TierKey } from '@/features/ranking/scoring';
import { t } from '@/i18n/de';
import { fonts, tierColors } from '@/theme/tokens';

import { AppText } from './AppText';

export function TierBadge({ tier, size = 32 }: { tier: TierKey; size?: number }) {
  const { bg, fg } = tierColors[tier];
  return (
    <View
      accessible
      accessibilityLabel={`${t.detail.tier} ${tier}: ${t.tiers.names[tier]}`}
      style={[styles.badge, { width: size, height: size, borderRadius: size / 4, backgroundColor: bg }]}
    >
      <AppText
        style={{ color: fg, fontFamily: fonts.display, fontSize: size * 0.66, lineHeight: size * 0.9 }}
      >
        {tier}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#2A1A0C',
  },
});
