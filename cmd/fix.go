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
	fixAuto    bool
	fixConfirm bool
)

var fixCmd = &cobra.Command{
	Use:   "fix [path]",
	Short: "Apply automatic fixes",
	Long: `Automatically applies safe fixes (removes secrets, 
fixes .env files, etc.). Use --auto to apply without confirmation.`,
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

		fmt.Println("🔍 Quick scan to identify fixes...")
		results, err := scanner.RunFullScan(absPath)
		if err != nil {
			fmt.Fprintf(os.Stderr, "❌ Error during scan: %v\n", err)
			os.Exit(1)
		}

		fmt.Println("🔧 Applying fixes...")
		fixes, err := fixer.AutoFix(results, absPath, fixAuto)
		if err != nil {
			fmt.Fprintf(os.Stderr, "❌ Error applying fixes: %v\n", err)
			os.Exit(1)
		}

		if len(fixes) == 0 {
			fmt.Println("✅ No automatic fixes available.")
			return
		}

		fmt.Printf("\n✅ %d fix(es) applied successfully:\n", len(fixes))
		for _, fix := range fixes {
			fmt.Printf("  • %s\n", fix)
		}

		if !fixAuto {
			fmt.Println("\n💡 Use --auto to apply automatically without confirmation.")
		}
	},
}

func init() {
	fixCmd.Flags().BoolVarP(&fixAuto, "auto", "a", false, "Apply fixes without confirmation")
	fixCmd.Flags().BoolVarP(&fixConfirm, "confirm", "c", false, "Ask confirmation for each fix")
}
