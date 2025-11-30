# `tools` Command

Manages scan tools: detects installed ones and offers to install missing ones.

## Usage

```bash
dso tools [options]
```

## Description

The `tools` command:
- ✅ Detects installed tools (Trivy, grype, gitleaks, tfsec, etc.)
- 📦 Displays versions
- ⚠️ Lists missing tools
- 🔧 Offers interactive installation

## Options

### `--install, -i`

Offers to install missing tools interactively:

```bash
dso tools --install
```

### `--all, -a`

Shows all tools, including optional ones:

```bash
dso tools --all
```

## Examples

### View Tools Status

```bash
dso tools
```

Output:

```
🔧 DevSecOps Tools Status

📦 SAST:
   ✅ trivy (v0.45.0)
      Complete vulnerability scanner (SAST, dependencies, IaC, containers)
   ❌ semgrep
      Fast SAST scanner with 1000+ security rules
      💡 Install: brew install semgrep

📦 Dependencies:
   ✅ npm (10.9.2)
      Node.js package manager (for npm audit)
   ❌ grype
      Vulnerability scanner for container images and filesystems
      💡 Install: brew install grype

📦 Secrets:
   ❌ gitleaks
      Fast and accurate secret detector
      💡 Install: brew install gitleaks

📦 IaC:
   ❌ tfsec
      Security scanner for Terraform
      💡 Install: brew install tfsec
```

Tools are organized by category with installation instructions for missing tools.

### Interactive Installation

```bash
dso tools --install
```

DSO will:
1. List missing tools
2. Offer to install them one by one
3. Execute installation commands

## Supported Tools

DSO integrates **20+ DevSecOps tools** organized by category:

### SAST (Static Application Security Testing)

- **Trivy**: Complete vulnerability scanner (SAST, dependencies, IaC, containers) - **Recommended**
- **Semgrep**: Fast SAST scanner with 1000+ security rules
- **Bandit**: Python security linter
- **ESLint**: JavaScript/TypeScript linter with security plugins
- **Gosec**: Go security checker
- **Brakeman**: Ruby on Rails security scanner

### Dependencies (Software Composition Analysis)

- **Grype**: Vulnerability scanner for container images and filesystems - **Recommended**
- **npm**: Node.js package manager (for `npm audit`)
- **pip-audit**: Python vulnerability auditor
- **Snyk**: Multi-language dependency and container scanner
- **OWASP Dependency-Check**: Enterprise dependency analysis

### Secrets Detection

- **Gitleaks**: Fast and accurate secret detector - **Recommended**
- **TruffleHog**: Find secrets in git repositories
- **detect-secrets**: Python-based secret detection with baseline support

### IaC (Infrastructure as Code)

- **TFSec**: Security scanner for Terraform - **Recommended**
- **Checkov**: Infrastructure as Code security scanner (Terraform, CloudFormation, Kubernetes)
- **Terrascan**: Detect compliance and security violations in IaC
- **Kics**: Find security vulnerabilities, compliance issues in IaC

### Containers

- **Hadolint**: Dockerfile linter and security scanner
- **Docker Bench Security**: Docker security best practices checker

### SBOM (Software Bill of Materials)

- **Syft**: Generate Software Bill of Materials (SBOM)

### Compliance

- **OPA**: Open Policy Agent for policy-based compliance

### Required

No tool is strictly required. DSO works with any combination of available tools.

### Recommended Minimum

For comprehensive coverage, install at least:
- **Trivy**: Universal scanner (covers most aspects)
- **Gitleaks**: Secret detection
- **Grype**: Dependency scanning (complementary to Trivy)
- **TFSec**: If using Terraform

## Manual Installation

If automatic installation doesn't work:

### macOS

```bash
brew install trivy
brew install grype
brew install gitleaks
brew install tfsec
```

### Linux

```bash
# Trivy
curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh

# Grype
curl -sSfL https://raw.githubusercontent.com/anchore/grype/main/install.sh | sh

# gitleaks
wget https://github.com/gitleaks/gitleaks/releases/latest/download/gitleaks-linux-amd64
chmod +x gitleaks-linux-amd64
sudo mv gitleaks-linux-amd64 /usr/local/bin/gitleaks
```

## Automatic Detection

DSO automatically detects:
- Tools installed in PATH
- Versions (when available)
- Missing tools

## See Also

- [`audit`](/commands/audit): Run an audit (uses detected tools)
- [`check`](/commands/check): Check Ollama status
