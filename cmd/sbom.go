package cmd

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/dso-cli/dso-cli/internal/sbom"
	"github.com/spf13/cobra"
)

var (
	sbomFormat string
	sbomOutput string
)

var sbomCmd = &cobra.Command{
	Use:   "sbom [path]",
	Short: "Generate a SBOM (Software Bill of Materials)",
	Long: `Generates a detailed SBOM of the project in CycloneDX or SPDX format.
Useful for compliance and dependency tracking.`,
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

		fmt.Printf("📦 Generating SBOM (format: %s)\n", sbomFormat)
		fmt.Printf("📁 Directory: %s\n\n", absPath)

		content, err := sbom.GenerateSBOM(absPath, sbomFormat)
		if err != nil {
			fmt.Fprintf(os.Stderr, "❌ Error: %v\n", err)
			os.Exit(1)
		}

		// Determine output filename
		outputFile := sbomOutput
		if outputFile == "" {
			ext := "json"
			if sbomFormat == "spdx" {
				ext = "spdx"
			}
			outputFile = fmt.Sprintf("sbom.%s", ext)
		}

		// Write file
		if err := os.WriteFile(outputFile, []byte(content), 0600); err != nil {
			fmt.Fprintf(os.Stderr, "❌ Error writing file: %v\n", err)
			os.Exit(1)
		}

		fmt.Printf("✅ SBOM generated: %s\n", outputFile)
		fmt.Printf("📊 Size: %d bytes\n", len(content))
	},
}

func init() {
	sbomCmd.Flags().StringVarP(&sbomFormat, "format", "f", "cyclonedx", "SBOM format (cyclonedx, spdx)")
	sbomCmd.Flags().StringVarP(&sbomOutput, "output", "o", "", "Output file (default: sbom.json or sbom.spdx)")
	rootCmd.AddCommand(sbomCmd)
}
