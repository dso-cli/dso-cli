# `audit` Command

Runs a complete security scan and analyzes results with local AI.

## Usage

```bash
dso audit [path]
```

## Description

The `audit` command is DSO's main command. It:

1. **Scans** your code with all available scanners (Trivy, grype, gitleaks, tfsec)
2. **Analyzes** results with local AI (Ollama)
3. **Summarizes** critical issues intelligently
4. **Proposes** priority fixes with exact commands

## Options

### `--format, -f`

Output format:

```bash
# Text format (default)
dso audit .

# JSON format
dso audit --format json .
```

### `--interactive, -i`

Interactive TUI mode with navigation and filtering:

```bash
# Launch interactive UI
dso audit . --interactive
# or
dso audit . -i
```

**Interactive UI Features:**
- Navigate through tabs (Summary, Top Fixes, Critical, High, All Findings)
- Real-time search and filtering
- Progress bars for severity statistics
- Keyboard shortcuts:
  - `Tab` / `→` : Next tab
  - `Shift+Tab` / `←` : Previous tab
  - `↑` / `k` : Move up
  - `↓` / `j` : Move down
  - `/` : Search (in lists)
  - `q` / `Ctrl+C` : Quit

### `--verbose, -v`

Verbose mode with additional details:

```bash
dso audit --verbose .
```

Displays:
- Duration of each step
- Number of findings per scanner
- Ollama connection details

## Examples

### Basic Audit

```bash
dso audit .
```

### Audit with JSON Output

```bash
dso audit --format json . > results.json
```

### Audit a Specific Directory

```bash
dso audit ./src
```

## Output

### Text Format

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

🔧 Top Priority Fixes
────────────────────────────────────────────────────────────

❌ 1. Hardcoded AWS key in frontend/.env.production
   📁 frontend/.env.production:12
   Secret detected in a versioned file
   
   sed -i '12d' frontend/.env.production && git commit -am "fix: remove hardcoded AWS key"
```

### JSON Format

```json
{
  "analysis": {
    "summary": "You have 127 alerts but only 3 are critical...",
    "critical": ["issue 1", "issue 2"],
    "high": ["issue 3"],
    "top_fixes": [
      {
        "title": "Hardcoded AWS key",
        "file": "frontend/.env.production",
        "line": 12,
        "command": "sed -i '12d' frontend/.env.production"
      }
    ]
  },
  "results": {
    "summary": {
      "total": 127,
      "critical": 3,
      "high": 12
    }
  }
}
```

## Scanners Used

DSO automatically detects and uses:

- **Trivy**: SAST, dependencies, IaC
- **Grype**: Dependencies (complementary)
- **gitleaks**: Secrets
- **tfsec**: Terraform (if present)

## Automatic Detection

DSO automatically detects:
- Languages (Go, JavaScript, Python, Java, etc.)
- Frameworks
- Configuration files (Dockerfile, Terraform, K8s, etc.)

## See Also

- [`fix`](/commands/fix): Automatically fix issues
- [`why`](/commands/why): Explain a vulnerability
- [`check`](/commands/check): Check Ollama status
