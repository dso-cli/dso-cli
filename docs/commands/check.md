# `check` Command

Verifies Ollama connection and lists available AI models.

## Usage

```bash
dso check
```

## Description

The `check` command verifies that:
- ✅ Ollama is running and accessible
- ✅ AI models are installed
- ✅ The configured model is available

This is useful for troubleshooting AI-related issues.

## Examples

### Basic Check

```bash
dso check
```

Output:
```
🔍 Checking Ollama integration...

📡 Connecting to Ollama... ✅ OK

📦 Available models:
   👉 llama3.1:8b
      phi3
      mistral:7b

🎯 Configured model: llama3.1:8b
✅ Model available

🎉 Everything is ready! You can run: dso audit .
```

### Ollama Not Running

If Ollama is not running:

```
🔍 Checking Ollama integration...

📡 Connecting to Ollama... ❌ Failed
   Error: connection refused

💡 Solutions:
   1. Check that Ollama is installed: https://ollama.ai
   2. Start Ollama: ollama serve
   3. Check OLLAMA_HOST environment variable if Ollama is not on localhost:11434
```

### Model Not Installed

If the configured model is not installed:

```
📦 Available models:
      phi3

🎯 Configured model: llama3.1:8b
⚠️  Model llama3.1:8b is not installed
💡 Download it: ollama pull llama3.1:8b
```

## Troubleshooting

### Ollama Connection Issues

**Problem**: `connection refused`

**Solutions**:
1. Start Ollama: `ollama serve`
2. Check if Ollama is running: `ollama list`
3. Verify OLLAMA_HOST if using remote Ollama:
   ```bash
   export OLLAMA_HOST=http://your-ollama-server:11434
   ```

### Model Not Found

**Problem**: Model is not installed

**Solution**: Download the model:
```bash
ollama pull llama3.1:8b
```

### Wrong Model Configured

**Problem**: Different model than expected

**Solution**: Change the model:
```bash
export DSO_MODEL=phi3
dso check
```

## Environment Variables

### `OLLAMA_HOST`

If Ollama is not on `localhost:11434`:

```bash
export OLLAMA_HOST=http://192.168.1.100:11434
dso check
```

### `DSO_MODEL`

To check a specific model:

```bash
export DSO_MODEL=phi3
dso check
```

## Use Cases

### Initial Setup

After installing DSO, verify everything works:

```bash
dso check
```

### Troubleshooting

If `dso audit` fails with AI errors:

```bash
dso check
# Identifies the issue (Ollama not running, model missing, etc.)
```

### CI/CD Verification

In CI/CD pipelines, verify Ollama before running audits:

```bash
dso check || exit 1
dso audit .
```

## See Also

- [`audit`](/commands/audit): Run a security audit (requires Ollama)
- [`tools`](/commands/tools): Check scan tools status
- [Ollama Integration Guide](/guide/ollama): Detailed Ollama setup

