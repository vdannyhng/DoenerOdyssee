import { StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/ui';
import { t } from '@/i18n/de';

import type { SeaMapProps } from './SeaMap.types';

/** Browser: react-native-maps gibt es nur auf dem Handy – dort ist die Karte; hier ein Hinweis */
export default function SeaMap(_props: SeaMapProps) {
  return (
    <View style={styles.wrap}>
      <EmptyState icon="compass-rose" title={t.chart.webTitle} message={t.chart.webBody} />
    </View>
  );
}

const styles = StyleSheet.create({ wrap: { flex: 1 } });
