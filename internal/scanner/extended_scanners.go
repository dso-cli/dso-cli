package scanner

import (
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

// scanSecretsExtended scans with multiple secret detection tools
func scanSecretsExtended(path string) ([]Finding, error) {
	var findings []Finding

	// Gitleaks (already in main scanner, but we'll enhance it)
	if _, err := exec.LookPath("gitleaks"); err == nil {
		if gitleaksFindings, err := scanWithGitleaks(path); err == nil {
			findings = append(findings, gitleaksFindings...)
		}
	}

	// TruffleHog
	if _, err := exec.LookPath("trufflehog"); err == nil {
		if truffleFindings, err := scanWithTruffleHog(path); err == nil {
			findings = append(findings, truffleFindings...)
		}
	}

	// detect-secrets
	if _, err := exec.LookPath("detect-secrets"); err == nil {
		if detectFindings, err := scanWithDetectSecrets(path); err == nil {
			findings = append(findings, detectFindings...)
		}
	}

	return findings, nil
}

// scanWithGitleaks enhanced gitleaks scanning
func scanWithGitleaks(path string) ([]Finding, error) {
	var findings []Finding
	cmd := exec.Command("gitleaks", "detect", "--source", path, "--no-git", "--format", "json",
		"--exclude-path", "node_modules", "--exclude-path", "vendor", "--exclude-path", "dist",
		"--exclude-path", "build", "--exclude-path", ".git", "--exclude-path", ".cache")
	output, err := cmd.Output()
	if err != nil && len(output) > 0 {
		var results []struct {
			RuleID    string `json:"RuleID"`
			File      string `json:"File"`
			StartLine string `json:"StartLine"`
			Secret    string `json:"Secret"`
		}
		if json.Unmarshal(output, &results) == nil {
			for _, r := range results {
				line, _ := strconv.Atoi(r.StartLine)
				findings = append(findings, Finding{
					ID:          fmt.Sprintf("gitleaks-%s-%s-%s", r.RuleID, r.File, r.StartLine),
					Type:        "SECRET",
					Severity:    SeverityCritical,
					Title:       fmt.Sprintf("Exposed secret: %s", r.RuleID),
					Description: fmt.Sprintf("Secret detected in %s at line %s", r.File, r.StartLine),
					File:        r.File,
					Line:        line,
					Tool:        "gitleaks",
					Fixable:     true,
					Exploitable: true,
					Timestamp:   time.Now(),
				})
			}
		}
	}
	return findings, nil
}

// scanWithTruffleHog scans with TruffleHog
func scanWithTruffleHog(path string) ([]Finding, error) {
	var findings []Finding
	cmd := exec.Command("trufflehog", "filesystem", path, "--json", "--no-verification")
	output, err := cmd.Output()
	if err != nil && len(output) > 0 {
		lines := strings.Split(string(output), "\n")
		for _, line := range lines {
			line = strings.TrimSpace(line)
			if line == "" {
				continue
			}
			var result struct {
				DetectorName string `json:"DetectorName"`
				Raw          string `json:"Raw"`
				Redacted     string `json:"Redacted"`
				SourceMetadata struct {
					Data struct {
						File string `json:"file"`
						Line int    `json:"line"`
					} `json:"Data"`
				} `json:"SourceMetadata"`
			}
			if json.Unmarshal([]byte(line), &result) == nil {
				findings = append(findings, Finding{
					ID:          fmt.Sprintf("trufflehog-%s-%s", result.DetectorName, result.SourceMetadata.Data.File),
					Type:        "SECRET",
					Severity:    SeverityCritical,
					Title:       fmt.Sprintf("Secret detected: %s", result.DetectorName),
					Description: fmt.Sprintf("Potential secret found: %s", result.Redacted),
					File:        result.SourceMetadata.Data.File,
					Line:        result.SourceMetadata.Data.Line,
					Tool:        "trufflehog",
					Fixable:     true,
					Exploitable: true,
				})
			}
		}
	}
	return findings, nil
}

// scanWithDetectSecrets scans with detect-secrets
func scanWithDetectSecrets(path string) ([]Finding, error) {
	var findings []Finding
	// detect-secrets scan --baseline .secrets.baseline
	cmd := exec.Command("detect-secrets", "scan", path, "--baseline", filepath.Join(path, ".secrets.baseline"))
	output, err := cmd.Output()
	if err == nil && len(output) > 0 {
		var result struct {
			Results map[string][]struct {
				Type       string `json:"type"`
				LineNumber int    `json:"line_number"`
				Filename   string `json:"filename"`
			} `json:"results"`
		}
		if json.Unmarshal(output, &result) == nil {
			for file, secrets := range result.Results {
				for _, secret := range secrets {
					findings = append(findings, Finding{
						ID:          fmt.Sprintf("detect-secrets-%s-%d", file, secret.LineNumber),
						Type:        "SECRET",
						Severity:    SeverityCritical,
						Title:       fmt.Sprintf("Secret detected: %s", secret.Type),
						Description: fmt.Sprintf("Potential secret of type %s found", secret.Type),
						File:        secret.Filename,
						Line:        secret.LineNumber,
						Tool:        "detect-secrets",
						Fixable:     true,
						Exploitable: true,
					})
				}
			}
		}
	}
	return findings, nil
}

// scanSASTExtended scans with multiple SAST tools
func scanSASTExtended(path string, language string) ([]Finding, error) {
	var findings []Finding

	// Semgrep (universal SAST)
	if _, err := exec.LookPath("semgrep"); err == nil {
		if semgrepFindings, err := scanWithSemgrep(path); err == nil {
			findings = append(findings, semgrepFindings...)
		}
	}

	// Language-specific scanners
	switch language {
	case "python":
		if _, err := exec.LookPath("bandit"); err == nil {
			if banditFindings, err := scanWithBandit(path); err == nil {
				findings = append(findings, banditFindings...)
			}
		}
	case "go":
		if _, err := exec.LookPath("gosec"); err == nil {
			if gosecFindings, err := scanWithGosec(path); err == nil {
				findings = append(findings, gosecFindings...)
			}
		}
	case "javascript", "typescript":
		if _, err := exec.LookPath("eslint"); err == nil {
			if eslintFindings, err := scanWithESLint(path); err == nil {
				findings = append(findings, eslintFindings...)
			}
		}
	case "ruby":
		if _, err := exec.LookPath("brakeman"); err == nil {
			if brakemanFindings, err := scanWithBrakeman(path); err == nil {
				findings = append(findings, brakemanFindings...)
			}
		}
	}

	return findings, nil
}

// scanWithSemgrep scans with Semgrep
func scanWithSemgrep(path string) ([]Finding, error) {
	var findings []Finding
	cmd := exec.Command("semgrep", "--config", "auto", "--json", path)
	output, err := cmd.Output()
	if err == nil && len(output) > 0 {
		var result struct {
			Results []struct {
				CheckID  string `json:"check_id"`
				Path     string `json:"path"`
				Start    struct {
					Line int `json:"line"`
				} `json:"start"`
				End struct {
					Line int `json:"line"`
				} `json:"end"`
				Message string `json:"message"`
				Metadata struct {
					Severity string `json:"severity"`
				} `json:"metadata"`
			} `json:"results"`
		}
		if json.Unmarshal(output, &result) == nil {
			for _, r := range result.Results {
				severity := mapSeverity(r.Metadata.Severity)
				findings = append(findings, Finding{
					ID:          fmt.Sprintf("semgrep-%s-%s-%d", r.CheckID, r.Path, r.Start.Line),
					Type:        "SAST",
					Severity:    severity,
					Title:       r.CheckID,
					Description: r.Message,
					File:        r.Path,
					Line:        r.Start.Line,
					Tool:        "semgrep",
					Fixable:     true,
				})
			}
		}
	}
	return findings, nil
}

// scanWithBandit scans Python code with Bandit
func scanWithBandit(path string) ([]Finding, error) {
	var findings []Finding
	cmd := exec.Command("bandit", "-r", "-f", "json", path)
	output, err := cmd.Output()
	if err == nil && len(output) > 0 {
		var result struct {
			Results []struct {
				TestID   string `json:"test_id"`
				IssueSeverity string `json:"issue_severity"`
				IssueConfidence string `json:"issue_confidence"`
				Text     string `json:"text"`
				Filename string `json:"filename"`
				LineNumber int  `json:"line_number"`
			} `json:"results"`
		}
		if json.Unmarshal(output, &result) == nil {
			for _, r := range result.Results {
				severity := mapSeverity(r.IssueSeverity)
				findings = append(findings, Finding{
					ID:          fmt.Sprintf("bandit-%s-%s-%d", r.TestID, r.Filename, r.LineNumber),
					Type:        "SAST",
					Severity:    severity,
					Title:       r.TestID,
					Description: r.Text,
					File:        r.Filename,
					Line:        r.LineNumber,
					Tool:        "bandit",
					Fixable:     true,
				})
			}
		}
	}
	return findings, nil
}

// scanWithGosec scans Go code with Gosec
func scanWithGosec(path string) ([]Finding, error) {
	var findings []Finding
	cmd := exec.Command("gosec", "-fmt", "json", "./...")
	cmd.Dir = path
	output, err := cmd.Output()
	if err == nil && len(output) > 0 {
		var result struct {
			Issues []struct {
				Severity   string `json:"severity"`
				Confidence string `json:"confidence"`
				RuleID     string `json:"rule_id"`
				Details    string `json:"details"`
				File       string `json:"file"`
				Line       string `json:"line"`
			} `json:"Issues"`
		}
		if json.Unmarshal(output, &result) == nil {
			for _, issue := range result.Issues {
				line, _ := strconv.Atoi(issue.Line)
				severity := mapSeverity(issue.Severity)
				findings = append(findings, Finding{
					ID:          fmt.Sprintf("gosec-%s-%s-%s", issue.RuleID, issue.File, issue.Line),
					Type:        "SAST",
					Severity:    severity,
					Title:       issue.RuleID,
					Description: issue.Details,
					File:        issue.File,
					Line:        line,
					Tool:        "gosec",
					Fixable:     true,
				})
			}
		}
	}
	return findings, nil
}

// scanWithESLint scans JavaScript/TypeScript with ESLint security plugin
func scanWithESLint(path string) ([]Finding, error) {
	var findings []Finding
	// ESLint with security plugin
	cmd := exec.Command("eslint", "--format", "json", path)
	output, err := cmd.Output()
	if err == nil && len(output) > 0 {
		var results []struct {
			FilePath string `json:"filePath"`
			Messages []struct {
				RuleId   string `json:"ruleId"`
				Severity int    `json:"severity"`
				Message  string `json:"message"`
				Line     int    `json:"line"`
			} `json:"messages"`
		}
		if json.Unmarshal(output, &results) == nil {
			for _, file := range results {
				for _, msg := range file.Messages {
					// Only include security-related rules
					if strings.Contains(msg.RuleId, "security") || strings.Contains(msg.RuleId, "no-eval") ||
						strings.Contains(msg.RuleId, "no-implied-eval") {
						severity := SeverityLow
						if msg.Severity == 2 {
							severity = SeverityHigh
						} else if msg.Severity == 1 {
							severity = SeverityMedium
						}
						findings = append(findings, Finding{
							ID:          fmt.Sprintf("eslint-%s-%s-%d", msg.RuleId, file.FilePath, msg.Line),
							Type:        "SAST",
							Severity:    severity,
							Title:       msg.RuleId,
							Description: msg.Message,
							File:        file.FilePath,
							Line:        msg.Line,
							Tool:        "eslint",
							Fixable:     true,
						})
					}
				}
			}
		}
	}
	return findings, nil
}

// scanWithBrakeman scans Ruby on Rails code with Brakeman
func scanWithBrakeman(path string) ([]Finding, error) {
	var findings []Finding
	cmd := exec.Command("brakeman", "-f", "json", path)
	output, err := cmd.Output()
	if err == nil && len(output) > 0 {
		var result struct {
			Warnings []struct {
				WarningType string `json:"warning_type"`
				WarningCode int    `json:"warning_code"`
				Message     string `json:"message"`
				File        string `json:"file"`
				Line        int    `json:"line"`
				Confidence  string `json:"confidence"`
			} `json:"warnings"`
		}
		if json.Unmarshal(output, &result) == nil {
			for _, warning := range result.Warnings {
				severity := SeverityMedium
				if warning.Confidence == "High" {
					severity = SeverityHigh
				}
				findings = append(findings, Finding{
					ID:          fmt.Sprintf("brakeman-%d-%s-%d", warning.WarningCode, warning.File, warning.Line),
					Type:        "SAST",
					Severity:    severity,
					Title:       warning.WarningType,
					Description: warning.Message,
					File:        warning.File,
					Line:        warning.Line,
					Tool:        "brakeman",
					Fixable:     true,
				})
			}
		}
	}
	return findings, nil
}

// scanDependenciesExtended scans with multiple dependency scanners
func scanDependenciesExtended(path string) ([]Finding, error) {
	var findings []Finding

	// Snyk
	if _, err := exec.LookPath("snyk"); err == nil {
		if snykFindings, err := scanWithSnyk(path); err == nil {
			findings = append(findings, snykFindings...)
		}
	}

	// OWASP Dependency-Check
	if _, err := exec.LookPath("dependency-check"); err == nil {
		if depCheckFindings, err := scanWithDependencyCheck(path); err == nil {
			findings = append(findings, depCheckFindings...)
		}
	}

	return findings, nil
}

// scanWithSnyk scans with Snyk
func scanWithSnyk(path string) ([]Finding, error) {
	var findings []Finding
	cmd := exec.Command("snyk", "test", "--json", path)
	output, err := cmd.Output()
	if err == nil && len(output) > 0 {
		var result struct {
			Vulnerabilities []struct {
				ID          string `json:"id"`
				Title       string `json:"title"`
				Severity    string `json:"severity"`
				Description string `json:"description"`
				PackageName string `json:"packageName"`
			} `json:"vulnerabilities"`
		}
		if json.Unmarshal(output, &result) == nil {
			for _, vuln := range result.Vulnerabilities {
				severity := mapSeverity(vuln.Severity)
				findings = append(findings, Finding{
					ID:          fmt.Sprintf("snyk-%s-%s", vuln.ID, vuln.PackageName),
					Type:        "DEPENDENCY",
					Severity:    severity,
					Title:       vuln.Title,
					Description: vuln.Description,
					Tool:        "snyk",
					Fixable:     true,
				})
			}
		}
	}
	return findings, nil
}

// scanWithDependencyCheck scans with OWASP Dependency-Check
func scanWithDependencyCheck(path string) ([]Finding, error) {
	var findings []Finding
	// Create report directory
	reportDir := filepath.Join(path, ".dependency-check-reports")
	cmd := exec.Command("dependency-check", "--project", "DSO-Scan", "--scan", path, "--format", "JSON", "--out", reportDir)
	_, err := cmd.Output()
	if err == nil {
		reportFile := filepath.Join(reportDir, "dependency-check-report.json")
		if data, readErr := os.ReadFile(reportFile); readErr == nil {
			var result struct {
				Dependencies []struct {
					Vulnerabilities []struct {
						Name        string `json:"name"`
						Severity    string `json:"severity"`
						Description string `json:"description"`
					} `json:"vulnerabilities"`
					FileName string `json:"fileName"`
				} `json:"dependencies"`
			}
			if json.Unmarshal(data, &result) == nil {
				for _, dep := range result.Dependencies {
					for _, vuln := range dep.Vulnerabilities {
						severity := mapSeverity(vuln.Severity)
						findings = append(findings, Finding{
							ID:          fmt.Sprintf("depcheck-%s-%s", vuln.Name, dep.FileName),
							Type:        "DEPENDENCY",
							Severity:    severity,
							Title:       vuln.Name,
							Description: vuln.Description,
							File:        dep.FileName,
							Tool:        "dependency-check",
							Fixable:     true,
						})
					}
				}
			}
		}
	}
	return findings, nil
}

// scanIaCExtended scans with multiple IaC scanners
func scanIaCExtended(path string) ([]Finding, error) {
	var findings []Finding

	// Checkov
	if _, err := exec.LookPath("checkov"); err == nil {
		if checkovFindings, err := scanWithCheckov(path); err == nil {
			findings = append(findings, checkovFindings...)
		}
	}

	// Terrascan
	if _, err := exec.LookPath("terrascan"); err == nil {
		if terrascanFindings, err := scanWithTerrascan(path); err == nil {
			findings = append(findings, terrascanFindings...)
		}
	}

	// Kics
	if _, err := exec.LookPath("kics"); err == nil {
		if kicsFindings, err := scanWithKics(path); err == nil {
			findings = append(findings, kicsFindings...)
		}
	}

	return findings, nil
}

// scanWithCheckov scans with Checkov
func scanWithCheckov(path string) ([]Finding, error) {
	var findings []Finding
	cmd := exec.Command("checkov", "-d", path, "-o", "json", "--quiet")
	output, err := cmd.Output()
	if err == nil && len(output) > 0 {
		var result struct {
			Results struct {
				FailedChecks []struct {
					CheckID   string `json:"check_id"`
					CheckName string `json:"check_name"`
					Severity  string `json:"severity"`
					File      string `json:"file_path"`
					Line      []int  `json:"file_line_range"`
				} `json:"failed_checks"`
			} `json:"results"`
		}
		if json.Unmarshal(output, &result) == nil {
			for _, check := range result.Results.FailedChecks {
				line := 0
				if len(check.Line) > 0 {
					line = check.Line[0]
				}
				severity := mapSeverity(check.Severity)
				findings = append(findings, Finding{
					ID:          fmt.Sprintf("checkov-%s-%s-%d", check.CheckID, check.File, line),
					Type:        "IAC",
					Severity:    severity,
					Title:       check.CheckName,
					Description: check.CheckID,
					File:        check.File,
					Line:        line,
					Tool:        "checkov",
					Fixable:     true,
				})
			}
		}
	}
	return findings, nil
}

// scanWithTerrascan scans with Terrascan
func scanWithTerrascan(path string) ([]Finding, error) {
	var findings []Finding
	cmd := exec.Command("terrascan", "scan", "-i", "all", "-t", "all", "-o", "json", "-d", path)
	output, err := cmd.Output()
	if err == nil && len(output) > 0 {
		var result struct {
			Violations []struct {
				RuleID    string `json:"rule_id"`
				RuleName  string `json:"rule_name"`
				Severity  string `json:"severity"`
				File      string `json:"file"`
				Line      int    `json:"line_number"`
				Description string `json:"description"`
			} `json:"violations"`
		}
		if json.Unmarshal(output, &result) == nil {
			for _, violation := range result.Violations {
				severity := mapSeverity(violation.Severity)
				findings = append(findings, Finding{
					ID:          fmt.Sprintf("terrascan-%s-%s-%d", violation.RuleID, violation.File, violation.Line),
					Type:        "IAC",
					Severity:    severity,
					Title:       violation.RuleName,
					Description: violation.Description,
					File:        violation.File,
					Line:        violation.Line,
					Tool:        "terrascan",
					Fixable:     true,
				})
			}
		}
	}
	return findings, nil
}

// scanWithKics scans with Kics
func scanWithKics(path string) ([]Finding, error) {
	var findings []Finding
	cmd := exec.Command("kics", "scan", "-p", path, "-o", filepath.Join(path, ".kics-results"), "--report-formats", "json")
	_, err := cmd.Output()
	if err == nil {
		reportFile := filepath.Join(path, ".kics-results", "results.json")
		if data, readErr := os.ReadFile(reportFile); readErr == nil {
			var result struct {
				Queries []struct {
					QueryID   string `json:"query_id"`
					QueryName string `json:"query_name"`
					Severity  string `json:"severity"`
					Files     []struct {
						FileName string `json:"file_name"`
						Line     int    `json:"line"`
					} `json:"files"`
				} `json:"queries"`
			}
			if json.Unmarshal(data, &result) == nil {
				for _, query := range result.Queries {
					severity := mapSeverity(query.Severity)
					for _, file := range query.Files {
						findings = append(findings, Finding{
							ID:          fmt.Sprintf("kics-%s-%s-%d", query.QueryID, file.FileName, file.Line),
							Type:        "IAC",
							Severity:    severity,
							Title:       query.QueryName,
							Description: query.QueryID,
							File:        file.FileName,
							Line:        file.Line,
							Tool:        "kics",
							Fixable:     true,
						})
					}
				}
			}
		}
	}
	return findings, nil
}

// scanContainersExtended scans with multiple container security tools
func scanContainersExtended(path string) ([]Finding, error) {
	var findings []Finding

	// Hadolint for Dockerfiles
	if _, err := exec.LookPath("hadolint"); err == nil {
		if hadolintFindings, err := scanWithHadolint(path); err == nil {
			findings = append(findings, hadolintFindings...)
		}
	}

	return findings, nil
}

// scanWithHadolint scans Dockerfiles with Hadolint
func scanWithHadolint(path string) ([]Finding, error) {
	var findings []Finding
	// Find all Dockerfiles
	dockerfiles := []string{}
	filepath.Walk(path, func(p string, info os.FileInfo, err error) error {
		if err != nil {
			return nil
		}
		if info.Name() == "Dockerfile" || strings.HasSuffix(info.Name(), ".dockerfile") {
			dockerfiles = append(dockerfiles, p)
		}
		return nil
	})

	for _, dockerfile := range dockerfiles {
		cmd := exec.Command("hadolint", "--format", "json", dockerfile)
		output, err := cmd.Output()
		if err == nil && len(output) > 0 {
			var results []struct {
				Code     string `json:"code"`
				Level    string `json:"level"`
				Message  string `json:"message"`
				Line     int    `json:"line"`
				Column   int    `json:"column"`
			}
			if json.Unmarshal(output, &results) == nil {
				for _, r := range results {
					severity := SeverityLow
					if r.Level == "error" {
						severity = SeverityHigh
					} else if r.Level == "warning" {
						severity = SeverityMedium
					}
					findings = append(findings, Finding{
						ID:          fmt.Sprintf("hadolint-%s-%s-%d", r.Code, dockerfile, r.Line),
						Type:        "CONTAINER",
						Severity:    severity,
						Title:       r.Code,
						Description: r.Message,
						File:        dockerfile,
						Line:        r.Line,
						Tool:        "hadolint",
						Fixable:     true,
					})
				}
			}
		}
	}
	return findings, nil
}

