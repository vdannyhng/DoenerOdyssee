import { StyleSheet, View } from 'react-native';

import { PirateAvatar } from '@/components/art/PirateAvatar';
import { Chip } from '@/components/ui';
import { t } from '@/i18n/de';
import { spacing } from '@/theme/tokens';

import type { Member } from './api';

type Props = {
  members: Member[];
  selected: string[];
  onChange: (ids: string[]) => void;
  myId: string | null;
};

export function MemberPicker({ members, selected, onChange, myId }: Props) {
  const toggle = (id: string) =>
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  return (
    <View style={styles.wrap}>
      {members.map((m) => (
        <Chip
          key={m.id}
          label={m.id === myId ? `${m.display_name} (${t.common.you})` : m.display_name}
          selected={selected.includes(m.id)}
          onPress={() => toggle(m.id)}
          leading={<PirateAvatar avatar={m.avatar} color={m.color} size={28} />}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
