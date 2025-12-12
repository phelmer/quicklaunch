package notification

import (
	"fmt"

	"git.sr.ht/~jackmordaunt/go-toast/v2/wintoast"
)

const (
	appID = "QuickLaunch"
	// GUID for COM activation - generated once, must stay constant
	appGUID = "F8A5B3D1-7C2E-4A9F-B6D8-3E1F0A2C4B5D"
)

// ToastCallback is called when the user clicks on a toast notification
type ToastCallback func(action string)

// Toast handles Windows toast notifications
type Toast struct {
	callback ToastCallback
}

// NewToast creates a new Toast notification handler
func NewToast() *Toast {
	return &Toast{}
}

// Initialize sets up the toast notification system
func (t *Toast) Initialize(exePath string, iconPath string) error {
	appData := wintoast.AppData{
		AppID:         appID,
		GUID:          appGUID,
		ActivationExe: exePath,
		IconPath:      iconPath,
	}

	if err := wintoast.SetAppData(appData); err != nil {
		return fmt.Errorf("failed to set app data: %w", err)
	}

	// Set up activation callback
	wintoast.SetActivationCallback(func(appUserModelId string, invokedArgs string, userData []wintoast.UserData) {
		if t.callback != nil {
			t.callback(invokedArgs)
		}
	})

	return nil
}

// SetCallback sets the callback function for toast activation
func (t *Toast) SetCallback(cb ToastCallback) {
	t.callback = cb
}

// ShowUpdateAvailable shows a toast notification for an available update
func (t *Toast) ShowUpdateAvailable(currentVersion, newVersion string) error {
	xml := fmt.Sprintf(`
<toast launch="show-update" activationType="foreground">
    <visual>
        <binding template="ToastGeneric">
            <text>Update verfügbar</text>
            <text>QuickLaunch %s ist verfügbar (aktuell: %s)</text>
        </binding>
    </visual>
    <actions>
        <action content="Jetzt aktualisieren" arguments="show-update" activationType="foreground"/>
        <action content="Später" arguments="dismiss" activationType="system"/>
    </actions>
</toast>`, newVersion, currentVersion)

	return wintoast.Push(appID, xml)
}

// ShowUpdateReady shows a toast notification when update is ready to install
func (t *Toast) ShowUpdateReady(newVersion string) error {
	xml := fmt.Sprintf(`
<toast launch="show-update" activationType="foreground">
    <visual>
        <binding template="ToastGeneric">
            <text>Update bereit</text>
            <text>QuickLaunch %s wurde heruntergeladen und ist bereit zur Installation.</text>
        </binding>
    </visual>
    <actions>
        <action content="Jetzt neu starten" arguments="restart-app" activationType="foreground"/>
        <action content="Später" arguments="dismiss" activationType="system"/>
    </actions>
</toast>`, newVersion)

	return wintoast.Push(appID, xml)
}
