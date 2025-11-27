package cmd

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
)

var (
	// version is set at build time via ldflags
	version   = "dev"
	buildDate = "unknown"
	buildTime = "unknown"
)

var rootCmd = &cobra.Command{
	Use:   "dso",
	Short: "Your senior DevSecOps engineer in your terminal",
	Long: `dso (DevSecOps Oracle) - A DevSecOps CLI assistant powered by local AI.

Analyzes your code, tells you what really matters and proposes fixes in 1 command.
100% local, zero data leakage, zero configuration.`,
	Version: version,
}

func Execute() {
	if err := rootCmd.Execute(); err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}
}

func init() {
	rootCmd.AddCommand(auditCmd)
	rootCmd.AddCommand(fixCmd)
	rootCmd.AddCommand(whyCmd)
	rootCmd.AddCommand(prCmd)
	rootCmd.AddCommand(checkCmd)
	rootCmd.AddCommand(watchCmd)
	rootCmd.AddCommand(policyCmd)
	rootCmd.AddCommand(sbomCmd)
	rootCmd.AddCommand(toolsCmd)
	rootCmd.AddCommand(ciCmd)

	// Override version template to include build info
	rootCmd.SetVersionTemplate(fmt.Sprintf(`{{with .Name}}{{printf "%%s " .}}{{end}}{{printf "version %%s" .Version}}
Build date: %s
Build time: %s
`, buildDate, buildTime))
}
