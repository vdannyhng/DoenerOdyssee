# Döner Odyssee

Private App für unsere Crew: Döner-Läden („Inseln“) anlegen, Besuche ins Logbuch eintragen, jede Person
bewertet den Geschmack von 0–10. Die App zeigt die Top 10 als Wanted-Poster an einer Holzwand, die Flotte
(Tiers als Schiffe), alle Einzelnoten und Fotos pro Spot sowie Empfehlungen in der Schatzsuche.
Anforderungen: [doener-tierlist-anforderungen.md](doener-tierlist-anforderungen.md) · Roadmap: [docs/ROADMAP.md](docs/ROADMAP.md).

**Stack:** Expo SDK 57 · React Native · TypeScript (strict) · Expo Router · Supabase (Postgres, Auth, RLS,
Realtime) · TanStack Query · Zustand · Jest

## Setup (lokal mit Docker)

Voraussetzungen: Node 20+, Docker Desktop (läuft), Expo Go auf dem Handy.

```bash
npm install
npm run db:start          # lokale Supabase in Docker (Ports 553xx, kollidiert nicht mit TrainSched)
cp .env.example .env.local # PUBLISHABLE_KEY aus der Ausgabe von db:start eintragen
npm start                 # QR-Code mit Expo Go scannen
```

- `npm run db:reset` spielt Migrationen und Demo-Daten neu ein (löscht alle lokalen Daten).
- Supabase Studio: http://127.0.0.1:55323
- Handy und PC müssen im selben WLAN sein. Die App ersetzt `127.0.0.1` automatisch durch die IP des
  Dev-Servers ([src/lib/devHost.ts](src/lib/devHost.ts)). Blockiert die Windows-Firewall Port `55321`,
  einmalig freigeben.

### Demo-Daten (nur lokal)

[supabase/seed.sql](supabase/seed.sql) legt die Crew „Die Dürüm-Bande“ (Einladungscode `DEMO42`)
mit drei Piraten und zwölf Spots an. Die Logins stehen oben in der Datei.

## Befehle

| Befehl                 | Zweck                                                 |
| ---------------------- | ----------------------------------------------------- |
| `npm test`             | Unit-Tests (Berechnung, Duplikate, Sortierung, Daten) |
| `npm run test:rls`     | Prüft die Zugriffsregeln gegen die lokale Datenbank   |
| `npm run check`        | Typecheck + Lint + Prettier + Tests                   |
| `npm run db:types`     | TypeScript-Typen aus dem DB-Schema neu erzeugen       |
| `npm run test:secrets` | Secret-Scan                                           |

Ein Pre-Commit-Hook ([scripts/pre-commit.mjs](scripts/pre-commit.mjs)) prüft gestagte Dateien.

## Projektstruktur

```
src/app/            Screens (Expo Router): sign-in, onboarding, (app)/(tabs)/…, spots/…, visits/…
src/components/     UI-Bausteine (ui/) und eigene Illustrationen (art/: Jolly Roger, Avatare, Berry-Zeichen)
src/features/       auth, crew, logbook (Spots/Besuche/Noten), ranking (Berechnung, Wanted-Wand), spots
src/i18n/de.ts      Alle Texte der App
src/lib/            Supabase-Client, Env, Fehlermeldungen, Datum
src/theme/          Farben, Schriften, Abstände
supabase/           Migrationen (Schema + RLS) und Demo-Seed
```

## Regeln, die die App umsetzt

- **Gesamtwert:** pro Person Durchschnitt über ihre Besuche, dann Durchschnitt der Personen (jede Person
  zählt gleich). Tie-Break: mehr Bewerter → höhere Minimalnote → Name. Siehe
  [src/features/ranking/scoring.ts](src/features/ranking/scoring.ts).
- **Noten:** eingeben mit einer Nachkommastelle (0.1er-Schritte), Durchschnitte mit zwei Nachkommastellen.
- **Kopfgeld:** gerundeter Gesamtwert × 100 Mio. Berries (eigenes, nachgezeichnetes Berry-Zeichen).
- **Flotte (Tiers):** S Flaggschiff ≥ 9 · A Fregatte ≥ 8 · B Brigg ≥ 7 · C Schoner ≥ 5.5 · D Ruderboot ≥ 4 ·
  F Floß (Schwellen in den Crew-Einstellungen änderbar).
- **Fotos:** privater Bucket `photos`, Ordner je Crew, verkleinert auf 1280 px.
- **Schatzsuche:** Empfehlungen aus den Noten der Crew; Läden in der Nähe aus OpenStreetMap (Overpass).
- **Rechte (RLS):** Jede Person sieht alle Noten ihrer Crew, ändert aber nur die eigenen. Nur der
  Captain löscht Spots, entfernt Mitglieder und erneuert den Einladungscode.
- **Design:** eigener Piraten-Look ohne Originalbilder, -logos, -figuren oder -namen.

## Stand

M1 (MVP), M2 (Schnell-Logbuch, Fotos, Flotte, Schatzsuche) und M3 (Seekarte) sind umgesetzt. Als Nächstes kommt
M4 (Teilen & Statistik) – Details und alle weiteren Etappen in [docs/ROADMAP.md](docs/ROADMAP.md).

Für Supabase Cloud später ein Projekt anlegen, `npx supabase link` + `npx supabase db push` ausführen und
URL/Publishable Key in `.env.local` eintragen.
