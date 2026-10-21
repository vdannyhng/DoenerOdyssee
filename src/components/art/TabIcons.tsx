import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

/** Einfarbige Tab-Icons (eingefärbt über color) – eigene Zeichnungen */
type Props = { color: string; size: number };

/** Steckbrief: Plakat mit Nagel, Foto und Textzeilen */
export function WantedTabIcon({ color, size }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M 5 3 H 19 V 21.5 H 5 Z" fill="none" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Circle cx={12} cy={2.6} r={1.3} fill={color} />
      <Line x1={7.5} y1={6} x2={16.5} y2={6} stroke={color} strokeWidth={2} />
      <Rect x={8} y={8.3} width={8} height={6.5} fill="none" stroke={color} strokeWidth={1.4} />
      <Circle cx={12} cy={10.6} r={1.5} fill={color} />
      <Path d="M 9.3 14.6 Q 12 11.8 14.7 14.6 Z" fill={color} />
      <Line x1={7.5} y1={17} x2={16.5} y2={17} stroke={color} strokeWidth={1.4} />
      <Line x1={9} y1={19.3} x2={15} y2={19.3} stroke={color} strokeWidth={1.4} />
    </Svg>
  );
}

/** Flying Lamb als Silhouette: Segel mit Totenkopf, Rumpf, Lammkopf am Bug */
export function LambTabIcon({ color, size }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Line x1={11} y1={2} x2={11} y2={16} stroke={color} strokeWidth={1.5} />
      <Path
        d="M 6 4 Q 11 3 16 4 Q 17 9 15.6 13 Q 11 14.2 6.4 13 Q 5 9 6 4 Z"
        fill="none"
        stroke={color}
        strokeWidth={1.5}
      />
      <Circle cx={11} cy={7.6} r={1.6} fill={color} />
      <Line x1={8.6} y1={10.2} x2={13.4} y2={12} stroke={color} strokeWidth={1.1} />
      <Line x1={13.4} y1={10.2} x2={8.6} y2={12} stroke={color} strokeWidth={1.1} />
      <Path
        d="M 2 15 H 5 L 5.5 16.5 H 19 Q 20.5 16.3 21 15 L 22 15.6 Q 21 19.5 17.5 20.5 H 6 Q 3 19.5 2.4 17 Z"
        fill={color}
      />
      <Circle cx={21.2} cy={12.6} r={2} fill="none" stroke={color} strokeWidth={1.4} />
      <Path
        d="M 1 22.5 Q 4 21 7 22.5 T 13 22.5 T 19 22.5 T 23 22.5"
        fill="none"
        stroke={color}
        strokeWidth={1.2}
      />
    </Svg>
  );
}

/** Logport: Glaskugel mit Nadel auf einem Sockel am Armband */
export function LogportTabIcon({ color, size }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={8.5} r={6.5} fill="none" stroke={color} strokeWidth={1.7} />
      <Line x1={9.2} y1={11.6} x2={14.8} y2={5.4} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Circle cx={12} cy={8.5} r={1.2} fill={color} />
      <Path d="M 9.8 7.6 A 3 3 0 0 1 11 5.4" fill="none" stroke={color} strokeWidth={0.9} opacity={0.7} />
      <Rect x={7.5} y={15} width={9} height={3} rx={1} fill={color} />
      <Path d="M 4 17 Q 3 21.5 7 22 H 17 Q 21 21.5 20 17" fill="none" stroke={color} strokeWidth={1.7} />
    </Svg>
  );
}
