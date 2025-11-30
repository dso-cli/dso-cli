package cmd

import (
	"fmt"
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

		fmt.Println("🔧 DevSecOps Tools Status")
		fmt.Println()

		// Group tools by category
		categories := map[string][]tools.Tool{
			"SAST":           {},
			"Dependencies":   {},
			"Secrets":        {},
			"IaC":            {},
			"Containers":     {},
			"SBOM":           {},
			"Compliance":     {},
			"Linting":        {},
		}

		// Categorize tools
		for _, tool := range append(installed, missing...) {
			category := tools.GetToolCategory(tool.Name)
			if category != "" {
				categories[category] = append(categories[category], tool)
			} else {
				categories["Other"] = append(categories["Other"], tool)
			}
		}

		// Display by category
		for category, toolList := range categories {
			if len(toolList) == 0 {
				continue
			}

			fmt.Printf("📦 %s:\n", category)
			for _, tool := range toolList {
				status := "❌"
				if tool.Installed {
					status = "✅"
				}
				fmt.Printf("   %s %s", status, tool.Name)
				if tool.Installed && tool.Version != "" {
					fmt.Printf(" (%s)", tool.Version)
				}
				fmt.Println()
				if tool.Description != "" {
					fmt.Printf("      %s\n", tool.Description)
				}
				if !tool.Installed && tool.InstallCmd != "" {
					fmt.Printf("      💡 Install: %s\n", tool.InstallCmd)
				}
			}
			fmt.Println()
		}

		// Installation prompt
		if len(missing) > 0 {
			if toolsInstall {
				fmt.Println("📥 Interactive installation of missing tools...")
				for _, tool := range missing {
					if err := tools.InstallTool(tool, true); err != nil {
						if !strings.Contains(err.Error(), "canceled") {
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
