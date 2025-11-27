# Quick Start Guide

## One-Command Installation

### macOS / Linux

```bash
curl -fsSL https://raw.githubusercontent.com/dso-cli/dso-cli/main/install | bash
```

That's it! The script will:
1. Check/Install Go
2. Build DSO
3. Check/Install Ollama
4. Download AI model
5. Optionally install security tools

### Windows

**PowerShell:**
```powershell
git clone https://github.com/dso-cli/dso-cli.git
cd dso
.\install.ps1
```

**Batch:**
```cmd
git clone https://github.com/dso-cli/dso-cli.git
cd dso
install.bat
```

## First Use

After installation:

```bash
# Verify installation
./dso check

# Check available tools
./dso tools

# Run your first audit
./dso audit .
```

## What You Get

- ✅ **DSO binary** - Ready to use
- ✅ **Ollama** - Local AI runtime
- ✅ **AI Model** - llama3.1:8b (~4.7 GB)
- ✅ **Security Tools** - Optional but recommended

## Next Steps

1. **Read the docs**: `cd docs && npm install && npm run dev`
2. **Explore commands**: `./dso --help`
3. **Run an audit**: `./dso audit .`
4. **Auto-fix issues**: `./dso fix --auto .`

## Troubleshooting

### Go Not Found
- **macOS**: `brew install go`
- **Linux**: `sudo apt-get install golang-go` (Ubuntu/Debian)
- **Windows**: Download from [go.dev](https://go.dev/doc/install)

### Ollama Not Starting
- **macOS**: `brew services start ollama`
- **Linux**: `systemctl --user start ollama` or `ollama serve`
- **Windows**: Start from Start Menu or run `ollama serve`

### Model Download Failed
```bash
ollama pull llama3.1:8b
```

For more help, see [INSTALL.md](INSTALL.md) or [docs/guide/installation.md](docs/guide/installation.md).

