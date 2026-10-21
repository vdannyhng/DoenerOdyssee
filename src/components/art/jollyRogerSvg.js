// Gemeinsame Vorlage für das Crew-Logo: in der App (JollyRoger.tsx) und für das App-Icon
// (scripts/make-icons.mjs). Flacher Flaggen-Stil mit dicken Konturen: Ein Totenkopf kaut ein
// abgebissenes Stück Döner, Knoblauchsoße im Mund, daneben der angebissene Döner, dahinter
// gekreuzte Knochen. Eigene Zeichnung. Bewusst JavaScript (ESM), damit Node die Datei direkt laden kann.

const INK = '#141414';
const W = '#FFFFFF';
const SAUCE = '#F6ECCB';

/** Klassischer Knochen, gekreuzt symmetrisch unter der Schädelmitte (x = 46) */
const bone = (angle) => `<g transform="translate(46 46) rotate(${angle})">
  <rect x="-3.2" y="-44" width="6.4" height="88" fill="${W}" stroke="${INK}" stroke-width="3"/>
  ${[-45, 45]
    .map(
      (y) =>
        `<circle cx="-4.6" cy="${y}" r="5.4" fill="${W}" stroke="${INK}" stroke-width="3"/>` +
        `<circle cx="4.6" cy="${y}" r="5.4" fill="${W}" stroke="${INK}" stroke-width="3"/>`,
    )
    .join('')}
  <rect x="-3.2" y="-45" width="6.4" height="90" fill="${W}"/>
</g>`;

const cranium = `<path d="M 46 6 C 26 6 18 20 19 34 C 20 42 24 46 29 48 L 63 48 C 68 46 72 42 73 34 C 74 20 66 6 46 6 Z"
    fill="${W}" stroke="${INK}" stroke-width="3.4" stroke-linejoin="round"/>
  <ellipse cx="36" cy="29" rx="7" ry="8" fill="${INK}"/>
  <ellipse cx="56" cy="29" rx="7" ry="8" fill="${INK}"/>
  <circle cx="38" cy="27" r="1.8" fill="${W}"/><circle cx="58" cy="27" r="1.8" fill="${W}"/>
  <path d="M 46 36 L 42.5 42 L 49.5 42 Z" fill="${INK}"/>`;

// Oberkiefer (Zähne nach unten) und leicht geöffneter, kauender Unterkiefer
const upper = `<path d="M 31 47 H 61 V 53 Q 58.5 56 56 53 Q 53.5 56 51 53 Q 48.5 56 46 53 Q 43.5 56 41 53 Q 38.5 56 36 53 Q 33.5 56 31 53 Z"
  fill="${W}" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>`;
const lower = `<path d="M 31 61 Q 33.5 58 36 61 Q 38.5 58 41 61 Q 43.5 58 46 61 Q 48.5 58 51 61 Q 53.5 58 56 61 Q 58.5 58 61 61 V 65 Q 46 75 31 65 Z"
  fill="${W}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;

// Knoblauchsoße füllt den Mund und tropft vom Kinn
const sauce = `<path d="M 32 54 Q 36 53 40 55 Q 44 53 48 55 L 49 59 Q 44 61 40 59 Q 36 61 32 59 Z" fill="${SAUCE}" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>
  <path d="M 58 58 Q 61 57 62 59 Q 61 61 58 60 Z" fill="${SAUCE}" stroke="${INK}" stroke-width="1.6"/>
  <path d="M 35 66 Q 34 71 35.5 74 Q 37 76 38.5 74 Q 39.5 71 38.5 67 Z" fill="${SAUCE}" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>
  <path d="M 52 68 Q 51.5 73 53 77.5 Q 54.5 80 56 77.5 Q 57 73 55.5 68 Z" fill="${SAUCE}" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>
  <circle cx="54.5" cy="83" r="1.6" fill="${SAUCE}" stroke="${INK}" stroke-width="1.2"/>`;

// Abgebissenes Stück zwischen den Zähnen: Fleisch mit Salatzipfel, dazu Krümel
const chunk = `<path d="M 49 53 Q 55 52 60 55 Q 62 58 58 60 Q 53 61 49 59 Q 47 56 49 53 Z" fill="#8B4A22" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
  <path d="M 57 54 Q 62 51 64 55 Q 62 57 59 57 Z" fill="#6CBF45" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>
  <path d="M 51 56 Q 54 55 57 57" stroke="#C98446" stroke-width="1.3" fill="none"/>`;
const crumbs = `<circle cx="67" cy="64" r="1.6" fill="#EDB868" stroke="${INK}" stroke-width="1"/>
  <circle cx="69" cy="57" r="1.2" fill="#6CBF45" stroke="${INK}" stroke-width="0.8"/>`;

/** Döner im Fladenbrot, Mittelpunkt (0,0): Fleischberg, Salat, Tomate, rote Zwiebeln, Soße */
const doener = `<path d="M -22 -12 Q 0 -20 22 -12 L 21 -6 L -21 -6 Z" fill="#D9A050" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>
  <path d="M -21 -8 Q -24 -18 -16 -20 Q -12 -27 -4 -23 Q 2 -30 9 -24 Q 17 -27 19 -19 Q 26 -16 21 -8 Z" fill="#5DA83A" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M -17 -9 Q -18 -21 -8 -23 Q -1 -29 7 -24 Q 17 -22 17 -9 Z" fill="#8B4A22" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M -14 -12 Q -6 -16 2 -13 Q 9 -10 14 -13 M -15 -17 Q -7 -21 0 -18 Q 7 -15 13 -18 M -8 -22 Q -2 -25 5 -22" stroke="#C98446" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  <path d="M -12 -14 Q -4 -18 4 -15 M -10 -19 Q -3 -22 4 -20" stroke="#5E2E12" stroke-width="1.2" fill="none" stroke-linecap="round"/>
  <path d="M -24 -7 Q -25 -15 -19 -13 Q -17 -18 -12 -13 Q -9 -16 -6 -11 L 6 -11 Q 9 -16 12 -13 Q 17 -18 19 -13 Q 25 -15 24 -7 Z" fill="#6CBF45" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>
  <path d="M -19 -10 Q -17 -12 -15 -10 M 15 -10 Q 17 -12 19 -10" stroke="#3E7F25" stroke-width="1.4" fill="none"/>
  <circle cx="-19" cy="-14" r="3.6" fill="#D63A2A" stroke="${INK}" stroke-width="1.8"/>
  <circle cx="15" cy="-15" r="3.6" fill="#D63A2A" stroke="${INK}" stroke-width="1.8"/>
  <path d="M 13.5 -15 Q 15 -17 16.5 -15" stroke="#F3A99F" stroke-width="1" fill="none"/>
  <path d="M -6 -26 Q -2 -30 2 -26" stroke="#8E3B8E" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <path d="M 4 -24 Q 8 -28 12 -24" stroke="#8E3B8E" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <path d="M -15 -12 Q -9 -16 -4 -12 Q 1 -16 6 -12 Q 11 -16 16 -12" stroke="#FFF8E6" stroke-width="2.6" fill="none" stroke-linecap="round"/>
  <path d="M -23 -8 Q 0 -2 23 -8 Q 25 18 0 30 Q -25 18 -23 -8 Z" fill="#EDB868" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M -18 0 Q -16 6 -18 10 M 16 2 Q 18 8 15 12 M -4 8 Q 0 10 4 8 M -10 18 Q -6 21 -2 19 M 6 20 Q 10 18 12 15" stroke="#B8823A" stroke-width="2" fill="none" stroke-linecap="round"/>
  <ellipse cx="-9" cy="4" rx="1.3" ry="0.8" fill="#FFF3D6"/>
  <ellipse cx="9" cy="6" rx="1.3" ry="0.8" fill="#FFF3D6"/>
  <ellipse cx="0" cy="14" rx="1.3" ry="0.8" fill="#FFF3D6"/>
  <ellipse cx="-14" cy="12" rx="1.3" ry="0.8" fill="#FFF3D6"/>`;

// Biss: Maske schneidet die Ecke zum Mund heraus, die Zahnbögen werden nur innerhalb des Döners nachgezogen
const BITES = [
  [-25, -11, 8.5],
  [-17, -20, 7.5],
  [-27, 0, 6.5],
];
const SILHOUETTE =
  'M -24 -8 Q -26 -16 -19 -15 Q -18 -22 -8 -24 Q -1 -31 8 -25 Q 18 -24 19 -15 Q 26 -16 24 -8 Q 25 18 0 31 Q -25 18 -24 -8 Z';
const bitten = `<g transform="translate(79 63) rotate(-26) scale(0.74)">
  <defs>
    <mask id="jr-bite" maskUnits="userSpaceOnUse" x="-40" y="-40" width="80" height="80">
      <rect x="-40" y="-40" width="80" height="80" fill="white"/>
      ${BITES.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="black"/>`).join('')}
    </mask>
    <clipPath id="jr-shape"><path d="${SILHOUETTE}"/></clipPath>
  </defs>
  <g mask="url(#jr-bite)">${doener}</g>
  <g clip-path="url(#jr-shape)" fill="none" stroke="${INK}" stroke-width="2.8">
    ${BITES.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('')}
  </g>
</g>`;

export function jollyRogerBody({ mono = false } = {}) {
  const body = `${bone(46)}${bone(-46)}${cranium}${lower}${upper}${sauce}${chunk}${bitten}${crumbs}`;
  // Einfarbig (Android-Monochrom-Icon): alles weiss auf transparent, Konturen schwarz
  return mono
    ? body.replace(/fill="#(?!141414)[0-9A-Fa-f]{6}"/g, 'fill="#FFFFFF"').replace(/141414/g, '000000')
    : body;
}

export function jollyRogerSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${jollyRogerBody()}</svg>`;
}
