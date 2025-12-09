package tray

import (
	"github.com/getlantern/systray"
)

// Manager handles the system tray functionality
type Manager struct {
	onShow func()
	onQuit func()
	icon   []byte
}

// NewManager creates a new tray manager
func NewManager(icon []byte, onShow, onQuit func()) *Manager {
	return &Manager{
		icon:   icon,
		onShow: onShow,
		onQuit: onQuit,
	}
}

// Run starts the system tray (blocking)
func (m *Manager) Run() {
	systray.Run(m.onReady, m.onExit)
}

// Quit stops the system tray
func (m *Manager) Quit() {
	systray.Quit()
}

func (m *Manager) onReady() {
	systray.SetIcon(m.icon)
	systray.SetTitle("QuickLaunch")
	systray.SetTooltip("QuickLaunch - Drücke Ctrl+Space zum Öffnen")

	// Menu items
	mShow := systray.AddMenuItem("Öffnen", "QuickLaunch öffnen")
	systray.AddSeparator()
	mQuit := systray.AddMenuItem("Beenden", "QuickLaunch beenden")

	// Handle menu clicks in goroutine
	go func() {
		for {
			select {
			case <-mShow.ClickedCh:
				if m.onShow != nil {
					m.onShow()
				}
			case <-mQuit.ClickedCh:
				if m.onQuit != nil {
					m.onQuit()
				}
				systray.Quit()
				return
			}
		}
	}()
}

func (m *Manager) onExit() {
	// Cleanup when tray exits
}
