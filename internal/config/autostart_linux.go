//go:build linux

package config

import (
	"os"
	"path/filepath"
	"text/template"
)

const desktopEntryTemplate = `[Desktop Entry]
Type=Application
Name=QuickLaunch
Comment=Quick application launcher
Exec={{.ExecPath}}
Icon=quicklaunch
Terminal=false
Categories=Utility;
X-GNOME-Autostart-enabled=true
`

// SetAutoStart enables or disables autostart on Linux via XDG desktop entry
func SetAutoStart(enabled bool) error {
	configDir, err := os.UserConfigDir()
	if err != nil {
		return err
	}

	autostartDir := filepath.Join(configDir, "autostart")
	desktopFile := filepath.Join(autostartDir, "quicklaunch.desktop")

	if !enabled {
		err := os.Remove(desktopFile)
		if os.IsNotExist(err) {
			return nil
		}
		return err
	}

	// Create autostart directory if it doesn't exist
	if err := os.MkdirAll(autostartDir, 0755); err != nil {
		return err
	}

	// Get executable path
	execPath, err := os.Executable()
	if err != nil {
		return err
	}
	execPath = filepath.Clean(execPath)

	// Create desktop entry file
	f, err := os.Create(desktopFile)
	if err != nil {
		return err
	}
	defer f.Close()

	tmpl, err := template.New("desktop").Parse(desktopEntryTemplate)
	if err != nil {
		return err
	}

	return tmpl.Execute(f, map[string]string{"ExecPath": execPath})
}

// IsAutoStartEnabled checks if autostart is enabled on Linux
func IsAutoStartEnabled() bool {
	configDir, err := os.UserConfigDir()
	if err != nil {
		return false
	}

	desktopFile := filepath.Join(configDir, "autostart", "quicklaunch.desktop")
	_, err = os.Stat(desktopFile)
	return err == nil
}
