# Installation Guide

## One-Command Installation (Recommended)

### macOS / Linux

```bash
curl -fsSL https://raw.githubusercontent.com/dso-cli/dso-cli/main/install | bash
```

Or if you've cloned the repository:

```bash
chmod +x install
./install
```

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

## What Gets Installed

The installation script automatically handles:

1. **Go** - Checks if installed, installs if missing (via Homebrew on macOS, apt on Debian/Ubuntu)
2. **DSO** - Builds the binary from source
3. **Ollama** - Installs Ollama AI runtime
4. **AI Model** - Downloads `llama3.1:8b` model (~4.7 GB)
5. **Security Tools** (optional) - Trivy, gitleaks, grype, tfsec

## Requirements

- **Go 1.21+** - Will be installed automatically if missing
- **Git** - For cloning the repository
- **Internet connection** - For downloading dependencies and models

## Platform Support

### ✅ Fully Supported

- **macOS** (Intel & Apple Silicon)
- **Linux** (Ubuntu, Debian, Fedora, RHEL, CentOS)
- **Windows** (via PowerShell, Git Bash, or WSL)

### Installation Methods by Platform

#### macOS

```bash
# Using Homebrew (recommended)
brew install ollama
curl -fsSL https://raw.githubusercontent.com/dso-cli/dso-cli/main/install | bash

# Or manual
git clone https://github.com/dso-cli/dso-cli.git
cd dso
./install
```

#### Linux (Ubuntu/Debian)

```bash
# Automatic installation
curl -fsSL https://raw.githubusercontent.com/dso-cli/dso-cli/main/install | bash

# Or manual
git clone https://github.com/dso-cli/dso-cli.git
cd dso
chmod +x install
./install
```

#### Linux (Other Distributions)

```bash
# Install Go first
# Fedora: sudo dnf install golang
# RHEL/CentOS: sudo yum install golang
# Arch: sudo pacman -S go

# Then install DSO
git clone https://github.com/dso-cli/dso-cli.git
cd dso
chmod +x install
./install
```

#### Windows

**Option 1: PowerShell (Recommended)**
```powershell
git clone https://github.com/dso-cli/dso-cli.git
cd dso
.\install.ps1
```

**Option 2: Git Bash**
```bash
git clone https://github.com/dso-cli/dso-cli.git
cd dso
chmod +x install
./install
```

**Option 3: WSL (Windows Subsystem for Linux)**
```bash
# Use Linux installation method
curl -fsSL https://raw.githubusercontent.com/dso-cli/dso-cli/main/install | bash
```

## Verification

After installation, verify everything works:

```bash
# Check DSO
./dso --version

# Check Ollama connection
./dso check

# Check installed tools
./dso tools

# Run first audit
./dso audit .
```

## Troubleshooting

### Go Not Found

**macOS:**
```bash
brew install go
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install golang-go
```

**Linux (Fedora/RHEL):**
```bash
sudo dnf install golang
```

### Ollama Not Starting

**macOS:**
```bash
brew services start ollama
```

**Linux:**
```bash
systemctl --user start ollama
# Or manually:
ollama serve
```

**Windows:**
- Start Ollama from Start Menu
- Or run `ollama serve` in a terminal

### Model Download Failed

```bash
# Check Ollama is running
ollama list

# Download model manually
ollama pull llama3.1:8b

# Or use a lighter model
ollama pull phi3        # ~2.3 GB
ollama pull mistral:7b  # ~4.1 GB
```

### Permission Denied

```bash
# Make scripts executable
chmod +x install install.sh

# For global installation, may need sudo
sudo cp dso /usr/local/bin/
```

### Windows-Specific Issues

**PowerShell Execution Policy:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Go Not in PATH:**
- Restart terminal after installing Go
- Add Go bin directory to PATH: `C:\Program Files\Go\bin`

**Ollama Not in PATH:**
- Restart terminal after installing Ollama
- Or add Ollama installation directory to PATH

## Advanced Installation

### Install Without Interactive Prompts

```bash
# Install with all tools
./install --with-tools

# Or set environment variable
DSO_MODEL=phi3 ./install
```

### Global Installation

After building, install globally:

**macOS / Linux:**
```bash
sudo cp dso /usr/local/bin/
sudo chmod +x /usr/local/bin/dso
```

**Windows:**
- Add `dso.exe` to a directory in your PATH
- Or use: `go install .` (installs to `$GOPATH/bin`)

### Docker Installation (Coming Soon)

```bash
docker pull dso-cli/dso-cli:latest
docker run -v $(pwd):/workspace dso-cli/dso-cli audit /workspace
```

## Next Steps

1. **Verify installation**: `./dso check`
2. **Check tools**: `./dso tools`
3. **Run first audit**: `./dso audit .`
4. **Read documentation**: See `docs/` directory

## Support

If you encounter issues:

1. Check [Troubleshooting](#troubleshooting) section
2. Open an issue on [GitHub](https://github.com/dso-cli/dso-cli/issues)
3. Check [Documentation](https://github.com/dso-cli/dso-cli/tree/main/docs)
