# 🔒 DSO - DevSecOps Oracle

A DevSecOps CLI assistant powered by local AI that talks to you like a senior security engineer sitting next to you.

**Developed by:** Ismail MOUYAHADA

## 📚 Documentation

Complete documentation available with VitePress and Catppuccin theme:

```bash
cd docs
npm install
npm run dev
```

Access at `http://localhost:5173`

**Platform-specific instructions:** See [PLATFORMS.md](docs/additional/PLATFORMS.md) for detailed installation guides for Windows, macOS, Ubuntu, Debian, and other Linux distributions.

## 🚀 Installation

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
- ✅ Installs DSO globally (available as `dso` command)
- ✅ Checks/Installs Ollama
- ✅ Downloads AI model **qwen2.5:7b** by default (if no models exist)
- ✅ Optionally installs security tools (Trivy, gitleaks, etc.)

### Native Package Installation

**Debian/Ubuntu (.deb):**
```bash
# Download the .deb package from releases
wget https://github.com/dso-cli/dso-cli/releases/latest/download/dso_0.1.0_amd64.deb
sudo dpkg -i dso_0.1.0_amd64.deb
```

**RHEL/CentOS/Fedora (.rpm):**
```bash
# Download the .rpm package from releases
wget https://github.com/dso-cli/dso-cli/releases/latest/download/dso_0.1.0_x86_64.rpm
sudo rpm -i dso_0.1.0_x86_64.rpm
```

**macOS (.pkg):**
```bash
# Download the .pkg package from releases
wget https://github.com/dso-cli/dso-cli/releases/latest/download/dso_0.1.0_arm64.pkg
sudo installer -pkg dso_0.1.0_arm64.pkg -target /
```

**Windows (.msi):**
```powershell
# Download the .msi package from releases
# Double-click to install, or use:
msiexec /i dso_0.1.0_amd64.msi
```

### Manual Installation

**Prerequisites:**
- Go 1.21+ ([Install Go](https://go.dev/doc/install))
- Ollama ([Install Ollama](https://ollama.ai))

**Build:**
```bash
# Clone the repo
git clone https://github.com/dso-cli/dso-cli.git
cd dso

# Build
go build -o dso        # Linux/macOS
go build -o dso.exe    # Windows
```

**Install Ollama:**

- **macOS:** `brew install ollama`
- **Linux (Ubuntu/Debian):** `curl -fsSL https://ollama.ai/install.sh | sh`
- **Linux (Other):** See [Ollama installation](https://ollama.ai)
- **Windows:** Download from [ollama.ai](https://ollama.ai) or `winget install Ollama.Ollama`

**Download AI Model:**
```bash
ollama pull qwen2.5:7b   # Default (~4.7 GB) - automatically installed
# Or other alternatives:
ollama pull llama3.1:8b  # ~4.7 GB
ollama pull phi3          # ~2.3 GB - Lightweight
ollama pull mistral:7b    # ~4.1 GB
```

## 📦 External Dependencies (optional but recommended)

DSO automatically detects available tools and adapts. Install them for complete analysis:

**macOS:**
```bash
brew install trivy grype gitleaks tfsec
```

**Linux (Ubuntu/Debian):**
```bash
# Trivy
sudo apt-get update
sudo apt-get install -y wget apt-transport-https gnupg lsb-release
wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
echo "deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | sudo tee -a /etc/apt/sources.list.d/trivy.list
sudo apt-get update
sudo apt-get install -y trivy

# Other tools
curl -sSfL https://raw.githubusercontent.com/anchore/grype/main/install.sh | sh -s -- -b /usr/local/bin
wget https://github.com/gitleaks/gitleaks/releases/latest/download/gitleaks_$(uname -s)_$(uname -m).tar.gz -O /tmp/gitleaks.tar.gz
tar -xzf /tmp/gitleaks.tar.gz -C /tmp && sudo mv /tmp/gitleaks /usr/local/bin/
```

**Linux (Other distributions):**
```bash
curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh
curl -sSfL https://raw.githubusercontent.com/anchore/grype/main/install.sh | sh
go install github.com/gitleaks/gitleaks/v8@latest
go install github.com/aquasecurity/tfsec/cmd/tfsec@latest
```

**Windows:**
```powershell
# Using Scoop
scoop install trivy grype gitleaks tfsec

# Or using winget
winget install AquaSecurity.Trivy
winget install Anchore.Grype
winget install Gitleaks.Gitleaks
winget install AquaSecurity.Tfsec
```

Or use DSO's interactive tool installer:
```bash
dso tools --install
```

## 🎯 Usage

### Complete audit

```bash
# Standard mode (text output)
dso audit .

# Interactive TUI mode (recommended)
dso audit . --interactive
# or
dso audit . -i

# JSON output
dso audit . --format json
```

Analyzes your repo and gives you:
- A clear summary of real risk
- The 3-5 priority fixes
- Exact commands to run

**Interactive TUI Features:**
- Navigate through tabs (Summary, Top Fixes, Critical, High, All Findings)
- Real-time search and filtering
- Progress bars for severity statistics
- Keyboard shortcuts (Tab/→ for next tab, Shift+Tab/← for previous, q to quit)

### Auto-fix

```bash
# With confirmation
dso fix .

# Without confirmation (auto mode)
dso fix --auto .
```

Automatically applies safe fixes (secrets, dependencies, etc.)

### Explain a vulnerability

```bash
dso why CVE-2024-12345
```

Explains in natural language why an alert is critical or a false positive.

### Automatic Pull Request

```bash
dso pr --title "fix(security): dso fixes" --branch dso/fixes
```

Applies fixes and automatically opens a GitHub/GitLab PR.

### Check Ollama status

```bash
dso check
```

Checks that Ollama is accessible and lists available models. Useful for diagnosing connection issues.

### Manage scan tools

```bash
# View tools status
dso tools

# Install missing tools interactively
dso tools --install
```

### Watch mode (monitoring)

```bash
# Monitor repo every 5 minutes
dso watch .

# Custom interval
dso watch --interval 10m .

# Quiet mode (only shows new issues)
dso watch --quiet .
```

### Generate security policies

```bash
# OPA/Rego policy
dso policy --type opa .

# CODEOWNERS for GitHub
dso policy --type codeowners --output .github/CODEOWNERS .
```

### Generate SBOM

```bash
# CycloneDX format (default)
dso sbom .

# SPDX format
dso sbom --format spdx .

# Custom output file
dso sbom --output my-sbom.json .
```

### CI/CD Integration

```bash
# Generate GitHub Actions workflow
dso ci --provider github .

# Generate GitLab CI pipeline
dso ci --provider gitlab .
```

## 🎨 Example Output

```
🔒 DSO - DevSecOps Oracle

📊 Summary
────────────────────────────────────────────────────────────
  You have 127 alerts but only 3 are critical and exploitable in prod.

📈 Statistics
────────────────────────────────────────────────────────────
  Total: 127 findings
  🔴 Critical: 3
  🟠 High: 12
  🟡 Medium: 45
  🔵 Low: 67
  ✅ Fixable: 89
  ⚠️  Exploitable: 3

💼 Business Impact
────────────────────────────────────────────────────────────
  The 3 critical vulnerabilities are in public exposed endpoints.
  Risk of user data exfiltration.

🔧 Top Priority Fixes
────────────────────────────────────────────────────────────

❌ 1. Hardcoded AWS key in frontend/.env.production
   📁 frontend/.env.production:12
   Secret detected in a versioned file
   
   sed -i '12d' frontend/.env.production && git commit -am "fix: remove hardcoded AWS key"

❌ 2. XSS in src/components/Search.tsx
   📁 src/components/Search.tsx:45
   React useEffect unprotected against injection
   
   [patch to apply...]

💡 Ready to fix this in 2 min? Run: dso fix --auto
```

## ⚙️ Configuration

### AI Model

By default, DSO uses `llama3.1:8b`. To change the model:

```bash
export DSO_MODEL=phi3
# or
export DSO_MODEL=mistral:7b
```

### Ollama URL

If Ollama is not on `localhost:11434`, configure the URL:

```bash
export OLLAMA_HOST=http://192.168.1.100:11434
```

### Output format

```bash
# Text (default)
dso audit .

# JSON
dso audit --format json .

# Verbose mode
dso audit --verbose .
```

### Ollama Integration Check

```bash
# Check that everything works
dso check
```

This command checks:
- ✅ Connection to Ollama
- ✅ Available models
- ✅ Configured model is installed

## 🏗️ Architecture

```
dso/
├── cmd/              # Cobra commands
│   ├── root.go
│   ├── audit.go
│   ├── fix.go
│   ├── why.go
│   └── pr.go
├── internal/
│   ├── scanner/      # Scanners (Trivy, grype, etc.)
│   ├── llm/          # Ollama wrapper
│   ├── fixer/        # Auto-fix
│   └── ui/           # Terminal interface
└── templates/        # System prompts
```

## 🔒 Security

- **100% local**: No data is sent outside
- **Zero configuration**: Automatic detection of languages and frameworks
- **Confirmation required**: Destructive fixes ask for confirmation

## 🛠️ Development

```bash
# Install dependencies
go mod download
cd web && npm install && cd ..

# Run all tests
make test-all

# Run Go tests only
go test ./...

# Run Web tests
cd web && npm run test

# Run E2E tests
cd web && npm run test:e2e

# Build
go build -o dso

# Install locally
go install
```

## 🧪 Testing

### Tests Go
```bash
# Run unit tests
go test ./...

# Run with coverage
go test -cover ./...

# Run specific package
go test ./internal/scanner/...
```

### Tests Web
```bash
cd web

# Type checking
npm run type-check

# Unit tests
npm run test

# E2E tests (requires server running)
npm run test:e2e

# E2E with UI
npm run test:e2e:ui
```

### Tests d'intégration API
Les tests d'intégration API sont inclus dans les tests E2E et vérifient :
- ✅ Détection des problèmes (`/api/autofix/issues`)
- ✅ Configuration des outils (`/api/tools/config`)
- ✅ Diagnostic des services (`/api/monitoring/services/diagnose`)
- ✅ Statut des services (`/api/monitoring/services`)
- ✅ Gestion des intégrations (`/api/integrations`)

## 📝 TODO / Roadmap

- [ ] TUI interface with bubbletea
- [ ] Slack/Teams integration
- [ ] Gemini/Claude API support
- [ ] Result caching to avoid repeated scans
- [ ] Optional web dashboard
- [ ] Export to Jira, Linear, etc.

## 🤝 Contributing

PRs are welcome! For major changes, please open an issue first.

## 📄 License

MIT

---

**Made with ❤️ for DevSecOps engineers who are tired of false positives**
