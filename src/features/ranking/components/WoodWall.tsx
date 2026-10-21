import { useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

const PLANK_HEIGHT = 72;
const PLANK_COLORS = ['#6B4423', '#734A27', '#664020', '#70482A'];

/** Deterministischer Pseudo-Zufall, damit die Maserung beim Neurendern nicht springt */
const rand = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

/** Holzwand aus waagrechten Brettern mit Maserung – Hintergrund für die Wanted-Poster */
export function WoodWall({ children }: { children: ReactNode }) {
  const [height, setHeight] = useState(800);
  const planks = Math.ceil(height / PLANK_HEIGHT) + 1;

  return (
    <View style={styles.wall} onLayout={(e) => setHeight(e.nativeEvent.layout.height)}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none" accessible={false}>
        {Array.from({ length: planks }, (_, i) => (
          <View key={i} style={[styles.plank, { backgroundColor: PLANK_COLORS[i % PLANK_COLORS.length] }]}>
            {[0, 1, 2].map((g) => (
              <View
                key={g}
                style={[
                  styles.grain,
                  {
                    top: 12 + g * 18 + rand(i * 7 + g) * 8,
                    left: `${rand(i * 13 + g) * 50}%`,
                    width: `${30 + rand(i * 17 + g) * 45}%`,
                  },
                ]}
              />
            ))}
            {/* Brettfuge mit versetztem Stoss */}
            <View style={[styles.joint, { left: `${20 + rand(i) * 60}%` }]} />
          </View>
        ))}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wall: { flexGrow: 1, backgroundColor: '#5E3B1E', overflow: 'hidden' },
  plank: {
    height: PLANK_HEIGHT,
    borderBottomWidth: 3,
    borderBottomColor: '#3B2412',
    borderTopWidth: 1,
    borderTopColor: '#8A5A33',
  },
  grain: { position: 'absolute', height: 1.5, borderRadius: 1, backgroundColor: 'rgba(40, 22, 8, 0.28)' },
  joint: { position: 'absolute', top: 0, bottom: 0, width: 3, backgroundColor: '#3B2412' },
});
