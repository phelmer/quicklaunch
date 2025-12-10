package updater

import (
	"context"
	"fmt"
	"os"
	"runtime"

	"github.com/creativeprojects/go-selfupdate"

	"quicklaunch/internal/version"
)

const (
	// GitHub repository owner and name
	repoOwner = "phelmer"
	repoName  = "quicklaunch"
)

// UpdateInfo contains information about an available update
type UpdateInfo struct {
	Available   bool   `json:"available"`
	CurrentVer  string `json:"currentVersion"`
	LatestVer   string `json:"latestVersion"`
	ReleaseURL  string `json:"releaseUrl"`
	ReleaseNote string `json:"releaseNote"`
	AssetURL    string `json:"assetUrl"`
	AssetSize   int64  `json:"assetSize"`
}

// Updater handles application updates via GitHub Releases
type Updater struct {
	source        *selfupdate.GitHubSource
	latestRelease *selfupdate.Release
}

// New creates a new Updater instance
func New() *Updater {
	source, _ := selfupdate.NewGitHubSource(selfupdate.GitHubConfig{})
	return &Updater{
		source: source,
	}
}

// CheckForUpdate checks if a new version is available on GitHub Releases
func (u *Updater) CheckForUpdate(ctx context.Context) (*UpdateInfo, error) {
	currentVersion := version.Version

	// Handle development version
	if currentVersion == "dev" || currentVersion == "" {
		return &UpdateInfo{
			Available:  false,
			CurrentVer: currentVersion,
			LatestVer:  "unknown",
		}, nil
	}

	updater, err := selfupdate.NewUpdater(selfupdate.Config{
		Source: u.source,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create updater: %w", err)
	}

	// Find latest release
	release, found, err := updater.DetectLatest(ctx, selfupdate.NewRepositorySlug(repoOwner, repoName))
	if err != nil {
		return nil, fmt.Errorf("failed to detect latest version: %w", err)
	}

	if !found {
		return &UpdateInfo{
			Available:  false,
			CurrentVer: currentVersion,
			LatestVer:  currentVersion,
		}, nil
	}

	// Compare versions
	latestVersion := release.Version()

	info := &UpdateInfo{
		CurrentVer:  currentVersion,
		LatestVer:   latestVersion,
		ReleaseURL:  release.ReleaseNotes,
		ReleaseNote: release.ReleaseNotes,
		AssetURL:    release.AssetURL,
	}

	// Check if update is available (latest > current)
	if release.GreaterThan(currentVersion) {
		info.Available = true
		u.latestRelease = release // Store for later download
	}

	return info, nil
}

// DownloadAndApply downloads the latest version and applies the update
// Returns the path to the new executable (requires restart)
func (u *Updater) DownloadAndApply(ctx context.Context) error {
	currentVersion := version.Version

	// Don't update development versions
	if currentVersion == "dev" || currentVersion == "" {
		return fmt.Errorf("cannot update development version")
	}

	// Check if we have a cached release from CheckForUpdate
	if u.latestRelease == nil {
		// Need to detect latest first
		updater, err := selfupdate.NewUpdater(selfupdate.Config{
			Source: u.source,
		})
		if err != nil {
			return fmt.Errorf("failed to create updater: %w", err)
		}

		release, found, err := updater.DetectLatest(ctx, selfupdate.NewRepositorySlug(repoOwner, repoName))
		if err != nil {
			return fmt.Errorf("failed to detect latest version: %w", err)
		}
		if !found || !release.GreaterThan(currentVersion) {
			return fmt.Errorf("no update available")
		}
		u.latestRelease = release
	}

	updater, err := selfupdate.NewUpdater(selfupdate.Config{
		Source: u.source,
	})
	if err != nil {
		return fmt.Errorf("failed to create updater: %w", err)
	}

	// Get current executable path
	exe, err := os.Executable()
	if err != nil {
		return fmt.Errorf("failed to get executable path: %w", err)
	}

	// Perform the update using the stored release
	err = updater.UpdateTo(ctx, u.latestRelease, exe)
	if err != nil {
		return fmt.Errorf("failed to update: %w", err)
	}

	// Clear cached release after successful update
	u.latestRelease = nil

	return nil
}

// GetCurrentVersion returns the current application version
func GetCurrentVersion() string {
	return version.Version
}

// GetPlatformInfo returns current OS and architecture
func GetPlatformInfo() (string, string) {
	return runtime.GOOS, runtime.GOARCH
}
