import { StyleSheet } from 'react-native';
import Svg, { Circle, Defs, Ellipse, RadialGradient, Rect, Stop } from 'react-native-svg';

const rand = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

/**
 * Altes Steckbrief-Papier: heller, leicht grauer Kern, abgedunkelte Ränder, ein paar Flecken.
 * Liegt absolut hinter dem Poster-Inhalt; seed variiert die Flecken pro Poster.
 */
export function PosterPaper({ seed = 1 }: { seed?: number }) {
  const stains = Array.from({ length: 7 }, (_, i) => ({
    cx: 5 + rand(seed * 11 + i) * 90,
    cy: 5 + rand(seed * 17 + i) * 130,
    r: 2 + rand(seed * 23 + i) * 8,
    o: 0.04 + rand(seed * 29 + i) * 0.06,
  }));
  return (
    <Svg style={StyleSheet.absoluteFill} viewBox="0 0 100 140" preserveAspectRatio="none">
      <Defs>
        <RadialGradient id="paper" cx="50%" cy="42%" r="78%">
          <Stop offset="0" stopColor="#F1E8D6" />
          <Stop offset="0.6" stopColor="#E4D6BC" />
          <Stop offset="1" stopColor="#C7B391" />
        </RadialGradient>
        <RadialGradient id="edge" cx="50%" cy="50%" r="72%">
          <Stop offset="0.75" stopColor="#4A3523" stopOpacity="0" />
          <Stop offset="1" stopColor="#4A3523" stopOpacity="0.4" />
        </RadialGradient>
      </Defs>
      <Rect width="100" height="140" fill="url(#paper)" />
      {stains.map((s, i) => (
        <Circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill="#6B5236" opacity={s.o} />
      ))}
      <Ellipse cx={15 + rand(seed) * 70} cy={128} rx={16} ry={5} fill="#6B5236" opacity={0.05} />
      <Rect width="100" height="140" fill="url(#edge)" />
    </Svg>
  );
}
