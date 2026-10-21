import Svg, { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

const INK = '#2A1A0C';
const WOOD = '#8A5A2E';
const WOOD_LIGHT = '#B07A44';
const SAIL = '#F6EFDC';
const WOOL = '#FBF8F0';

/**
 * Die „Flying Lamb“: kleine Karavelle der Crew mit Lammkopf als Galionsfigur,
 * Jolly Roger auf dem Hauptsegel. Eigene Gestaltung.
 */
export function FlyingLamb({ width = 120, waves = true }: { width?: number; waves?: boolean }) {
  return (
    <Svg width={width} height={(width * 90) / 120} viewBox="0 0 120 90">
      {/* Masten */}
      <Line x1={56} y1={64} x2={56} y2={8} stroke={INK} strokeWidth={2.2} />
      <Line x1={30} y1={60} x2={30} y2={26} stroke={INK} strokeWidth={1.8} />
      {/* Wimpel */}
      <Path d="M 56 8 L 70 11 L 56 14 Z" fill="#A8261D" stroke={INK} strokeWidth={1} />
      {/* Hauptsegel mit Jolly Roger */}
      <Path
        d="M 38 16 Q 56 12 74 16 Q 77 34 72 50 Q 56 55 40 50 Q 35 34 38 16 Z"
        fill={SAIL}
        stroke={INK}
        strokeWidth={1.6}
      />
      <G>
        <Ellipse cx={56} cy={30} rx={7} ry={6.4} fill={INK} />
        <Rect x={52.5} y={34} width={7} height={4} rx={1} fill={INK} />
        <Circle cx={53.6} cy={30} r={1.8} fill={SAIL} />
        <Circle cx={58.4} cy={30} r={1.8} fill={SAIL} />
        <Line x1={47} y1={36} x2={65} y2={44} stroke={INK} strokeWidth={2.2} strokeLinecap="round" />
        <Line x1={65} y1={36} x2={47} y2={44} stroke={INK} strokeWidth={2.2} strokeLinecap="round" />
      </G>
      {/* Besansegel hinten */}
      <Path
        d="M 22 30 Q 30 27 38 30 Q 40 42 37 52 Q 30 54 23 52 Q 20 42 22 30 Z"
        fill={SAIL}
        stroke={INK}
        strokeWidth={1.4}
      />
      {/* Rumpf: hohes Heck links, geschwungener Bug rechts */}
      <Path
        d="M 10 52 L 22 52 L 24 60 L 94 60 Q 100 59 103 54 L 106 56 Q 102 70 88 76 L 30 76 Q 16 72 12 62 Z"
        fill={WOOD}
        stroke={INK}
        strokeWidth={1.8}
      />
      <Path d="M 16 64 L 100 64" stroke={WOOD_LIGHT} strokeWidth={2.4} />
      {[34, 46, 58, 70].map((x) => (
        <Circle key={x} cx={x} cy={69.5} r={1.8} fill={INK} />
      ))}
      {/* Galionsfigur: Lammkopf mit Wollkringeln und gedrehten Hörnern */}
      <G>
        <Circle cx={104} cy={47} r={6} fill={WOOL} stroke={INK} strokeWidth={1.3} />
        <Circle cx={99} cy={44} r={3.4} fill={WOOL} stroke={INK} strokeWidth={1.1} />
        <Circle cx={105} cy={41} r={3.4} fill={WOOL} stroke={INK} strokeWidth={1.1} />
        <Ellipse cx={109} cy={50} rx={4.2} ry={3.6} fill="#F2D9C4" stroke={INK} strokeWidth={1.2} />
        <Circle cx={107.6} cy={48.6} r={0.9} fill={INK} />
        <Path d="M 98 48 Q 94 46 95 51 Q 97 54 100 51" fill="none" stroke={INK} strokeWidth={1.6} />
        <Ellipse cx={101} cy={41} rx={2.2} ry={1.2} fill="#F2D9C4" stroke={INK} strokeWidth={0.8} />
      </G>
      {waves ? (
        <Path
          d="M 0 80 Q 10 75 20 80 T 40 80 T 60 80 T 80 80 T 100 80 T 120 80 L 120 90 L 0 90 Z"
          fill="#2A6BB0"
          opacity={0.85}
        />
      ) : null}
    </Svg>
  );
}
