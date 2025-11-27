package cmd

import (
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/dso-cli/dso-cli/internal/scanner"
	"github.com/spf13/cobra"
)

var (
	watchInterval time.Duration
	watchQuiet    bool
)

var watchCmd = &cobra.Command{
	Use:   "watch [path]",
	Short: "Watch the repo and notify about new issues",
	Long: `Continuous monitoring mode. Scans the directory periodically 
and only notifies about newly detected security issues.`,
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

		fmt.Printf("👀 Watching: %s\n", absPath)
		fmt.Printf("⏱️  Interval: %v\n", watchInterval)
		fmt.Println("💡 Press Ctrl+C to stop")
		fmt.Println()

		// First scan
		lastResults := &scanner.ScanResults{}
		firstScan := true

		for {
			if !watchQuiet {
				fmt.Printf("\n[%s] 🔍 Scanning...\n", time.Now().Format("15:04:05"))
			}

			results, err := scanner.RunFullScan(absPath)
			if err != nil {
				if !watchQuiet {
					fmt.Fprintf(os.Stderr, "❌ Error during scan: %v\n", err)
				}
				time.Sleep(watchInterval)
				continue
			}

			// Compare with previous scan
			if !firstScan {
				newFindings := findNewFindings(lastResults, results)
				if len(newFindings) > 0 {
					fmt.Printf("\n🚨 %d new issue(s) detected!\n", len(newFindings))
					for _, finding := range newFindings {
						fmt.Printf("   • [%s] %s in %s\n", finding.Severity, finding.Title, finding.File)
					}
					fmt.Println()
				} else if !watchQuiet {
					fmt.Println("✅ No new issues")
				}
			} else {
				firstScan = false
				if !watchQuiet {
					fmt.Printf("📊 Initial scan: %d findings\n", results.Summary.Total)
				}
			}

			lastResults = results
			time.Sleep(watchInterval)
		}
	},
}

func init() {
	watchCmd.Flags().DurationVarP(&watchInterval, "interval", "i", 5*time.Minute, "Interval between scans")
	watchCmd.Flags().BoolVarP(&watchQuiet, "quiet", "q", false, "Quiet mode (only shows new issues)")
	rootCmd.AddCommand(watchCmd)
}

// findNewFindings finds findings that weren't in the previous scan
func findNewFindings(old, new *scanner.ScanResults) []scanner.Finding {
	newFindings := []scanner.Finding{}

	// Create a map of old findings for quick comparison
	oldMap := make(map[string]bool)
	for _, f := range old.Findings {
		key := fmt.Sprintf("%s:%s:%d", f.ID, f.File, f.Line)
		oldMap[key] = true
	}

	// Find new ones
	for _, f := range new.Findings {
		key := fmt.Sprintf("%s:%s:%d", f.ID, f.File, f.Line)
		if !oldMap[key] {
			newFindings = append(newFindings, f)
		}
	}

	return newFindings
}
