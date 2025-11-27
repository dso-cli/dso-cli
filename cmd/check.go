package cmd

import (
	"fmt"
	"os"

	"github.com/dso-cli/dso-cli/internal/llm"
	"github.com/spf13/cobra"
)

var checkCmd = &cobra.Command{
	Use:   "check",
	Short: "Check Ollama status and models",
	Long: `Checks that Ollama is accessible and lists available models.
Useful for diagnosing connection issues.`,
	Run: func(cmd *cobra.Command, args []string) {
		client := llm.NewOllamaClient()

		fmt.Println("🔍 Checking Ollama integration...")
		fmt.Println()

		// Check connection
		fmt.Print("📡 Connecting to Ollama... ")
		if err := client.CheckConnection(); err != nil {
			fmt.Printf("❌ Failed\n")
			fmt.Printf("   Error: %v\n", err)
			fmt.Println()
			fmt.Println("💡 Solutions:")
			fmt.Println("   1. Check that Ollama is installed: https://ollama.ai")
			fmt.Println("   2. Start Ollama: ollama serve")
			fmt.Println("   3. Check OLLAMA_HOST environment variable if Ollama is not on localhost:11434")
			os.Exit(1)
		}
		fmt.Println("✅ OK")
		fmt.Println()

		// List models
		fmt.Println("📦 Available models:")
		models, err := client.ListModels()
		if err != nil {
			fmt.Printf("❌ Error: %v\n", err)
			os.Exit(1)
		}

		if len(models) == 0 {
			fmt.Println("   ⚠️  No models installed")
			fmt.Println()
			fmt.Printf("💡 Download a model: ollama pull %s\n", client.GetModel())
		} else {
			for _, model := range models {
				marker := "  "
				if model == client.GetModel() {
					marker = "👉"
				}
				fmt.Printf("   %s %s\n", marker, model)
			}
		}
		fmt.Println()

		// Check default model
		fmt.Printf("🎯 Configured model: %s\n", client.GetModel())
		modelFound := false
		for _, model := range models {
			if model == client.GetModel() {
				modelFound = true
				break
			}
		}

		if !modelFound {
			fmt.Printf("⚠️  Model %s is not installed\n", client.GetModel())
			fmt.Printf("💡 Download it: ollama pull %s\n", client.GetModel())
			os.Exit(1)
		} else {
			fmt.Println("✅ Model available")
		}

		fmt.Println()
		fmt.Println("🎉 Everything is ready! You can run: dso audit .")
	},
}

func init() {
	rootCmd.AddCommand(checkCmd)
}
