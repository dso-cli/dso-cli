package cmd

import (
	"fmt"
	"os"
	"strings"

	"github.com/dso-cli/dso-cli/internal/tools"
	"github.com/spf13/cobra"
)

var (
	toolsInstall bool
	toolsAll     bool
)

var toolsCmd = &cobra.Command{
	Use:   "tools",
	Short: "Manage scan tools (detection, installation)",
	Long: `Detects installed scan tools and offers to install missing ones.
Useful to verify that all scanners are available.`,
	Run: func(cmd *cobra.Command, args []string) {
		installed, missing := tools.CheckTools(!toolsAll)

		fmt.Println("🔧 Scan tools status")
		fmt.Println()

		if len(installed) > 0 {
			fmt.Println("✅ Installed tools:")
			for _, tool := range installed {
				fmt.Printf("   • %s", tool.Name)
				if tool.Version != "" {
					fmt.Printf(" (%s)", tool.Version)
				}
				fmt.Println()
				if tool.Description != "" {
					fmt.Printf("     %s\n", tool.Description)
				}
			}
			fmt.Println()
		}

		if len(missing) > 0 {
			fmt.Println("⚠️  Missing tools:")
			for _, tool := range missing {
				fmt.Printf("   • %s - %s\n", tool.Name, tool.Description)
				if tool.InstallCmd != "" {
					fmt.Printf("     💡 Installation: %s\n", tool.InstallCmd)
				}
			}
			fmt.Println()

			if toolsInstall {
				fmt.Println("📥 Interactive installation of missing tools...")
				for _, tool := range missing {
					if err := tools.InstallTool(tool, true); err != nil {
						if !strings.Contains(err.Error(), "cancelled") {
							fmt.Printf("⚠️  Failed to install %s: %v\n", tool.Name, err)
						}
					} else {
						fmt.Printf("✅ %s installed successfully\n", tool.Name)
					}
				}
			} else {
				fmt.Println("💡 Use --install to install missing tools interactively")
			}
		} else {
			fmt.Println("🎉 All tools are installed!")
		}

		// Recommendations
		if len(installed) == 0 {
			fmt.Println()
			fmt.Println("💡 Recommendation: Install at least Trivy for complete analysis:")
			fmt.Println("   brew install trivy")
		}
	},
}

func init() {
	toolsCmd.Flags().BoolVarP(&toolsInstall, "install", "i", false, "Offer to install missing tools")
	toolsCmd.Flags().BoolVarP(&toolsAll, "all", "a", false, "Show all tools (including optional)")
}
