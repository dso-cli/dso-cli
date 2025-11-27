---
layout: home

hero:
  name: DSO
  text: DevSecOps Oracle
  tagline: Your senior DevSecOps engineer in your terminal
  image:
    src: /logo.png
    alt: DSO
  actions:
    - theme: brand
      text: Get Started
      link: /guide/
    - theme: alt
      text: View on GitHub
      link: https://github.com/dso-cli/dso-cli

features:
  - icon: 🔒
    title: 100% Local
    details: No data is sent outside. Everything works locally with Ollama for AI.
  - icon: 🧠
    title: Local AI
    details: Intelligent analysis of results with Ollama. No internet connection needed for analysis.
  - icon: ⚡
    title: Zero Configuration
    details: Automatic detection of languages, frameworks and tools. Works immediately.
  - icon: 🔧
    title: Auto-Fix
    details: Automatic correction of safe issues with interactive confirmation.
  - icon: 👀
    title: Continuous Monitoring
    details: Watch mode to monitor your repo and detect new issues.
  - icon: 📦
    title: CI/CD Integration
    details: Automatic generation of GitHub Actions and GitLab CI workflows.

---

## Quick Installation

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

### Manual Installation

```bash
# Clone and build
git clone https://github.com/dso-cli/dso-cli.git
cd dso-cli
go build -o dso .        # Linux/macOS
go build -o dso.exe .   # Windows

# Install Ollama and model
# macOS: brew install ollama
# Linux: curl -fsSL https://ollama.ai/install.sh | sh
# Windows: Download from ollama.ai
ollama pull qwen2.5:7b  # Default model

# Run your first audit
./dso audit .           # Linux/macOS
.\dso.exe audit .       # Windows
```

## Example Output

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

🔧 Top Priority Fixes
────────────────────────────────────────────────────────────

❌ 1. Hardcoded AWS key in frontend/.env.production
   📁 frontend/.env.production:12
   
   sed -i '12d' frontend/.env.production && git commit -am "fix: remove hardcoded AWS key"
```
