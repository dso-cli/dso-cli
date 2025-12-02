# Security Scanners

DSO integrates a comprehensive set of DevSecOps tools to provide complete security coverage for your projects.

## Overview

DSO automatically detects and uses available security tools across multiple categories. All tools are optional - DSO works with any combination of installed tools.

## Tool Categories

### SAST (Static Application Security Testing)

Static analysis tools that examine source code without executing it:

#### Trivy
- **Purpose**: Complete vulnerability scanner (SAST, dependencies, IaC, containers)
- **Installation**: `brew install trivy` (macOS) or see [Trivy docs](https://aquasecurity.github.io/trivy/)
- **Usage**: Automatically used for SAST, dependency, and IaC scanning
- **Output**: Comprehensive vulnerability reports with CVSS scores

#### Semgrep
- **Purpose**: Fast SAST scanner with 1000+ security rules
- **Installation**: `brew install semgrep` (macOS) or `pip install semgrep`
- **Usage**: Language-agnostic pattern matching for security issues
- **Output**: Rule-based findings with severity levels

#### Bandit
- **Purpose**: Python security linter (SAST for Python)
- **Installation**: `pip install bandit`
- **Usage**: Automatically used when Python files are detected
- **Output**: Python-specific security issues

#### ESLint
- **Purpose**: JavaScript/TypeScript linter with security plugins
- **Installation**: `npm install -g eslint eslint-plugin-security`
- **Usage**: Automatically used for JavaScript/TypeScript projects
- **Output**: Code quality and security issues

#### Gosec
- **Purpose**: Go security checker (SAST for Go)
- **Installation**: `brew install gosec` or `go install github.com/securego/gosec/v2/cmd/gosec@latest`
- **Usage**: Automatically used when Go files are detected
- **Output**: Go-specific security vulnerabilities

#### Brakeman
- **Purpose**: Ruby on Rails security scanner
- **Installation**: `gem install brakeman`
- **Usage**: Automatically used for Rails projects
- **Output**: Rails-specific security issues

### Dependencies (Software Composition Analysis)

Tools that analyze dependencies for known vulnerabilities:

#### Grype
- **Purpose**: Vulnerability scanner for container images and filesystems
- **Installation**: `brew install grype` (macOS) or see [Grype docs](https://github.com/anchore/grype)
- **Usage**: Complementary to Trivy for dependency scanning
- **Output**: CVE matches with severity and fix information

#### npm audit
- **Purpose**: Node.js package vulnerability scanner
- **Installation**: Included with Node.js
- **Usage**: Automatically used for Node.js projects
- **Output**: npm package vulnerabilities

#### pip-audit
- **Purpose**: Python vulnerability auditor
- **Installation**: `pip install pip-audit`
- **Usage**: Automatically used for Python projects
- **Output**: Python package vulnerabilities

#### Snyk
- **Purpose**: Multi-language dependency and container scanner
- **Installation**: `brew tap snyk/tap && brew install snyk` (macOS)
- **Usage**: Comprehensive dependency scanning
- **Output**: Detailed vulnerability reports with remediation advice

#### OWASP Dependency-Check
- **Purpose**: OWASP Dependency-Check for Java, .NET, Python, Node.js
- **Installation**: `brew install dependency-check` (macOS)
- **Usage**: Enterprise-grade dependency analysis
- **Output**: CVE database matches

### Secrets Detection

Tools that detect exposed secrets and credentials:

#### Gitleaks
- **Purpose**: Fast and accurate secret detector
- **Installation**: `brew install gitleaks` (macOS) or see [Gitleaks docs](https://github.com/gitleaks/gitleaks)
- **Usage**: Primary secret detection tool
- **Output**: Secret matches with rule IDs and locations

#### TruffleHog
- **Purpose**: Find secrets in git repositories
- **Installation**: `brew install trufflesecurity/trufflehog/trufflehog` (macOS)
- **Usage**: Complementary secret detection
- **Output**: Secret patterns with detector names

#### detect-secrets
- **Purpose**: Python-based secret detection with baseline support
- **Installation**: `pip install detect-secrets`
- **Usage**: Python-focused secret detection
- **Output**: Secret types with line numbers

### IaC (Infrastructure as Code)

Tools that scan infrastructure-as-code files:

#### TFSec
- **Purpose**: Security scanner for Terraform
- **Installation**: `brew install tfsec` (macOS) or see [TFSec docs](https://github.com/aquasecurity/tfsec)
- **Usage**: Primary Terraform scanner
- **Output**: Terraform security issues with rule IDs

#### Checkov
- **Purpose**: Infrastructure as Code security scanner (Terraform, CloudFormation, Kubernetes)
- **Installation**: `brew install checkov` (macOS) or `pip install checkov`
- **Usage**: Multi-format IaC scanning
- **Output**: Policy violations with severity

#### Terrascan
- **Purpose**: Detect compliance and security violations in IaC
- **Installation**: `brew install terrascan` (macOS)
- **Usage**: Comprehensive IaC analysis
- **Output**: Violations with rule names and descriptions

#### Kics
- **Purpose**: Find security vulnerabilities, compliance issues in IaC
- **Installation**: `brew install kics` (macOS) or see [Kics docs](https://docs.kics.io/)
- **Usage**: Multi-cloud IaC scanning
- **Output**: Query-based findings

### Containers

Tools for container security:

#### Hadolint
- **Purpose**: Dockerfile linter and security scanner
- **Installation**: `brew install hadolint` (macOS)
- **Usage**: Automatically used when Dockerfiles are detected
- **Output**: Dockerfile best practices and security issues

#### Docker Bench Security
- **Purpose**: Docker security best practices checker
- **Installation**: Docker container (see installation command in `dso tools`)
- **Usage**: Container runtime security
- **Output**: Security configuration checks

### SBOM (Software Bill of Materials)

#### Syft
- **Purpose**: Generate Software Bill of Materials (SBOM)
- **Installation**: `brew install syft` (macOS) or see [Syft docs](https://github.com/anchore/syft)
- **Usage**: SBOM generation for compliance
- **Output**: CycloneDX or SPDX format SBOMs

### Compliance

#### OPA (Open Policy Agent)
- **Purpose**: Open Policy Agent for policy-based compliance
- **Installation**: `brew install opa` (macOS) or see [OPA docs](https://www.openpolicyagent.org/)
- **Usage**: Policy enforcement and compliance checking
- **Output**: Policy evaluation results

## Tool Detection

DSO automatically detects installed tools:

```bash
# Check which tools are installed
dso tools

# Show all tools (including missing ones)
dso tools --all
```

The output is organized by category:
- Installed tools with versions
- Missing tools with installation instructions

## Installation

### Interactive Installation

```bash
# Offer to install missing tools interactively
dso tools --install
```

### Manual Installation

Each tool provides installation instructions when you run `dso tools`. Common methods:

**macOS (Homebrew):**
```bash
brew install trivy gitleaks tfsec grype semgrep
```

**Linux:**
```bash
# Trivy
curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh

# Gitleaks
wget https://github.com/gitleaks/gitleaks/releases/latest/download/gitleaks_Linux_x64.tar.gz
tar -xzf gitleaks_Linux_x64.tar.gz
sudo mv gitleaks /usr/local/bin/
```

**Python Tools:**
```bash
pip install bandit pip-audit detect-secrets semgrep checkov
```

**Node.js Tools:**
```bash
npm install -g eslint eslint-plugin-security snyk
```

## Tool Priority

DSO uses tools in the following priority:

1. **Primary tools** (if available): Trivy, Gitleaks, TFSec
2. **Complementary tools**: Additional scanners for redundancy
3. **Language-specific**: Tools matched to detected languages

## Integration in Scans

When you run `dso audit .`, DSO:

1. **Detects** available tools automatically
2. **Runs** all applicable scanners in parallel
3. **Merges** results from all tools
4. **Deduplicates** findings based on ID
5. **Analyzes** with AI for intelligent prioritization

## Best Practices

### Minimum Recommended Tools

For comprehensive coverage, install at least:
- **Trivy**: Universal scanner (SAST, dependencies, IaC)
- **Gitleaks**: Secret detection
- **TFSec**: If using Terraform

### Language-Specific Tools

Install tools matching your stack:
- **Python**: Bandit, pip-audit
- **JavaScript/TypeScript**: ESLint, npm audit
- **Go**: Gosec
- **Ruby**: Brakeman

### Container Projects

For containerized applications:
- **Trivy**: Container image scanning
- **Hadolint**: Dockerfile linting
- **Syft**: SBOM generation

## Troubleshooting

### Tool Not Detected

```bash
# Verify tool is in PATH
which trivy

# Check tool version
trivy --version

# Re-run detection
dso tools
```

### Tool Installation Issues

- Check tool-specific documentation
- Verify system requirements
- Ensure proper permissions
- Check PATH configuration

## Next Steps

- [Getting Started](/guide/getting-started.md) - Run your first scan
- [Commands](/commands/) - Explore all commands
- [Web Interface](/guide/web-interface.md) - Use the graphical interface
