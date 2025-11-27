package config

import (
	"bufio"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

const (
	configDirName  = ".dso"
	configFileName = "config"
)

// GetConfigDir returns the DSO configuration directory
func GetConfigDir() (string, error) {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return "", fmt.Errorf("cannot get home directory: %v", err)
	}
	
	configDir := filepath.Join(homeDir, configDirName)
	
	// Create directory if it doesn't exist
	if err := os.MkdirAll(configDir, 0755); err != nil {
		return "", fmt.Errorf("cannot create config directory: %v", err)
	}
	
	return configDir, nil
}

// GetConfigFile returns the path to the config file
func GetConfigFile() (string, error) {
	configDir, err := GetConfigDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(configDir, configFileName), nil
}

// GetModel returns the configured model from config file or environment
func GetModel() string {
	// First check environment variable
	if model := os.Getenv("DSO_MODEL"); model != "" {
		return model
	}
	
	// Then check config file
	configFile, err := GetConfigFile()
	if err != nil {
		return ""
	}
	
	data, err := os.ReadFile(configFile)
	if err != nil {
		return ""
	}
	
	// Parse config file (simple key=value format)
	scanner := bufio.NewScanner(strings.NewReader(string(data)))
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if strings.HasPrefix(line, "DSO_MODEL=") {
			model := strings.TrimPrefix(line, "DSO_MODEL=")
			model = strings.Trim(model, `"'`)
			return model
		}
	}
	
	return ""
}

// SetModel saves the model to the config file
func SetModel(model string) error {
	configFile, err := GetConfigFile()
	if err != nil {
		return err
	}
	
	content := fmt.Sprintf("DSO_MODEL=%s\n", model)
	return os.WriteFile(configFile, []byte(content), 0644)
}

// GetAllConfig reads all config values
func GetAllConfig() (map[string]string, error) {
	config := make(map[string]string)
	
	// Add environment variables
	if model := os.Getenv("DSO_MODEL"); model != "" {
		config["DSO_MODEL"] = model
	}
	if host := os.Getenv("OLLAMA_HOST"); host != "" {
		config["OLLAMA_HOST"] = host
	}
	
	// Read from config file
	configFile, err := GetConfigFile()
	if err != nil {
		return config, nil
	}
	
	data, err := os.ReadFile(configFile)
	if err != nil {
		return config, nil
	}
	
	// Parse config file
	scanner := bufio.NewScanner(strings.NewReader(string(data)))
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if strings.Contains(line, "=") {
			parts := strings.SplitN(line, "=", 2)
			if len(parts) == 2 {
				key := strings.TrimSpace(parts[0])
				value := strings.TrimSpace(parts[1])
				value = strings.Trim(value, `"'`)
				config[key] = value
			}
		}
	}
	
	return config, nil
}

