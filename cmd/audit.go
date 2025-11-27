package cmd

import (
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/dso-cli/dso-cli/internal/llm"
	"github.com/dso-cli/dso-cli/internal/scanner"
	"github.com/dso-cli/dso-cli/internal/tools"
	"github.com/dso-cli/dso-cli/internal/ui"
	"github.com/spf13/cobra"
)

var (
	auditFormat  string
	auditVerbose bool
)

var auditCmd = &cobra.Command{
	Use:   "audit [path]",
	Short: "Complete audit + AI analysis",
	Long: `Runs a complete security scan (SAST, secrets, dependencies, IaC) 
and analyzes results with local AI to give you the 3-5 critical issues.`,
	Args: cobra.MaximumNArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		path := "."
		if len(args) > 0 {
			path = args[0]
		}

		absPath, err := filepath.Abs(path)
		if err != nil {
			fmt.Fprintf(os.Stderr, "❌ Error: cannot resolve path %s\n", path)
			os.Exit(1)
		}

		if auditVerbose {
			fmt.Printf("📁 Analyzing directory: %s\n\n", absPath)
		}

		// Check available tools
		installed, missing := tools.CheckTools(false)
		if len(missing) > 0 && auditVerbose {
			fmt.Println("⚠️  Some tools are missing (scan will continue with available tools):")
			for _, tool := range missing {
				fmt.Printf("   • %s\n", tool.Name)
			}
			fmt.Println()
		}

		// Phase 1: Full scan
		fmt.Println("🔍 Scanning... (Trivy, grype, gitleaks, tfsec…)")
		start := time.Now()

		tracker := scanner.NewProgressTracker(auditVerbose)
		results, err := scanner.RunFullScanInteractive(absPath, auditVerbose, tracker)
		if err != nil {
			fmt.Fprintf(os.Stderr, "❌ Error during scan: %v\n", err)
			os.Exit(1)
		}

		scanDuration := time.Since(start)
		if auditVerbose {
			fmt.Printf("✅ Scan completed in %v\n\n", scanDuration.Round(time.Millisecond))
		}

		// Phase 2: AI Analysis
		fmt.Println("🧠 Analyzing with local AI (Ollama)…")
		if auditVerbose {
			fmt.Println("   💡 Use 'dso check' to verify Ollama status")
		}
		start = time.Now()

		summary, err := llm.Analyze(results, absPath)
		if err != nil {
			fmt.Fprintf(os.Stderr, "\n⚠️  Error during AI analysis: %v\n", err)
			fmt.Println("\n💡 Check Ollama status with: dso check")
			fmt.Println("\nDisplaying raw scan results:")
			ui.PrintRawResults(results)
			os.Exit(1)
		}

		analysisDuration := time.Since(start)
		if auditVerbose {
			fmt.Printf("✅ Analysis completed in %v\n\n", analysisDuration.Round(time.Millisecond))
		}

		// Phase 3: Display
		fmt.Println()
		ui.PrintBeautifulSummary(summary, results, auditFormat == "json")
	},
}

func init() {
	auditCmd.Flags().StringVarP(&auditFormat, "format", "f", "text", "Output format (text, json)")
	auditCmd.Flags().BoolVarP(&auditVerbose, "verbose", "v", false, "Verbose mode")
}

