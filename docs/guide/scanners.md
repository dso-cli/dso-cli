# Scanners

DSO integrates with multiple security scanners to provide comprehensive coverage.

## Supported Scanners

### Trivy (Recommended)

**Purpose**: Comprehensive vulnerability scanner

**Capabilities**:
- SAST (Static Application Security Testing)
- Dependency scanning
- Container image scanning
- IaC (Infrastructure as Code) scanning
- Secret detection

**Installation**:

**macOS**:
```bash
brew install trivy
```

**Linux (Ubuntu/Debian)**:
```bash
sudo apt-get update
sudo apt-get install -y wget apt-transport-https gnupg lsb-release
wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
echo "deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | sudo tee -a /etc/apt/sources.list.d/trivy.list
sudo apt-get update
sudo apt-get install -y trivy
```

**Linux (Other)**:
```bash
curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh
```

**Windows**:
```powershell
scoop install trivy
# or
winget install AquaSecurity.Trivy
```

**Usage in DSO**: Automatically used for SAST, dependencies, and IaC scanning.

### Grype

**Purpose**: Dependency vulnerability scanner

**Capabilities**:
- Comprehensive dependency scanning
- Multiple package manager support
- CVSS scoring

**Installation**:

**macOS**:
```bash
brew install grype
```

**Linux**:
```bash
curl -sSfL https://raw.githubusercontent.com/anchore/grype/main/install.sh | sh
```

**Windows**:
```powershell
scoop install grype
# or
winget install Anchore.Grype
```

**Usage in DSO**: Used as a complement to Trivy for dependency scanning.

### gitleaks

**Purpose**: Secret detection in code

**Capabilities**:
- Detects hardcoded secrets
- API keys, tokens, passwords
- Supports multiple secret types

**Installation**:

**macOS**:
```bash
brew install gitleaks
```

**Linux (Ubuntu/Debian)**:
```bash
wget https://github.com/gitleaks/gitleaks/releases/latest/download/gitleaks_$(uname -s)_$(uname -m).tar.gz -O /tmp/gitleaks.tar.gz
tar -xzf /tmp/gitleaks.tar.gz -C /tmp
sudo mv /tmp/gitleaks /usr/local/bin/
chmod +x /usr/local/bin/gitleaks
```

**Linux (Other)**:
```bash
go install github.com/gitleaks/gitleaks/v8@latest
```

**Windows**:
```powershell
scoop install gitleaks
# or
winget install Gitleaks.Gitleaks
```

**Usage in DSO**: Automatically used for secret detection.

### tfsec

**Purpose**: Terraform security scanner

**Capabilities**:
- Terraform-specific security checks
- AWS, Azure, GCP support
- Best practices validation

**Installation**:

**macOS**:
```bash
brew install tfsec
```

**Linux**:
```bash
go install github.com/aquasecurity/tfsec/cmd/tfsec@latest
```

**Windows**:
```powershell
scoop install tfsec
# or
winget install AquaSecurity.Tfsec
```

**Usage in DSO**: Automatically used when Terraform files are detected.

## Automatic Detection

DSO automatically:
- ✅ Detects installed scanners
- ✅ Uses available scanners
- ✅ Adapts to missing tools
- ✅ Provides installation instructions

Check installed tools:

```bash
dso tools
```

## Scanner Selection

DSO uses scanners based on:

1. **Availability**: Only uses installed scanners
2. **Project Type**: Detects languages and frameworks
3. **File Types**: Scans relevant files

### Detection Logic

```go
// DSO detects:
- Go projects: *.go, go.mod
- JavaScript/TypeScript: *.js, *.ts, package.json
- Python: *.py, requirements.txt, Pipfile
- Java: *.java, pom.xml, build.gradle
- Docker: Dockerfile, docker-compose.yml
- Terraform: *.tf, *.tfvars
- Kubernetes: *.yaml, *.yml
```

## Scanner Output

DSO normalizes output from all scanners into a unified format:

```go
type Finding struct {
    ID          string
    Type        string  // SECRET, DEPENDENCY, SAST, IAC
    Severity    Severity
    Title       string
    Description string
    File        string
    Line        int
    Tool        string  // trivy, grype, gitleaks, tfsec
    CVSS        float64
    Fixable     bool
    Exploitable bool
}
```

## Performance

Scanners run in parallel when possible:

```
[1/9] Scanning secrets... ✅ (12 findings)
[2/9] SAST Go... ✅ (3 findings)
[3/9] SAST JavaScript/TypeScript... ✅ (8 findings)
[4/9] Scanning dependencies (SCA)... ✅ (45 findings)
[5/9] Scanning Docker... ✅ (2 findings)
[6/9] Scanning Terraform... ✅ (5 findings)
[7/9] Scanning Kubernetes... ✅ (1 finding)
```

## Adding Custom Scanners

To add a custom scanner:

1. Add detection in `internal/tools/detector.go`
2. Add scanner function in `internal/scanner/scanner.go`
3. Add to scan steps in `RunFullScan`

## Scanner-Specific Features

### Trivy

- **Comprehensive**: Covers most security aspects
- **Fast**: Optimized for performance
- **Well-maintained**: Regular updates

### Grype

- **Dependency-focused**: Excellent for SCA
- **Multiple formats**: Supports many package managers
- **Complementary**: Works well with Trivy

### gitleaks

- **Secret-specific**: Specialized for secret detection
- **Fast**: Quick scans
- **Accurate**: Low false positive rate

### tfsec

- **Terraform-native**: Understands Terraform syntax
- **Cloud-aware**: Knows AWS, Azure, GCP best practices
- **Comprehensive**: Covers infrastructure security

## Best Practices

### Minimum Setup

At minimum, install **Trivy** for comprehensive coverage:

```bash
# macOS
brew install trivy

# Linux
curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh

# Windows
scoop install trivy
```

### Complete Setup

For best results, install all scanners:

```bash
dso tools --install
```

### CI/CD Setup

In CI/CD, install scanners in the workflow:

```yaml
- name: Install security tools
  run: |
    # Install Trivy, gitleaks, etc.
```

## About the Developer

**DSO** is developed by **Ismail MOUYAHADA**, a **DevSecOps Engineer** and **Multi-Platform Software Developer**.

With expertise in security automation, cloud infrastructure, and cross-platform development, Ismail created DSO to bring enterprise-grade security analysis to developers' terminals with zero configuration and complete privacy.

## See Also

- [`tools`](/commands/tools): Manage scanner installation
- [`audit`](/commands/audit): Run scans with all available scanners
- [Trivy Documentation](https://aquasecurity.github.io/trivy/)
- [Grype Documentation](https://github.com/anchore/grype)
- [gitleaks Documentation](https://github.com/gitleaks/gitleaks)

