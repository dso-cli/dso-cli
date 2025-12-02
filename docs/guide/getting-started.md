# Getting Started

This guide shows you how to use DSO for the first time.

## Initial Check

Before starting, verify everything is configured:

```bash
# 1. Check Ollama
dso check

# 2. Check scan tools
dso tools
```

## First Audit

Run your first audit on your project:

```bash
# Standard mode
dso audit .

# Interactive TUI mode (recommended)
dso audit . --interactive
```

DSO will:
1. Scan your code (SAST, secrets, dependencies, IaC)
2. Analyze results with local AI
3. Give you an intelligent summary
4. Display results in an interactive UI (if `--interactive` is used)

### Interactive UI Mode

When using `--interactive` or `-i`, DSO launches a beautiful TUI (Terminal User Interface) with:

- **Navigation tabs**: Summary, Top Fixes, Critical, High, All Findings
- **Real-time search**: Filter findings as you type
- **Progress bars**: Visual representation of severity distribution
- **Keyboard shortcuts**: Navigate efficiently with `Tab`, `↑`, `↓`, `/`, `q`

### Example Output

**Standard Mode:**
```
 DSO - DevSecOps Oracle

 Summary
────────────────────────────────────────────────────────────
 You have 127 alerts but only 3 are critical and exploitable in prod.

 Statistics
────────────────────────────────────────────────────────────
 Total: 127 findings
 Critical: 3
 High: 12
 Medium: 45
 Low: 67

 Top Priority Fixes
────────────────────────────────────────────────────────────

 1. Hardcoded AWS key in frontend/.env.production
 frontend/.env.production:12
 Secret detected in a versioned file
 
 sed -i '12d' frontend/.env.production && git commit -am "fix: remove hardcoded AWS key"
```

## Automatic Fix

If DSO finds automatically fixable issues:

```bash
# With confirmation
dso fix .

# Without confirmation (auto mode)
dso fix --auto .
```

## Explain a Vulnerability

To understand why an alert is critical:

```bash
dso why CVE-2024-12345
```

## Create a Pull Request

Apply fixes and create a PR automatically:

```bash
dso pr --title "fix(security): automatic fixes"
```

## Typical Workflow

### 1. Initial Audit

```bash
dso audit . --verbose
```

### 2. Fix

```bash
# See issues
dso audit .

# Fix automatically
dso fix --auto .

# Or create a PR
dso pr
```

### 3. CI/CD Integration

```bash
# Generate GitHub Actions workflow
dso ci --provider github .

# Commit and push
git add .github/workflows/dso.yml
git commit -m "ci: add DSO security audit"
git push
```

## About the Developer

**DSO** is developed by **Ismail MOUYAHADA**, a **DevSecOps Engineer** and **Multi-Platform Software Developer**.

With expertise in security automation, cloud infrastructure, and cross-platform development, Ismail created DSO to bring enterprise-grade security analysis to developers' terminals with zero configuration and complete privacy.

## Web Interface

DSO includes a modern web interface for comprehensive project analysis:

```bash
# Start the web UI
cd web
npm install
npm run dev:full
```

Access at **http://localhost:3000** for:
- Real-time scanning with progress tracking
- Multiple result views (All, By Category, By Tool)
- AI chat for security advice
- Repository integration (GitHub/GitLab)
- Configuration monitoring

See the [Web Interface Guide](/guide/web-interface.md) for details.

## Next Steps

- [Commands](/commands/): Discover all available commands
- [Scanners](/guide/scanners.md): Learn about all integrated tools
- [Web Interface](/guide/web-interface.md): Use the graphical interface
- [Examples](/examples/): See concrete examples
