# 🧠 Ollama Integration - Technical Documentation

## Overview

DSO uses Ollama for local AI analysis of scan results. The integration is complete and robust with support for the modern chat API.

## Features

### Modern Chat API

DSO uses Ollama's `/api/chat` API (instead of `/api/generate`) for:
- Better context management
- Multi-turn conversation support
- More standardized format

### Streaming (optional)

Streaming support to display progress in real-time:

```go
client.GenerateStream(prompt, func(chunk string) {
 fmt.Print(chunk) // Display as it comes
})
```

### Robust error handling

- Automatic retry for connections
- Clear error messages with solutions
- Pre-availability check

### Flexible configuration

- **Model**: `DSO_MODEL` variable (default: `llama3.1:8b`)
- **URL**: `OLLAMA_HOST` variable (default: `http://localhost:11434`)
- Automatic detection of available models

### Automatic download

If the configured model is not installed, DSO automatically downloads it with progress display.

## Architecture

```
cmd/audit.go
 ↓
internal/llm/prompts.go (Analyze)
 ↓
internal/llm/ollama.go (OllamaClient)
 ↓
Ollama API (/api/chat)
```

## Usage

### Basic client

```go
client := llm.NewOllamaClient()
response, err := client.Generate("Analyze these results...")
```

### With context

```go
context := []map[string]string{
 {"role": "system", "content": "You are a security expert"},
 {"role": "user", "content": "Previous question"},
}
response, err := client.GenerateWithContext("New question", context)
```

### Streaming

```go
response, err := client.GenerateStream(prompt, func(chunk string) {
 fmt.Print(chunk)
 os.Stdout.Sync()
})
```

## CLI Commands

### `dso check`

Checks Ollama status:
- Connection
- Available models
- Configured model installed

### `dso audit .`

Automatically uses Ollama to analyze results.

## Troubleshooting

### Ollama not accessible

```bash
# Check that Ollama is running
ollama serve

# Check connection
dso check
```

### Model not found

```bash
# List models
ollama list

# Download model
ollama pull llama3.1:8b
```

### Timeout

Timeouts are configured to 5 minutes by default. For very long analyses, increase the value in `ollama.go`.

## Future improvements

- [ ] Response caching to avoid repeated calls
- [ ] Support for multiple models in parallel
- [ ] Performance metrics (latency, tokens/s)
- [ ] Support for external models (OpenAI, Anthropic) as fallback
