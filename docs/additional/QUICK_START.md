# Quick Start - DSO CLI

Quick start guide for using DSO CLI.

## ⚡ Express Installation

### macOS / Linux
```bash
curl -fsSL https://raw.githubusercontent.com/dso-cli/dso-cli/main/install | bash
```

### Windows
```powershell
git clone https://github.com/dso-cli/dso-cli.git
cd dso-cli
.\install.ps1
```

## Post-Installation Verification

```bash
# Verify installation
dso --version

# Verify Ollama
dso check

# Verify tools
dso tools
```

## First Steps

### 1. Security Audit
```bash
# Full scan with AI analysis
dso audit .

# Interactive mode (TUI)
dso audit . --interactive

# JSON format
dso audit . --format json
```

### 2. Automatic Fix
```bash
# With confirmation
dso fix .

# Without confirmation
dso fix --auto .
```

### 3. Vulnerability Explanation
```bash
dso why CVE-2024-12345
```

### 4. Continuous Monitoring
```bash
# Monitor every 5 minutes
dso watch .

# Custom interval
dso watch --interval 10m .
```

## 🌐 Web Interface

### Start the server
```bash
cd web
npm install
npm run dev:full
```

Open `http://localhost:3000`

### Web Features
- Dashboard with statistics
- 🔍 Interactive new scan
- AI Assistant (chat)
- AutoFix for issues
- 🔌 Integration management
- Service monitoring

## Complete Documentation

- **Documentation Index**: [docs/DOCUMENTATION_INDEX.md](../DOCUMENTATION_INDEX.md) - Complete list of all documentation
- **Installation guide**: [docs/additional/INSTALL.md](INSTALL.md)
- **Testing guide**: [docs/additional/TESTING.md](TESTING.md)
- **Architecture**: [docs/guide/architecture.md](../guide/architecture.md)
- **Roadmap**: [docs/additional/NEXT_STEPS.md](NEXT_STEPS.md)

## 🆘 Help

```bash
# General help
dso --help

# Command help
dso audit --help
dso tools --help
```

## Common Issues

### Ollama not detected
```bash
# Install Ollama
brew install ollama # macOS
# or
curl -fsSL https://ollama.ai/install.sh | sh # Linux

# Start Ollama
ollama serve

# Download a model
ollama pull qwen2.5:7b
```

### Missing tools
```bash
# View available tools
dso tools

# Install interactively
dso tools --install
```

## Ready!

You are now ready to use DSO CLI. Happy vulnerability hunting! 
