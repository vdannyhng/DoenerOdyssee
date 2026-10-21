import Svg, { Path, Rect } from 'react-native-svg';

/** Berry-Zeichen für Kopfgelder: serifenbetontes B mit zwei senkrechten Strichen (nachgezeichnet) */
export function BerrySign({ size = 20, color = '#3B2E26' }: { size?: number; color?: string }) {
  return (
    <Svg width={size * 0.8} height={size} viewBox="0 0 16 20">
      {/* zwei senkrechte Striche, oben und unten über das B hinaus */}
      <Rect x={5.2} y={0} width={1.5} height={20} fill={color} />
      <Rect x={8.4} y={0} width={1.5} height={20} fill={color} />
      {/* B mit Serifen: Stamm links, zwei Bäuche rechts */}
      <Path
        fillRule="evenodd"
        d={[
          'M 1.5 2.6 H 9.2 Q 13.6 2.6 13.6 6 Q 13.6 8.6 11.2 9.4 Q 14.4 10.2 14.4 13.3 Q 14.4 17.4 9.4 17.4 H 1.5 V 16.4 Q 3 16.3 3 15 V 5 Q 3 3.7 1.5 3.6 Z',
          'M 5.4 4 V 8.8 H 8.8 Q 11 8.8 11 6.4 Q 11 4 8.8 4 Z',
          'M 5.4 10.2 V 16 H 9.2 Q 11.7 16 11.7 13.1 Q 11.7 10.2 9.2 10.2 Z',
        ].join(' ')}
        fill={color}
      />
    </Svg>
  );
}
