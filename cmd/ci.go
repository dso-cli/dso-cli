package cmd

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/dso-cli/dso-cli/internal/ci"
	"github.com/spf13/cobra"
)

var (
	ciProvider string
	ciOutput   string
)

var ciCmd = &cobra.Command{
	Use:   "ci [path]",
	Short: "Generate CI/CD workflows (GitHub Actions, GitLab CI)",
	Long: `Automatically generates CI/CD workflows to integrate DSO into your pipeline.
Supports GitHub Actions and GitLab CI.`,
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

		fmt.Printf("🔧 Generating CI/CD workflow: %s\n", ciProvider)
		fmt.Printf("📁 Directory: %s\n\n", absPath)

		var content string
		var filename string

		switch ciProvider {
		case "github", "github-actions":
			content, filename, err = ci.GenerateGitHubActions(absPath, ciOutput)
		case "gitlab", "gitlab-ci":
			content, filename, err = ci.GenerateGitLabCI(absPath, ciOutput)
		default:
			fmt.Fprintf(os.Stderr, "❌ Invalid CI provider: %s\n", ciProvider)
			fmt.Println("Supported providers: github, gitlab")
			os.Exit(1)
		}

		if err != nil {
			fmt.Fprintf(os.Stderr, "❌ Error: %v\n", err)
			os.Exit(1)
		}

		// Create directory if needed
		dir := filepath.Dir(filename)
		if dir != "." && dir != "" {
			if err := os.MkdirAll(dir, 0o755); err != nil {
				fmt.Fprintf(os.Stderr, "❌ Error creating directory: %v\n", err)
				os.Exit(1)
			}
		}

		// Write file
		if err := os.WriteFile(filename, []byte(content), 0o600); err != nil {
			fmt.Fprintf(os.Stderr, "❌ Error writing file: %v\n", err)
			os.Exit(1)
		}

		fmt.Printf("✅ Workflow generated: %s\n", filename)
		fmt.Println()
		fmt.Println("💡 Next steps:")
		fmt.Println("   1. Commit the file to your repo")
		fmt.Println("   2. Push to GitHub/GitLab")
		fmt.Println("   3. The workflow will run automatically on each PR")
	},
}

func init() {
	ciCmd.Flags().StringVarP(&ciProvider, "provider", "p", "github", "CI provider (github, gitlab)")
	ciCmd.Flags().StringVarP(&ciOutput, "output", "o", "", "Output file (default: .github/workflows/dso.yml or .gitlab-ci.yml)")
	rootCmd.AddCommand(ciCmd)
}
