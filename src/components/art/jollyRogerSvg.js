// Gemeinsame Vorlage für das Crew-Logo: in der App (JollyRoger.tsx) und für das App-Icon
// (scripts/make-icons.mjs). Flacher Flaggen-Stil: dicke Konturen, weisser Schädel, Dönerbrot als Hut,
// gekreuzte Dönerspiesse als Knochen. Eigene Gestaltung. Bewusst JavaScript (ESM), damit Node
// die Datei direkt laden kann.

const INK = '#141414';

/** Ein Dönerspiess: weisser Stab mit Knochen-Knauf hinten und Spitze vorne, Fleischkegel in der Mitte */
function spit(angle) {
  return `<g transform="translate(50 56) rotate(${angle})">
    <path d="M -3 -52 L 3 -52 L 3 40 L 0 47 L -3 40 Z" fill="#FFFFFF" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="-4.2" cy="-53" r="5" fill="#FFFFFF" stroke="${INK}" stroke-width="3"/>
    <circle cx="4.2" cy="-53" r="5" fill="#FFFFFF" stroke="${INK}" stroke-width="3"/>
    <rect x="-3" y="-52" width="6" height="6" fill="#FFFFFF"/>
    <path d="M -10 20 Q 0 16 10 20 L 6 36 Q 0 38.5 -6 36 Z" fill="#9A5527" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M -8 26 Q 0 28.5 8 26 M -7 31 Q 0 33.5 7 31" stroke="#C98446" stroke-width="2" fill="none"/>
  </g>`;
}

export function jollyRogerBody({ mono = false } = {}) {
  const body = `${spit(48)}${spit(-48)}
  <path d="M 50 24 C 31 24 23 37 24 50 C 25 59 30 63 36 65 L 36 73 Q 50 79 64 73 L 64 65 C 70 63 75 59 76 50 C 77 37 69 24 50 24 Z"
        fill="#FFFFFF" stroke="${INK}" stroke-width="3.4" stroke-linejoin="round"/>
  <ellipse cx="40.5" cy="50" rx="7.2" ry="8" fill="${INK}"/>
  <ellipse cx="59.5" cy="50" rx="7.2" ry="8" fill="${INK}"/>
  <path d="M 50 57 L 46 63.5 L 54 63.5 Z" fill="${INK}"/>
  <path d="M 43 67 V 75 M 50 67.5 V 76.5 M 57 67 V 75" stroke="${INK}" stroke-width="2.6"/>
  <path d="M 21 31 Q 32 24 50 24 Q 68 24 79 31 L 79 35 Q 50 28 21 35 Z" fill="#5DA83A" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>
  <circle cx="31" cy="30.5" r="3" fill="#D63A2A" stroke="${INK}" stroke-width="1.6"/>
  <circle cx="69" cy="30.5" r="3" fill="#D63A2A" stroke="${INK}" stroke-width="1.6"/>
  <path d="M 18 31 Q 20 8 50 7 Q 80 8 82 31 Q 50 23 18 31 Z" fill="#EDB868" stroke="${INK}" stroke-width="3.4" stroke-linejoin="round"/>
  <path d="M 33 17 Q 37 14.5 41 17 M 56 13.5 Q 60 11 64 13.5 M 46 21 Q 50 18.5 54 21" stroke="#B8823A" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
  // Einfarbig (Android-Monochrom-Icon): alles weiss auf transparent, Augen/Nase ausgespart
  return mono
    ? body.replace(/fill="#(?!141414)[0-9A-Fa-f]{6}"/g, 'fill="#FFFFFF"').replace(/141414/g, '000000')
    : body;
}

export function jollyRogerSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${jollyRogerBody()}</svg>`;
}
