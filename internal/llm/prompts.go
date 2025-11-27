package llm

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/dso-cli/dso-cli/internal/scanner"
)

// AnalysisResult contains the AI analysis summary
type AnalysisResult struct {
	Summary        string   `json:"summary"`
	Critical       []string `json:"critical"`
	High           []string `json:"high"`
	Medium         []string `json:"medium"`
	Low            []string `json:"low"`
	FalsePositives []string `json:"false_positives,omitempty"`
	BusinessImpact string   `json:"business_impact"`
	TopFixes       []Fix    `json:"top_fixes"`
}

// Fix represents a recommended fix
type Fix struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Command     string `json:"command,omitempty"`
	Patch       string `json:"patch,omitempty"`
	File        string `json:"file"`
	Line        int    `json:"line,omitempty"`
	Priority    int    `json:"priority"`
}

// Analyze analyzes scan results with AI
func Analyze(results *scanner.ScanResults, projectPath string) (*AnalysisResult, error) {
	client := NewOllamaClient()

	// Load the system prompt
	prompt := loadSystemPrompt()

	// Prepare data for AI
	scanData := formatScanResultsForAI(results, projectPath)
	fullPrompt := fmt.Sprintf("%s\n\n%s", prompt, scanData)

	// Call AI
	response, err := client.Generate(fullPrompt)
	if err != nil {
		return nil, err
	}

	// Parse the response (JSON format or free text)
	return parseAIResponse(response, results)
}

// ExplainVulnerability explains a specific vulnerability
func ExplainVulnerability(vulnID string, projectPath string) (string, error) {
	client := NewOllamaClient()

	prompt := fmt.Sprintf(`You are a senior DevSecOps engineer. A developer asks you why this vulnerability is critical or if it's a false positive.

Vulnerability ID: %s
Project: %s

Explain in 3-4 sentences:
1. Why this vulnerability is dangerous (or why it's a false positive)
2. Whether it's exploitable in production
3. How to fix it quickly

Be direct, technical but educational.`, vulnID, projectPath)

	return client.Generate(prompt)
}

// loadSystemPrompt loads the system prompt from template
func loadSystemPrompt() string {
	// Look for template in several possible locations
	paths := []string{
		"templates/prompt_system.txt",
		"./templates/prompt_system.txt",
		filepath.Join(os.Getenv("HOME"), ".dso", "templates", "prompt_system.txt"),
	}

	for _, path := range paths {
		if data, err := os.ReadFile(path); err == nil {
			return string(data)
		}
	}

	// Fallback: embedded prompt
	return getDefaultPrompt()
}

// getDefaultPrompt returns the default prompt
func getDefaultPrompt() string {
	return `You are a senior DevSecOps engineer, direct, educational, and a bit playful.
You speak in technical but friendly English.

Your job: look at SARIF scan results and output ONLY the 3-5 problems that really matter for this project.

For each problem:
- Real business severity (not just CVSS)
- Whether it's exploitable in production or not
- The exact command or patch to apply
- A light joke if it's a junior mistake

Always start with a 2-line ultra-clear summary.

End with "Ready to fix this in 2 min? Run: dso fix --auto"

Respond in JSON with this structure:
{
  "summary": "2-line summary",
  "critical": ["issue 1", "issue 2"],
  "high": ["issue 3"],
  "medium": [],
  "low": [],
  "business_impact": "Real business impact",
  "top_fixes": [
    {
      "title": "Fix title",
      "description": "Description",
      "command": "command to run",
      "patch": "diff if needed",
      "file": "affected file",
      "line": 12,
      "priority": 1
    }
  ]
}`
}

// formatScanResultsForAI formats results for AI
func formatScanResultsForAI(results *scanner.ScanResults, projectPath string) string {
	var sb strings.Builder
	sb.WriteString(fmt.Sprintf("Project: %s\n", projectPath))
	sb.WriteString(fmt.Sprintf("Total findings: %d\n", results.Summary.Total))
	sb.WriteString(fmt.Sprintf("Critical: %d, High: %d, Medium: %d, Low: %d\n\n",
		results.Summary.Critical, results.Summary.High, results.Summary.Medium, results.Summary.Low))

	// Group by severity
	critical := []scanner.Finding{}
	high := []scanner.Finding{}
	medium := []scanner.Finding{}

	for _, f := range results.Findings {
		switch f.Severity {
		case scanner.SeverityCritical:
			critical = append(critical, f)
		case scanner.SeverityHigh:
			high = append(high, f)
		case scanner.SeverityMedium:
			medium = append(medium, f)
		}
	}

	// Limit to 20 findings per category to avoid prompts that are too long
	limit := 20
	if len(critical) > limit {
		critical = critical[:limit]
	}
	if len(high) > limit {
		high = high[:limit]
	}
	if len(medium) > limit {
		medium = medium[:limit]
	}

	sb.WriteString("=== CRITICAL ===\n")
	for _, f := range critical {
		sb.WriteString(fmt.Sprintf("- [%s] %s\n  File: %s:%d\n  %s\n\n",
			f.ID, f.Title, f.File, f.Line, f.Description))
	}

	sb.WriteString("=== HIGH ===\n")
	for _, f := range high {
		sb.WriteString(fmt.Sprintf("- [%s] %s\n  File: %s:%d\n  %s\n\n",
			f.ID, f.Title, f.File, f.Line, f.Description))
	}

	sb.WriteString("=== MEDIUM (top 10) ===\n")
	for i, f := range medium {
		if i >= 10 {
			break
		}
		sb.WriteString(fmt.Sprintf("- [%s] %s\n  File: %s\n\n",
			f.ID, f.Title, f.File))
	}

	return sb.String()
}

// parseAIResponse parses the AI response
func parseAIResponse(response string, results *scanner.ScanResults) (*AnalysisResult, error) {
	// Try to parse as JSON first
	response = strings.TrimSpace(response)

	// Look for a JSON block in the response
	jsonStart := strings.Index(response, "{")
	jsonEnd := strings.LastIndex(response, "}")
	if jsonStart != -1 && jsonEnd != -1 && jsonEnd > jsonStart {
		jsonStr := response[jsonStart : jsonEnd+1]
		var result AnalysisResult
		if err := json.Unmarshal([]byte(jsonStr), &result); err == nil {
			return &result, nil
		}
	}

	// Fallback: create a basic result from raw data
	return createFallbackAnalysis(results), nil
}

// createFallbackAnalysis creates a basic analysis if AI doesn't respond in JSON
func createFallbackAnalysis(results *scanner.ScanResults) *AnalysisResult {
	analysis := &AnalysisResult{
		Summary: fmt.Sprintf("Scan completed: %d findings total (%d critical, %d high).",
			results.Summary.Total, results.Summary.Critical, results.Summary.High),
		TopFixes: []Fix{},
	}

	// Extract top 3 critical/high findings
	count := 0
	for _, f := range results.Findings {
		if count >= 3 {
			break
		}
		if f.Severity == scanner.SeverityCritical || f.Severity == scanner.SeverityHigh {
			analysis.TopFixes = append(analysis.TopFixes, Fix{
				Title:       f.Title,
				Description: f.Description,
				File:        f.File,
				Line:        f.Line,
				Priority:    count + 1,
			})
			count++
		}
	}

	return analysis
}
