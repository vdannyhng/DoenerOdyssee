import Svg, { Path, Rect } from 'react-native-svg';

/**
 * Eigenes Währungszeichen „Taler“ für Kopfgelder: serifenbetontes T mit zwei Querstrichen.
 * Bewusst kein Nachbau eines bekannten Zeichens.
 */
export function TalerSign({ size = 20, color = '#3A2511' }: { size?: number; color?: string }) {
  return (
    <Svg width={size * 0.8} height={size} viewBox="0 0 16 20">
      {/* Querbalken mit Serifen */}
      <Path
        d="M 1 2 H 15 V 5.5 H 13.6 Q 13.4 3.9 11.6 3.9 H 9.6 V 4 H 6.4 V 3.9 H 4.4 Q 2.6 3.9 2.4 5.5 H 1 Z"
        fill={color}
      />
      {/* Stamm mit Fuss */}
      <Path
        d="M 6.4 3.9 H 9.6 V 16.6 Q 9.6 17.6 11 17.8 V 19 H 5 V 17.8 Q 6.4 17.6 6.4 16.6 Z"
        fill={color}
      />
      {/* zwei Querstriche */}
      <Rect x={3} y={8.2} width={10} height={1.4} fill={color} />
      <Rect x={3} y={11.2} width={10} height={1.4} fill={color} />
    </Svg>
  );
}
