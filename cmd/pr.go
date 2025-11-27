package cmd

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/dso-cli/dso-cli/internal/fixer"
	"github.com/dso-cli/dso-cli/internal/scanner"
	"github.com/spf13/cobra"
)

var (
	prTitle   string
	prMessage string
	prBranch  string
)

var prCmd = &cobra.Command{
	Use:   "pr [path]",
	Short: "Open a Pull Request with fixes",
	Long: `Applies fixes and automatically opens a Pull Request 
on GitHub/GitLab with the changes.`,
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

		fmt.Println("🔍 Scanning and applying fixes...")
		results, err := scanner.RunFullScan(absPath)
		if err != nil {
			fmt.Fprintf(os.Stderr, "❌ Error during scan: %v\n", err)
			os.Exit(1)
		}

		fixes, err := fixer.AutoFix(results, absPath, true)
		if err != nil {
			fmt.Fprintf(os.Stderr, "❌ Error applying fixes: %v\n", err)
			os.Exit(1)
		}

		if len(fixes) == 0 {
			fmt.Println("✅ No fixes to apply.")
			return
		}

		fmt.Println("📝 Creating Pull Request...")
		prURL, err := fixer.CreatePullRequest(absPath, prBranch, prTitle, prMessage, fixes)
		if err != nil {
			fmt.Fprintf(os.Stderr, "❌ Error creating PR: %v\n", err)
			fmt.Println("💡 Make sure you have GitHub CLI (gh) installed and configured.")
			os.Exit(1)
		}

		fmt.Printf("\n✅ Pull Request created: %s\n", prURL)
	},
}

func init() {
	prCmd.Flags().StringVarP(&prTitle, "title", "t", "fix(security): automatic dso fixes", "PR title")
	prCmd.Flags().StringVarP(&prMessage, "message", "m", "", "PR message")
	prCmd.Flags().StringVarP(&prBranch, "branch", "b", "dso/security-fixes", "Branch for the PR")
}
