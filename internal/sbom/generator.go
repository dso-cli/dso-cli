package sbom

import (
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"
)

// Component represents a component in the SBOM
type Component struct {
	Type    string            `json:"type"`
	Name    string            `json:"name"`
	Version string            `json:"version,omitempty"`
	PURL    string            `json:"purl,omitempty"`
	Properties map[string]string `json:"properties,omitempty"`
}

// SBOMDocument represents an SBOM document
type SBOMDocument struct {
	Format    string      `json:"format"`
	Version   string      `json:"version"`
	Timestamp time.Time   `json:"timestamp"`
	Components []Component `json:"components"`
}

// GenerateSBOM generates an SBOM in the specified format
func GenerateSBOM(projectPath string, format string) (string, error) {
	components, err := detectComponents(projectPath)
	if err != nil {
		return "", err
	}

	switch format {
	case "cyclonedx":
		return generateCycloneDX(components, projectPath)
	case "spdx":
		return generateSPDX(components, projectPath)
	default:
		return "", fmt.Errorf("unsupported format: %s (supported: cyclonedx, spdx)", format)
	}
}

// detectComponents detects all components in the project
func detectComponents(projectPath string) ([]Component, error) {
	var components []Component

	// Detect dependency managers
	if hasFile(projectPath, "package.json") {
		npmComponents, err := detectNPM(projectPath)
		if err == nil {
			components = append(components, npmComponents...)
		}
	}

	if hasFile(projectPath, "go.mod") {
		goComponents, err := detectGo(projectPath)
		if err == nil {
			components = append(components, goComponents...)
		}
	}

	if hasFile(projectPath, "requirements.txt") || hasFile(projectPath, "Pipfile") {
		pythonComponents, err := detectPython(projectPath)
		if err == nil {
			components = append(components, pythonComponents...)
		}
	}

	if hasFile(projectPath, "pom.xml") {
		javaComponents, err := detectMaven(projectPath)
		if err == nil {
			components = append(components, javaComponents...)
		}
	}

	return components, nil
}

// generateCycloneDX generates an SBOM in CycloneDX format
func generateCycloneDX(components []Component, projectPath string) (string, error) {
	doc := map[string]interface{}{
		"bomFormat":    "CycloneDX",
		"specVersion":  "1.4",
		"version":      1,
		"metadata": map[string]interface{}{
			"timestamp": time.Now().Format(time.RFC3339),
			"tools": []map[string]string{
				{
					"name":    "dso",
					"version": "0.1.0",
				},
			},
			"component": map[string]string{
				"type":    "application",
				"name":    filepath.Base(projectPath),
				"version": "1.0.0",
			},
		},
		"components": components,
	}

	jsonData, err := json.MarshalIndent(doc, "", "  ")
	if err != nil {
		return "", err
	}

	return string(jsonData), nil
}

// generateSPDX generates an SBOM in SPDX format
func generateSPDX(components []Component, projectPath string) (string, error) {
	var sb strings.Builder
	
	sb.WriteString("SPDXVersion: SPDX-2.3\n")
	sb.WriteString("DataLicense: CC0-1.0\n")
	sb.WriteString(fmt.Sprintf("SPDXID: SPDXRef-DOCUMENT\n"))
	sb.WriteString(fmt.Sprintf("DocumentName: %s\n", filepath.Base(projectPath)))
	sb.WriteString(fmt.Sprintf("DocumentNamespace: https://example.com/%s\n", filepath.Base(projectPath)))
	sb.WriteString(fmt.Sprintf("Creator: Tool: dso-0.1.0\n"))
	sb.WriteString(fmt.Sprintf("Created: %s\n\n", time.Now().Format(time.RFC3339)))
	
	for i, comp := range components {
		sb.WriteString(fmt.Sprintf("PackageName: %s\n", comp.Name))
		sb.WriteString(fmt.Sprintf("SPDXID: SPDXRef-Package-%d\n", i+1))
		if comp.Version != "" {
			sb.WriteString(fmt.Sprintf("PackageVersion: %s\n", comp.Version))
		}
		sb.WriteString(fmt.Sprintf("PackageDownloadLocation: NOASSERTION\n"))
		sb.WriteString("\n")
	}
	
	return sb.String(), nil
}

// Language-specific detection functions
func detectNPM(projectPath string) ([]Component, error) {
	var components []Component
	
	// Use npm list if available
	if _, err := exec.LookPath("npm"); err == nil {
		cmd := exec.Command("npm", "list", "--json", "--depth=0")
		cmd.Dir = projectPath
		output, err := cmd.Output()
		if err == nil {
			var npmList struct {
				Dependencies map[string]struct {
					Version string `json:"version"`
				} `json:"dependencies"`
			}
			if json.Unmarshal(output, &npmList) == nil {
				for name, dep := range npmList.Dependencies {
					components = append(components, Component{
						Type:    "library",
						Name:    name,
						Version: dep.Version,
						PURL:    fmt.Sprintf("pkg:npm/%s@%s", name, dep.Version),
					})
				}
			}
		}
	}
	
	return components, nil
}

func detectGo(projectPath string) ([]Component, error) {
	var components []Component
	
	// Read go.mod
	goModPath := filepath.Join(projectPath, "go.mod")
	data, err := os.ReadFile(goModPath)
	if err != nil {
		return components, err
	}
	
	lines := strings.Split(string(data), "\n")
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if strings.HasPrefix(line, "require ") {
			parts := strings.Fields(line)
			if len(parts) >= 2 {
				name := parts[1]
				version := ""
				if len(parts) >= 3 {
					version = parts[2]
				}
				components = append(components, Component{
					Type:    "library",
					Name:    name,
					Version: version,
					PURL:    fmt.Sprintf("pkg:golang/%s@%s", name, version),
				})
			}
		}
	}
	
	return components, nil
}

func detectPython(projectPath string) ([]Component, error) {
	var components []Component

	// Read requirements.txt
	reqPath := filepath.Join(projectPath, "requirements.txt")
	if data, err := os.ReadFile(reqPath); err == nil {
		lines := strings.Split(string(data), "\n")
		for _, line := range lines {
			line = strings.TrimSpace(line)
			if line == "" || strings.HasPrefix(line, "#") {
				continue
			}
			parts := strings.Fields(line)
			if len(parts) > 0 {
				name := strings.Split(parts[0], "==")[0]
				version := ""
				if strings.Contains(parts[0], "==") {
					version = strings.Split(parts[0], "==")[1]
				}
				components = append(components, Component{
					Type:    "library",
					Name:    name,
					Version: version,
					PURL:    fmt.Sprintf("pkg:pypi/%s@%s", name, version),
				})
			}
		}
	}
	
	return components, nil
}

func detectMaven(projectPath string) ([]Component, error) {
	var components []Component

	// Read pom.xml (simplified version)
	pomPath := filepath.Join(projectPath, "pom.xml")
	if _, err := os.Stat(pomPath); err == nil {
		// For a complete implementation, we would need to parse the XML
		// Here we just return a basic structure
		components = append(components, Component{
			Type: "application",
			Name: filepath.Base(projectPath),
		})
	}
	
	return components, nil
}

func hasFile(projectPath, filename string) bool {
	_, err := os.Stat(filepath.Join(projectPath, filename))
	return err == nil
}

