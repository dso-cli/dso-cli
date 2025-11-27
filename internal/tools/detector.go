package tools

import (
	"fmt"
	"os"
	"os/exec"
	"runtime"
	"strings"
)

// Tool represents a scan tool
type Tool struct {
	Name        string
	Description string
	Command     string
	InstallCmd  string // Installation command
	Required    bool
	Installed   bool
	Version     string
}

var (
	// List of supported tools
	Tools = []Tool{
		{
			Name:        "trivy",
			Description: "Complete vulnerability scanner (SAST, dependencies, IaC)",
			Command:     "trivy",
			Required:    false,
			InstallCmd:  getTrivyInstallCmd(),
		},
		{
			Name:        "grype",
			Description: "Dependency scanner (complementary to Trivy)",
			Command:     "grype",
			Required:    false,
			InstallCmd:  getGrypeInstallCmd(),
		},
		{
			Name:        "gitleaks",
			Description: "Secret detector in code",
			Command:     "gitleaks",
			Required:    false,
			InstallCmd:  getGitleaksInstallCmd(),
		},
		{
			Name:        "tfsec",
			Description: "Security scanner for Terraform",
			Command:     "tfsec",
			Required:    false,
			InstallCmd:  getTfsecInstallCmd(),
		},
		{
			Name:        "npm",
			Description: "Node.js package manager (for npm audit)",
			Command:     "npm",
			Required:    false,
			InstallCmd:  "https://nodejs.org/",
		},
		{
			Name:        "pip-audit",
			Description: "Python vulnerability auditor",
			Command:     "pip-audit",
			Required:    false,
			InstallCmd:  "pip install pip-audit",
		},
	}
)

// DetectTools detects which tools are installed
func DetectTools() []Tool {
	detected := make([]Tool, 0, len(Tools))

	for _, tool := range Tools {
		tool.Installed = isInstalled(tool.Command)
		if tool.Installed {
			tool.Version = getVersion(tool.Command)
		}
		detected = append(detected, tool)
	}

	return detected
}

// isInstalled checks if a tool is installed
func isInstalled(command string) bool {
	_, err := exec.LookPath(command)
	return err == nil
}

// getVersion retrieves the version of a tool
func getVersion(command string) string {
	cmd := exec.Command(command, "--version")
	output, err := cmd.Output()
	if err != nil {
		return "unknown"
	}

	version := strings.TrimSpace(string(output))
	// Extract just the version number if possible
	lines := strings.Split(version, "\n")
	if len(lines) > 0 {
		return lines[0]
	}
	return version
}

// CheckTools checks tools and returns missing ones
func CheckTools(requiredOnly bool) ([]Tool, []Tool) {
	allTools := DetectTools()
	installed := []Tool{}
	missing := []Tool{}

	for _, tool := range allTools {
		if tool.Installed {
			installed = append(installed, tool)
		} else {
			if !requiredOnly || tool.Required {
				missing = append(missing, tool)
			}
		}
	}

	return installed, missing
}

// PrintToolsStatus displays tools status
func PrintToolsStatus() {
	installed, missing := CheckTools(false)

	fmt.Println("🔧 Scan tools detected:")
	fmt.Println()

	if len(installed) > 0 {
		fmt.Println("✅ Installed:")
		for _, tool := range installed {
			fmt.Printf("   • %s", tool.Name)
			if tool.Version != "" {
				fmt.Printf(" (%s)", tool.Version)
			}
			fmt.Println()
		}
		fmt.Println()
	}

	if len(missing) > 0 {
		fmt.Println("⚠️  Missing (optional):")
		for _, tool := range missing {
			fmt.Printf("   • %s - %s\n", tool.Name, tool.Description)
			if tool.InstallCmd != "" {
				fmt.Printf("     💡 Installation: %s\n", tool.InstallCmd)
			}
		}
		fmt.Println()
	}
}

// getTrivyInstallCmd returns installation command for Trivy
func getTrivyInstallCmd() string {
	switch runtime.GOOS {
	case "darwin":
		return "brew install trivy"
	case "linux":
		// Detect Linux distribution
		if isDebianBased() {
			return "sudo apt-get update && sudo apt-get install -y wget apt-transport-https gnupg lsb-release && wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add - && echo \"deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main\" | sudo tee -a /etc/apt/sources.list.d/trivy.list && sudo apt-get update && sudo apt-get install -y trivy"
		}
		return "curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin"
	case "windows":
		return "scoop install trivy || winget install AquaSecurity.Trivy"
	default:
		return "https://aquasecurity.github.io/trivy/"
	}
}

// getGrypeInstallCmd returns installation command for Grype
func getGrypeInstallCmd() string {
	switch runtime.GOOS {
	case "darwin":
		return "brew install grype"
	case "linux":
		return "curl -sSfL https://raw.githubusercontent.com/anchore/grype/main/install.sh | sh -s -- -b /usr/local/bin"
	case "windows":
		return "scoop install grype || winget install Anchore.Grype"
	default:
		return "https://github.com/anchore/grype"
	}
}

// getGitleaksInstallCmd returns installation command for gitleaks
func getGitleaksInstallCmd() string {
	switch runtime.GOOS {
	case "darwin":
		return "brew install gitleaks"
	case "linux":
		if isDebianBased() {
			return "wget https://github.com/gitleaks/gitleaks/releases/latest/download/gitleaks_$(uname -s)_$(uname -m).tar.gz -O /tmp/gitleaks.tar.gz && tar -xzf /tmp/gitleaks.tar.gz -C /tmp && sudo mv /tmp/gitleaks /usr/local/bin/ && chmod +x /usr/local/bin/gitleaks"
		}
		return "brew install gitleaks || go install github.com/gitleaks/gitleaks/v8@latest"
	case "windows":
		return "scoop install gitleaks || winget install Gitleaks.Gitleaks"
	default:
		return "https://github.com/gitleaks/gitleaks"
	}
}

// getTfsecInstallCmd returns installation command for tfsec
func getTfsecInstallCmd() string {
	switch runtime.GOOS {
	case "darwin":
		return "brew install tfsec"
	case "linux":
		return "brew install tfsec || go install github.com/aquasecurity/tfsec/cmd/tfsec@latest"
	case "windows":
		return "scoop install tfsec || winget install AquaSecurity.Tfsec"
	default:
		return "https://github.com/aquasecurity/tfsec"
	}
}

// InstallTool interactively offers to install a tool
func InstallTool(tool Tool, interactive bool) error {
	if !interactive {
		fmt.Printf("💡 To install %s: %s\n", tool.Name, tool.InstallCmd)
		return fmt.Errorf("non-interactive installation")
	}

	fmt.Printf("\n❓ Install %s now? (y/N): ", tool.Name)
	var response string
	fmt.Scanln(&response)

	if strings.ToLower(response) != "y" && strings.ToLower(response) != "yes" {
		return fmt.Errorf("installation canceled")
	}

	// Try to execute installation command
	if strings.HasPrefix(tool.InstallCmd, "brew") {
		parts := strings.Fields(tool.InstallCmd)
		cmd := exec.Command(parts[0], parts[1:]...)
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr
		return cmd.Run()
	}

	// For other methods, display instructions
	fmt.Printf("📝 Run this command:\n   %s\n", tool.InstallCmd)
	return fmt.Errorf("manual installation required")
}

// isDebianBased checks if the Linux system is Debian-based (Ubuntu, Debian, etc.)
func isDebianBased() bool {
	if runtime.GOOS != "linux" {
		return false
	}

	// Check for common Debian-based distribution indicators
	debianFiles := []string{
		"/etc/debian_version",
		"/etc/os-release",
	}

	for _, file := range debianFiles {
		if data, err := os.ReadFile(file); err == nil {
			content := strings.ToLower(string(data))
			if strings.Contains(content, "debian") ||
				strings.Contains(content, "ubuntu") ||
				strings.Contains(content, "mint") ||
				strings.Contains(content, "elementary") {
				return true
			}
		}
	}

	return false
}
