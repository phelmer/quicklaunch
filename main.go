package main

import (
	"context"
	"embed"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/windows"

	"quicklaunch/internal/tray"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	// Create an instance of the app structure
	app := NewApp()

	// Start system tray in a goroutine
	go func() {
		trayManager := tray.NewManager(
			tray.DefaultIcon,
			func() { app.ShowPanel() },  // onShow
			func() { app.QuitApp() },    // onQuit
		)
		app.SetTrayManager(trayManager)
		trayManager.Run()
	}()

	// Create application with options
	err := wails.Run(&options.App{
		Title:            "QuickLaunch",
		Width:            280,
		Height:           500,
		MinWidth:         280,
		MinHeight:        400,
		MaxWidth:         280,
		DisableResize:    true,
		Frameless:        true,
		StartHidden:      true,
		AlwaysOnTop:      true,
		BackgroundColour: &options.RGBA{R: 0, G: 0, B: 0, A: 0},
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		OnStartup:  app.startup,
		OnShutdown: app.shutdown,
		OnDomReady: app.domReady,
		OnBeforeClose: func(ctx context.Context) (prevent bool) {
			// Prevent close, just hide instead
			app.HidePanel()
			return true
		},
		Bind: []interface{}{
			app,
		},
		Windows: &windows.Options{
			WebviewIsTransparent:              true,
			WindowIsTranslucent:               false,
			DisableWindowIcon:                 true,
			DisableFramelessWindowDecorations: true,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
