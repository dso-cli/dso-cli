package cmd

import (
	"fmt"
	"os"
	"strings"

	"github.com/dso-cli/dso-cli/internal/llm"
	"github.com/spf13/cobra"
)

var whyCmd = &cobra.Command{
	Use:   "why <vulnerability-id>",
	Short: "Explain why an alert is a false positive or not",
	Long: `Analyzes a specific vulnerability and explains in natural language 
whether it's a false positive, why it's critical, or how to fix it.`,
	Args: cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		vulnID := strings.TrimSpace(args[0])
		if vulnID == "" {
			fmt.Fprintf(os.Stderr, "❌ Error: vulnerability ID required\n")
			os.Exit(1)
		}

		fmt.Printf("🔍 Analyzing vulnerability: %s\n", vulnID)
		fmt.Println("🧠 Consulting local AI...")

		explanation, err := llm.ExplainVulnerability(vulnID, ".")
		if err != nil {
			fmt.Fprintf(os.Stderr, "❌ Error: %v\n", err)
			os.Exit(1)
		}

		fmt.Println()
		fmt.Println(explanation)
	},
}
