package main

import (
	"testing"
)

func TestNewApp(t *testing.T) {
	app := NewApp()
	if app == nil {
		t.Error("NewApp() returned nil")
	}
}

func TestTogglePanel(t *testing.T) {
	app := NewApp()

	// Initially not visible
	if app.IsVisible() {
		t.Error("App should not be visible initially")
	}

	// Toggle visibility state (without ctx, just test the state)
	app.isVisible = true
	if !app.IsVisible() {
		t.Error("App should be visible after setting isVisible to true")
	}

	app.isVisible = false
	if app.IsVisible() {
		t.Error("App should not be visible after setting isVisible to false")
	}
}

func TestExecuteAction(t *testing.T) {
	// Test that executeAction doesn't panic with empty inputs
	// Note: actual execution would require OS interaction
	err := executeAction("internal", "settings", "")
	if err != nil {
		t.Errorf("executeAction for internal settings should not return error: %v", err)
	}
}
