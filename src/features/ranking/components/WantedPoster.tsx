import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { DoenerIcon } from '@/components/art/DoenerIcon';
import { PosterPaper } from '@/components/art/PosterPaper';
import { ScrollOrnament } from '@/components/art/ScrollOrnament';
import { TalerSign } from '@/components/art/TalerSign';
import { bountyFor, formatBounty, formatScore, type TierKey } from '@/features/ranking/scoring';
import { t } from '@/i18n/de';
import { fonts } from '@/theme/tokens';
import { useReduceMotion } from '@/theme/useTheme';

export type PosterSize = 'lg' | 'md' | 'sm';

type Props = {
  rank: number;
  name: string;
  overall: number;
  raters: number;
  tier: TierKey;
  photoUrl?: string | null;
  size: PosterSize;
  onPress: () => void;
};

const INK = '#3B2E26';
const INK_SOFT = '#5C4A3C';
const FRAME = '#4A3523';

const SCALE: Record<
  PosterSize,
  {
    wanted: number;
    dead: number;
    name: number;
    bounty: number;
    fine: number;
    frame: number;
    pad: number;
    seal: number;
    icon: number;
  }
> = {
  lg: { wanted: 64, dead: 22, name: 40, bounty: 24, fine: 6.5, frame: 7, pad: 12, seal: 42, icon: 110 },
  md: { wanted: 40, dead: 13, name: 22, bounty: 15, fine: 4.5, frame: 5, pad: 7, seal: 32, icon: 64 },
  sm: { wanted: 33, dead: 11, name: 18, bounty: 13, fine: 4, frame: 4, pad: 6, seal: 28, icon: 52 },
};

const SEAL_COLORS = ['#D9A521', '#B8BCC4', '#B87333'];
// Leicht schief angenagelt – je Rang fest, damit nichts wackelt
const TILT = [-1.2, 1.8, -2, 1.3, -1.1, 2.2, -1.8, 1, -2.4, 1.6];

/** Steckbrief im Aufbau klassischer Piraten-Kopfgeldplakate – Foto = der Döner */
export function WantedPoster({ rank, name, overall, raters, tier, photoUrl, size, onPress }: Props) {
  const s = SCALE[size];
  const reduceMotion = useReduceMotion();
  const [lowerHeight, setLowerHeight] = useState(0);
  const [paperWidth, setPaperWidth] = useState(0);
  const tilt = TILT[(rank - 1) % TILT.length] ?? 0;
  const sealColor = SEAL_COLORS[rank - 1] ?? '#8E1F17';
  const score = formatScore(overall);
  // Das „Kleingedruckte“ trägt die echten Daten des Spots
  const fine = t.ranking.finePrint(rank, score, raters, `${tier} · ${t.tiers.names[tier]}`);

  // Schriftgrösse aus der Plakatbreite (adjustsFontSizeToFit gibt es nicht überall, z. B. im Browser)
  const inner = paperWidth - 2 * s.pad;
  const fit = (text: string, max: number, share: number, glyph: number) =>
    inner > 0 ? Math.min(max, (inner * share) / (Math.max(text.length, 1) * glyph)) : max;
  const title = name.toUpperCase();
  const bountyText = `${formatBounty(bountyFor(overall))}–`;
  const wantedSize = fit(t.ranking.wanted, s.wanted, 0.98, 0.8);
  const deadSize = fit(t.ranking.deadOrAlive, s.dead, 0.84, 0.74);
  const oneLine = fit(title, s.name, 0.84, 0.74);
  // Lange Namen: lieber zwei Zeilen (nur an Leerzeichen) als winzige Schrift
  const longestWord = title.split(/s+/).reduce((x, w) => (w.length > x.length ? w : x), '');
  const twoLines = oneLine < s.name * 0.6 && longestWord.length < title.length;
  const nameSize = twoLines
    ? Math.min(fit(longestWord, s.name, 0.84, 0.74), fit(title, s.name, 1.5, 0.74))
    : oneLine;
  const bountySize = fit(bountyText, s.bounty, 0.72, 0.64);

  return (
    <Animated.View
      entering={
        reduceMotion
          ? undefined
          : ZoomIn.delay(Math.min(rank, 10) * 70)
              .springify()
              .damping(14)
      }
    >
      {/* Schräglage auf einer eigenen View, damit die Einblend-Animation das transform nicht überschreibt */}
      <View style={[styles.hang, { transform: [{ rotate: `${tilt}deg` }] }]}>
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={t.ranking.posterA11y(rank, name, score, raters)}
          style={({ pressed }) => [styles.frame, { padding: s.frame }, pressed && styles.pressed]}
        >
          <View
            style={[styles.paper, { padding: s.pad }]}
            onLayout={(e) => setPaperWidth(e.nativeEvent.layout.width)}
          >
            <PosterPaper seed={rank} />
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={[styles.wanted, { fontSize: wantedSize, lineHeight: wantedSize * 1.08 }]}
            >
              {t.ranking.wanted}
            </Text>
            <View style={styles.photo}>
              {photoUrl ? (
                <Image source={{ uri: photoUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
              ) : (
                <DoenerIcon size={s.icon} />
              )}
            </View>

            <View style={styles.lower} onLayout={(e) => setLowerHeight(e.nativeEvent.layout.height)}>
              {lowerHeight > 0 ? (
                <>
                  <View style={[styles.ornament, styles.left]}>
                    <ScrollOrnament height={lowerHeight} color={INK_SOFT} />
                  </View>
                  <View style={[styles.ornament, styles.right]}>
                    <ScrollOrnament height={lowerHeight} color={INK_SOFT} mirror />
                  </View>
                </>
              ) : null}
              <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.dead, { fontSize: deadSize }]}>
                {t.ranking.deadOrAlive}
              </Text>
              <Text
                numberOfLines={twoLines ? 2 : 1}
                adjustsFontSizeToFit
                style={[styles.name, { fontSize: nameSize, lineHeight: nameSize * 1.12 }]}
              >
                {title}
              </Text>
              <View style={styles.bountyRow}>
                <TalerSign size={bountySize * 1.15} color={INK} />
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  style={[styles.bounty, { fontSize: bountySize }]}
                >
                  {bountyText}
                </Text>
              </View>
              <View style={styles.footer}>
                <Text
                  style={[styles.fine, { fontSize: s.fine, lineHeight: s.fine * 1.3 }]}
                  numberOfLines={size === 'lg' ? 3 : 2}
                >
                  {fine}
                </Text>
                <Text style={[styles.marine, { fontSize: bountySize * 0.8 }]}>{t.ranking.marine}</Text>
              </View>
            </View>
          </View>
        </Pressable>
        {/* Nagel */}
        <View style={styles.nail} />
        {/* Wachssiegel mit Rang */}
        <View
          style={[
            styles.seal,
            { width: s.seal, height: s.seal, borderRadius: s.seal / 2, backgroundColor: sealColor },
          ]}
        >
          <Text
            style={[styles.sealText, { fontSize: s.seal * 0.5, color: rank <= 3 ? '#2A1A0C' : '#FFF4E0' }]}
          >
            {rank}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  hang: { paddingTop: 8 },
  frame: {
    backgroundColor: FRAME,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 6,
    shadowOffset: { width: 2, height: 6 },
    elevation: 7,
  },
  paper: { overflow: 'hidden', alignItems: 'stretch', backgroundColor: '#E4D6BC' },
  pressed: { transform: [{ scale: 0.97 }] },
  wanted: { fontFamily: fonts.poster, color: INK, letterSpacing: 1, textAlign: 'center' },
  photo: {
    width: '100%',
    aspectRatio: 1.32,
    backgroundColor: '#B9A88C',
    borderWidth: 1.5,
    borderColor: INK,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginTop: 2,
  },
  lower: { paddingHorizontal: '7%', marginTop: 4 },
  ornament: { position: 'absolute', top: 0, bottom: 0 },
  left: { left: -2 },
  right: { right: -2 },
  dead: { fontFamily: fonts.poster, color: INK, letterSpacing: 2, textAlign: 'center' },
  name: { fontFamily: fonts.poster, color: INK, textAlign: 'center', letterSpacing: 0.5 },
  bountyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  bounty: { fontFamily: fonts.poster, color: INK, flexShrink: 1, letterSpacing: 1 },
  footer: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, marginTop: 1 },
  fine: { flex: 1, fontFamily: fonts.bodyBold, color: INK_SOFT, textTransform: 'uppercase' },
  marine: { fontFamily: fonts.poster, color: INK, letterSpacing: 0.5 },
  nail: {
    position: 'absolute',
    top: 2,
    alignSelf: 'center',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#6B6B6B',
    borderWidth: 2,
    borderColor: '#2E2E2E',
  },
  seal: {
    position: 'absolute',
    top: -2,
    left: -8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.35)',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 2,
    shadowOffset: { width: 1, height: 2 },
    elevation: 8,
  },
  sealText: { fontFamily: fonts.display },
});
