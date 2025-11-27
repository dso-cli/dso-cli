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
- `llama3.1:8b` (default, ~4.7 GB)
- `phi3` (~2.3 GB, lighter)
- `mistral:7b` (~4.1 GB)

### `OLLAMA_HOST`

Ollama URL if different from `localhost:11434`:

```bash
export OLLAMA_HOST=http://192.168.1.100:11434
```

## Configuration Files

### `.dso/config.yaml` (Coming Soon)

Advanced configuration in a file:

```yaml
model: llama3.1:8b
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

```bash
# Temporary
export DSO_MODEL=phi3
dso audit .

# Permanent (add to ~/.zshrc or ~/.bashrc)
echo 'export DSO_MODEL=phi3' >> ~/.zshrc
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

## See Also

- [Installation Guide](/guide/installation): Initial configuration
- [Ollama Integration](/guide/ollama): Detailed Ollama configuration
