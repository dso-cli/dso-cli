# Configuration

DSO is designed to work with zero configuration, but you can customize its behavior.

## Environment Variables

### `DSO_MODEL`

Ollama model to use:

```bash
export DSO_MODEL=phi3
# or
export DSO_MODEL=mistral:7b
```

Supported models:
- `qwen2.5:7b` (default, ~4.7 GB) - Automatically installed
- `llama3.1:8b` (~4.7 GB, alternative)
- `phi3` (~2.3 GB, lighter)
- `mistral:7b` (~4.1 GB)
- `gemma:7b` (~5.2 GB)
- `llama3.1:70b` (~40 GB, best quality)

### `OLLAMA_HOST`

Ollama URL if different from `localhost:11434`:

```bash
export OLLAMA_HOST=http://192.168.1.100:11434
```

## Configuration Files

### `~/.dso/config`

The installation script automatically creates this file with your selected model:

```bash
# View current config
cat ~/.dso/config
# Output: DSO_MODEL=qwen2.5:7b

# Change model
echo "DSO_MODEL=llama3.1:8b" > ~/.dso/config
```

**Priority order:**
1. Environment variable `DSO_MODEL`
2. Configuration file `~/.dso/config`
3. Default: `qwen2.5:7b`

### Advanced Configuration (Coming Soon)

Future support for YAML configuration:

```yaml
# ~/.dso/config.yaml (planned)
model: qwen2.5:7b
ollama_host: http://localhost:11434
scanners:
  trivy: true
  grype: false
  gitleaks: true
output:
  format: text
  verbose: false
```

## Command Options

### `audit`

```bash
# JSON format
dso audit --format json .

# Verbose mode
dso audit --verbose .
```

### `fix`

```bash
# Auto mode (no confirmation)
dso fix --auto .

# With confirmation
dso fix --confirm .
```

### `watch`

```bash
# Custom interval
dso watch --interval 10m .

# Quiet mode
dso watch --quiet .
```

## Ollama Configuration

### Change Model

**Via environment variable (temporary):**
```bash
export DSO_MODEL=phi3
dso audit .
```

**Via configuration file (permanent, recommended):**
```bash
# The installation script creates this automatically
echo "DSO_MODEL=phi3" > ~/.dso/config
dso audit .
```

**Via shell profile (permanent):**
```bash
# Add to ~/.zshrc or ~/.bashrc
echo 'export DSO_MODEL=phi3' >> ~/.zshrc
source ~/.zshrc
```

### Ollama on Remote Server

```bash
export OLLAMA_HOST=http://ollama-server:11434
dso audit .
```

## Scanner Configuration

DSO automatically detects available scanners. To force the use of certain scanners, use environment variables (coming soon):

```bash
# Disable a scanner
export DSO_DISABLE_GRYPE=true
```

## About the Developer

**DSO** is developed by **Ismail MOUYAHADA**, a **DevSecOps Engineer** and **Multi-Platform Software Developer**.

With expertise in security automation, cloud infrastructure, and cross-platform development, Ismail created DSO to bring enterprise-grade security analysis to developers' terminals with zero configuration and complete privacy.

## See Also

- [Installation Guide](/guide/installation): Initial configuration
- [Ollama Integration](/guide/ollama): Detailed Ollama configuration
