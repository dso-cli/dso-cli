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
🔧 Scan tools status

✅ Installed tools:
   • trivy (v0.45.0)
     Complete vulnerability scanner (SAST, dependencies, IaC)
   • gitleaks (v8.18.0)
     Secret detector in code

⚠️  Missing tools:
   • grype - Dependency scanner (complementary to Trivy)
     💡 Installation: brew install grype
   • tfsec - Security scanner for Terraform
     💡 Installation: brew install tfsec
```

### Interactive Installation

```bash
dso tools --install
```

DSO will:
1. List missing tools
2. Offer to install them one by one
3. Execute installation commands

## Supported Tools

### Required

No tool is strictly required. DSO works with available tools.

### Recommended

- **Trivy**: Main scanner (most complete)
- **gitleaks**: Secret detection
- **grype**: Complementary dependency scanner
- **tfsec**: For Terraform projects

### Optional

- **npm**: For `npm audit` (Node.js dependencies)
- **pip-audit**: For Python dependencies

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
