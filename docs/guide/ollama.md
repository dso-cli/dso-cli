# Ollama Integration

DSO uses Ollama for local AI-powered analysis. This guide covers setup, configuration, and troubleshooting.

## What is Ollama?

[Ollama](https://ollama.ai) is a tool for running large language models locally on your machine. DSO uses it to:
- Analyze security scan results intelligently
- Explain vulnerabilities in natural language
- Prioritize issues based on business impact
- Identify false positives

## Installation

### macOS

```bash
brew install ollama
```

### Linux

```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### Windows

Download from [ollama.ai](https://ollama.ai) or:

```powershell
winget install Ollama.Ollama
# or
scoop install ollama
```

## Starting Ollama

### macOS / Linux

```bash
ollama serve
```

This starts Ollama in the foreground. For background:

```bash
# macOS (using launchd)
brew services start ollama

# Linux (using systemd)
systemctl --user start ollama
```

### Windows

Ollama runs as a service automatically after installation.

## Downloading Models

DSO works with various models. Recommended:

### Recommended: llama3.1:8b

```bash
ollama pull llama3.1:8b
```

- **Size**: ~4.7 GB
- **Speed**: Fast
- **Quality**: Excellent for security analysis

### Lightweight: phi3

```bash
ollama pull phi3
```

- **Size**: ~2.3 GB
- **Speed**: Very fast
- **Quality**: Good for basic analysis

### Alternative: mistral:7b

```bash
ollama pull mistral:7b
```

- **Size**: ~4.1 GB
- **Speed**: Fast
- **Quality**: Excellent

## Configuration

### Model Selection

Set the model via environment variable:

```bash
# macOS / Linux
export DSO_MODEL=phi3
dso audit .

# Windows (PowerShell)
$env:DSO_MODEL="phi3"
dso audit .
```

### Remote Ollama

If Ollama is on a different machine:

```bash
export OLLAMA_HOST=http://192.168.1.100:11434
dso audit .
```

### Permanent Configuration

Add to your shell profile:

**macOS / Linux** (`~/.zshrc` or `~/.bashrc`):
```bash
export DSO_MODEL=llama3.1:8b
export OLLAMA_HOST=http://localhost:11434
```

**Windows** (PowerShell profile):
```powershell
$env:DSO_MODEL="llama3.1:8b"
$env:OLLAMA_HOST="http://localhost:11434"
```

## Verification

Check that everything works:

```bash
dso check
```

This verifies:
- ✅ Ollama connection
- ✅ Available models
- ✅ Configured model is installed

## How DSO Uses Ollama

### 1. Analysis

When you run `dso audit`, DSO:
1. Scans your codebase
2. Formats results for AI
3. Sends to Ollama with a security-focused prompt
4. Receives intelligent analysis
5. Displays prioritized findings

### 2. Explanation

When you run `dso why`, DSO:
1. Sends vulnerability details to Ollama
2. Receives natural language explanation
3. Displays context-aware analysis

## Performance Tips

### Model Selection

- **Development**: Use `phi3` for faster feedback
- **Production**: Use `llama3.1:8b` for better analysis
- **Large Projects**: Use `mistral:7b` for comprehensive analysis

### Resource Usage

Models use RAM:
- `phi3`: ~2.3 GB RAM
- `llama3.1:8b`: ~4.7 GB RAM
- `mistral:7b`: ~4.1 GB RAM

Ensure you have enough RAM available.

### First Run

The first analysis may be slower as the model loads. Subsequent analyses are faster.

## Troubleshooting

### Ollama Not Responding

**Problem**: `connection refused`

**Solutions**:
1. Start Ollama: `ollama serve`
2. Check if running: `ollama list`
3. Verify port: Default is `11434`
4. Check firewall settings

### Model Not Found

**Problem**: `model not found`

**Solution**: Download the model:
```bash
ollama pull llama3.1:8b
```

### Slow Responses

**Problem**: AI analysis is slow

**Solutions**:
1. Use a lighter model: `export DSO_MODEL=phi3`
2. Ensure enough RAM available
3. Close other applications
4. Use a GPU if available (Ollama supports GPU acceleration)

### Out of Memory

**Problem**: Model doesn't fit in RAM

**Solutions**:
1. Use a smaller model: `phi3`
2. Increase available RAM
3. Close other applications

## Advanced Configuration

### Custom Prompts

You can customize the AI prompt by creating:

```
templates/prompt_system.txt
```

Or in your home directory:

```
~/.dso/templates/prompt_system.txt
```

### Streaming Responses

DSO uses streaming for real-time output. This is handled automatically.

### Context Management

DSO maintains conversation context for better analysis. This is handled automatically.

## Integration with CI/CD

For CI/CD, you can:

1. **Install Ollama in CI**:
   ```yaml
   - name: Install Ollama
     run: curl -fsSL https://ollama.ai/install.sh | sh
   ```

2. **Download Model**:
   ```yaml
   - name: Pull model
     run: ollama pull llama3.1:8b
   ```

3. **Run DSO**:
   ```yaml
   - name: Run audit
     run: dso audit . --format json
   ```

**Note**: CI environments may have limited resources. Consider using smaller models or running without AI analysis.

## See Also

- [`check`](/commands/check): Verify Ollama setup
- [`audit`](/commands/audit): Run security audit with AI
- [`why`](/commands/why): Get AI explanations
- [Ollama Documentation](https://github.com/ollama/ollama)

