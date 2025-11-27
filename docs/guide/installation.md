# Installation

DSO supports multiple platforms: **macOS**, **Linux** (Ubuntu, Debian, and others), and **Windows**.

## Prerequisites

- **Go 1.21+**: [Install Go](https://go.dev/doc/install)
- **Ollama**: [Install Ollama](https://ollama.ai)

## Quick Install

### One-Command Installation (Recommended)

**macOS / Linux:**
```bash
curl -fsSL https://raw.githubusercontent.com/dso-cli/dso-cli/main/install | bash
```

Or if you've cloned the repository:
```bash
git clone https://github.com/dso-cli/dso-cli.git
cd dso-cli
chmod +x install
./install
```

**Windows (PowerShell):**
```powershell
git clone https://github.com/dso-cli/dso-cli.git
cd dso-cli
.\install.ps1
```

**Windows (Batch):**
```cmd
git clone https://github.com/dso-cli/dso-cli.git
cd dso-cli
install.bat
```

The installation script automatically:
- ✅ Checks/Installs Go (if missing)
- ✅ Builds DSO binary
- ✅ Checks/Installs Ollama
- ✅ Downloads AI model **qwen2.5:7b** by default (if no models exist)
- ✅ Optionally installs security tools (Trivy, gitleaks, etc.)
- ✅ Updates to latest version if already installed

## Manual Installation

### 1. Clone and Build

**macOS / Linux:**
```bash
git clone https://github.com/dso-cli/dso-cli.git
cd dso
go build -o dso .
```

**Windows:**
```powershell
git clone https://github.com/dso-cli/dso-cli.git
cd dso
$env:GOOS = "windows"
$env:GOARCH = "amd64"
go build -o dso.exe .
```

Or with Make (macOS/Linux):
```bash
make build
```

### 2. Install Ollama and AI Model

#### macOS

```bash
brew install ollama
ollama serve  # Start Ollama
```

#### Linux (Ubuntu/Debian)

```bash
curl -fsSL https://ollama.ai/install.sh | sh
ollama serve  # Start Ollama
```

#### Linux (Other)

```bash
# See: https://ollama.ai for distribution-specific instructions
```

#### Windows

Download from [ollama.ai](https://ollama.ai) or:
```powershell
winget install Ollama.Ollama
# or
scoop install ollama
```

#### Download Model

```bash
# Default model (4.7 GB) - automatically installed by install script
ollama pull qwen2.5:7b

# Other recommended models
ollama pull llama3.1:8b  # ~4.7 GB - Alternative high quality
ollama pull phi3         # ~2.3 GB - Lightweight, fast
ollama pull mistral:7b   # ~4.1 GB - Good balance
ollama pull gemma:7b     # ~5.2 GB - Google's model
```

**Note:** The installation script automatically installs `qwen2.5:7b` by default if no models are present.

### 3. Install Scanners (Optional but Recommended)

DSO works without these tools, but with reduced capabilities.

#### macOS

```bash
brew install trivy grype gitleaks tfsec
```

#### Linux (Ubuntu/Debian)

```bash
# Trivy
sudo apt-get update
sudo apt-get install -y wget apt-transport-https gnupg lsb-release
wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
echo "deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | sudo tee -a /etc/apt/sources.list.d/trivy.list
sudo apt-get update
sudo apt-get install -y trivy

# Grype
curl -sSfL https://raw.githubusercontent.com/anchore/grype/main/install.sh | sh

# gitleaks
wget https://github.com/gitleaks/gitleaks/releases/latest/download/gitleaks_$(uname -s)_$(uname -m).tar.gz -O /tmp/gitleaks.tar.gz
tar -xzf /tmp/gitleaks.tar.gz -C /tmp
sudo mv /tmp/gitleaks /usr/local/bin/
chmod +x /usr/local/bin/gitleaks
```

#### Linux (Other)

```bash
# Trivy
curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh

# Grype
curl -sSfL https://raw.githubusercontent.com/anchore/grype/main/install.sh | sh

# gitleaks
go install github.com/gitleaks/gitleaks/v8@latest

# tfsec
go install github.com/aquasecurity/tfsec/cmd/tfsec@latest
```

#### Windows

```powershell
# Using Scoop
scoop install trivy grype gitleaks tfsec

# Or using winget
winget install AquaSecurity.Trivy
winget install Anchore.Grype
winget install Gitleaks.Gitleaks
winget install AquaSecurity.Tfsec
```

**Or use DSO's interactive installer:**
```bash
dso tools --install
```

## Verification

**macOS / Linux:**
```bash
# Check that DSO works
./dso --version

# Check Ollama
dso check

# Check tools
dso tools

# First audit
./dso audit .
```

**Windows:**
```powershell
# Check that DSO works
.\dso.exe --version

# Check Ollama
.\dso.exe check

# Check tools
.\dso.exe tools

# First audit
.\dso.exe audit .
```

## Global Installation (Optional)

**macOS / Linux:**
```bash
# Install in $GOPATH/bin
make install
# or
go install .

# Add to PATH if needed
export PATH=$PATH:$(go env GOPATH)/bin

# Or install system-wide
sudo cp dso /usr/local/bin/
sudo chmod +x /usr/local/bin/dso
```

**Windows:**
```powershell
# Install in Go bin directory
go install .

# Add to PATH if needed
# Go bin is usually: C:\Users\<user>\go\bin
# Add this to your PATH environment variable
```

## Automatic Installation

Use the installation scripts:

**macOS / Linux:**
```bash
chmod +x install.sh
./install.sh
```

**Windows (PowerShell):**
```powershell
.\install.ps1
```

**Windows (Batch):**
```cmd
install.bat
```

The scripts will:
- ✅ Check/Install Go (if missing)
- ✅ Build DSO
- ✅ Check/Install Ollama (if missing)
- ✅ Download **qwen2.5:7b** model automatically (if no models exist)
- ✅ Update to latest version if already installed
- ✅ Remove old versions before reinstalling

## Troubleshooting

### Ollama not responding

**macOS / Linux:**
```bash
# Check that Ollama is running
ollama serve

# In another terminal
ollama list
dso check
```

**Windows:**
```powershell
# Check that Ollama is running
ollama serve

# In another terminal
ollama list
dso check
```

### Trivy not found

DSO will work without Trivy, but with reduced capabilities. Install it for complete analysis:

```bash
dso tools --install
```

### "model not found" error

```bash
# List available models
ollama list

# Download default model
ollama pull qwen2.5:7b

# Or download other models
ollama pull llama3.1:8b
ollama pull phi3
```

**Note:** The default model is saved in `~/.dso/config`. You can change it:
```bash
# View current config
cat ~/.dso/config

# Change model
echo "DSO_MODEL=llama3.1:8b" > ~/.dso/config
```

### Windows-specific Issues

**PowerShell execution policy:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Go not in PATH:**
- Restart terminal after installing Go
- Verify: `go version`

**Ollama not in PATH:**
- Add Ollama installation directory to PATH
- Or restart terminal after installation

### Platform-specific Installation

For detailed platform-specific instructions, see [PLATFORMS.md](https://github.com/dso-cli/dso-cli/blob/main/PLATFORMS.md) in the repository root.

## About the Developer

**DSO** is developed by **Ismail MOUYAHADA**, a **DevSecOps Engineer** and **Multi-Platform Software Developer**.

With expertise in security automation, cloud infrastructure, and cross-platform development, Ismail created DSO to bring enterprise-grade security analysis to developers' terminals with zero configuration and complete privacy.

## Support

If you encounter issues, open an issue on [GitHub](https://github.com/dso-cli/dso-cli/issues).
