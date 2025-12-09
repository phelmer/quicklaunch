//go:build darwin

package focus

// Note on macOS Focus Handling:
//
// CGo Objective-C code for focus handling conflicts with getlantern/systray
// which also defines AppDelegate. This causes "duplicate symbol" linker errors.
//
// Current implementation: No-op (empty function)
// Focus handling on macOS would require either:
// 1. Removing systray dependency
// 2. Using a different approach that doesn't conflict with systray's AppDelegate

// Monitor watches for focus changes
type Monitor struct {
	onFocusLost func()
	stop        chan struct{}
	running     bool
}

// NewMonitor creates a new focus monitor
func NewMonitor(onFocusLost func()) *Monitor {
	return &Monitor{
		onFocusLost: onFocusLost,
		stop:        make(chan struct{}),
	}
}

// Start begins monitoring focus (no-op on macOS due to systray conflict)
func (m *Monitor) Start() {
	// Focus monitoring not implemented on macOS
	// Conflicts with systray's AppDelegate
}

// Stop stops the focus monitor
func (m *Monitor) Stop() {
	if !m.running {
		return
	}
	m.running = false
	close(m.stop)
}

// SetForeground brings the application window to the foreground
// Note: This is a no-op on macOS due to systray AppDelegate conflict
func SetForeground() {
	// Cannot use CGo Objective-C here as it conflicts with systray
}
