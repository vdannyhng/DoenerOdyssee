import Svg, { G, Line, Path, Rect } from 'react-native-svg';

import type { TierKey } from '@/features/ranking/scoring';

import { FlyingLamb } from './FlyingLamb';

const INK = '#2A1A0C';
const WOOD = '#7A4A26';
const WOOD_DARK = '#4A2C14';
const SAIL = '#F4ECD6';
const GOLD = '#D9A521';
const WATER = '#2A6BB0';

type MastSpec = { x: number; height: number; kind: 'square' | 'fore' };

function Mast({ x, height, kind, base }: MastSpec & { base: number }) {
  const top = base - height;
  return (
    <G>
      <Line x1={x} y1={base} x2={x} y2={top} stroke={INK} strokeWidth={2} />
      {kind === 'square' ? (
        <>
          {/* zwei gewölbte Rahsegel übereinander */}
          <Path
            d={`M ${x - height * 0.32} ${top + 4} Q ${x} ${top + 1} ${x + height * 0.32} ${top + 4} L ${x + height * 0.28} ${top + height * 0.42} Q ${x} ${top + height * 0.5} ${x - height * 0.28} ${top + height * 0.42} Z`}
            fill={SAIL}
            stroke={INK}
            strokeWidth={1.3}
          />
          <Path
            d={`M ${x - height * 0.38} ${top + height * 0.5} Q ${x} ${top + height * 0.46} ${x + height * 0.38} ${top + height * 0.5} L ${x + height * 0.34} ${top + height * 0.88} Q ${x} ${top + height * 0.97} ${x - height * 0.34} ${top + height * 0.88} Z`}
            fill={SAIL}
            stroke={INK}
            strokeWidth={1.3}
          />
        </>
      ) : (
        <Path
          d={`M ${x + 1} ${top + 3} Q ${x + height * 0.5} ${top + height * 0.5} ${x + height * 0.55} ${base - 4} L ${x + 1} ${base - 4} Z`}
          fill={SAIL}
          stroke={INK}
          strokeWidth={1.3}
        />
      )}
      {/* Wimpel */}
      <Path
        d={`M ${x} ${top} L ${x + 9} ${top + 3} L ${x} ${top + 6} Z`}
        fill="#A8261D"
        stroke={INK}
        strokeWidth={0.8}
      />
    </G>
  );
}

function Ship({
  masts,
  hullLeft,
  hullRight,
  stern,
  gold,
}: {
  masts: MastSpec[];
  hullLeft: number;
  hullRight: number;
  stern?: boolean;
  gold?: boolean;
}) {
  const base = 62;
  return (
    <G>
      {masts.map((m) => (
        <Mast key={m.x} {...m} base={base} />
      ))}
      <Path
        d={
          stern
            ? `M ${hullLeft} ${base - 10} L ${hullLeft + 16} ${base - 10} L ${hullLeft + 16} ${base} L ${hullRight} ${base} L ${hullRight - 12} ${base + 16} L ${hullLeft + 12} ${base + 16} Z`
            : `M ${hullLeft} ${base} L ${hullRight} ${base} L ${hullRight - 10} ${base + 14} L ${hullLeft + 10} ${base + 14} Z`
        }
        fill={WOOD}
        stroke={INK}
        strokeWidth={1.8}
      />
      <Line
        x1={hullLeft + 6}
        y1={base + 5}
        x2={hullRight - 6}
        y2={base + 5}
        stroke={gold ? GOLD : WOOD_DARK}
        strokeWidth={gold ? 2.4 : 1.5}
      />
      {stern ? (
        <>
          {[0, 1, 2, 3].map((i) => (
            <Rect key={i} x={hullLeft + 30 + i * 14} y={base + 7} width={5} height={4} fill={INK} />
          ))}
        </>
      ) : null}
    </G>
  );
}

function Rowboat() {
  return (
    <G>
      <Line x1={30} y1={60} x2={18} y2={80} stroke={WOOD_DARK} strokeWidth={2.5} strokeLinecap="round" />
      <Line x1={90} y1={60} x2={102} y2={80} stroke={WOOD_DARK} strokeWidth={2.5} strokeLinecap="round" />
      <Path d="M 32 64 L 88 64 L 80 77 L 40 77 Z" fill={WOOD} stroke={INK} strokeWidth={1.8} />
      <Line x1={38} y1={68} x2={82} y2={68} stroke={WOOD_DARK} strokeWidth={1.4} />
    </G>
  );
}

function Raft() {
  return (
    <G>
      <Line x1={60} y1={70} x2={58} y2={36} stroke={INK} strokeWidth={2} />
      {/* geflicktes Segel */}
      <Path d="M 59 38 L 80 46 L 78 64 L 60 62 Z" fill="#E2D7BC" stroke={INK} strokeWidth={1.2} />
      <Rect x={66} y={48} width={6} height={6} fill="#B9A983" stroke={INK} strokeWidth={0.8} />
      {[0, 1, 2, 3, 4].map((i) => (
        <Rect
          key={i}
          x={34 + i * 11}
          y={68}
          width={10}
          height={8}
          rx={3}
          fill={WOOD}
          stroke={INK}
          strokeWidth={1.2}
        />
      ))}
    </G>
  );
}

const WAVES = 'M 0 80 Q 10 75 20 80 T 40 80 T 60 80 T 80 80 T 100 80 T 120 80 L 120 90 L 0 90 Z';

/** Eigene Schiffs-Illustration je Tier – vom Flaggschiff bis zum Floss */
export function ShipArt({ tier, width = 120 }: { tier: TierKey; width?: number }) {
  // Das Flaggschiff ist die Flying Lamb der Crew
  if (tier === 'S') return <FlyingLamb width={width} />;
  return (
    <Svg width={width} height={(width * 90) / 120} viewBox="0 0 120 90">
      {tier === 'A' ? (
        <Ship
          stern
          gold
          hullLeft={14}
          hullRight={106}
          masts={[
            { x: 36, height: 38, kind: 'square' },
            { x: 60, height: 46, kind: 'square' },
            { x: 84, height: 38, kind: 'square' },
          ]}
        />
      ) : tier === 'B' ? (
        <Ship
          hullLeft={22}
          hullRight={98}
          masts={[
            { x: 46, height: 40, kind: 'square' },
            { x: 74, height: 40, kind: 'square' },
          ]}
        />
      ) : tier === 'C' ? (
        <Ship
          hullLeft={26}
          hullRight={94}
          masts={[
            { x: 44, height: 40, kind: 'fore' },
            { x: 68, height: 34, kind: 'fore' },
          ]}
        />
      ) : tier === 'D' ? (
        <Rowboat />
      ) : (
        <Raft />
      )}
      <Path d={WAVES} fill={WATER} opacity={0.85} />
    </Svg>
  );
}
