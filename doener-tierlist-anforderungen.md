# Anforderungen: Döner Odyssee – die Döner-Rangliste unserer Crew

> Lebendes Dokument (Stand 2026-10-21). Es beschreibt, was die App können soll und welche Entscheidungen
> gefallen sind. Umsetzungsstand und Reihenfolge stehen in [docs/ROADMAP.md](docs/ROADMAP.md).

## 1. Vision

Eine Handy-App für unsere Freundesgruppe, die gemeinsam Döner-Läden ausprobiert. Jede Person bewertet den
Geschmack, die App rechnet daraus eine faire Rangliste und macht daraus eine Reise **im Stil von One Piece**:
Wir sind die Crew **„Die Dürüm-Bande“** auf der Suche nach dem One Döner, jeder Laden ist eine Insel, die
besten Döner hängen als Steckbriefe an der Wand.

**Nutzung: rein privat.** Kein Store-Release, keine Veröffentlichung, kein kommerzieller Zweck. Deshalb
dürfen wir uns beim Look frei bei One Piece bedienen (Steckbrief-Layout, Berries, Begriffe, Anspielungen).
Bilder und Logos zeichnen wir trotzdem selbst nach, damit alles einheitlich aussieht und scharf skaliert.

**Zielgruppe:** eine Crew mit ca. 3–10 Personen, jede mit eigenem Konto und eigenem Handy.

## 2. Technik

- **App:** Expo SDK 57 (passend zur aktuellen Expo Go), React Native, TypeScript strict, Expo Router.
  Getestet wird in Expo Go auf iOS und Android; Web läuft für Tests im Browser mit, ist aber kein Ziel.
- **Backend:** Supabase (Postgres, Auth, Row Level Security, Realtime, Storage).
  Zuerst **lokal in Docker** (`npm run db:start`, Ports 553xx, damit es neben TrainSched läuft),
  später optional ein Cloud-Projekt.
- **Daten im Client:** TanStack Query für Server-Daten, Zustand für kleine UI-Zustände.
- **Karte:** `react-native-maps` (läuft in Expo Go). iOS zeigt die Apple-Standardkarte, Android einen
  Pergament-Seekartenstil. Ortssuche und Adressen über OpenStreetMap (Nominatim), Läden in der Nähe über
  Overpass – beides ohne API-Key.
- **Qualität:** ESLint, Prettier, Jest für alle Rechen- und Hilfsfunktionen, ein Skript für die
  Zugriffsregeln (`npm run test:rls`), Pre-Commit-Hook mit Secret-Scan. Secrets nur in `.env.local`.
- **Sprache:** Deutsch mit ß, alle Texte zentral in `src/i18n/de.ts`. Währung für Preise: Euro.

## 3. Crew, Konten, Rechte

- Eine Person gehört zu genau einer Crew. Beitritt per **Einladungscode** (6 Zeichen).
- Login mit **E-Mail + Passwort** (Magic Links funktionieren in Expo Go nicht zuverlässig).
- Profil: Piratenname, einer von 8 gezeichneten Piraten-Avataren, Lieblingsfarbe.
- **Captain** (wer die Crew gründet): Mitglieder entfernen, Spots löschen, Code erneuern, Crew-Einstellungen.
- **Jede Person bewertet nur für sich selbst** und kann nur die eigenen Noten ändern oder löschen. Alle sehen
  alle Noten der Crew. Das erzwingt die Datenbank (RLS), nicht nur die App.

## 4. Kernfunktionen

### 4.1 Inseln (Döner-Läden)

- Name (Pflicht), Standort (Pflicht): Adresse suchen, aktueller Standort oder **Pin auf der Karte setzen**.
- Optional: Preis des klassischen Döners (€), Foto vom Laden, Notiz.
- Status ergibt sich automatisch: **Neue Welt** (noch keine Note, Wunschliste) oder **Erobert**.
- Duplikat-Warnung bei ähnlichem Namen oder weniger als 50 m Abstand.

### 4.2 Logbuch (Besuch eintragen) – so schnell wie möglich

Ein Eintrag soll in wenigen Sekunden erledigt sein, am Tisch, mit einer Hand:

- Großer **Logbuch-Knopf in der Mitte der Tab-Leiste**, von überall erreichbar.
- **Wo?** Läden in der Nähe stehen oben; steht man (unter 75 m) vor einem bekannten Laden, ist er schon
  gewählt. Ohne Standort: zuletzt besuchte zuerst. Unbekannter Laden: Namen tippen → direkt neu anlegen.
- **Note** eintippen (z. B. „8,7“) oder ganze Zahl antippen und mit ±0,1 feinjustieren.
- **Foto vom Döner** per Kamera oder Galerie (wird verkleinert, nur die Crew sieht es).
- **Wer war dabei?** – Avatare antippen, man selbst ist vorausgewählt.
- Datum, Gericht (Döner, Dürüm, Teller, Vegi, Sonstiges) und Kommentar sind eingeklappt.
- Die anderen tragen ihre Note auf dem eigenen Handy nach; die App zeigt ihnen „Deine Note fehlt“.

### 4.3 Berechnung

- **Noten** von 0 bis 10 mit **einer Nachkommastelle** (0,1er-Schritte).
- **Pro Person und Insel:** Durchschnitt über alle Besuche dieser Person.
- **Gesamtwert:** Durchschnitt der Personenwerte – jede Person zählt gleich, egal wie oft sie dort war.
- Anzeige mit **zwei Nachkommastellen**, intern ungerundet.
- Nur bewertete Inseln kommen ins Ranking; optional Mindestanzahl Bewerter (Crew-Einstellung, Standard 1).
- **Gleichstand:** 1. mehr Bewerter, 2. höherer niedrigster Personenwert, 3. Name alphabetisch.
- **Kopfgeld:** Gesamtwert × 100 Mio. **Berries**, z. B. 9,25 → ฿ 925.000.000–.

### 4.4 Wanted-Wand (Startseite)

- Top 10 als **One-Piece-Steckbriefe** an einer Holzwand: dunkler Rahmen, altes Papier, groß „WANTED“,
  das Döner-Foto, „DEAD OR ALIVE“, Name, Kopfgeld mit Berry-Zeichen, Kleingedrucktes und „MARINE“.
- Platz 1 groß, Platz 2–3 mittel, 4–10 klein; Wachssiegel mit Rang, leicht schief angenagelt.
- Hinweis, wenn eigene Noten fehlen; Link zu „Alle Spots“ (Suche, Sortierung nach Wert/Preis/Datum/Name).

### 4.5 Insel-Seite

- Kopf im Steckbrief-Look: Foto, Name, Adresse, Gesamtwert groß, Rang, Schiff/Tier, Kopfgeld, Preis.
- Noten aller Mitglieder als Balken mit Crew-Schnitt (wer bewertet strenger/milder), aufklappbar pro Besuch.
- Fotoalbum, Logbuch aller Besuche, „Neuer Besuch“ und „Route öffnen“ (Karten-App des Handys).

### 4.6 Ränge der Meere (statt klassischer Tier List)

Jeder Tier ist ein Rang aus der Welt von One Piece, dazu ein passendes Schiff; die Inseln hängen als
Wimpel daran:

| Tier | Rang              | Schiff                 | ab Note  |
| ---- | ----------------- | ---------------------- | -------- |
| S    | Yonko             | unsere **Flying Lamb** | 9,00     |
| A    | Admiral           | Fregatte               | 8,00     |
| B    | Samurai der Meere | Brigg                  | 7,00     |
| C    | Supernova         | Schoner                | 5,50     |
| D    | East Blue         | Ruderboot              | 4,00     |
| F    | Impel Down        | Floß                   | darunter |

Schwellen sind in den Einstellungen der Bande änderbar. Der Tier steht immer auch als Buchstabe da.

### 4.7 Grand Line (Tab mit Logport-Symbol)

- Umschalter **Karte / Schatzsuche**.
- Karte: Inseln als Marker in Rang-Farbe, Neue Welt grau; **gestrichelte Reiseroute** in Besuchsreihenfolge;
  Filter (Alle, Top 10, Neue Welt, je Rang); Pins bündeln sich bei vielen Inseln; Vorschaukarte beim
  Antippen; „Mein Standort“ und „Alle zeigen“.
- **Schatzsuche:** „Die Bande empfiehlt dir“ (gut bewertet, von dir noch nicht probiert), Neue Welt und
  unbekannte Döner-Läden im Umkreis von 2 km aus OpenStreetMap – mit „In die Neue Welt“ und Link zu
  den Google-Maps-Bewertungen. Die Funde erscheinen auch auf der Karte.

### 4.8 Piratenbande & Einstellungen

- Banden-Seite: Jolly Roger, Name der Bande, Anzahl Inseln/Abenteuer, Mitglieder mit Rolle an Bord
  (Smutje, Navigatorin, Schwertkämpfer, Musiker …), Einladungscode; Käpt’n schickt über die Planke.
- Einstellungen: Profil; für den Käpt’n Name der Bande, Währung, Mindestbewerter, Rang-Schwellen;
  pro Gerät Tag/Nachtfahrt (Dunkelmodus) und „Animationen reduzieren“.

## 5. Look & Feel

- **One-Piece-Abenteuer:** Pergament, Ozeanblau, Rot, Gold, dunkles Holz. Dunkelmodus „Nachtfahrt“.
- **Schriften:** Bangers für Überschriften, Abril Fatface auf den Steckbriefen, Nunito für Fließtext.
- **Eigene Zeichnungen:** Jolly Roger (Totenkopf mit Dönerbrot-Hut, Dönerspieße als Knochen, auf schwarzer
  Flagge = App-Icon), Flying Lamb, Logport, Steckbrief-Icon, Berry-Zeichen, Schiffe, Avatare, Döner.
- **Tab-Leiste:** Wanted (Steckbrief) · Ränge (Flying Lamb) · **Logbuch (großer Feder-Knopf)** ·
  Grand Line (Logport) · Bande (Piratenhut).
- **Begriffe aus One Piece:** Bande, Käpt’n, Berries, Grand Line, Neue Welt, Steckbrief, Marine,
  „Ich werde König der Döner!“.
- **Textton:** augenzwinkernd wie die Serie („Neue Insel entdeckt!“, „Über die Planke schicken“), aber klar.
- **Bedienbarkeit vor Deko:** Touch-Ziele ≥ 44 pt, gute Kontraste, Screenreader-Beschriftungen, nie nur
  Farbe als Information, gestaltete Lade-, Leer- und Fehlerzustände, haptisches Feedback beim Bewerten.

## 6. Datenmodell

- `crews` (Name, Einladungscode, Einstellungen als JSON)
- `members` (Crew, Konto, Name, Avatar, Farbe, Rolle captain/pirate)
- `spots` (Crew, Name, Adresse, Koordinaten, Preis, Foto-Pfad, Notiz, angelegt von)
- `visits` (Insel, Datum, Gericht, Foto-Pfad, angelegt von) + `visit_participants`
- `ratings` (Besuch, Mitglied, Note 0–10 mit 1 Nachkommastelle, Kommentar, Zusatznoten als JSON) – eine
  Note pro Person und Besuch
- Fotos im privaten Storage-Bucket `photos`, ein Ordner pro Crew, Zugriff nur für die Crew.
- Gesamtwert, Rang, Tier und Kopfgeld werden **nicht gespeichert**, sondern in der App berechnet (getestet).

## 7. Nicht-funktional

- Startseite lädt in unter 2 s; Skelett-Platzhalter beim Laden.
- Neue Noten und Besuche der anderen erscheinen live (Realtime), ohne Neuladen.
- Standort nur bei aktiver Nutzung (Logbuch, Karte, Schatzsuche), es werden nur Insel-Koordinaten gespeichert.
- Offline: zuletzt geladene Daten lesbar (geplant), Fehlermeldungen statt Endlos-Laden.

## 8. Weitere Ideen (aus meiner Sicht sinnvoll, nach Priorität)

1. **Teilen:** Steckbrief, Ränge oder Banden-Statistik als Bild in den Gruppenchat.
2. **Crew-Statistiken:** strengster/mildester Pirat, größte Meinungsverschiedenheit, günstigster Döner,
   Preis-Leistungs-Ranking, „Dönerflation“ (Preisverlauf).
3. **Zusatzkategorien** pro Bewertung (Fleisch, Soße, Brot, Frische, Preis-Leistung) – nur zur Info, nicht
   im Gesamtwert.
4. **Blind-Modus:** Noten der anderen erst sehen, wenn man selbst bewertet hat (gegen Gruppendruck).
5. **Kopfgeld-Erhöhung:** Wenn ein Laden im Ranking steigt, gibt es eine kleine „Kopfgeld erhöht!“-Animation;
   neuer Platz 1 mit Konfetti.
6. **Achievements/Titel:** „Erste Insel“, „10 Inseln erobert“, „Perfekte 10“, „Stammgast“, „Kartograf“.
7. **Abstimmung „Nächster Kurs“:** Inseln für den nächsten Ausflug vorschlagen, Crew stimmt ab.
8. **Push:** „Deine Note fehlt“, „Neue Insel auf der Karte“.
9. **Cloud & Installation:** Supabase-Cloud und Web-App (PWA) bzw. interne Builds, damit die App ohne
   laufenden PC funktioniert.

## 9. Entschieden (statt offener Fragen)

| Frage                     | Entscheidung                                            |
| ------------------------- | ------------------------------------------------------- |
| App-Name / Crew           | Döner Odyssee / Die Dürüm-Bande                         |
| Bewerten                  | Jede Person auf dem eigenen Handy, nur eigene Noten     |
| Mehrere Besuche           | Durchschnitt pro Person, dann Durchschnitt der Personen |
| Was zählt                 | Nur Geschmack; Zusatzkategorien später, nur zur Info    |
| Notenformat               | Eingabe 1 Nachkommastelle, Anzeige 2 Nachkommastellen   |
| Backend                   | Supabase, zuerst lokal in Docker                        |
| Kartenstil                | iOS Standardkarte, Android Seekartenstil                |
| Währung / Kopfgeld        | Euro für Preise, Berries fürs Kopfgeld                  |
| Läden außerhalb der Stadt | Erlaubt, Karte zoomt auf alle Inseln                    |
| Urheberrecht              | Rein private Nutzung – One-Piece-Anspielungen erlaubt   |
