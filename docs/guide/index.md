# What is DSO?

DSO (DevSecOps Oracle) is a DevSecOps CLI assistant powered by local AI that talks to you like a senior security engineer sitting next to you.

## Why DSO?

### The Problem

Existing security tools are often:
- ❌ Too verbose (thousands of false positives)
- ❌ Not contextual (don't understand your project)
- ❌ Require complex configuration
- ❌ Send your data outside

### The Solution

DSO solves these problems by being:
- ✅ **Intelligent**: Local AI analyzes and filters results
- ✅ **Contextual**: Understands your project and gives you the 3-5 issues that really matter
- ✅ **Local**: 100% local, zero code leakage
- ✅ **Simple**: One command, zero configuration

## How It Works

```bash
dso audit .
```

And DSO does **EVERYTHING** automatically:

1. **Full scan**: SAST, secrets, dependencies, IaC
2. **AI analysis**: Ollama analyzes results locally
3. **Smart summary**: Gives you the 3-5 critical issues
4. **Fixes**: Proposes exact commands to run

## Key Features

### 🧠 Local AI

Uses Ollama with models like `llama3.1:8b`, `phi3`, or `mistral:7b` to analyze results. Everything works locally, no data is sent outside.

### 🔍 Multiple Scanners

Automatically detects and uses:
- **Trivy**: Main scanner (SAST, dependencies, IaC)
- **Grype**: Complementary dependency scanner
- **gitleaks**: Secret detector
- **tfsec**: Terraform scanner

### 🔧 Smart Auto-Fix

Automatically fixes safe issues:
- Removes exposed secrets
- Updates vulnerable dependencies
- Fixes configurations

### 👀 Continuous Monitoring

`watch` mode to continuously monitor your repo and detect new issues.

## Use Cases

### Individual Developer

```bash
# Quick audit before commit
dso audit .

# Automatic fix
dso fix --auto .
```

### Team

```bash
# CI/CD integration
dso ci --provider github .

# Continuous monitoring
dso watch --interval 10m .
```

### Enterprise

```bash
# Policy generation
dso policy --type opa .

# SBOM for compliance
dso sbom --format cyclonedx .
```

## Next Steps

- [Installation](/guide/installation): Install DSO in 3 steps
- [Getting Started](/guide/getting-started): Run your first audit
- [Commands](/commands/): Discover all available commands
