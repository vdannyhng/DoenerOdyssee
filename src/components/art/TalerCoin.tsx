import Svg, { Circle, Path } from 'react-native-svg';

/** Münzsymbol der Fantasie-Währung „Taler“ */
export function TalerCoin({ size = 16 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20">
      <Circle cx={10} cy={10} r={9} fill="#D9A521" stroke="#6A4B10" strokeWidth={1.5} />
      <Circle cx={10} cy={10} r={6.2} fill="none" stroke="#F3D27A" strokeWidth={1} />
      <Path d="M 6.5 6.8 H 13.5 M 10 6.8 V 14" stroke="#6A4B10" strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}
