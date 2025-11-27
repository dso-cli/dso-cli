package llm

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)

const (
	defaultOllamaURL = "http://localhost:11434"
	defaultModel     = "qwen2.5:7b"
)

// OllamaClient is a client for Ollama with support for the modern chat API
type OllamaClient struct {
	baseURL string
	model   string
	client  *http.Client
}

// NewOllamaClient creates a new Ollama client
func NewOllamaClient() *OllamaClient {
	// Try to get model from config file first, then environment, then default
	model := ""

	// Check config file
	homeDir, err := os.UserHomeDir()
	if err == nil {
		configFile := filepath.Join(homeDir, ".dso", "config")
		if data, err := os.ReadFile(configFile); err == nil {
			lines := strings.Split(string(data), "\n")
			for _, line := range lines {
				line = strings.TrimSpace(line)
				if strings.HasPrefix(line, "DSO_MODEL=") {
					model = strings.TrimPrefix(line, "DSO_MODEL=")
					model = strings.Trim(model, `"'`)
					break
				}
			}
		}
	}

	// Fallback to environment variable
	if model == "" {
		model = os.Getenv("DSO_MODEL")
	}

	// Fallback to default
	if model == "" {
		model = defaultModel
	}

	baseURL := os.Getenv("OLLAMA_HOST")
	if baseURL == "" {
		baseURL = defaultOllamaURL
	}
	// Ensure the URL doesn't have a trailing slash
	baseURL = strings.TrimSuffix(baseURL, "/")

	return &OllamaClient{
		baseURL: baseURL,
		model:   model,
		client: &http.Client{
			Timeout: 300 * time.Second, // 5 minutes for long analyzes
		},
	}
}

// Generate sends a request to Ollama and returns the response (uses the modern chat API)
func (c *OllamaClient) Generate(prompt string) (string, error) {
	return c.GenerateWithContext(prompt, nil)
}

// GenerateWithContext generates a response with a conversation context
func (c *OllamaClient) GenerateWithContext(prompt string, context []map[string]string) (string, error) {
	// Check that Ollama is available
	if err := c.checkOllamaAvailable(); err != nil {
		return "", fmt.Errorf("Ollama is not available: %v\n💡 Install it: https://ollama.ai\n💡 Then run: ollama pull %s", err, c.model)
	}

	// Verify that the model is available
	if err := c.ensureModel(); err != nil {
		return "", err
	}

	// Build messages for the chat API
	messages := []map[string]interface{}{}

	// Add context if provided
	if context != nil {
		for _, msg := range context {
			messages = append(messages, map[string]interface{}{
				"role":    msg["role"],
				"content": msg["content"],
			})
		}
	}

	// Add the current prompt
	messages = append(messages, map[string]interface{}{
		"role":    "user",
		"content": prompt,
	})

	// Use Ollama's modern chat API
	payload := map[string]interface{}{
		"model":    c.model,
		"messages": messages,
		"stream":   false,
		"options": map[string]interface{}{
			"temperature": 0.7,
			"top_p":       0.9,
			"num_predict": 4000, // Token limit for long responses
		},
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return "", fmt.Errorf("serialization error: %v", err)
	}

	req, err := http.NewRequest("POST", fmt.Sprintf("%s/api/chat", c.baseURL), bytes.NewBuffer(jsonData))
	if err != nil {
		return "", fmt.Errorf("request creation error: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.client.Do(req)
	if err != nil {
		return "", fmt.Errorf("cannot contact Ollama at %s: %v\n💡 Check that Ollama is running: ollama serve", c.baseURL, err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("Ollama error (status %d): %s", resp.StatusCode, string(body))
	}

	var result struct {
		Message struct {
			Role    string `json:"role"`
			Content string `json:"content"`
		} `json:"message"`
		Done bool `json:"done"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", fmt.Errorf("response parsing error: %v", err)
	}

	if !result.Done {
		return "", fmt.Errorf("response is not complete")
	}

	return result.Message.Content, nil
}

// GenerateStream generates a streaming response (for progressive display)
func (c *OllamaClient) GenerateStream(prompt string, onChunk func(string)) (string, error) {
	// Check that Ollama is available
	if err := c.checkOllamaAvailable(); err != nil {
		return "", fmt.Errorf("Ollama is not available: %v", err)
	}

	if err := c.ensureModel(); err != nil {
		return "", err
	}

	messages := []map[string]interface{}{
		{
			"role":    "user",
			"content": prompt,
		},
	}

	payload := map[string]interface{}{
		"model":    c.model,
		"messages": messages,
		"stream":   true,
		"options": map[string]interface{}{
			"temperature": 0.7,
			"top_p":       0.9,
		},
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequest("POST", fmt.Sprintf("%s/api/chat", c.baseURL), bytes.NewBuffer(jsonData))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("Ollama error (status %d): %s", resp.StatusCode, string(body))
	}

	var fullResponse strings.Builder
	decoder := json.NewDecoder(resp.Body)

	for {
		var chunk struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
			Done bool `json:"done"`
		}

		if err := decoder.Decode(&chunk); err != nil {
			if err == io.EOF {
				break
			}
			return "", err
		}

		if chunk.Message.Content != "" {
			fullResponse.WriteString(chunk.Message.Content)
			if onChunk != nil {
				onChunk(chunk.Message.Content)
			}
		}

		if chunk.Done {
			break
		}
	}

	return fullResponse.String(), nil
}

// checkOllamaAvailable checks if Ollama is available with retry
func (c *OllamaClient) checkOllamaAvailable() error {
	maxRetries := 3
	for i := 0; i < maxRetries; i++ {
		resp, err := http.Get(fmt.Sprintf("%s/api/tags", c.baseURL))
		if err == nil {
			resp.Body.Close()
			if resp.StatusCode == http.StatusOK {
				return nil
			}
		}
		if i < maxRetries-1 {
			time.Sleep(time.Second * time.Duration(i+1))
		}
	}
	return fmt.Errorf("Ollama is not accessible at %s\n💡 Start Ollama: ollama serve", c.baseURL)
}

// ensureModel checks and downloads the model if necessary
func (c *OllamaClient) ensureModel() error {
	// Check if the model exists
	resp, err := http.Get(fmt.Sprintf("%s/api/tags", c.baseURL))
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	var modelsResp struct {
		Models []struct {
			Name string `json:"name"`
		} `json:"models"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&modelsResp); err != nil {
		return err
	}

	// Check if the model is present
	for _, model := range modelsResp.Models {
		if model.Name == c.model {
			return nil
		}
	}

	// Model doesn't exist, download it
	fmt.Printf("📥 Downloading model %s (this may take a few minutes)...\n", c.model)
	return c.pullModel()
}

// pullModel downloads the model with progress display
func (c *OllamaClient) pullModel() error {
	payload := map[string]interface{}{
		"name": c.model,
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	req, err := http.NewRequest("POST", fmt.Sprintf("%s/api/pull", c.baseURL), bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")

	// Longer timeout for download
	client := &http.Client{
		Timeout: 0, // No timeout for large downloads
	}

	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("connection error: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, err := io.ReadAll(resp.Body)
		if err != nil {
			return fmt.Errorf("model download error (status %d): failed to read body", resp.StatusCode)
		}
		return fmt.Errorf("model download error (status %d): %s", resp.StatusCode, string(body))
	}

	// Read streaming response to display progress
	decoder := json.NewDecoder(resp.Body)
	lastStatus := ""
	for {
		var progress struct {
			Status    string `json:"status"`
			Completed int64  `json:"completed,omitempty"`
			Total     int64  `json:"total,omitempty"`
			Done      bool   `json:"done"`
		}
		if err := decoder.Decode(&progress); err != nil {
			if err == io.EOF {
				break
			}
			return fmt.Errorf("parsing error: %v", err)
		}

		// Display progress only if status changes
		if progress.Status != lastStatus {
			if progress.Total > 0 {
				percent := float64(progress.Completed) / float64(progress.Total) * 100
				fmt.Printf("\r📥 %s (%.1f%%)", progress.Status, percent)
			} else {
				fmt.Printf("\r📥 %s", progress.Status)
			}
			lastStatus = progress.Status
		}

		if progress.Done {
			fmt.Println() // New line after progress
			break
		}
	}

	return nil
}

// ListModels lists available models
func (c *OllamaClient) ListModels() ([]string, error) {
	resp, err := http.Get(fmt.Sprintf("%s/api/tags", c.baseURL))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error retrieving models")
	}

	var modelsResp struct {
		Models []struct {
			Name string `json:"name"`
		} `json:"models"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&modelsResp); err != nil {
		return nil, err
	}

	models := make([]string, len(modelsResp.Models))
	for i, m := range modelsResp.Models {
		models[i] = m.Name
	}

	return models, nil
}

// CheckConnection checks that the connection to Ollama works
func (c *OllamaClient) CheckConnection() error {
	return c.checkOllamaAvailable()
}

// GetModel returns the configured model
func (c *OllamaClient) GetModel() string {
	return c.model
}

// GetBaseURL returns Ollama's base URL
func (c *OllamaClient) GetBaseURL() string {
	return c.baseURL
}
