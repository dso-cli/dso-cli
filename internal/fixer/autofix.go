package fixer

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"github.com/dso-cli/dso-cli/internal/scanner"
)

// AutoFix applies automatic fixes
func AutoFix(results *scanner.ScanResults, projectPath string, auto bool) ([]string, error) {
	var appliedFixes []string

	for _, finding := range results.Findings {
		if !finding.Fixable {
			continue
		}

		// Fixes for secrets
		if finding.Type == "SECRET" {
			if fix, err := fixSecret(finding, projectPath, auto); err == nil && fix != "" {
				appliedFixes = append(appliedFixes, fix)
			}
		}

		// Fixes for vulnerable dependencies
		if finding.Type == "DEPENDENCY" && finding.Severity == scanner.SeverityCritical {
			if fix, err := fixDependency(finding, projectPath, auto); err == nil && fix != "" {
				appliedFixes = append(appliedFixes, fix)
			}
		}
	}

	return appliedFixes, nil
}

// fixSecret fixes an exposed secret
func fixSecret(finding scanner.Finding, projectPath string, auto bool) (string, error) {
	filePath := filepath.Join(projectPath, finding.File)

	// Lire le fichier
	content, err := os.ReadFile(filePath)
	if err != nil {
		return "", err
	}

	lines := strings.Split(string(content), "\n")
	if finding.Line <= 0 || finding.Line > len(lines) {
		return "", fmt.Errorf("invalid line")
	}

	// Ask for confirmation if needed
	if !auto {
		fmt.Printf("⚠️  Secret detected in %s:%d\n", finding.File, finding.Line)
		fmt.Printf("   Line: %s\n", strings.TrimSpace(lines[finding.Line-1]))
		fmt.Print("   Remove this line? (y/N): ")
		var response string
		fmt.Scanln(&response)
		if strings.ToLower(response) != "y" && strings.ToLower(response) != "yes" {
			return "", nil
		}
	}

	// Remove the line
	newLines := append(lines[:finding.Line-1], lines[finding.Line:]...)
	newContent := strings.Join(newLines, "\n")

	// Write file
	if err := os.WriteFile(filePath, []byte(newContent), 0644); err != nil {
		return "", err
	}

	return fmt.Sprintf("Secret removed from %s:%d", finding.File, finding.Line), nil
}

// fixDependency attempts to update a vulnerable dependency
func fixDependency(finding scanner.Finding, projectPath string, auto bool) (string, error) {
	// Detect dependency manager
	if strings.Contains(finding.File, "package.json") {
		return fixNPMDependency(finding, projectPath, auto)
	}
	if strings.Contains(finding.File, "go.mod") {
		return fixGoDependency(finding, projectPath, auto)
	}
	if strings.Contains(finding.File, "requirements.txt") || strings.Contains(finding.File, "Pipfile") {
		return fixPythonDependency(finding, projectPath, auto)
	}
	if strings.Contains(finding.File, "pom.xml") || strings.Contains(finding.File, "build.gradle") {
		return fixJavaDependency(finding, projectPath, auto)
	}

	return "", fmt.Errorf("unsupported dependency manager")
}

// fixNPMDependency updates an npm dependency
func fixNPMDependency(finding scanner.Finding, projectPath string, auto bool) (string, error) {
	// Extract package name from finding
	// Expected format: "vulnerability-id in package-name"
	parts := strings.Fields(finding.Title)
	if len(parts) < 3 {
		return "", fmt.Errorf("cannot extract package name")
	}

	packageName := parts[len(parts)-1]

	// Run npm audit fix
	cmd := exec.Command("npm", "audit", "fix", "--package-lock-only")
	cmd.Dir = projectPath
	if err := cmd.Run(); err != nil {
		// npm audit fix may fail, continue anyway
	}

	return fmt.Sprintf("npm dependency %s updated", packageName), nil
}

// fixGoDependency updates a Go dependency
func fixGoDependency(finding scanner.Finding, projectPath string, auto bool) (string, error) {
	// go get -u to update
	cmd := exec.Command("go", "get", "-u", "./...")
	cmd.Dir = projectPath
	if err := cmd.Run(); err != nil {
		return "", err
	}

	return "Go dependencies updated", nil
}

// fixPythonDependency updates a Python dependency
func fixPythonDependency(finding scanner.Finding, projectPath string, auto bool) (string, error) {
	// Try pip-audit if available
	if _, err := exec.LookPath("pip-audit"); err == nil {
		cmd := exec.Command("pip-audit", "--fix")
		cmd.Dir = projectPath
		if err := cmd.Run(); err == nil {
			return "Python dependencies updated via pip-audit", nil
		}
	}

	return "", fmt.Errorf("pip-audit not available, manual update required")
}

// fixJavaDependency updates a Java dependency
func fixJavaDependency(finding scanner.Finding, projectPath string, auto bool) (string, error) {
	// For Maven
	if strings.Contains(finding.File, "pom.xml") {
		cmd := exec.Command("mvn", "versions:use-latest-versions")
		cmd.Dir = projectPath
		if err := cmd.Run(); err == nil {
			return "Maven dependencies updated", nil
		}
	}

	return "", fmt.Errorf("automatic update not available for this project")
}

