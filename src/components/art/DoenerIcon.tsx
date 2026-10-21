import Svg, { Circle, Path } from 'react-native-svg';

/** Platzhalter-Illustration für Spots ohne Foto: halbes Dönerbrot mit Füllung */
export function DoenerIcon({ size = 64 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Path d="M 8 30 Q 20 18 32 20 Q 46 18 56 30 Z" fill="#4E9A3A" />
      <Path d="M 12 28 Q 22 20 32 22 Q 42 20 52 28 Z" fill="#8B4A22" />
      <Circle cx={22} cy={24} r={3} fill="#D2402F" />
      <Circle cx={40} cy={23} r={3} fill="#D2402F" />
      <Path d="M 26 22 Q 30 19 34 22" stroke="#F4F0E6" strokeWidth={2} fill="none" />
      <Path d="M 6 30 L 58 30 Q 56 52 32 54 Q 8 52 6 30 Z" fill="#E4B16A" stroke="#3A2511" strokeWidth={2} />
      <Path d="M 11 36 Q 32 44 53 36" stroke="#B9833C" strokeWidth={1.6} fill="none" />
    </Svg>
  );
}
