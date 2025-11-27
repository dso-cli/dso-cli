package scanner

import (
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"github.com/dso-cli/dso-cli/internal/constants"
)

// RunFullScan runs all available scanners
func RunFullScan(path string) (*ScanResults, error) {
	return RunFullScanInteractive(path, false, nil)
}

// RunFullScanInteractive runs all scanners with progress tracking
func RunFullScanInteractive(path string, interactive bool, tracker *ProgressTracker) (*ScanResults, error) {
	results := &ScanResults{
		Path:      path,
		Timestamp: time.Now(),
		Findings:  []Finding{},
	}

	if tracker == nil {
		tracker = NewProgressTracker(interactive)
	}

	// Automatic file type detection
	tracker.StartStep(0, "Detecting technologies")
	hasDocker := detectFileType(path, "Dockerfile", "docker-compose.yml", "*.dockerfile")
	hasTerraform := detectFileType(path, "*.tf", "*.tfvars")
	hasK8s := detectFileType(path, "*.yaml", "*.yml")
	hasGo := detectFileType(path, "*.go", "go.mod")
	hasJS := detectFileType(path, "*.js", "*.ts", "package.json")
	hasPython := detectFileType(path, "*.py", "requirements.txt", "Pipfile")
	hasJava := detectFileType(path, "*.java", "pom.xml", "build.gradle")
	tracker.CompleteStep(0, 0)

	stepIndex := 1

	// Prepare steps
	steps := []struct {
		name    string
		enabled bool
		scan    func() ([]Finding, error)
	}{
		{"Scanning secrets", true, func() ([]Finding, error) { return scanSecrets(path) }},
		{"SAST Go", hasGo, func() ([]Finding, error) { return scanSAST(path, "go") }},
		{"SAST JavaScript/TypeScript", hasJS, func() ([]Finding, error) { return scanSAST(path, "javascript") }},
		{"SAST Python", hasPython, func() ([]Finding, error) { return scanSAST(path, "python") }},
		{"SAST Java", hasJava, func() ([]Finding, error) { return scanSAST(path, "java") }},
		{"Scanning dependencies (SCA)", true, func() ([]Finding, error) { return scanDependencies(path) }},
		{"Scanning Docker", hasDocker, func() ([]Finding, error) { return scanDocker(path) }},
		{"Scanning Terraform", hasTerraform, func() ([]Finding, error) { return scanTerraform(path) }},
		{"Scanning Kubernetes", hasK8s, func() ([]Finding, error) { return scanKubernetes(path) }},
	}

	// Add steps to tracker
	for _, step := range steps {
		if step.enabled {
			tracker.AddStep(step.name)
		}
	}

	// Execute scans
	for _, step := range steps {
		if !step.enabled {
			continue
		}
		tracker.StartStep(stepIndex-1, step.name)
		if findings, err := step.scan(); err == nil {
			results.Findings = append(results.Findings, findings...)
			tracker.CompleteStep(stepIndex-1, len(findings))
		} else {
			if interactive {
				fmt.Printf("\r[%d/%d] ⚠️  %s (error: %v)\n", stepIndex, tracker.totalSteps, step.name, err)
			}
		}
		stepIndex++
	}

	results.CalculateSummary()
	tracker.Finish(results.Summary.Total)

	return results, nil
}

// detectFileType checks if a file type exists in the directory
func detectFileType(path string, patterns ...string) bool {
	for _, pattern := range patterns {
		matches, err := filepath.Glob(filepath.Join(path, pattern))
		if err == nil && len(matches) > 0 {
			return true
		}
		// Recursive search for certain patterns
		if strings.Contains(pattern, "*") {
			err := filepath.Walk(path, func(p string, info os.FileInfo, err error) error {
				if err != nil {
					return nil
				}
				matched, matchErr := filepath.Match(pattern, info.Name())
				if matchErr == nil && matched {
					return fmt.Errorf("found") // Stop the search
				}
				return nil
			})
			if err != nil && err.Error() == "found" {
				return true
			}
		}
	}
	return false
}

// scanSecrets scans secrets with gitleaks (or trivy)
func scanSecrets(path string) ([]Finding, error) {
	var findings []Finding

	// Try with gitleaks
	if _, err := exec.LookPath("gitleaks"); err == nil {
		cmd := exec.Command("gitleaks", "detect", "--source", path, "--no-git", "--format", "json")
		output, err := cmd.Output()
		if err != nil {
			// gitleaks returns an error code if secrets are found
			var gitleaksResults []struct {
				RuleID string `json:"RuleID"`
				File   string `json:"File"`
				Line   string `json:"StartLine"`
				Secret string `json:"Secret"`
			}
			if json.Unmarshal(output, &gitleaksResults) == nil {
				for _, r := range gitleaksResults {
					findings = append(findings, Finding{
						ID:          fmt.Sprintf("secret-%s-%s", r.RuleID, r.File),
						Type:        "SECRET",
						Severity:    SeverityCritical,
						Title:       fmt.Sprintf("Exposed secret: %s", r.RuleID),
						Description: fmt.Sprintf("Secret detected in %s", r.File),
						File:        r.File,
						Tool:        "gitleaks",
						Fixable:     true,
						Exploitable: true,
					})
				}
			}
		}
		return findings, nil
	}

	// Fallback: trivy for secrets
	return scanWithTrivy(path, "secret")
}

// scanSAST scans source code with Trivy
func scanSAST(path string, lang string) ([]Finding, error) {
	return scanWithTrivy(path, "fs", "--scanners", "vuln,secret,config")
}

// scanDependencies scans dependencies with Trivy and Grype
func scanDependencies(path string) ([]Finding, error) {
	var findings []Finding

	// Trivy for dependencies
	if trivyFindings, err := scanWithTrivy(path, "fs", "--scanners", "vuln"); err == nil {
		findings = append(findings, trivyFindings...)
	}

	// Grype as complement
	if _, err := exec.LookPath("grype"); err == nil {
		cmd := exec.Command("grype", path, "-o", "json")
		output, err := cmd.Output()
		if err == nil && len(output) > 0 {
			var grypeResults struct {
				Matches []struct {
					Vulnerability struct {
						ID          string `json:"id"`
						Severity    string `json:"severity"`
						Description string `json:"description"`
						CVSS        []struct {
							Metrics struct {
								BaseScore float64 `json:"baseScore"`
							} `json:"metrics"`
						} `json:"cvss"`
					} `json:"vulnerability"`
					Artifact struct {
						Name    string `json:"name"`
						Version string `json:"version"`
					} `json:"artifact"`
				} `json:"matches"`
			}
			if json.Unmarshal(output, &grypeResults) == nil {
				for _, m := range grypeResults.Matches {
					severity := mapSeverity(m.Vulnerability.Severity)
					cvss := 0.0
					if len(m.Vulnerability.CVSS) > 0 {
						cvss = m.Vulnerability.CVSS[0].Metrics.BaseScore
					}
					findings = append(findings, Finding{
						ID:          m.Vulnerability.ID,
						Type:        "DEPENDENCY",
						Severity:    severity,
						Title:       fmt.Sprintf("%s in %s", m.Vulnerability.ID, m.Artifact.Name),
						Description: m.Vulnerability.Description,
						Tool:        "grype",
						CVSS:        cvss,
						Fixable:     true,
					})
				}
			}
		}
	}

	return findings, nil
}

// scanDocker scans Dockerfiles
func scanDocker(path string) ([]Finding, error) {
	return scanWithTrivy(path, "config", "--scanners", "config")
}

// scanTerraform scans Terraform files
func scanTerraform(path string) ([]Finding, error) {
	var findings []Finding

	// tfsec
	if _, err := exec.LookPath("tfsec"); err == nil {
		cmd := exec.Command("tfsec", path, "--format", "json")
		output, err := cmd.Output()
		if err == nil {
			var tfsecResults struct {
				Results []struct {
					RuleID      string `json:"rule_id"`
					Severity    string `json:"severity"`
					Description string `json:"description"`
					Location    struct {
						Filename  string `json:"filename"`
						StartLine int    `json:"start_line"`
					} `json:"location"`
				} `json:"results"`
			}
			if json.Unmarshal(output, &tfsecResults) == nil {
				for _, r := range tfsecResults.Results {
					findings = append(findings, Finding{
						ID:          r.RuleID,
						Type:        "IAC",
						Severity:    mapSeverity(r.Severity),
						Title:       r.RuleID,
						Description: r.Description,
						File:        r.Location.Filename,
						Line:        r.Location.StartLine,
						Tool:        "tfsec",
						Fixable:     true,
					})
				}
			}
		}
	}

	// Trivy for Terraform too
	if trivyFindings, err := scanWithTrivy(path, "config", "--scanners", "config"); err == nil {
		findings = append(findings, trivyFindings...)
	}

	return findings, nil
}

// scanKubernetes scans Kubernetes manifests
func scanKubernetes(path string) ([]Finding, error) {
	return scanWithTrivy(path, "config", "--scanners", "config")
}

// scanWithTrivy executes Trivy and parses results
func scanWithTrivy(path string, scanType string, extraArgs ...string) ([]Finding, error) {
	if _, err := exec.LookPath("trivy"); err != nil {
		return nil, fmt.Errorf("trivy not found. Install it: https://aquasecurity.github.io/trivy/")
	}

	args := []string{scanType, path, "--format", "json", "--quiet"}
	args = append(args, extraArgs...)

	cmd := exec.Command("trivy", args...)
	output, err := cmd.Output()
	if err != nil {
		// Trivy may return an error if vulnerabilities are found
		// Continue anyway to parse results
	}

	var trivyResults struct {
		Results []struct {
			Target          string `json:"Target"`
			Vulnerabilities []struct {
				VulnerabilityID string `json:"VulnerabilityID"`
				Severity        string `json:"Severity"`
				Title           string `json:"Title"`
				Description     string `json:"Description"`
				CVSS            map[string]struct {
					V3Score float64 `json:"v3Score"`
				} `json:"CVSS"`
			} `json:"Vulnerabilities"`
		} `json:"Results"`
	}

	if err := json.Unmarshal(output, &trivyResults); err != nil {
		return nil, err
	}

	var findings []Finding
	for _, result := range trivyResults.Results {
		for _, vuln := range result.Vulnerabilities {
			cvss := 0.0
			if cvssData, ok := vuln.CVSS["nvd"]; ok {
				cvss = cvssData.V3Score
			}
			findings = append(findings, Finding{
				ID:          vuln.VulnerabilityID,
				Type:        "DEPENDENCY",
				Severity:    mapSeverity(vuln.Severity),
				Title:       vuln.Title,
				Description: vuln.Description,
				File:        result.Target,
				Tool:        "trivy",
				CVSS:        cvss,
				Fixable:     true,
			})
		}
	}

	return findings, nil
}

// mapSeverity converts a severity string to Severity type
func mapSeverity(s string) Severity {
	s = strings.ToUpper(s)
	switch s {
	case "CRITICAL", "CRIT":
		return SeverityCritical
	case "HIGH":
		return SeverityHigh
	case "MEDIUM", "MODERATE":
		return SeverityMedium
	case "LOW":
		return SeverityLow
	default:
		return SeverityInfo
	}
}
