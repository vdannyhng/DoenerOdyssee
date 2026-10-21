import Svg, { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

/** Gekreuzte Dönerspiesse (Fleischkegel am Spiess) als Ersatz für die Knochen */
function Spit({ angle }: { angle: number }) {
  return (
    <G transform={`translate(50 50) rotate(${angle})`}>
      <Rect
        x={-1.8}
        y={-46}
        width={3.6}
        height={100}
        rx={1.8}
        fill="#A9A9B0"
        stroke="#2A1A0C"
        strokeWidth={1.2}
      />
      <Rect x={-4} y={-52} width={8} height={8} rx={2} fill="#3B2412" stroke="#2A1A0C" strokeWidth={1.2} />
      {/* Fleischkegel am unteren Ende, damit er neben dem Schädel sichtbar bleibt */}
      <Path
        d="M -13 20 Q 0 15 13 20 L 7 48 Q 0 52 -7 48 Z"
        fill="#8B4A22"
        stroke="#2A1A0C"
        strokeWidth={1.6}
      />
      {[27, 34, 41].map((y, i) => (
        <Path
          key={y}
          d={`M ${-11 + i * 1.6} ${y} Q 0 ${y + 3} ${11 - i * 1.6} ${y}`}
          stroke="#C27A3E"
          strokeWidth={2}
          fill="none"
        />
      ))}
    </G>
  );
}

/** Crew-Logo: Totenkopf mit Dönerbrot als Hut vor gekreuzten Dönerspiessen (eigene Gestaltung) */
export function JollyRoger({ size = 96 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Spit angle={42} />
      <Spit angle={-42} />
      {/* Schädel */}
      <Path
        d="M 50 26 C 33 26 26 38 27 50 C 28 58 32 61 37 63 L 37 71 Q 50 76 63 71 L 63 63 C 68 61 72 58 73 50 C 74 38 67 26 50 26 Z"
        fill="#F6EBD5"
        stroke="#2A1A0C"
        strokeWidth={2.2}
      />
      <Ellipse cx={41} cy={49} rx={6.2} ry={7} fill="#2A1A0C" />
      <Ellipse cx={59} cy={49} rx={6.2} ry={7} fill="#2A1A0C" />
      <Circle cx={42.5} cy={47.5} r={1.6} fill="#F6EBD5" />
      <Circle cx={60.5} cy={47.5} r={1.6} fill="#F6EBD5" />
      <Path d="M 50 55 L 46.5 61 L 53.5 61 Z" fill="#2A1A0C" />
      {[44, 50, 56].map((x) => (
        <Line key={x} x1={x} y1={65} x2={x} y2={72} stroke="#2A1A0C" strokeWidth={1.6} />
      ))}
      {/* Dönerbrot als Hut: Füllung schaut am Rand heraus */}
      <Path d="M 27 33 Q 33 27 50 27 Q 67 27 73 33 Q 62 30 50 31 Q 38 30 27 33 Z" fill="#4E9A3A" />
      <Circle cx={36} cy={30} r={2.6} fill="#D2402F" />
      <Circle cx={64} cy={30} r={2.6} fill="#D2402F" />
      <Path
        d="M 25 31 Q 26 12 50 11 Q 74 12 75 31 Q 50 25 25 31 Z"
        fill="#E4B16A"
        stroke="#2A1A0C"
        strokeWidth={2}
      />
      <Path
        d="M 36 19 Q 39 17 42 19 M 55 16 Q 58 14 61 16 M 47 22 Q 50 20 53 22"
        stroke="#B9833C"
        strokeWidth={1.6}
        fill="none"
      />
    </Svg>
  );
}
