//go:build linux

package focus

// Note on Linux Focus Handling:
//
// X11: Focus can be set using _NET_ACTIVE_WINDOW message via xgb library.
//      However, this requires additional dependencies (libx11-dev).
//
// Wayland: Focus stealing is intentionally blocked by design for security.
//          There is no reliable way to bring a window to foreground on Wayland.
//          This is a fundamental limitation of the Wayland protocol.
//
// Current implementation: No-op (empty function)
// The application will still work, but the window won't auto-focus when opened.
// Users need to click on the window to focus it.

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

// Start begins monitoring focus (no-op on Linux)
func (m *Monitor) Start() {
	// Focus monitoring not implemented on Linux
	// Wayland doesn't provide a way to monitor focus for other windows
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
// Note: This is a no-op on Linux due to Wayland security restrictions
func SetForeground() {
	// On X11: Could use _NET_ACTIVE_WINDOW via xgb library
	// On Wayland: Not possible by design (security feature)
	//
	// For now, this is a no-op. The window will need to be focused manually.
}
