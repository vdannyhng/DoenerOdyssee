# Anforderungen: Döner Grand Line – die Döner-Tier-List-App

> Dokument für Claude Code. Bitte zuerst komplett lesen, dann einen Umsetzungsplan vorschlagen und phasenweise (siehe Abschnitt 11) bauen.

## 1. Vision

Eine mobile App für eine Freundesgruppe, die gemeinsam Döner-Läden ausprobiert. Jede Person bewertet den Geschmack von 0–10. Die App zeigt pro Laden alle Einzelbewertungen, den berechneten Gesamtwert, eine Top-10-Rangliste, eine Tier List und eine Karte aller Spots.

Das Ganze ist als **Reise im One-Piece-Stil** gedacht: Die Gruppe ist eine Piratenbande auf der Suche nach dem „One Döner" (dem besten Döner). Jeder Laden ist eine Insel auf der Grand Line.

**Zielgruppe:** geschlossene Gruppe von Freunden (ca. 3–10 Personen). Keine öffentliche App, kein App-Store-Release nötig (Nutzung über Expo Go bzw. Development/Internal Build).

## 2. Technische Rahmenbedingungen

- **Framework:** Expo (aktuelle stabile SDK), React Native, **TypeScript** (strict), Expo Router (dateibasiertes Routing). Gleiche Grundstruktur wie die Anwendung „TrainSched".
- **Plattformen:** iOS und Android, Test über Expo Go. Web optional, nicht Ziel.
- **Backend:** Gemeinsame Daten sind Pflicht, da mehrere Personen bewerten. Empfehlung: **Supabase** (Postgres, Auth, Row Level Security, Realtime, Storage für Fotos, Gratis-Tier reicht). Falls das Projekt bewusst ohne Backend starten soll, Datenzugriff hinter einer Repository-Schicht kapseln, damit Backend später austauschbar ist.
- **Karte:** `react-native-maps` (funktioniert in Expo Go) oder `expo-maps`, je nach Stand der SDK. Ortssuche/Geocoding über `expo-location` plus Geocoding-API (z. B. Nominatim/OpenStreetMap, kein Kreditkarten-Key nötig). Falls Google-Maps-Keys nötig wären, vorher nachfragen.
- **State/Daten:** TanStack Query für Server-State, kleine lokale Stores (Zustand) für UI-State.
- **Qualität:** ESLint, Prettier, TypeScript strict, Unit-Tests für die Berechnungslogik (Abschnitt 5), `.env`-basierte Konfiguration, keine Secrets im Repo.
- **Sprache der App:** Deutsch (Texte in zentraler i18n-Datei, damit später änderbar).

## 3. Rollen und Zugang

- **Crew (Gruppe):** Eine App-Instanz = eine Crew. Beitritt per Einladungscode.
- **Mitglieder („Piraten"):** Name/Spitzname, Avatar (Auswahl aus vordefinierten, selbst erstellten Piraten-Avataren oder Foto), Lieblingsfarbe.
- **Captain (Ersteller der Crew):** kann Mitglieder entfernen, Spots löschen, Einladungscode erneuern.
- **Login:** einfach halten (Magic-Link per E-Mail oder E-Mail+Passwort über Supabase Auth). Kein Social Login nötig.
- Jede Person darf nur **ihre eigenen Bewertungen** bearbeiten oder löschen, sieht aber alle Bewertungen der Crew (per RLS erzwingen).

## 4. Kernfunktionen (MVP)

### 4.1 Döner-Spot („Insel") anlegen

Felder:

- Name des Ladens (Pflicht)
- Standort: Adresse suchen oder Pin auf der Karte setzen oder aktuellen Standort verwenden (Pflicht, speichert Koordinaten + Adresse)
- Preis des klassischen Döners (optional, Währung standardmässig CHF, einstellbar)
- Foto (optional)
- Notiz (optional)
- Status: **„Entdeckt"** (noch nicht probiert, Wunschliste) oder **„Erobert"** (mindestens eine Bewertung vorhanden)

Duplikat-Warnung, wenn ein Spot mit sehr ähnlichem Namen oder nahen Koordinaten (< 50 m) existiert.

### 4.2 Besuch („Expedition") erfassen

Ein Besuch gehört zu einem Spot und hat ein Datum und eine Teilnehmerliste. Pro Teilnehmer wird eine Bewertung abgegeben.

- Datum (Standard: heute)
- Teilnehmer (Mehrfachauswahl aus Crew)
- Optional: Was wurde gegessen (Döner Kebab, Dürüm, Teller, Vegi, Sonstiges)
- Optional: Foto vom Döner
- Jeder Teilnehmer vergibt seine **Geschmacksnote von 0 bis 10** (Schritte von 0.5; Slider oder +/- Buttons, gut bedienbar mit einer Hand)
- Optional pro Bewertung: kurzer Kommentar
- Bewertungen können **unabhängig voneinander** abgegeben werden: Jeder trägt seine Note auf dem eigenen Handy ein, der Besuch füllt sich nach und nach. Optional „Blind-Modus": Bewertungen der anderen sind erst sichtbar, wenn man selbst bewertet hat (oder alle fertig sind), damit man sich nicht beeinflusst.

### 4.3 Berechnung des Gesamtwerts

- **Pro Person und Spot:** Durchschnitt über alle Besuche dieser Person (bei einem Besuch = die Note).
- **Gesamtwert des Spots:** Durchschnitt der Personen-Werte (jede Person zählt gleich, auch wenn sie öfter dort war).
- Auf eine Nachkommastelle runden, intern ungerundet speichern/berechnen.
- Spots ohne Bewertung erscheinen nicht im Ranking.
- Optionale Mindestanzahl Bewerter für das Ranking (Einstellung der Crew, Standard 1).
- Tie-Break bei Gleichstand: 1. mehr Bewerter, 2. höhere Minimalnote, 3. Name alphabetisch.
- Berechnungslogik als reine, getestete Funktionen (Unit-Tests mit Randfällen: 0 Bewertungen, unterschiedlich viele Besuche pro Person, Gleichstand).

### 4.4 Top-10-Ranking („Wanted-Liste")

- Startscreen zeigt die Top 10 nach Gesamtwert.
- Platz 1–3 als Podium/hervorgehoben.
- Jeder Eintrag zeigt: Rang, Name, Gesamtwert, Anzahl Bewerter, kleines Foto.
- Tippen öffnet die Detailseite.
- Link „Alle Spots" zur vollständigen Liste mit Sortierung (Gesamtwert, Preis, Entfernung, zuletzt besucht) und Suche.

### 4.5 Spot-Detailseite

- Kopfbereich: Foto, Name, Adresse, Gesamtwert gross, Rang, Tier.
- **Bewertungen aller Mitglieder** nebeneinander: Avatar, Name, Note (bei mehreren Besuchen: Durchschnitt, aufklappbar mit einzelnen Besuchen).
- Balken-/Radar-Vergleich der Einzelnoten (wer bewertet strenger/milder).
- Besuchsverlauf (Datum, Teilnehmer, Fotos, Kommentare).
- Button „Route öffnen" (öffnet Karten-App des Handys) und „Neuen Besuch erfassen".

### 4.6 Tier List

- Eigene Ansicht, die alle bewerteten Spots in Tiers einteilt:
  - **S** ≥ 9.0, **A** ≥ 8.0, **B** ≥ 7.0, **C** ≥ 5.5, **D** ≥ 4.0, **F** < 4.0
  - Schwellen in den Crew-Einstellungen anpassbar.
- Darstellung wie klassische Tier List (farbige Zeilen, Spot-Kacheln mit Bild/Initialen).
- Tier-Namen im Thema (z. B. S = „Yonko-Klasse", A = „Admiral", B = „Supernova", C = „Piratenjäger", D = „Marine-Rekrut", F = „Schiffbrüchig"; bitte frei, aber konsistent).
- Als Bild exportier- und teilbar (Share-Sheet), z. B. für den Gruppenchat.

### 4.7 Karte („Grand Line")

- Alle Spots als Pins; Pinfarbe oder -icon nach Tier bzw. Status (Entdeckt = graue/„unerforschte" Insel, Erobert = farbig).
- Tippen auf Pin: Vorschau-Karte (Name, Gesamtwert, Rang) mit Button zur Detailseite.
- Button „Mein Standort" und „Alle Spots zeigen" (Zoom auf alle Pins).
- Filter: nur Top 10, nur Wunschliste, nach Tier.
- Optional: Marker-Clustering bei vielen Spots.
- Kartenstil an Theme angepasst (Pergament-/Seekarten-Look), sofern mit gewählter Kartenlösung machbar. Sonst Standardkarte mit thematischen Markern.

## 5. Weitere Funktionen (bewusst ergänzt)

Nach Priorität sortiert. Alles ausser 5.1 ist Phase 2 oder später.

1. **Wunschliste „Entdeckt"** (siehe 4.1): Spots vormerken, die man noch probieren will; nach dem ersten Besuch wechselt der Status automatisch.
2. **Zusatzkategorien (optional pro Bewertung):** Fleisch, Sauce, Brot, Frische, Preis-Leistung (je 0–10). Sie fliessen **nicht** in den Gesamtwert ein, der basiert nur auf dem Geschmack. Dienen nur der Detailansicht.
3. **Crew-Statistiken:** strengster/mildester Bewerter, durchschnittliche Note pro Person, Anzahl Besuche, meistbesuchter Spot, grösste Meinungsverschiedenheit (höchste Standardabweichung), günstigster/teuerster Döner, Preis-Leistungs-Ranking.
4. **Kopfgeld-Gimmick („Bounty"):** Jeder Spot hat ein fiktives Kopfgeld, abgeleitet vom Gesamtwert (z. B. Wert × 100 Mio. „Berry"-ähnlich, **eigene Währung ohne Originalmarken, z. B. „Taler"**). Wird in Wanted-Poster-Karten angezeigt.
5. **Titel/Achievements:** z. B. „Erster Besuch", „10 Spots erobert", „Perfekte 10 vergeben", „Karten-Entdecker" (5 Spots in 5 verschiedenen Orten). Rein spielerisch, Phase 3.
6. **Push-Benachrichtigungen (optional):** „Neuer Besuch erfasst, bewerte jetzt!", „Neuer Spot auf der Karte".
7. **Spot-Vorschläge/Voting:** Mitglieder können Spots für den nächsten Ausflug vorschlagen; Crew stimmt ab.
8. **Entfernungs-Sortierung:** „Döner in meiner Nähe".
9. **Export:** Ranking als CSV oder Bild.
10. **Datenschutz:** Standort nur bei aktiver Nutzung abfragen, nur Spot-Koordinaten speichern, nie Nutzerbewegungen.

## 6. Design und Theme („One-Piece-Stil")

**Wichtig (Urheberrecht):** Es sollen **keine Originalbilder, -Logos, -Charaktere oder -Schriften** von One Piece verwendet werden. Stattdessen ein **eigenständiger, davon inspirierter Piraten-Abenteuer-Look** mit eigenen Illustrationen/Icons. Namen wie „Strohhut", „Berry" oder Charaktere nicht verwenden.

Stil-Elemente:

- **Farbwelt:** Pergament/Beige (Hintergrund), Ozeanblau, Rot, Gold, dunkles Holzbraun. Dark Mode optional („Nachtfahrt").
- **Wanted-Poster** als Kartenstil für Spots (Papiertextur, „WANTED"-Kopf, Foto, Name, Kopfgeld = Gesamtwert-Anzeige).
- **Seekarte/Grand Line** für die Kartenansicht, Kompass-Icon, gestrichelte Reiserouten zwischen besuchten Spots in chronologischer Reihenfolge (zeigt die „Reise").
- **Jolly-Roger-Logo** der Crew (eigene Gestaltung, z. B. Totenkopf mit Döner-Spiess oder Dönerbrot als Hut), anpassbarer Crew-Name.
- **Navigation:** Bottom Tabs mit thematischen Icons: Ranking (Krone), Karte (Kompass), Tier List (Flagge/Rangabzeichen), Crew/Profil (Piratenhut).
- **Typografie:** Abenteuer-/Comic-Schrift für Überschriften (z. B. Google Fonts „Pirata One", „Bangers" o. Ä. via `expo-font`/`@expo-google-fonts`), gut lesbare Schrift für Fliesstext.
- **Animationen (dezent, mit `react-native-reanimated`):** Podium-Einblendung, Zähler-Animation für den Gesamtwert, Konfetti bei neuem Platz 1, Wellen-Hintergrund. Haptisches Feedback bei Bewertung (`expo-haptics`). Option „Animationen reduzieren".
- **Textton:** augenzwinkernd, z. B. „Neue Insel entdeckt!", „Kopfgeld ausgesetzt", „Besuch eintragen = Logbuch schreiben". Konsistent und nicht übertrieben.
- **Bedienbarkeit hat Vorrang:** grosse Touch-Ziele (min. 44 pt), klare Kontraste, Bewertung in max. 3 Taps abgeschlossen, Ladezustände/Leerzustände/Fehlerzustände gestaltet (z. B. leere Top 10: „Noch keine Insel erobert, setzt die Segel!").

## 7. Screens (Übersicht)

1. **Onboarding/Login/Crew beitreten oder erstellen**
2. **Ranking (Home):** Top 10, Button „Neuer Besuch"
3. **Alle Spots:** Liste, Suche, Sortierung, Filter
4. **Spot-Detail** (4.5)
5. **Spot anlegen/bearbeiten** (4.1)
6. **Besuch erfassen / Bewertung abgeben** (4.2)
7. **Tier List** (4.6)
8. **Karte** (4.7)
9. **Crew:** Mitglieder, Statistiken, Einladungscode
10. **Einstellungen:** Profil, Tier-Schwellen, Blind-Modus, Mindestbewerter, Währung, Dark Mode, Animationen

## 8. Datenmodell (Vorschlag)

- `crews` (id, name, invite_code, settings jsonb)
- `members` (id, crew_id, user_id, display_name, avatar, color, role)
- `spots` (id, crew_id, name, address, lat, lng, price, photo_url, note, status, created_by, created_at)
- `visits` (id, spot_id, date, meal_type, photo_url, created_by)
- `visit_participants` (visit_id, member_id)
- `ratings` (id, visit_id, member_id, taste_score numeric(3,1) CHECK 0..10, comment, extra_scores jsonb, created_at) mit UNIQUE (visit_id, member_id)
- Berechnete Werte (Gesamtwert, Rang, Tier) als **View/Funktion** oder client-seitig mit getesteter Logik, nicht doppelt speichern.
- RLS: Zugriff nur für Mitglieder der Crew; Ratings nur vom Besitzer änderbar.

## 9. Nicht-funktionale Anforderungen

- Ladezeit der Startseite < 2 s bei normaler Verbindung; Skeleton-Loader.
- Offline: gecachte Daten lesbar; Schreibaktionen mit klarer Fehlermeldung oder Warteschlange (Phase 2).
- Realtime-Updates (neue Bewertungen erscheinen ohne manuelles Neuladen).
- Barrierefreiheit: Labels für Screenreader, nicht nur Farbe als Information (Tier zusätzlich als Buchstabe).
- Fotos beim Upload verkleinern (`expo-image-manipulator`).
- Saubere Projektstruktur (`app/`, `components/`, `features/`, `lib/`, `theme/`), README mit Setup (Expo, Supabase, `.env.example`).

## 10. Abnahmekriterien (MVP)

- Ich kann eine Crew erstellen, Freunde per Code einladen und Spots anlegen.
- Jeder Freund kann pro Besuch seine Note 0–10 abgeben; alle Einzelnoten und der Gesamtwert sind auf der Spot-Seite sichtbar.
- Die Top 10 stimmt rechnerisch (Unit-Tests grün) und aktualisiert sich nach neuer Bewertung.
- Die Tier List und die Karte zeigen alle bewerteten Spots korrekt.
- Das Theme ist durchgängig im Piraten-Look, ohne urheberrechtlich geschützte Elemente.
- App läuft fehlerfrei in Expo Go auf iOS und Android.

## 11. Umsetzungsphasen

1. **Phase 1 (MVP):** Projekt-Setup, Theme-System, Auth + Crew, Spots, Besuche + Bewertungen, Berechnungslogik + Tests, Top 10, Spot-Detail.
2. **Phase 2:** Karte, Tier List (inkl. Bild-Export), Wunschliste, Fotos, Realtime, Statistiken.
3. **Phase 3:** Zusatzkategorien, Blind-Modus, Achievements, Voting, Push, Feinschliff der Animationen.

## 12. Offene Punkte / Annahmen

Falls nichts anderes entschieden wird, gelten die Annahmen in Klammern:

1. Wie viele Personen sind in der Gruppe? (3–10)
2. Soll jede Person pro Besuch separat bewerten oder tragen wir alle Noten gemeinsam auf einem Handy ein? (beides unterstützt)
3. Zählt ein Spot mit mehreren Besuchen als Durchschnitt oder zählt nur der letzte Besuch? (Durchschnitt, siehe 4.3)
4. Backend Supabase okay, oder lieber ohne Backend (nur lokal/Export)? (Supabase)
5. Soll nur der Geschmack zählen oder auch Preis-Leistung in den Gesamtwert einfliessen? (nur Geschmack)
6. Sollen Läden ausserhalb der Heimatregion erlaubt sein (Reisen, Städtetrips)? (ja, Karte zoomt auf alle Pins)
7. Gewünschter App-Name? (Arbeitstitel: „Döner Grand Line")
