/**
 * Seekarten-Look für Google Maps (Android): Pergament-Land, tiefblaues Meer, gedämpfte Strassen.
 * Apple Maps (iOS) lässt sich in Expo Go nicht gestalten und zeigt die Standardkarte.
 */
export const parchmentMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#ebdcb8' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#5e4528' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#f3e8cf' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#7fa7c9' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#1d4e89' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#f6eedb' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#e2c58f' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#c9ae7b' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#dfcd9f' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#a88a55' }] },
];
