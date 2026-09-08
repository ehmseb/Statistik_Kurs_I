# Statistik-Kurs NWW an der KSK

Der Kurs ist eine statische Webseite. Er benötigt keine Datenbank und speichert den Lernfortschritt nur im Browser der jeweiligen Person.

## Inhalt

- `index.html`: Startseite und Kursinhalte
- `styles.css`: Gestaltung
- `app.js`: Übungen und Interaktionen
- `server.js` und `package.json`: Start auf Railway
- `materialien/`: Begleitheft als PDF und Word-Datei sowie die Excel-Beispiele

## Lokal testen

Node.js ab Version 18 installieren und im Projektordner ausführen:

```bash
npm start
```

Danach `http://localhost:3000` öffnen.

## Auf GitHub Pages veröffentlichen

1. Auf GitHub ein neues Repository erstellen.
2. Alle Dateien aus diesem Ordner in die oberste Ebene des Repositorys hochladen.
3. Unter **Settings → Pages** bei **Build and deployment** die Option **Deploy from a branch** auswählen.
4. Branch `main` und Ordner `/ (root)` auswählen und speichern.
5. Nach kurzer Zeit zeigt GitHub dort die Adresse der Webseite an.

Für GitHub Pages werden `server.js` und `package.json` nicht benötigt; sie stören aber nicht.

## Auf Railway veröffentlichen

1. Den Ordner zuerst in ein GitHub-Repository hochladen.
2. In Railway **New Project → Deploy from GitHub repo** wählen.
3. Das Repository auswählen.
4. Railway erkennt `package.json` und startet automatisch `npm start`.
5. Unter **Settings → Networking → Generate Domain** eine Webadresse erzeugen.

Es sind keine Umgebungsvariablen nötig. Railway stellt die Variable `PORT` automatisch bereit.

## Kurs anpassen

- Texte und Kapitel: `index.html`
- Farben und Darstellung: `styles.css`
- Aufgaben, Daten und Berechnungen: `app.js`

Nach Änderungen die Dateien erneut zu GitHub hochladen oder committen. GitHub Pages beziehungsweise Railway veröffentlicht die neue Fassung automatisch.
