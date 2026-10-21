// Pre-Commit: schnelle Prüfungen auf den gestagten Dateien, Typecheck auf dem ganzen Projekt.
// Notfalls überspringen mit `git commit --no-verify`.
import { execFileSync, spawnSync } from 'node:child_process';

const staged = execFileSync('git', ['diff', '--cached', '--name-only', '--diff-filter=ACMR'], {
  encoding: 'utf8',
})
  .split('\n')
  .map((f) => f.trim())
  .filter(Boolean);

if (staged.length === 0) process.exit(0);

// Werkzeuge direkt über Node starten – ohne Shell, damit Dateinamen nie als Befehle interpretiert werden
const BIN = {
  secretlint: 'node_modules/secretlint/bin/secretlint.js',
  prettier: 'node_modules/prettier/bin/prettier.cjs',
  eslint: 'node_modules/eslint/bin/eslint.js',
  tsc: 'node_modules/typescript/bin/tsc',
};
const run = (label, [tool, ...args]) => {
  process.stdout.write(`› ${label} … `);
  const res = spawnSync(process.execPath, [BIN[tool], ...args], {
    stdio: ['ignore', 'pipe', 'pipe'],
    encoding: 'utf8',
  });
  if (res.status === 0) {
    console.log('ok');
    return true;
  }
  console.log('FEHLER\n' + (res.stdout || '') + (res.stderr || ''));
  return false;
};

const code = staged.filter((f) => /\.(ts|tsx|js|mjs)$/.test(f));
const formattable = staged.filter((f) => /\.(ts|tsx|js|mjs|json|md|yml|yaml|css)$/.test(f));

const results = [
  run('Secret-Scan', ['secretlint', '--maskSecrets', '--', ...staged]),
  formattable.length ? run('Prettier', ['prettier', '--check', '--', ...formattable]) : true,
  code.length ? run('ESLint', ['eslint', '--max-warnings=0', '--no-warn-ignored', '--', ...code]) : true,
  code.length ? run('Typecheck', ['tsc', '--noEmit']) : true,
];

if (results.includes(false)) {
  console.log('\nCommit abgebrochen – bitte Fehler oben beheben.');
  process.exit(1);
}
