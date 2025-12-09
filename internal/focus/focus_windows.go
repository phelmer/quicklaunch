//go:build windows

package focus

import (
	"syscall"
	"time"
	"unsafe"
)

var (
	user32                       = syscall.NewLazyDLL("user32.dll")
	procGetForegroundWnd         = user32.NewProc("GetForegroundWindow")
	procGetWindowThreadProcessId = user32.NewProc("GetWindowThreadProcessId")
	procSetForegroundWindow      = user32.NewProc("SetForegroundWindow")
	procEnumWindows              = user32.NewProc("EnumWindows")
	procIsWindowVisible          = user32.NewProc("IsWindowVisible")
	procBringWindowToTop         = user32.NewProc("BringWindowToTop")
	procAttachThreadInput        = user32.NewProc("AttachThreadInput")
	procAllowSetForegroundWindow = user32.NewProc("AllowSetForegroundWindow")
	procSystemParametersInfoW    = user32.NewProc("SystemParametersInfoW")
	procSetFocus                 = user32.NewProc("SetFocus")
	procShowWindow               = user32.NewProc("ShowWindow")
	procKeybd_event              = user32.NewProc("keybd_event")
	kernel32                     = syscall.NewLazyDLL("kernel32.dll")
	procGetCurrentProcessId      = kernel32.NewProc("GetCurrentProcessId")
	procGetCurrentThreadId       = kernel32.NewProc("GetCurrentThreadId")
)

const (
	SPI_GETFOREGROUNDLOCKTIMEOUT = 0x2000
	SPI_SETFOREGROUNDLOCKTIMEOUT = 0x2001
	SPIF_SENDCHANGE              = 0x0002
	ASFW_ANY                     = 0xFFFFFFFF
	SW_SHOW                      = 5
	SW_RESTORE                   = 9
	VK_MENU                      = 0x12 // Alt key
	KEYEVENTF_EXTENDEDKEY        = 0x0001
	KEYEVENTF_KEYUP              = 0x0002
)

// Monitor watches for focus changes and calls onFocusLost when the app loses focus
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

// Start begins monitoring focus
func (m *Monitor) Start() {
	if m.running {
		return
	}
	m.stop = make(chan struct{}) // Create new channel for this monitoring session
	m.running = true
	go m.watch()
}

// Stop stops the focus monitor
func (m *Monitor) Stop() {
	if !m.running {
		return
	}
	m.running = false // Set flag first to prevent race condition
	close(m.stop)
}

func (m *Monitor) watch() {
	currentPID := getCurrentProcessID()
	hadFocus := false

	ticker := time.NewTicker(100 * time.Millisecond)
	defer ticker.Stop()

	for {
		select {
		case <-m.stop:
			return
		case <-ticker.C:
			hasFocus := isForegroundWindowOurs(currentPID)

			// If we had focus and now we don't, trigger callback
			if hadFocus && !hasFocus {
				if m.onFocusLost != nil {
					m.onFocusLost()
				}
			}
			hadFocus = hasFocus
		}
	}
}

func getCurrentProcessID() uint32 {
	ret, _, _ := procGetCurrentProcessId.Call()
	return uint32(ret)
}

func isForegroundWindowOurs(ourPID uint32) bool {
	hwnd, _, _ := procGetForegroundWnd.Call()
	if hwnd == 0 {
		return false
	}

	var pid uint32
	procGetWindowThreadProcessId.Call(hwnd, uintptr(unsafe.Pointer(&pid)))

	return pid == ourPID
}

// simulateAltKeyPress sends a fake Alt key press/release to trick Windows
// into allowing SetForegroundWindow. This is a well-known workaround.
func simulateAltKeyPress() {
	procKeybd_event.Call(VK_MENU, 0, KEYEVENTF_EXTENDEDKEY, 0)
	procKeybd_event.Call(VK_MENU, 0, KEYEVENTF_EXTENDEDKEY|KEYEVENTF_KEYUP, 0)
}

// SetForeground brings the application window to the foreground and sets focus
// Uses multiple techniques to bypass Windows foreground restrictions
func SetForeground() {
	ourPID := getCurrentProcessID()

	// Simulate Alt key press - this is a key workaround that tells Windows
	// "the user took action" which allows SetForegroundWindow to work
	simulateAltKeyPress()

	// Allow any process to set foreground window
	procAllowSetForegroundWindow.Call(ASFW_ANY)

	// Temporarily disable foreground lock timeout
	var oldTimeout uintptr
	procSystemParametersInfoW.Call(SPI_GETFOREGROUNDLOCKTIMEOUT, 0, uintptr(unsafe.Pointer(&oldTimeout)), 0)
	procSystemParametersInfoW.Call(SPI_SETFOREGROUNDLOCKTIMEOUT, 0, 0, SPIF_SENDCHANGE)

	// Get foreground window's thread ID for AttachThreadInput
	fgHwnd, _, _ := procGetForegroundWnd.Call()
	var fgThreadID uintptr
	if fgHwnd != 0 {
		fgThreadID, _, _ = procGetWindowThreadProcessId.Call(fgHwnd, 0)
	}

	// Try multiple times with small delays
	for i := 0; i < 5; i++ {
		// Find our visible window and bring it to front
		callback := syscall.NewCallback(func(hwnd uintptr, lparam uintptr) uintptr {
			var pid uint32
			procGetWindowThreadProcessId.Call(hwnd, uintptr(unsafe.Pointer(&pid)))

			if pid == ourPID {
				// Check if window is visible
				visible, _, _ := procIsWindowVisible.Call(hwnd)
				if visible != 0 {
					// Get our window's thread ID
					ourThreadID, _, _ := procGetWindowThreadProcessId.Call(hwnd, 0)

					// Attach to foreground thread's input queue to allow SetForegroundWindow
					if fgThreadID != 0 && fgThreadID != ourThreadID {
						procAttachThreadInput.Call(ourThreadID, fgThreadID, 1) // Attach
					}

					// Use multiple methods to ensure focus
					procShowWindow.Call(hwnd, SW_RESTORE)
					procBringWindowToTop.Call(hwnd)
					procSetForegroundWindow.Call(hwnd)
					procSetFocus.Call(hwnd)

					if fgThreadID != 0 && fgThreadID != ourThreadID {
						procAttachThreadInput.Call(ourThreadID, fgThreadID, 0) // Detach
					}
					return 0 // Stop enumeration
				}
			}
			return 1 // Continue enumeration
		})

		procEnumWindows.Call(callback, 0)

		// Check if we got focus
		if isForegroundWindowOurs(ourPID) {
			break
		}
		time.Sleep(20 * time.Millisecond)
	}

	// Restore original foreground lock timeout
	procSystemParametersInfoW.Call(SPI_SETFOREGROUNDLOCKTIMEOUT, 0, oldTimeout, SPIF_SENDCHANGE)
}
