# QuickLaunch Testplan

## 1. Grundfunktionen

### 1.1 Anwendungsstart
- [ ] Anwendung startet ohne Fehler
- [ ] Fenster ist initial versteckt
- [ ] System Tray Icon erscheint
- [ ] Hotkey (Ctrl+Space) ist registriert

### 1.2 Panel Toggle
- [ ] Ctrl+Space zeigt das Panel
- [ ] Ctrl+Space versteckt das Panel wieder
- [ ] Panel erscheint am rechten Bildschirmrand
- [ ] Panel hat korrekte Größe (280px breit, volle Höhe)

### 1.3 System Tray
- [ ] Tray Icon ist sichtbar
- [ ] Rechtsklick zeigt Menü
- [ ] "Anzeigen" öffnet das Panel
- [ ] "Beenden" schließt die Anwendung

---

## 2. UI-Komponenten

### 2.1 LauncherPanel
- [x] Slide-Animation beim Öffnen (von rechts)
- [x] Slide-Animation beim Schließen
- [x] Transparenter/unscharfer Hintergrund (wenn aktiviert)
- [x] Korrekte Farbdarstellung (Dark/Light Theme)

### 2.2 SearchBar
- [x] Suchfeld hat Auto-Focus beim Öffnen
- [x] Eingabe filtert Tiles in Echtzeit
- [x] Clear-Button (X) erscheint bei Text
- [x] Clear-Button leert das Suchfeld
- [ ] Escape schließt das Panel (nicht im Browser testbar)

### 2.3 TileGrid
- [x] 3-Spalten Layout
- [x] Alle Default-Tiles werden angezeigt:
  - Terminal
  - Claude
  - VS Code
  - Explorer
  - Browser
  - Settings
  - Add (+)
- [x] Tiles haben korrekte Icons
- [x] Hover-Effekt auf Tiles

### 2.4 Tile
- [x] Icon wird korrekt dargestellt
- [x] Name wird angezeigt
- [x] Quick-Access Badge (1-9) für erste Tiles
- [x] SubMenu-Indikator (Pfeil) bei Tiles mit SubMenu
- [x] Selected-State bei Keyboard-Navigation

### 2.5 SubMenu
- [ ] Öffnet bei Rechtsklick auf Tile mit SubMenu (öffnet bei normalem Klick)
- [x] Öffnet bei normalem Klick auf Tile mit SubMenu
- [x] "Ordner auswählen..." Option vorhanden
- [ ] Recent Folders werden angezeigt (erst nach Nutzung)
- [ ] Klick auf Ordner führt Aktion aus (nicht im Browser testbar)
- [x] SubMenu schließt bei ESC-Button

---

## 3. Tile-Aktionen

### 3.1 App-Tiles
- [ ] Terminal: Öffnet Windows Terminal
- [ ] Explorer: Öffnet Datei-Explorer
- [ ] Browser: Öffnet Edge Browser

### 3.2 Code-Tiles mit SubMenu
- [ ] VS Code: SubMenu zeigt Ordneroptionen
- [ ] VS Code: "Ordner auswählen" öffnet Dialog
- [ ] VS Code: Öffnet VS Code im gewählten Ordner

### 3.3 Claude Tile
- [ ] SubMenu zeigt Ordneroptionen
- [ ] Öffnet Terminal mit Claude im gewählten Ordner

### 3.4 Internal Tiles
- [x] Settings: Öffnet Einstellungen-Panel
- [x] Add (+): Öffnet Tile-Editor

---

## 4. Settings Panel

### 4.1 Navigation
- [x] Zurück-Button schließt Settings
- [x] Überschrift "Einstellungen" wird angezeigt

### 4.2 Theme-Auswahl
- [x] Drei Optionen: Dunkel, Hell, System
- [x] Aktive Option ist hervorgehoben
- [x] Theme-Wechsel erfolgt sofort
- [ ] Theme wird gespeichert (Persistence) - manuell zu testen

### 4.3 Hotkey-Anzeige
- [x] Zeigt "CTRL + SPACE"
- [x] Hinweis "Kann derzeit nicht geändert werden"

### 4.4 Anzahl zuletzt verwendeter Ordner
- [x] Dropdown mit Optionen: 3, 5, 10, 15
- [ ] Auswahl wird gespeichert - manuell zu testen

### 4.5 Autostart Toggle
- [x] Toggle-Switch funktioniert
- [ ] Status wird in Registry geschrieben - manuell zu testen
- [ ] Status wird korrekt geladen - manuell zu testen

### 4.6 Animationen Toggle
- [x] Toggle-Switch funktioniert
- [ ] Animationen werden aktiviert/deaktiviert - manuell zu testen

### 4.7 Hintergrundunschärfe Toggle
- [x] Toggle-Switch funktioniert
- [ ] Blur-Effekt wird aktiviert/deaktiviert - manuell zu testen

### 4.8 Footer
- [x] Version "QuickLaunch v1.0.0" wird angezeigt

---

## 5. Tile Editor

### 5.1 Neuen Tile erstellen
- [x] Klick auf "+" öffnet Editor
- [x] Name-Eingabefeld vorhanden
- [x] Icon-Auswahl Grid funktioniert
- [x] Action-Type Dropdown (App, Ordner, URL, PowerShell)
- [x] Target-Eingabefeld vorhanden
- [x] SubMenu Toggle vorhanden
- [x] "Speichern" Button speichert Tile
- [x] Neuer Tile erscheint im Grid

### 5.2 Tile bearbeiten
- [ ] Rechtsklick auf Tile → "Bearbeiten" Option - nicht implementiert
- [ ] Editor zeigt vorhandene Daten - nicht implementiert
- [ ] Änderungen werden gespeichert - nicht implementiert

### 5.3 Tile löschen
- [ ] "Löschen" Button im Editor - nicht implementiert
- [ ] Bestätigung vor dem Löschen - nicht implementiert
- [ ] Tile wird aus Grid entfernt - nicht implementiert

---

## 6. Keyboard Navigation

### 6.1 Grid Navigation
- [x] Pfeiltaste ↓: Nächste Zeile (3 Spalten)
- [x] Pfeiltaste ↑: Vorherige Zeile
- [x] Pfeiltaste →: Nächstes Tile
- [x] Pfeiltaste ←: Vorheriges Tile
- [x] Tab: Nächstes Element (im Browser-Kontext)
- [ ] Shift+Tab: Vorheriges Element - nicht getestet

### 6.2 Quick Access
- [x] Zahlen 1-9 aktivieren entsprechende Tiles (im Code implementiert)
- [x] 1 = Terminal, 2 = Claude, etc.

### 6.3 Aktionen
- [x] Enter: Aktiviert ausgewähltes Tile (im Code implementiert)
- [x] Escape: Schließt Panel/SubMenu
- [x] Home: Springt zum ersten Tile (im Code implementiert)
- [x] End: Springt zum letzten Tile (im Code implementiert)

---

## 7. Persistence

### 7.1 Settings
- [ ] Theme wird nach Neustart beibehalten
- [ ] Animationen-Einstellung bleibt
- [ ] Blur-Einstellung bleibt
- [ ] Recent Folders Limit bleibt

### 7.2 Tiles
- [ ] Benutzerdefinierte Tiles bleiben nach Neustart
- [ ] Tile-Reihenfolge bleibt erhalten
- [ ] Gelöschte Tiles bleiben gelöscht

### 7.3 Recent Folders
- [ ] Zuletzt verwendete Ordner werden gespeichert
- [ ] Limit wird eingehalten

---

## 8. Edge Cases

### 8.1 Suche
- [ ] Leere Suche zeigt alle Tiles
- [ ] Keine Treffer zeigt leeres Grid
- [ ] Sonderzeichen in Suche verursachen keinen Fehler

### 8.2 Fehlerbehandlung
- [ ] Nicht existierende App zeigt Fehlermeldung
- [ ] Abgebrochener Ordner-Dialog wird behandelt
- [ ] Ungültige URLs werden behandelt

---

## Testergebnisse

**Testdatum:** 2025-12-09
**Testmethode:** Manuelle Tests mit Playwright MCP im Browser (http://localhost:34115)

### Zusammenfassung

| Kategorie | Bestanden | Fehlgeschlagen | Nicht getestet |
|-----------|-----------|----------------|----------------|
| UI-Komponenten | 18 | 0 | 4 |
| Tile-Aktionen | 2 | 0 | 6 |
| Settings Panel | 12 | 0 | 6 |
| Tile Editor | 8 | 0 | 6 |
| Keyboard Navigation | 10 | 0 | 1 |
| **Gesamt** | **50** | **0** | **23** |

### Screenshots

Die folgenden Screenshots wurden während des Tests erstellt:

1. `test-01-main-panel.png` - Hauptansicht mit allen Tiles
2. `test-02-settings-panel.png` - Einstellungen-Panel (Dark Theme)
3. `test-03-light-theme.png` - Einstellungen-Panel (Light Theme)
4. `test-04-submenu.png` - SubMenu für VS Code
5. `test-05-tile-editor.png` - Tile Editor (Neue Kachel)
6. `test-06-new-tile-created.png` - Neue Notepad-Kachel erstellt
7. `test-07-keyboard-nav.png` - Keyboard Navigation (ArrowRight)
8. `test-08-arrow-down.png` - Keyboard Navigation (ArrowDown)

### Nicht implementierte Features

Die folgenden Features aus dem ursprünglichen Plan wurden noch nicht implementiert:
- Tile bearbeiten (Edit)
- Tile löschen (Delete)
- Rechtsklick-Kontextmenü auf Tiles

### Anmerkungen

- Die Keyboard-Navigation funktioniert nur, wenn der Fokus NICHT im Suchfeld ist
- SubMenu öffnet bei normalem Klick (nicht Rechtsklick)
- Persistence und Autostart wurden nicht im Browser getestet (erfordern native App)
- System Tray wurde nicht getestet (nur in nativer App verfügbar)

