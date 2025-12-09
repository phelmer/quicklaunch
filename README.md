# QuickLaunch

Ein schneller Desktop-Launcher mit konfigurierbaren Kacheln, gebaut mit Wails v2, React 19 und Tailwind CSS 4.

## Features

- **Globaler Hotkey**: `Ctrl+Space` zum Öffnen/Schließen
- **Konfigurierbare Kacheln**: Apps, Ordner, URLs und PowerShell-Befehle
- **Schnellzugriff**: Tasten 1-9 für direkten Zugriff auf Kacheln
- **Untermenüs**: Zuletzt verwendete Ordner für schnellen Zugriff
- **Themes**: Dunkel, Hell und System-Modus
- **Autostart**: Optional mit dem System starten

## Download

Releases für Windows, Linux und macOS sind auf der [Releases-Seite](../../releases) verfügbar.

| Plattform | Datei |
|-----------|-------|
| Windows | `QuickLaunch-vX.X.X-windows-amd64.exe` |
| Linux | `QuickLaunch-vX.X.X-linux-amd64` |
| macOS | `QuickLaunch-vX.X.X-macos-universal.zip` |

## Tastenkürzel

| Taste | Aktion |
|-------|--------|
| `Ctrl+Space` | Panel öffnen/schließen |
| `1-9` | Kachel direkt ausführen |
| `ESC` | Untermenü/Overlay schließen |
| `Pfeiltasten` | Navigation |
| `Enter` | Auswahl bestätigen |

## Entwicklung

### Voraussetzungen

- [Go 1.24+](https://go.dev/dl/)
- [Node.js 20+](https://nodejs.org/)
- [Wails CLI](https://wails.io/docs/gettingstarted/installation)

### Setup

```bash
# Wails CLI installieren
go install github.com/wailsapp/wails/v2/cmd/wails@latest

# Frontend-Abhängigkeiten installieren
cd frontend && npm install && cd ..

# Live-Entwicklung mit Hot Reload
wails dev

# Produktions-Build erstellen
wails build
```

## Release erstellen

Releases werden automatisch über GitHub Actions erstellt:

```bash
# Version taggen und pushen
git tag v1.0.0
git push origin v1.0.0
```

GitHub Actions baut dann automatisch für alle Plattformen und erstellt ein Release.

## Konfiguration

Die Konfiguration wird gespeichert unter:
- **Windows**: `%APPDATA%\QuickLaunch\config.json`
- **Linux**: `~/.config/QuickLaunch/config.json`
- **macOS**: `~/Library/Application Support/QuickLaunch/config.json`

## Bekannte Probleme

### Fokus-Problem beim ersten Öffnen (Windows)

Beim ersten Öffnen des Panels nach dem App-Start erhält das Suchfeld möglicherweise keinen automatischen Fokus. Dies ist eine bekannte Einschränkung von Windows, die `SetForegroundWindow` nur unter bestimmten Bedingungen erlaubt.

**Workaround**: Nach dem ersten manuellen Klick in das Panel funktioniert der Fokus bei allen weiteren Öffnungen korrekt.

### Linux/macOS Support

Die App baut und startet auf allen Plattformen. Autostart und Focus-Handling sind aktuell nur für Windows implementiert.

## Technologie-Stack

- **Backend**: Go mit Wails v2
- **Frontend**: React 19, TypeScript, Tailwind CSS 4
- **Animationen**: Motion (Framer Motion)
- **State Management**: Zustand
- **Icons**: Lucide React
- **CI/CD**: GitHub Actions

## Lizenz

MIT
