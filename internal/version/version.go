package version

// These variables are set via ldflags at build time
// Example: go build -ldflags "-X quicklaunch/internal/version.Version=1.0.0"
var (
	// Version is the semantic version of the application
	Version = "dev"

	// Commit is the git commit hash
	Commit = "unknown"

	// BuildTime is the build timestamp
	BuildTime = "unknown"
)

// Info returns version information as a struct
type Info struct {
	Version   string `json:"version"`
	Commit    string `json:"commit"`
	BuildTime string `json:"buildTime"`
}

// GetInfo returns the current version info
func GetInfo() Info {
	return Info{
		Version:   Version,
		Commit:    Commit,
		BuildTime: BuildTime,
	}
}
