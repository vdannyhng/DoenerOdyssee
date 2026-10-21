import { View } from 'react-native';
import Svg, { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

import { t } from '@/i18n/de';

export const AVATAR_IDS = [
  'buccaneer',
  'bandana',
  'eyepatch',
  'cook',
  'navigator',
  'captain',
  'beard',
  'skull',
] as const;
export type AvatarId = (typeof AVATAR_IDS)[number];

export function isAvatarId(value: string): value is AvatarId {
  return (AVATAR_IDS as readonly string[]).includes(value);
}

const INK = '#2A1A0C';
const SKIN = '#F2C9A0';

function Face({ eyes = true }: { eyes?: boolean }) {
  return (
    <G>
      <Circle cx={32} cy={37} r={15} fill={SKIN} stroke={INK} strokeWidth={1.6} />
      {eyes && (
        <G>
          <Circle cx={26.5} cy={36} r={1.9} fill={INK} />
          <Circle cx={37.5} cy={36} r={1.9} fill={INK} />
        </G>
      )}
      <Path d="M 26 42.5 Q 32 47 38 42.5" stroke={INK} strokeWidth={1.8} fill="none" strokeLinecap="round" />
    </G>
  );
}

function Variant({ id }: { id: AvatarId }) {
  switch (id) {
    case 'buccaneer':
      return (
        <G>
          <Face />
          <Path d="M 12 26 Q 32 6 52 26 Q 32 20 12 26 Z" fill="#1E1E22" stroke={INK} strokeWidth={1.4} />
          <Path d="M 15 25 Q 32 19 49 25" stroke="#D9A521" strokeWidth={1.8} fill="none" />
        </G>
      );
    case 'bandana':
      return (
        <G>
          <Face />
          <Path d="M 17 32 Q 17 19 32 19 Q 47 19 47 32 Z" fill="#C0392B" stroke={INK} strokeWidth={1.4} />
          <Circle cx={24} cy={26} r={1.4} fill="#F6EBD5" />
          <Circle cx={36} cy={24} r={1.4} fill="#F6EBD5" />
          <Path d="M 46 29 L 53 25 L 52 33 Z" fill="#C0392B" stroke={INK} strokeWidth={1.2} />
        </G>
      );
    case 'eyepatch':
      return (
        <G>
          <Face eyes={false} />
          <Circle cx={37.5} cy={36} r={1.9} fill={INK} />
          <Line x1={18} y1={28} x2={44} y2={39} stroke={INK} strokeWidth={1.6} />
          <Ellipse cx={26.5} cy={36} rx={4.2} ry={3.6} fill={INK} />
          <Path
            d="M 18 30 Q 32 14 46 30"
            stroke="#5A3A1F"
            strokeWidth={4}
            fill="none"
            strokeLinecap="round"
          />
        </G>
      );
    case 'cook':
      return (
        <G>
          <Face />
          <Rect x={20} y={20} width={24} height={6} rx={2} fill="#FFFFFF" stroke={INK} strokeWidth={1.4} />
          <Path
            d="M 20 21 Q 14 12 22 9 Q 25 3 32 6 Q 39 3 42 9 Q 50 12 44 21 Z"
            fill="#FFFFFF"
            stroke={INK}
            strokeWidth={1.4}
          />
          <Path d="M 29 43 Q 32 41 35 43" stroke="#5A3A1F" strokeWidth={2.4} fill="none" />
        </G>
      );
    case 'navigator':
      return (
        <G>
          <Face eyes={false} />
          <Circle cx={26.5} cy={36} r={4.6} fill="#FFFFFF" stroke={INK} strokeWidth={1.6} />
          <Circle cx={37.5} cy={36} r={4.6} fill="#FFFFFF" stroke={INK} strokeWidth={1.6} />
          <Line x1={31.1} y1={36} x2={32.9} y2={36} stroke={INK} strokeWidth={1.6} />
          <Circle cx={26.5} cy={36} r={1.6} fill={INK} />
          <Circle cx={37.5} cy={36} r={1.6} fill={INK} />
          <Path d="M 17 29 Q 18 18 32 18 Q 46 18 47 29 Z" fill="#1D4E89" stroke={INK} strokeWidth={1.4} />
          <Path d="M 40 28 Q 50 27 54 30 L 46 31 Z" fill="#163C6A" stroke={INK} strokeWidth={1.2} />
        </G>
      );
    case 'captain':
      return (
        <G>
          <Face />
          <Path d="M 40 18 Q 52 6 58 10 Q 50 12 44 22 Z" fill="#E8E2D0" stroke={INK} strokeWidth={1.2} />
          <Path
            d="M 10 27 Q 14 12 32 12 Q 50 12 54 27 Q 32 21 10 27 Z"
            fill="#7A1F1A"
            stroke={INK}
            strokeWidth={1.4}
          />
          <Path d="M 12 26 Q 32 20 52 26" stroke="#D9A521" strokeWidth={2} fill="none" />
        </G>
      );
    case 'beard':
      return (
        <G>
          <Face />
          <Path
            d="M 17 38 Q 17 58 32 60 Q 47 58 47 38 Q 42 46 32 46 Q 22 46 17 38 Z"
            fill="#6B4423"
            stroke={INK}
            strokeWidth={1.4}
          />
          <Path
            d="M 25 43 Q 32 39 39 43"
            stroke="#4A2E17"
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d="M 18 30 Q 32 15 46 30"
            stroke="#6B4423"
            strokeWidth={5}
            fill="none"
            strokeLinecap="round"
          />
        </G>
      );
    case 'skull':
      return (
        <G>
          <Path
            d="M 32 20 C 21 20 17 28 17.5 36 C 18 41 21 43 24 44 L 24 50 Q 32 53 40 50 L 40 44 C 43 43 46 41 46.5 36 C 47 28 43 20 32 20 Z"
            fill="#F6EBD5"
            stroke={INK}
            strokeWidth={1.6}
          />
          <Ellipse cx={26.5} cy={35} rx={3.8} ry={4.3} fill={INK} />
          <Ellipse cx={37.5} cy={35} rx={3.8} ry={4.3} fill={INK} />
          <Path d="M 32 39 L 30 42.5 L 34 42.5 Z" fill={INK} />
          <Line x1={29} y1={46} x2={29} y2={50} stroke={INK} strokeWidth={1.2} />
          <Line x1={35} y1={46} x2={35} y2={50} stroke={INK} strokeWidth={1.2} />
        </G>
      );
  }
}

type Props = { avatar: string; color: string; size?: number; label?: string };

export function PirateAvatar({ avatar, color, size = 40, label }: Props) {
  const id: AvatarId = isAvatarId(avatar) ? avatar : 'buccaneer';
  return (
    <View accessible={!!label} accessibilityRole="image" accessibilityLabel={label ?? t.avatars[id]}>
      <Svg width={size} height={size} viewBox="0 0 64 64">
        <Circle cx={32} cy={32} r={31} fill={color} stroke={INK} strokeWidth={1.5} />
        <Variant id={id} />
      </Svg>
    </View>
  );
}
