# Platform Compatibility

DSO is designed to work across multiple platforms. This document outlines platform-specific considerations and installation instructions.

## Supported Platforms

- ✅ **macOS** (Intel and Apple Silicon)
- ✅ **Linux** (Ubuntu, Debian, and other distributions)
- ✅ **Windows** (10, 11, and Windows Server)

## Installation by Platform

### macOS

**Quick Install:**
```bash
./install.sh
```

**Manual Install:**
```bash
# Install Go (if not installed)
brew install go

# Install Ollama
brew install ollama

# Build DSO
go build -o dso .

# Download AI model
ollama pull llama3.1:8b
```

**Install Security Tools:**
```bash
brew install trivy grype gitleaks tfsec
```

### Linux (Ubuntu/Debian)

**Quick Install:**
```bash
chmod +x install.sh
./install.sh
```

**Manual Install:**
```bash
# Install Go (if not installed)
sudo apt-get update
sudo apt-get install -y golang-go

# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Build DSO
go build -o dso .

# Download AI model
ollama pull llama3.1:8b
```

**Install Security Tools (Ubuntu/Debian):**
```bash
# Trivy
sudo apt-get update
sudo apt-get install -y wget apt-transport-https gnupg lsb-release
wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
echo "deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | sudo tee -a /etc/apt/sources.list.d/trivy.list
sudo apt-get update
sudo apt-get install -y trivy

# Grype
curl -sSfL https://raw.githubusercontent.com/anchore/grype/main/install.sh | sh -s -- -b /usr/local/bin

# gitleaks
wget https://github.com/gitleaks/gitleaks/releases/latest/download/gitleaks_$(uname -s)_$(uname -m).tar.gz -O /tmp/gitleaks.tar.gz
tar -xzf /tmp/gitleaks.tar.gz -C /tmp
sudo mv /tmp/gitleaks /usr/local/bin/
chmod +x /usr/local/bin/gitleaks
```

### Linux (Other Distributions)

**Manual Install:**
```bash
# Install Go (if not installed)
# See: https://go.dev/doc/install

# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Build DSO
go build -o dso .

# Download AI model
ollama pull llama3.1:8b
```

**Install Security Tools:**
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

### Windows

**Quick Install (PowerShell):**
```powershell
.\install.ps1
```

**Quick Install (Batch):**
```cmd
install.bat
```

**Manual Install:**
```powershell
# Install Go (if not installed)
# Download from: https://go.dev/doc/install
# Or using winget: winget install GoLang.Go

# Install Ollama
# Download from: https://ollama.ai
# Or using winget: winget install Ollama.Ollama
# Or using scoop: scoop install ollama

# Build DSO
$env:GOOS = "windows"
$env:GOARCH = "amd64"
go build -o dso.exe .

# Download AI model
ollama pull llama3.1:8b
```

**Install Security Tools (Windows):**

Using Scoop:
```powershell
scoop install trivy grype gitleaks tfsec
```

Using winget:
```powershell
winget install AquaSecurity.Trivy
winget install Anchore.Grype
winget install Gitleaks.Gitleaks
winget install AquaSecurity.Tfsec
```

## Platform-Specific Considerations

### File Paths

DSO uses Go's `filepath.Join()` for all file operations, ensuring cross-platform compatibility. Paths are automatically handled correctly on all platforms.

### Line Endings

DSO handles both Unix (`\n`) and Windows (`\r\n`) line endings automatically when reading and writing files.

### Permissions

- **Linux/macOS:** Uses standard Unix permissions (0644 for files, 0755 for directories)
- **Windows:** Uses Windows ACLs (equivalent permissions are set automatically)

### Command Execution

DSO uses Go's `exec.Command()` which works consistently across all platforms. Platform-specific commands (like `brew`, `apt-get`, `scoop`) are detected and used appropriately.

## Troubleshooting

### macOS

**Issue:** `brew: command not found`
- **Solution:** Install Homebrew: `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`

**Issue:** Permission denied when installing tools
- **Solution:** Use `sudo` for system-wide installation, or install to user directory

### Linux (Ubuntu/Debian)

**Issue:** `apt-key` deprecated warning
- **Solution:** The installation script uses the legacy method for compatibility. For newer systems, you may need to use the GPG keyring method.

**Issue:** `lsb_release: command not found`
- **Solution:** Install lsb-release: `sudo apt-get install -y lsb-release`

### Linux (Other)

**Issue:** Tools not found in PATH
- **Solution:** Add `/usr/local/bin` to your PATH: `export PATH=$PATH:/usr/local/bin`

### Windows

**Issue:** PowerShell execution policy
- **Solution:** Run `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

**Issue:** `go: command not found`
- **Solution:** Ensure Go is in your PATH. Restart your terminal after installation.

**Issue:** `ollama: command not found`
- **Solution:** Add Ollama installation directory to PATH, or restart terminal

## Cross-Platform Build

To build for all platforms from a single machine:

```bash
make build-all
```

This creates:
- `dso-linux-amd64` - Linux 64-bit
- `dso-linux-arm64` - Linux ARM64
- `dso-darwin-amd64` - macOS Intel
- `dso-darwin-arm64` - macOS Apple Silicon
- `dso-windows-amd64.exe` - Windows 64-bit
- `dso-windows-arm64.exe` - Windows ARM64

## Testing on Different Platforms

DSO is tested on:
- macOS 12+ (Intel and Apple Silicon)
- Ubuntu 20.04, 22.04
- Debian 11, 12
- Windows 10, 11

If you encounter platform-specific issues, please open an issue on GitHub with:
- Operating system and version
- Go version (`go version`)
- Error message and steps to reproduce

