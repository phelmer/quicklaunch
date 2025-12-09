//go:build darwin

package config

import (
	"os"
	"path/filepath"
	"text/template"
)

const launchAgentTemplate = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.quicklaunch.app</string>
    <key>ProgramArguments</key>
    <array>
        <string>{{.ExecPath}}</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <false/>
</dict>
</plist>
`

// SetAutoStart enables or disables autostart on macOS via LaunchAgent
func SetAutoStart(enabled bool) error {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return err
	}

	launchAgentsDir := filepath.Join(homeDir, "Library", "LaunchAgents")
	plistFile := filepath.Join(launchAgentsDir, "com.quicklaunch.app.plist")

	if !enabled {
		err := os.Remove(plistFile)
		if os.IsNotExist(err) {
			return nil
		}
		return err
	}

	// Create LaunchAgents directory if it doesn't exist
	if err := os.MkdirAll(launchAgentsDir, 0755); err != nil {
		return err
	}

	// Get executable path
	execPath, err := os.Executable()
	if err != nil {
		return err
	}
	execPath = filepath.Clean(execPath)

	// Create plist file
	f, err := os.Create(plistFile)
	if err != nil {
		return err
	}
	defer f.Close()

	tmpl, err := template.New("plist").Parse(launchAgentTemplate)
	if err != nil {
		return err
	}

	return tmpl.Execute(f, map[string]string{"ExecPath": execPath})
}

// IsAutoStartEnabled checks if autostart is enabled on macOS
func IsAutoStartEnabled() bool {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return false
	}

	plistFile := filepath.Join(homeDir, "Library", "LaunchAgents", "com.quicklaunch.app.plist")
	_, err = os.Stat(plistFile)
	return err == nil
}
