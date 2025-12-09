package main

import (
	"os/exec"
	"path/filepath"
)

// executeAction executes an action based on type
func executeAction(actionType, target, path string) error {
	switch actionType {
	case "app":
		return launchApp(target, path)
	case "folder":
		return openFolder(path)
	case "url":
		return openURL(target)
	case "powershell":
		return runPowerShell(target, path)
	default:
		return nil
	}
}

// launchApp launches an application
func launchApp(target, path string) error {
	if path != "" {
		// Launch app with path as argument
		cmd := exec.Command("cmd", "/c", "start", "", target, path)
		return cmd.Start()
	}
	cmd := exec.Command("cmd", "/c", "start", "", target)
	return cmd.Start()
}

// openFolder opens a folder in Windows Explorer
func openFolder(path string) error {
	cmd := exec.Command("explorer", path)
	return cmd.Start()
}

// openURL opens a URL in the default browser
func openURL(url string) error {
	cmd := exec.Command("cmd", "/c", "start", "", url)
	return cmd.Start()
}

// runPowerShell runs a PowerShell command
func runPowerShell(command, path string) error {
	// Special handling for claude command
	if command == "claude" {
		if path != "" {
			// Open Windows Terminal with claude in the specified directory
			absPath, err := filepath.Abs(path)
			if err != nil {
				absPath = path
			}
			cmd := exec.Command("wt", "-d", absPath, "claude")
			return cmd.Start()
		}
		// Open Windows Terminal with claude in current directory
		cmd := exec.Command("wt", "claude")
		return cmd.Start()
	}

	// Generic PowerShell command
	if path != "" {
		absPath, err := filepath.Abs(path)
		if err != nil {
			absPath = path
		}
		cmd := exec.Command("powershell", "-NoExit", "-Command",
			"Set-Location '"+absPath+"'; "+command)
		return cmd.Start()
	}

	cmd := exec.Command("powershell", "-NoExit", "-Command", command)
	return cmd.Start()
}
