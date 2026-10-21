import { distanceMeters, findDuplicates, nameSimilarity, normalizeName } from '../duplicates';

const zurich = { lat: 47.3769, lng: 8.5417 };

describe('distanceMeters', () => {
  it('ist 0 für denselben Punkt', () => {
    expect(distanceMeters(zurich, zurich)).toBe(0);
  });

  it('misst ca. 111 km pro Breitengrad', () => {
    expect(distanceMeters({ lat: 0, lng: 0 }, { lat: 1, lng: 0 })).toBeCloseTo(111_195, -2);
  });
});

describe('nameSimilarity', () => {
  it('ignoriert Gross-/Kleinschreibung, Umlaute und Sonderzeichen', () => {
    expect(normalizeName('Döner-Haus Ürgüp!')).toBe('doenerhausuerguep');
    expect(nameSimilarity('Döner Haus', 'doener-haus')).toBe(1);
  });

  it('erkennt Tippfehler', () => {
    expect(nameSimilarity('Bosporus Grill', 'Bosporos Grill')).toBeGreaterThan(0.8);
  });

  it('unterscheidet verschiedene Namen', () => {
    expect(nameSimilarity('Bosporus Grill', 'Antalya Kebab')).toBeLessThan(0.5);
  });
});

describe('findDuplicates', () => {
  const existing = [
    { id: '1', name: 'Bosporus Grill', ...zurich },
    { id: '2', name: 'Antalya Kebab', lat: 47.4, lng: 8.6 },
  ];

  it('findet ähnliche Namen auch ohne Standort', () => {
    expect(findDuplicates({ name: 'Bosporus grill', location: null }, existing).map((s) => s.id)).toEqual([
      '1',
    ]);
  });

  it('findet nahe Spots (< 50 m) mit anderem Namen', () => {
    const near = { lat: zurich.lat + 0.0003, lng: zurich.lng }; // ca. 33 m
    expect(findDuplicates({ name: 'Kebab Express', location: near }, existing).map((s) => s.id)).toEqual([
      '1',
    ]);
  });

  it('meldet weiter entfernte Spots nicht', () => {
    const far = { lat: zurich.lat + 0.001, lng: zurich.lng }; // ca. 111 m
    expect(findDuplicates({ name: 'Kebab Express', location: far }, existing)).toEqual([]);
  });

  it('ignoriert den Spot selbst beim Bearbeiten', () => {
    expect(findDuplicates({ name: 'Bosporus Grill', location: zurich }, existing, '1')).toEqual([]);
  });
});
