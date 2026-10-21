// Erzeugt App-Icon, Android-Adaptive-Icon, Splash und Favicon aus dem Jolly-Roger-Motiv
// (gleiche Vorlage wie in der App: src/components/art/jollyRogerSvg.js).
// Aufruf: node scripts/make-icons.mjs <ordner-mit-node_modules/@resvg/resvg-js>
import { writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

import { jollyRogerBody } from '../src/components/art/jollyRogerSvg.js';

const require = createRequire(path.join(process.argv[2] ?? process.cwd(), 'noop.js'));
const { Resvg } = require('@resvg/resvg-js');

/** Motiv skaliert (scale) und zentriert in einer 100er-Fläche */
const placed = (scale, mono = false) =>
  `<g transform="translate(${50 - 50 * scale} ${50 - 50 * scale}) scale(${scale})">${jollyRogerBody({ mono })}</g>`;

// Schwarze Piratenflagge mit leichtem Faltenwurf auf Meeresblau
const background = `
  <defs>
    <radialGradient id="sea" cx="50%" cy="35%" r="75%">
      <stop offset="0%" stop-color="#2A6BB0"/>
      <stop offset="100%" stop-color="#0D2A4D"/>
    </radialGradient>
  </defs>
  <rect width="100" height="100" fill="url(#sea)"/>
  <path d="M 12 16 Q 31 11 50 16 T 88 16 L 88 84 Q 69 89 50 84 T 12 84 Z" fill="#141414"/>
  <path d="M 12 16 Q 31 11 50 16 T 88 16" fill="none" stroke="#2B2B2B" stroke-width="1.2"/>`;

const svg = (body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${body}</svg>`;

const out = (name, content, size) => {
  const png = new Resvg(content, { fitTo: { mode: 'width', value: size } }).render().asPng();
  writeFileSync(path.join('assets', 'images', name), png);
  console.log('✓', name);
};

out('icon.png', svg(background + placed(0.74)), 1024);
out('favicon.png', svg(background + placed(0.8)), 48);
// Android: Vordergrund muss in die sichere Zone (innere ~66 %) passen; Hintergrundfarbe aus app.json
out('android-icon-foreground.png', svg(placed(0.6)), 1024);
out('android-icon-monochrome.png', svg(placed(0.6, true)), 1024);
out('splash-icon.png', svg(placed(1)), 512);
writeFileSync(path.join('assets', 'images', 'jolly-roger.svg'), svg(placed(1)));
