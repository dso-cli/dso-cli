package cmd

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/dso-cli/dso-cli/internal/policy"
	"github.com/spf13/cobra"
)

var (
	policyType   string
	policyOutput string
)

var policyCmd = &cobra.Command{
	Use:   "policy [path]",
	Short: "Generate security policies (OPA/Rego, CODEOWNERS)",
	Long: `Automatically generates security policies based on audit results.
Supports OPA/Rego for validation and GitHub CODEOWNERS for review.`,
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

		fmt.Printf("📝 Generating policy: %s\n", policyType)
		fmt.Printf("📁 Directory: %s\n\n", absPath)

		var content string
		var filename string

		switch policyType {
		case "opa", "rego":
			content, err = policy.GenerateOPAPolicy(absPath)
			filename = policyOutput
			if filename == "" {
				filename = ".dso/policy.rego"
			}
		case "codeowners":
			content, err = policy.GenerateCODEOWNERS(absPath)
			filename = policyOutput
			if filename == "" {
				filename = ".github/CODEOWNERS"
			}
		default:
			fmt.Fprintf(os.Stderr, "❌ Invalid policy type: %s\n", policyType)
			fmt.Println("Supported types: opa, rego, codeowners")
			os.Exit(1)
		}

		if err != nil {
			fmt.Fprintf(os.Stderr, "❌ Error: %v\n", err)
			os.Exit(1)
		}

		// Create directory if needed
		dir := filepath.Dir(filename)
		if dir != "." && dir != "" {
			if err := os.MkdirAll(dir, 0755); err != nil {
				fmt.Fprintf(os.Stderr, "❌ Error creating directory: %v\n", err)
				os.Exit(1)
			}
		}

		// Write file
		if err := os.WriteFile(filename, []byte(content), 0644); err != nil {
			fmt.Fprintf(os.Stderr, "❌ Error writing file: %v\n", err)
			os.Exit(1)
		}

		fmt.Printf("✅ Policy generated: %s\n", filename)
	},
}

func init() {
	policyCmd.Flags().StringVarP(&policyType, "type", "t", "opa", "Policy type (opa, rego, codeowners)")
	policyCmd.Flags().StringVarP(&policyOutput, "output", "o", "", "Output file (default: .dso/policy.rego or .github/CODEOWNERS)")
	rootCmd.AddCommand(policyCmd)
}
