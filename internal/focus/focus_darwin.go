//go:build darwin

package focus

/*
#cgo CFLAGS: -x objective-c
#cgo LDFLAGS: -framework Cocoa

#import <Cocoa/Cocoa.h>

void activateApp() {
    dispatch_async(dispatch_get_main_queue(), ^{
        [NSApp activateIgnoringOtherApps:YES];

        // Also bring all windows to front
        for (NSWindow *window in [NSApp windows]) {
            if ([window isVisible]) {
                [window makeKeyAndOrderFront:nil];
            }
        }
    });
}

// Check if our app is the frontmost application
int isAppFrontmost() {
    return [[NSApp currentEvent] window] != nil && [NSApp isActive] ? 1 : 0;
}
*/
import "C"

import (
	"time"
)

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

// Start begins monitoring focus
func (m *Monitor) Start() {
	if m.running {
		return
	}
	m.stop = make(chan struct{})
	m.running = true
	go m.watch()
}

// Stop stops the focus monitor
func (m *Monitor) Stop() {
	if !m.running {
		return
	}
	m.running = false
	close(m.stop)
}

func (m *Monitor) watch() {
	hadFocus := false

	ticker := time.NewTicker(100 * time.Millisecond)
	defer ticker.Stop()

	for {
		select {
		case <-m.stop:
			return
		case <-ticker.C:
			hasFocus := C.isAppFrontmost() == 1

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

// SetForeground brings the application window to the foreground
// Note: This may require Accessibility permissions on macOS
func SetForeground() {
	C.activateApp()
}
