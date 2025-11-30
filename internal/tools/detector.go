package tools

import (
	"fmt"
	"os"
	"os/exec"
	"runtime"
	"strings"

	"github.com/dso-cli/dso-cli/internal/constants"
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

// ToolCategory represents the category of a security tool
type ToolCategory string

const (
	CategorySAST        ToolCategory = "SAST"        // Static Application Security Testing
	CategoryDAST        ToolCategory = "DAST"        // Dynamic Application Security Testing
	CategorySecrets     ToolCategory = "Secrets"     // Secret detection
	CategoryDependencies ToolCategory = "Dependencies" // Software Composition Analysis
	CategoryIaC         ToolCategory = "IaC"         // Infrastructure as Code
	CategoryContainers  ToolCategory = "Containers"  // Container security
	CategoryCompliance  ToolCategory = "Compliance"  // Compliance scanning
	CategorySBOM        ToolCategory = "SBOM"       // Software Bill of Materials
	CategoryLinting     ToolCategory = "Linting"    // Code quality and security linting
)

var (
	// List of supported tools - Comprehensive DevSecOps toolkit
	Tools = []Tool{
		// SAST Tools
		{
			Name:        "trivy",
			Description: "Complete vulnerability scanner (SAST, dependencies, IaC, containers)",
			Command:     "trivy",
			Required:    false,
			InstallCmd:  getTrivyInstallCmd(),
		},
		{
			Name:        "semgrep",
			Description: "Fast SAST scanner with 1000+ security rules",
			Command:     "semgrep",
			Required:    false,
			InstallCmd:  getSemgrepInstallCmd(),
		},
		{
			Name:        "bandit",
			Description: "Python security linter (SAST for Python)",
			Command:     "bandit",
			Required:    false,
			InstallCmd:  getBanditInstallCmd(),
		},
		{
			Name:        "eslint",
			Description: "JavaScript/TypeScript linter with security plugins",
			Command:     "eslint",
			Required:    false,
			InstallCmd:  getESLintInstallCmd(),
		},
		{
			Name:        "gosec",
			Description: "Go security checker (SAST for Go)",
			Command:     "gosec",
			Required:    false,
			InstallCmd:  getGosecInstallCmd(),
		},
		{
			Name:        "brakeman",
			Description: "Ruby on Rails security scanner",
			Command:     "brakeman",
			Required:    false,
			InstallCmd:  getBrakemanInstallCmd(),
		},
		
		// Dependency Scanners
		{
			Name:        "grype",
			Description: "Vulnerability scanner for container images and filesystems",
			Command:     "grype",
			Required:    false,
			InstallCmd:  getGrypeInstallCmd(),
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
			InstallCmd:  getPipAuditInstallCmd(),
		},
		{
			Name:        "snyk",
			Description: "Multi-language dependency and container scanner",
			Command:     "snyk",
			Required:    false,
			InstallCmd:  getSnykInstallCmd(),
		},
		{
			Name:        "dependency-check",
			Description: "OWASP Dependency-Check for Java, .NET, Python, Node.js",
			Command:     "dependency-check",
			Required:    false,
			InstallCmd:  getDependencyCheckInstallCmd(),
		},
		
		// Secret Detection
		{
			Name:        "gitleaks",
			Description: "Fast and accurate secret detector",
			Command:     "gitleaks",
			Required:    false,
			InstallCmd:  getGitleaksInstallCmd(),
		},
		{
			Name:        "trufflehog",
			Description: "Find secrets in git repositories",
			Command:     "trufflehog",
			Required:    false,
			InstallCmd:  getTruffleHogInstallCmd(),
		},
		{
			Name:        "detect-secrets",
			Description: "Python-based secret detection with baseline support",
			Command:     "detect-secrets",
			Required:    false,
			InstallCmd:  getDetectSecretsInstallCmd(),
		},
		
		// IaC Scanners
		{
			Name:        "tfsec",
			Description: "Security scanner for Terraform",
			Command:     "tfsec",
			Required:    false,
			InstallCmd:  getTfsecInstallCmd(),
		},
		{
			Name:        "checkov",
			Description: "Infrastructure as Code security scanner (Terraform, CloudFormation, Kubernetes)",
			Command:     "checkov",
			Required:    false,
			InstallCmd:  getCheckovInstallCmd(),
		},
		{
			Name:        "terrascan",
			Description: "Detect compliance and security violations in IaC",
			Command:     "terrascan",
			Required:    false,
			InstallCmd:  getTerrascanInstallCmd(),
		},
		{
			Name:        "kics",
			Description: "Find security vulnerabilities, compliance issues in IaC",
			Command:     "kics",
			Required:    false,
			InstallCmd:  getKicsInstallCmd(),
		},
		
		// Container Security
		{
			Name:        "hadolint",
			Description: "Dockerfile linter and security scanner",
			Command:     "hadolint",
			Required:    false,
			InstallCmd:  getHadolintInstallCmd(),
		},
		{
			Name:        "docker-bench",
			Description: "Docker security best practices checker",
			Command:     "docker-bench-security",
			Required:    false,
			InstallCmd:  getDockerBenchInstallCmd(),
		},
		
		// SBOM Tools
		{
			Name:        "syft",
			Description: "Generate Software Bill of Materials (SBOM)",
			Command:     "syft",
			Required:    false,
			InstallCmd:  getSyftInstallCmd(),
		},
		
		// Compliance
		{
			Name:        "opa",
			Description: "Open Policy Agent for policy-based compliance",
			Command:     "opa",
			Required:    false,
			InstallCmd:  getOPAInstallCmd(),
		},
	}
)

// GetToolCategory returns the category for a tool name
func GetToolCategory(toolName string) string {
	categoryMap := map[string]string{
		// SAST
		"trivy":    "SAST",
		"semgrep":  "SAST",
		"bandit":   "SAST",
		"eslint":    "SAST",
		"gosec":    "SAST",
		"brakeman": "SAST",
		// Dependencies
		"grype":            "Dependencies",
		"npm":              "Dependencies",
		"pip-audit":        "Dependencies",
		"snyk":             "Dependencies",
		"dependency-check": "Dependencies",
		// Secrets
		"gitleaks":      "Secrets",
		"trufflehog":    "Secrets",
		"detect-secrets": "Secrets",
		// IaC
		"tfsec":     "IaC",
		"checkov":   "IaC",
		"terrascan": "IaC",
		"kics":      "IaC",
		// Containers
		"hadolint":             "Containers",
		"docker-bench-security": "Containers",
		// SBOM
		"syft": "SBOM",
		// Compliance
		"opa": "Compliance",
	}
	
	if cat, ok := categoryMap[strings.ToLower(toolName)]; ok {
		return cat
	}
	return "Other"
}

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
	if err != nil || len(output) == 0 {
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

// CheckTools checks tools and returns installed and missing tools.
func CheckTools(requiredOnly bool) (installed []Tool, missing []Tool) {
	allTools := DetectTools()
	installed = []Tool{}
	missing = []Tool{}

	for _, tool := range allTools {
		if tool.Installed {
			installed = append(installed, tool)
		} else if !requiredOnly || tool.Required {
			missing = append(missing, tool)
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
	case constants.OSDarwin:
		return "brew install trivy"
	case constants.OSLinux:
		// Detect Linux distribution
		if isDebianBased() {
			return "sudo apt-get update && sudo apt-get install -y wget apt-transport-https gnupg lsb-release && wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add - && echo \"deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main\" | sudo tee -a /etc/apt/sources.list.d/trivy.list && sudo apt-get update && sudo apt-get install -y trivy"
		}
		return "curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin"
	case constants.OSWindows:
		return "scoop install trivy || winget install AquaSecurity.Trivy"
	default:
		return "https://aquasecurity.github.io/trivy/"
	}
}

// getGrypeInstallCmd returns installation command for Grype
func getGrypeInstallCmd() string {
	switch runtime.GOOS {
	case constants.OSDarwin:
		return "brew install grype"
	case constants.OSLinux:
		return "curl -sSfL https://raw.githubusercontent.com/anchore/grype/main/install.sh | sh -s -- -b /usr/local/bin"
	case constants.OSWindows:
		return "scoop install grype || winget install Anchore.Grype"
	default:
		return "https://github.com/anchore/grype"
	}
}

// getGitleaksInstallCmd returns installation command for gitleaks
func getGitleaksInstallCmd() string {
	switch runtime.GOOS {
	case constants.OSDarwin:
		return "brew install gitleaks"
	case constants.OSLinux:
		if isDebianBased() {
			return "wget https://github.com/gitleaks/gitleaks/releases/latest/download/gitleaks_$(uname -s)_$(uname -m).tar.gz -O /tmp/gitleaks.tar.gz && tar -xzf /tmp/gitleaks.tar.gz -C /tmp && sudo mv /tmp/gitleaks /usr/local/bin/ && chmod +x /usr/local/bin/gitleaks"
		}
		return "brew install gitleaks || go install github.com/gitleaks/gitleaks/v8@latest"
	case constants.OSWindows:
		return "scoop install gitleaks || winget install Gitleaks.Gitleaks"
	default:
		return "https://github.com/gitleaks/gitleaks"
	}
}

// getTfsecInstallCmd returns installation command for tfsec
func getTfsecInstallCmd() string {
	switch runtime.GOOS {
	case constants.OSDarwin:
		return "brew install tfsec"
	case constants.OSLinux:
		return "brew install tfsec || go install github.com/aquasecurity/tfsec/cmd/tfsec@latest"
	case constants.OSWindows:
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
	if _, err := fmt.Scanln(&response); err != nil {
		return fmt.Errorf("cannot read input: %w", err)
	}

	if !strings.EqualFold(response, "y") && !strings.EqualFold(response, "yes") {
		return fmt.Errorf("installation canceled")
	}

	// Try to execute installation command
	if strings.HasPrefix(tool.InstallCmd, "brew") {
		parts := strings.Fields(tool.InstallCmd)
		if len(parts) < 2 {
			return fmt.Errorf("invalid brew command")
		}
		// #nosec G204 - command is from user input, but we validate it's brew
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
	if runtime.GOOS != constants.OSLinux {
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

// Installation commands for new tools

func getSemgrepInstallCmd() string {
	switch runtime.GOOS {
	case constants.OSDarwin:
		return "brew install semgrep"
	case constants.OSLinux:
		return "python3 -m pip install semgrep"
	case constants.OSWindows:
		return "pip install semgrep || winget install Semgrep.Semgrep"
	default:
		return "pip install semgrep"
	}
}

func getBanditInstallCmd() string {
	return "pip install bandit"
}

func getESLintInstallCmd() string {
	return "npm install -g eslint eslint-plugin-security"
}

func getGosecInstallCmd() string {
	switch runtime.GOOS {
	case constants.OSDarwin:
		return "brew install gosec"
	case constants.OSLinux:
		return "go install github.com/securego/gosec/v2/cmd/gosec@latest"
	case constants.OSWindows:
		return "go install github.com/securego/gosec/v2/cmd/gosec@latest"
	default:
		return "go install github.com/securego/gosec/v2/cmd/gosec@latest"
	}
}

func getBrakemanInstallCmd() string {
	return "gem install brakeman"
}

func getPipAuditInstallCmd() string {
	return "pip install pip-audit"
}

func getSnykInstallCmd() string {
	switch runtime.GOOS {
	case constants.OSDarwin:
		return "brew tap snyk/tap && brew install snyk"
	case constants.OSLinux:
		return "curl -s https://static.snyk.io/cli/latest/snyk-linux -o snyk && chmod +x snyk && sudo mv snyk /usr/local/bin/"
	case constants.OSWindows:
		return "scoop install snyk || winget install Snyk.Snyk"
	default:
		return "npm install -g snyk"
	}
}

func getDependencyCheckInstallCmd() string {
	switch runtime.GOOS {
	case constants.OSDarwin:
		return "brew install dependency-check"
	case constants.OSLinux:
		return "wget https://github.com/jeremylong/DependencyCheck/releases/latest/download/dependency-check-9.0.9-release.zip && unzip dependency-check-*.zip"
	case constants.OSWindows:
		return "scoop install dependency-check || winget install OWASP.DependencyCheck"
	default:
		return "https://owasp.org/www-project-dependency-check/"
	}
}

func getTruffleHogInstallCmd() string {
	switch runtime.GOOS {
	case constants.OSDarwin:
		return "brew install trufflesecurity/trufflehog/trufflehog"
	case constants.OSLinux:
		return "go install github.com/trufflesecurity/trufflehog/v3/cmd/trufflehog@latest"
	case constants.OSWindows:
		return "scoop install trufflehog || winget install TruffleSecurity.TruffleHog"
	default:
		return "go install github.com/trufflesecurity/trufflehog/v3/cmd/trufflehog@latest"
	}
}

func getDetectSecretsInstallCmd() string {
	return "pip install detect-secrets"
}

func getCheckovInstallCmd() string {
	switch runtime.GOOS {
	case constants.OSDarwin:
		return "brew install checkov"
	case constants.OSLinux:
		return "pip install checkov"
	case constants.OSWindows:
		return "pip install checkov || winget install Bridgecrew.Checkov"
	default:
		return "pip install checkov"
	}
}

func getTerrascanInstallCmd() string {
	switch runtime.GOOS {
	case constants.OSDarwin:
		return "brew install terrascan"
	case constants.OSLinux:
		return "curl -L \"$(curl -s https://api.github.com/repos/tenable/terrascan/releases/latest | grep -o -E 'https://[^\"]*terrascan_[0-9]+\\.[0-9]+\\.[0-9]+_Linux_x64.tar.gz')\" -o terrascan.tar.gz && tar -xzf terrascan.tar.gz && sudo mv terrascan /usr/local/bin/"
	case constants.OSWindows:
		return "scoop install terrascan || winget install Tenable.Terrascan"
	default:
		return "go install github.com/tenable/terrascan/cmd/terrascan@latest"
	}
}

func getKicsInstallCmd() string {
	switch runtime.GOOS {
	case constants.OSDarwin:
		return "brew install kics"
	case constants.OSLinux:
		return "curl -sfL 'https://raw.githubusercontent.com/Checkmarx/kics/master/install.sh' | bash -"
	case constants.OSWindows:
		return "scoop install kics || winget install Checkmarx.Kics"
	default:
		return "https://docs.kics.io/latest/installation/"
	}
}

func getHadolintInstallCmd() string {
	switch runtime.GOOS {
	case constants.OSDarwin:
		return "brew install hadolint"
	case constants.OSLinux:
		return "wget -O /usr/local/bin/hadolint https://github.com/hadolint/hadolint/releases/latest/download/hadolint-Linux-x86_64 && chmod +x /usr/local/bin/hadolint"
	case constants.OSWindows:
		return "scoop install hadolint || winget install Hadolint.Hadolint"
	default:
		return "https://github.com/hadolint/hadolint"
	}
}

func getDockerBenchInstallCmd() string {
	return "docker run --rm --net host --pid host --userns host --cap-add audit_control -e DOCKER_CONTENT_TRUST=$DOCKER_CONTENT_TRUST -v /etc:/etc:ro -v /usr/bin/containerd:/usr/bin/containerd:ro -v /usr/bin/runc:/usr/bin/runc:ro -v /usr/lib/systemd:/usr/lib/systemd:ro -v /var/lib:/var/lib:ro -v /var/run/docker.sock:/var/run/docker.sock:ro --label docker_bench_security docker/docker-bench-security"
}

func getSyftInstallCmd() string {
	switch runtime.GOOS {
	case constants.OSDarwin:
		return "brew install syft"
	case constants.OSLinux:
		return "curl -sSfL https://raw.githubusercontent.com/anchore/syft/main/install.sh | sh -s -- -b /usr/local/bin"
	case constants.OSWindows:
		return "scoop install syft || winget install Anchore.Syft"
	default:
		return "https://github.com/anchore/syft"
	}
}

func getOPAInstallCmd() string {
	switch runtime.GOOS {
	case constants.OSDarwin:
		return "brew install opa"
	case constants.OSLinux:
		return "curl -L -o opa https://openpolicyagent.org/downloads/latest/opa_linux_amd64 && chmod +x opa && sudo mv opa /usr/local/bin/"
	case constants.OSWindows:
		return "scoop install opa || winget install OpenPolicyAgent.OPA"
	default:
		return "https://www.openpolicyagent.org/docs/latest/"
	}
}
