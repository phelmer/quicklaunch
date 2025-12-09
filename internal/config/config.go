package config

import (
	"encoding/json"
	"os"
	"path/filepath"
)

// Tile represents a launcher tile
type Tile struct {
	ID          string   `json:"id"`
	Name        string   `json:"name"`
	Icon        string   `json:"icon"`
	Action      string   `json:"action"`
	Target      string   `json:"target"`
	Args        []string `json:"args,omitempty"`
	WorkDir     string   `json:"workDir,omitempty"`
	HasSubMenu  bool     `json:"hasSubMenu"`
	SubMenuType string   `json:"subMenuType,omitempty"`
	Order       int      `json:"order"`
	Enabled     bool     `json:"enabled"`
	Color       string   `json:"color,omitempty"`
}

// Config represents the application configuration
type Config struct {
	Theme              string   `json:"theme"`
	Hotkey             string   `json:"hotkey"`
	Position           string   `json:"position"`
	Animation          bool     `json:"animation"`
	Blur               bool     `json:"blur"`
	StartWithWindows   bool     `json:"startWithWindows"`
	RecentFoldersLimit int      `json:"recentFoldersLimit"`
	RecentFolders      []string `json:"recentFolders"`
	Tiles              []Tile   `json:"tiles"`
}

// GetConfigDir returns the configuration directory path
func GetConfigDir() (string, error) {
	appData, err := os.UserConfigDir()
	if err != nil {
		return "", err
	}
	configDir := filepath.Join(appData, "QuickLaunch")
	return configDir, nil
}

// GetConfigPath returns the full path to the config file
func GetConfigPath() (string, error) {
	configDir, err := GetConfigDir()
	if err != nil {
		return "", err
	}

	// Create directory if it doesn't exist
	if err := os.MkdirAll(configDir, 0755); err != nil {
		return "", err
	}

	return filepath.Join(configDir, "config.json"), nil
}

// Load loads the configuration from disk
func Load() (*Config, error) {
	path, err := GetConfigPath()
	if err != nil {
		return DefaultConfig(), nil
	}

	data, err := os.ReadFile(path)
	if err != nil {
		// File doesn't exist, return defaults
		return DefaultConfig(), nil
	}

	var cfg Config
	if err := json.Unmarshal(data, &cfg); err != nil {
		// Invalid JSON, return defaults
		return DefaultConfig(), nil
	}

	return &cfg, nil
}

// Save saves the configuration to disk
func (c *Config) Save() error {
	path, err := GetConfigPath()
	if err != nil {
		return err
	}

	data, err := json.MarshalIndent(c, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(path, data, 0644)
}

// DefaultConfig returns the default configuration
func DefaultConfig() *Config {
	return &Config{
		Theme:              "dark",
		Hotkey:             "Ctrl+Space",
		Position:           "left",
		Animation:          true,
		Blur:               true,
		StartWithWindows:   false,
		RecentFoldersLimit: 5,
		RecentFolders:      []string{},
		Tiles:              []Tile{},
	}
}
