import Svg, { Path } from 'react-native-svg';

/**
 * Senkrechter Schnörkel mit eingerollten Enden, wie an den Seiten alter Steckbriefe.
 * mirror=true für die rechte Seite.
 */
export function ScrollOrnament({
  height,
  color,
  mirror = false,
}: {
  height: number;
  color: string;
  mirror?: boolean;
}) {
  const w = Math.max(10, height * 0.16);
  return (
    <Svg
      width={w}
      height={height}
      viewBox="0 0 16 100"
      preserveAspectRatio="none"
      style={mirror ? { transform: [{ scaleX: -1 }] } : undefined}
    >
      <Path
        d={[
          // obere Einrollung
          'M 12 8 C 12 3 6 2 4.5 5.5 C 3.2 8.6 6.5 10.8 8.6 9 C 10 7.8 9 6 7.6 6.4',
          // Stiel mit leichter Welle
          'M 12 8 C 12 30 7 40 8 50 C 9 60 12 70 12 92',
          // untere Einrollung
          'M 12 92 C 12 97 6 98 4.5 94.5 C 3.2 91.4 6.5 89.2 8.6 91 C 10 92.2 9 94 7.6 93.6',
          // Zierblatt in der Mitte
          'M 8 50 C 4 47 2 50 3.4 52 C 4.6 53.6 7 52.4 8 50',
        ].join(' ')}
        fill="none"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
    </Svg>
  );
}
