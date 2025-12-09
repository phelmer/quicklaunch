//go:build windows

package config

import (
	"os"
	"path/filepath"

	"golang.org/x/sys/windows/registry"
)

const (
	registryKey = `Software\Microsoft\Windows\CurrentVersion\Run`
	appName     = "QuickLaunch"
)

// SetAutoStart enables or disables autostart with Windows
func SetAutoStart(enabled bool) error {
	key, err := registry.OpenKey(registry.CURRENT_USER, registryKey, registry.SET_VALUE)
	if err != nil {
		return err
	}
	defer key.Close()

	if enabled {
		// Get the path to the current executable
		exe, err := os.Executable()
		if err != nil {
			return err
		}
		exePath := filepath.Clean(exe)

		// Set the registry value
		return key.SetStringValue(appName, exePath)
	}

	// Delete the registry value (ignore error if not exists)
	_ = key.DeleteValue(appName)
	return nil
}

// IsAutoStartEnabled checks if autostart is enabled
func IsAutoStartEnabled() bool {
	key, err := registry.OpenKey(registry.CURRENT_USER, registryKey, registry.QUERY_VALUE)
	if err != nil {
		return false
	}
	defer key.Close()

	_, _, err = key.GetStringValue(appName)
	return err == nil
}
