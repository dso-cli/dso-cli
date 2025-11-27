package cmd

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
	Use:   "dso",
	Short: "Your senior DevSecOps engineer in your terminal",
	Long: `dso (DevSecOps Oracle) - A DevSecOps CLI assistant powered by local AI.

Analyzes your code, tells you what really matters and proposes fixes in 1 command.
100% local, zero data leakage, zero configuration.`,
	Version: "0.1.0",
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
}

