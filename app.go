package main

import (
	"context"
	"time"

	"github.com/wailsapp/wails/v2/pkg/runtime"
	"golang.design/x/hotkey"
	"golang.design/x/hotkey/mainthread"

	"quicklaunch/internal/config"
	"quicklaunch/internal/focus"
	"quicklaunch/internal/tray"
)

// App struct
type App struct {
	ctx          context.Context
	isVisible    bool
	hk           *hotkey.Hotkey
	trayManager  *tray.Manager
	config       *config.Config
	focusMonitor *focus.Monitor
}

// NewApp creates a new App application struct
func NewApp() *App {
	// Load configuration
	cfg, _ := config.Load()

	return &App{
		config: cfg,
	}
}

// SetTrayManager sets the tray manager reference
func (a *App) SetTrayManager(tm *tray.Manager) {
	a.trayManager = tm
}

// startup is called when the app starts
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	// Start hotkey registration on main thread
	go mainthread.Init(func() {
		a.registerHotkey()
	})

	// Start focus monitor to hide panel when focus is lost
	a.focusMonitor = focus.NewMonitor(func() {
		if a.isVisible {
			a.HidePanel()
		}
	})
}

// domReady is called when the DOM is ready
func (a *App) domReady(ctx context.Context) {
	a.positionWindow()
}

// shutdown is called when the app is shutting down
func (a *App) shutdown(ctx context.Context) {
	if a.hk != nil {
		a.hk.Unregister()
	}

	// Stop focus monitor
	if a.focusMonitor != nil {
		a.focusMonitor.Stop()
	}

	// Save configuration
	if a.config != nil {
		a.config.Save()
	}

	// Quit tray
	if a.trayManager != nil {
		a.trayManager.Quit()
	}
}

// QuitApp quits the application
func (a *App) QuitApp() {
	if a.hk != nil {
		a.hk.Unregister()
	}
	if a.config != nil {
		a.config.Save()
	}
	runtime.Quit(a.ctx)
}

// registerHotkey registers the global hotkey (Ctrl+Space)
func (a *App) registerHotkey() {
	a.hk = hotkey.New([]hotkey.Modifier{hotkey.ModCtrl}, hotkey.KeySpace)
	if err := a.hk.Register(); err != nil {
		println("Failed to register hotkey:", err.Error())
		return
	}

	for range a.hk.Keydown() {
		a.TogglePanel()
	}
}

// positionWindow positions the window on the left edge of the primary screen
func (a *App) positionWindow() {
	// Position window on the left edge with fixed height
	x := 0
	y := 50 // Small offset from top
	runtime.WindowSetPosition(a.ctx, x, y)
	runtime.WindowSetSize(a.ctx, 280, 500)
}

// TogglePanel toggles the launcher panel visibility
func (a *App) TogglePanel() {
	if a.isVisible {
		a.HidePanel()
	} else {
		a.ShowPanel()
	}
}

// ShowPanel shows the launcher panel
func (a *App) ShowPanel() {
	a.isVisible = true
	a.positionWindow()
	runtime.WindowShow(a.ctx)
	runtime.WindowSetAlwaysOnTop(a.ctx, true)

	// Delay focus operations to allow window to fully render
	go func() {
		time.Sleep(50 * time.Millisecond)

		// Bring window to foreground and set focus
		focus.SetForeground()

		runtime.EventsEmit(a.ctx, "panel:show")

		// Start monitoring for focus loss after focus is established
		time.Sleep(100 * time.Millisecond)
		if a.focusMonitor != nil {
			a.focusMonitor.Start()
		}
	}()
}

// HidePanel hides the launcher panel
func (a *App) HidePanel() {
	// Stop monitoring for focus loss
	if a.focusMonitor != nil {
		a.focusMonitor.Stop()
	}

	a.isVisible = false
	runtime.EventsEmit(a.ctx, "panel:hide")
	runtime.WindowHide(a.ctx)
}

// IsVisible returns the current visibility state
func (a *App) IsVisible() bool {
	return a.isVisible
}

// ExecuteAction executes an action based on type
func (a *App) ExecuteAction(actionType, target string) error {
	return executeAction(actionType, target, "")
}

// ExecuteActionWithPath executes an action with a specific path
func (a *App) ExecuteActionWithPath(actionType, target, path string) error {
	return executeAction(actionType, target, path)
}

// OpenFolderDialog opens a native folder selection dialog
func (a *App) OpenFolderDialog() (string, error) {
	return runtime.OpenDirectoryDialog(a.ctx, runtime.OpenDialogOptions{
		Title:                "Ordner auswählen",
		CanCreateDirectories: false,
		ShowHiddenFiles:      false,
	})
}

// --- Config & Autostart Methods (exposed to frontend) ---

// GetAutoStartEnabled returns whether autostart is enabled
func (a *App) GetAutoStartEnabled() bool {
	return config.IsAutoStartEnabled()
}

// SetAutoStart enables or disables autostart with Windows
func (a *App) SetAutoStart(enabled bool) error {
	err := config.SetAutoStart(enabled)
	if err == nil && a.config != nil {
		a.config.StartWithWindows = enabled
		a.config.Save()
	}
	return err
}

// GetConfig returns the current configuration
func (a *App) GetConfig() *config.Config {
	return a.config
}

// SaveConfig saves the current configuration
func (a *App) SaveConfig() error {
	if a.config != nil {
		return a.config.Save()
	}
	return nil
}

// UpdateConfig updates and saves the configuration
func (a *App) UpdateConfig(theme, position string, animation, blur bool, recentFoldersLimit int) error {
	if a.config != nil {
		a.config.Theme = theme
		a.config.Position = position
		a.config.Animation = animation
		a.config.Blur = blur
		a.config.RecentFoldersLimit = recentFoldersLimit
		return a.config.Save()
	}
	return nil
}

// --- Tile Methods ---

// GetTiles returns all tiles from config
func (a *App) GetTiles() []config.Tile {
	if a.config != nil {
		return a.config.Tiles
	}
	return []config.Tile{}
}

// SaveTiles saves all tiles to config
func (a *App) SaveTiles(tiles []config.Tile) error {
	if a.config != nil {
		a.config.Tiles = tiles
		return a.config.Save()
	}
	return nil
}

// AddTile adds a new tile to config
func (a *App) AddTile(tile config.Tile) error {
	if a.config != nil {
		a.config.Tiles = append(a.config.Tiles, tile)
		return a.config.Save()
	}
	return nil
}

// UpdateTile updates an existing tile by ID
func (a *App) UpdateTile(id string, tile config.Tile) error {
	if a.config != nil {
		for i, t := range a.config.Tiles {
			if t.ID == id {
				a.config.Tiles[i] = tile
				return a.config.Save()
			}
		}
	}
	return nil
}

// RemoveTile removes a tile by ID
func (a *App) RemoveTile(id string) error {
	if a.config != nil {
		for i, t := range a.config.Tiles {
			if t.ID == id {
				a.config.Tiles = append(a.config.Tiles[:i], a.config.Tiles[i+1:]...)
				return a.config.Save()
			}
		}
	}
	return nil
}
