# Döner Odyssee – Roadmap

Stand: 2026-10-21 · **M1 ✅ · M2 ✅ · M3 ✅** · M4 Teilen & Statistik · M5 Spielspass · M6 Cloud & Release

## Definition of Done (gilt für jeden Meilenstein)

- Läuft in Expo Go auf Android und iOS (ab Push in M5 ein Dev Build).
- `npm run check` ist grün: `tsc --noEmit`, ESLint, Prettier, Jest.
- `npm run test:rls` ist grün (Zugriffsregeln gegen die lokale Datenbank).
- Jeder neue UI-Text steht in `src/i18n/de.ts`.
- Eigener Piraten-Look ohne Originalbilder, -logos, -figuren oder -namen aus One Piece.
- README ist aktualisiert, ein Commit pro Meilenstein (z. B. `feat(log): quick log with nearby spots`).

Legende: **[Du]** = Schritt, den du manuell machen musst (Konten, Gerätetest, Entscheidungen).

---

## M1 – Fundament & MVP ✅

- Expo SDK 57, TypeScript strict, Expo Router, ESLint, Prettier, Jest, secretlint + Pre-Commit-Hook.
- Theme (Pergament, Ozeanblau, Rot, Gold, Holz) mit Dunkelmodus „Nachtfahrt“, Schriften Pirata One + Nunito, eigene Illustrationen (Jolly Roger mit Dönerspiessen, 8 Piraten-Avatare, Taler-Münze), App-Icon.
- Supabase lokal (Docker, Ports 553xx): `crews`, `members`, `spots`, `visits`, `visit_participants`, `ratings`, RPCs für Crew gründen/beitreten/Code erneuern/Mitglied entfernen, RLS, Realtime.
- Login mit E-Mail + Passwort, Crew per Einladungscode, Captain-Rechte.
- Spots mit Adresssuche (OpenStreetMap/Nominatim) oder GPS, Duplikat-Warnung (< 50 m oder ähnlicher Name).
- Besuche + Bewertungen, Wanted-Wand (Top 10 als Poster mit Kopfgeld), Spot-Detail mit Einzelnoten als Balken, Alle Spots mit Suche/Sortierung, Einstellungen.
- **Tests:** Berechnung (Durchschnitt pro Person, Tie-Breaks, Rundung), Duplikate, Sortierung, Datum; 20 RLS-Prüfungen.

## M2 – Logbuch, Fotos, Flotte, Schatzsuche ✅

- **Schnell-Logbuch** über den grossen Knopf in der Tab-Leiste: Laden in der Nähe wird vorgeschlagen (unter 75 m automatisch gewählt), neuer Laden direkt aus der Suche, Note, Foto und Crew auf einer Seite, Details eingeklappt.
- **Noten** eintippbar mit einer Nachkommastelle (0.1er-Schritte), Durchschnitte mit zwei Nachkommastellen.
- **Fotos** per Kamera oder Galerie, verkleinert (1280 px, JPEG), privater Storage-Bucket je Crew mit Signed URLs; Fotoalbum auf der Spot-Seite, Titelbild auf dem Wanted-Poster, Foto nachträglich am Besuch.
- **Flotte** statt Tier List: S Flaggschiff · A Fregatte · B Brigg · C Schoner · D Ruderboot · F Floss, Spots als Wimpel.
- **Schatzsuche:** „Die Crew empfiehlt dir“ (gut bewertet, von dir noch nicht probiert), Wunschliste, unentdeckte Döner-Läden im Umkreis von 2 km aus OpenStreetMap (Overpass) mit „Auf die Wunschliste“ und Link zu Google-Maps-Bewertungen.
- **Tests:** Noten-Eingabe, Entfernung, Overpass-Auswertung, Empfehlungen.

## M3 – Seekarte („Grand Line“ der Crew) ✅

- Karte mit `react-native-maps` (Expo Go): Spots als Insel-Marker in Tier-Farbe, Wunschliste grau.
- Gestrichelte Reiseroute in chronologischer Reihenfolge der Besuche („unsere Odyssee“).
- Vorschaukarte beim Antippen (Name, Gesamtwert, Rang) → Detailseite; „Mein Standort“, „Alle Spots zeigen“.
- Filter: Top 10, Wunschliste, nach Schiff/Tier; Clustering bei vielen Spots.
- Karte als Umschalter in der Schatzsuche (Liste/Karte) – auch die OSM-Funde erscheinen dort.
- Pin auf der Karte setzen beim Anlegen eines Spots.
- **Entschieden:** iOS zeigt die Apple-Standardkarte, Android den Pergament-Seekartenstil (Google Maps).
- **Umgesetzt:** Tab „Seekarte“ mit Umschalter Karte/Schatzsuche; Insel-Marker mit Tier-Buchstabe auf Sandbank, Wunschliste grau mit „?“, OSM-Funde als Kompass-Marker; gestrichelte Route (nur Filter „Alle“); Raster-Clustering ab 25 Markern, Antippen zoomt hinein; Vorschaukarte mit „Ansehen“ und „Route“; Pin-Setzen per Antippen oder Ziehen, Adresse per Nominatim. Im Browser gibt es statt der Karte einen Hinweis.
- **Tests:** Reiseroute, Filter, Kartenausschnitt, Clustering.
- **[Du] offen:** Karte auf dem Handy in Expo Go ausprobieren (Marker, Route, Pin setzen).

## M4 – Teilen & Statistik

- Wanted-Poster und Flotte als Bild teilen (Share-Sheet, `react-native-view-shot`), z. B. für den Gruppenchat.
- Crew-Statistiken: strengster/mildester Pirat, Schnitt pro Person, meistbesuchter Spot, grösste Meinungsverschiedenheit (Standardabweichung), günstigster/teuerster Döner, Preis-Leistungs-Ranking.
- Zusatzkategorien pro Bewertung (Fleisch, Sosse, Brot, Frische, Preis-Leistung) – nur Detailansicht, nicht im Gesamtwert.
- Export der Rangliste als CSV.
- Offline: gecachte Daten lesbar, Eintrag ins Logbuch wird bei Funkloch zwischengespeichert und später gesendet.

## M5 – Spielspass

- **Blind-Modus:** Noten der anderen erst sichtbar, wenn man selbst bewertet hat (serverseitig per RLS/View).
- **Titel & Achievements:** „Erste Insel“, „10 Inseln erobert“, „Perfekte 10“, „Kartograf“ (5 Städte), „Stammgast“ (5× derselbe Laden).
- **Abstimmung „Nächster Kurs“:** Spots für den nächsten Ausflug vorschlagen, Crew stimmt ab.
- **Push:** „Neuer Besuch – deine Note fehlt“, „Neue Insel auf der Karte“, Ergebnis der Abstimmung (braucht Dev Build).
- Animationen: Zähler beim Gesamtwert, Konfetti bei neuem Platz 1, Wellen-Hintergrund (respektiert „Animationen reduzieren“).
- **[Du]:** Expo-Konto + `eas init` für Push, Gerätetest.

## M6 – Cloud & Release

- Supabase-Projekt in der Cloud (EU), `supabase link` + `db push`, Registrierung nur mit Einladungscode.
- Entweder Web/PWA über EAS Hosting (wie TrainSched) oder interne Builds (EAS, TestFlight/Play Internal).
- Datenschutz-Kurztext in der App (nur Spot-Koordinaten, keine Bewegungsdaten, Fotos nur für die Crew).
- Konto löschen und Crew verlassen.
- **[Du]:** Supabase-Konto/Projekt anlegen, entscheiden: PWA oder App-Builds.

---

## Backlog (Ideen, priorisiert)

1. **Bewertungen anderer Seiten einbinden** (Google/Tripadvisor-Sterne direkt in der App) – braucht kostenpflichtige API-Keys; bis dahin der Link „Bewertungen ansehen“.
2. **Döner-Pass:** Stempel pro Stadt/Bezirk, Fortschritt „12 von 23 Bezirken erobert“.
3. **Mehrere Crews** pro Person (z. B. Arbeit + Freunde).
4. **Preisverlauf:** Döner-Preis pro Besuch erfassen, „Dönerflation“-Diagramm.

## Offene Punkte / Risiken

- **Overpass/Nominatim** sind kostenlos, aber mit Fair-Use-Limits – Suchen nur auf Knopfdruck. Fällt der Dienst aus, zeigt die Schatzsuche einen Hinweis.
- **Expo Go und SDK:** Expo Go unterstützt immer nur die aktuelle SDK. Nach einem Expo-Update `npx expo install --fix`.
- **Fotos im Gratis-Tier:** 1 GB Storage reicht für ~5 000 Fotos (≈ 200 KB je Bild).
