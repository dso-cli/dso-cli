package ui

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"

	"github.com/charmbracelet/lipgloss"
	"github.com/dso-cli/dso-cli/internal/llm"
	"github.com/dso-cli/dso-cli/internal/scanner"
)

var (
	// Styles
	titleStyle = lipgloss.NewStyle().
			Bold(true).
			Foreground(lipgloss.Color("1")).
			Padding(0, 1)

	criticalStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("1")).
			Bold(true)

	highStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("3")).
			Bold(true)

	mediumStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("11"))

	lowStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("6"))

	successStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("2")).
			Bold(true)

	infoStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("4"))

	codeStyle = lipgloss.NewStyle().
			Background(lipgloss.Color("8")).
			Padding(0, 1).
			Margin(1, 0)
)

// PrintBeautifulSummary affiche un résumé magnifique des résultats
func PrintBeautifulSummary(analysis *llm.AnalysisResult, results *scanner.ScanResults, jsonOutput bool) {
	if jsonOutput {
		printJSON(analysis, results)
		return
	}

	// Header
	fmt.Println()
	fmt.Println(titleStyle.Render("🔒 DSO - DevSecOps Oracle"))
	fmt.Println()

	// Summary
	fmt.Println(successStyle.Render("📊 Summary"))
	fmt.Println(strings.Repeat("─", 60))
	fmt.Printf("  %s\n\n", analysis.Summary)

	// Statistics
	fmt.Println(infoStyle.Render("📈 Statistics"))
	fmt.Println(strings.Repeat("─", 60))
	fmt.Printf("  Total: %d findings\n", results.Summary.Total)
	fmt.Printf("  %s Critical: %d\n", criticalStyle.Render("🔴"), results.Summary.Critical)
	fmt.Printf("  %s High: %d\n", highStyle.Render("🟠"), results.Summary.High)
	fmt.Printf("  %s Medium: %d\n", mediumStyle.Render("🟡"), results.Summary.Medium)
	fmt.Printf("  %s Low: %d\n", lowStyle.Render("🔵"), results.Summary.Low)
	fmt.Printf("  ✅ Fixable: %d\n", results.Summary.Fixable)
	fmt.Printf("  ⚠️  Exploitable: %d\n", results.Summary.Exploitable)
	fmt.Println()

	// Business impact
	if analysis.BusinessImpact != "" {
		fmt.Println(infoStyle.Render("💼 Business Impact"))
		fmt.Println(strings.Repeat("─", 60))
		fmt.Printf("  %s\n\n", analysis.BusinessImpact)
	}

	// Top fixes
	if len(analysis.TopFixes) > 0 {
		fmt.Println(successStyle.Render("🔧 Top Priority Fixes"))
		fmt.Println(strings.Repeat("─", 60))
		for i, fix := range analysis.TopFixes {
			severity := criticalStyle
			if fix.Priority > 1 {
				severity = highStyle
			}
			fmt.Printf("\n%s %d. %s\n", severity.Render("❌"), fix.Priority, fix.Title)
			fmt.Printf("   📁 %s", fix.File)
			if fix.Line > 0 {
				fmt.Printf(":%d", fix.Line)
			}
			fmt.Println()
			if fix.Description != "" {
				fmt.Printf("   %s\n", fix.Description)
			}
			if fix.Command != "" {
				fmt.Println()
				fmt.Println(codeStyle.Render(fix.Command))
			}
			if fix.Patch != "" {
				fmt.Println()
				fmt.Println(codeStyle.Render(fix.Patch))
			}
			if i < len(analysis.TopFixes)-1 {
				fmt.Println()
			}
		}
		fmt.Println()
	}

	// Critical issues
	if len(analysis.Critical) > 0 {
		fmt.Println(criticalStyle.Render("🔴 Critical Issues"))
		fmt.Println(strings.Repeat("─", 60))
		for _, issue := range analysis.Critical {
			fmt.Printf("  • %s\n", issue)
		}
		fmt.Println()
	}

	// High issues
	if len(analysis.High) > 0 {
		fmt.Println(highStyle.Render("🟠 High Issues"))
		fmt.Println(strings.Repeat("─", 60))
		for _, issue := range analysis.High {
			fmt.Printf("  • %s\n", issue)
		}
		fmt.Println()
	}

	// False positives
	if len(analysis.FalsePositives) > 0 {
		fmt.Println(infoStyle.Render("✅ False Positives Identified"))
		fmt.Println(strings.Repeat("─", 60))
		for _, fp := range analysis.FalsePositives {
			fmt.Printf("  • %s\n", fp)
		}
		fmt.Println()
	}

	// Footer
	fmt.Println(strings.Repeat("─", 60))
	fmt.Println()
	fmt.Println(successStyle.Render("💡 Ready to fix this in 2 min? Run: dso fix --auto"))
	fmt.Println()
}

// PrintRawResults displays raw results without AI analysis
func PrintRawResults(results *scanner.ScanResults) {
	fmt.Println()
	fmt.Println(titleStyle.Render("🔒 DSO - Raw Results"))
	fmt.Println()

	fmt.Printf("Total: %d findings\n", results.Summary.Total)
	fmt.Printf("Critical: %d, High: %d, Medium: %d, Low: %d\n\n",
		results.Summary.Critical, results.Summary.High, results.Summary.Medium, results.Summary.Low)

	for _, f := range results.Findings {
		severity := lowStyle
		switch f.Severity {
		case scanner.SeverityCritical:
			severity = criticalStyle
		case scanner.SeverityHigh:
			severity = highStyle
		case scanner.SeverityMedium:
			severity = mediumStyle
		}

		fmt.Printf("%s [%s] %s\n", severity.Render(string(f.Severity)), f.Tool, f.Title)
		fmt.Printf("  📁 %s", f.File)
		if f.Line > 0 {
			fmt.Printf(":%d", f.Line)
		}
		fmt.Println()
		if f.Description != "" {
			fmt.Printf("  %s\n", f.Description)
		}
		fmt.Println()
	}
}

// printJSON affiche les résultats en JSON
func printJSON(analysis *llm.AnalysisResult, results *scanner.ScanResults) {
	output := map[string]interface{}{
		"analysis": analysis,
		"results":  results,
	}

	jsonData, err := json.MarshalIndent(output, "", "  ")
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		return
	}

	fmt.Println(string(jsonData))
}

