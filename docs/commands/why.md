# `why` Command

Explains why a specific vulnerability is critical or if it's a false positive.

## Usage

```bash
dso why <vulnerability-id>
```

## Description

The `why` command uses local AI to analyze a specific vulnerability and explain:
- Why it's dangerous (or why it's a false positive)
- Whether it's exploitable in production
- How to fix it quickly

## Arguments

### `<vulnerability-id>`

The vulnerability identifier (CVE ID, finding ID, etc.):

```bash
dso why CVE-2024-12345
dso why secret-aws-key-frontend-env
```

## Examples

### Explain a CVE

```bash
dso why CVE-2024-12345
```

Output:
```
🔍 Analyzing vulnerability: CVE-2024-12345
🧠 Consulting local AI…

This vulnerability is critical because it allows remote code execution
in a public endpoint. It is exploitable in production because the /api/upload
endpoint is accessible without authentication. To fix: update the dependency
to version 2.3.4 or apply the provided patch.
```

### Explain a Secret Finding

```bash
dso why secret-aws-key-frontend-env
```

### Explain a Dependency Issue

```bash
dso why lodash-CVE-2021-23337
```

## Use Cases

### Understanding False Positives

Sometimes security scanners flag issues that aren't actually exploitable in your context:

```bash
dso why CVE-2024-XXXXX
# AI explains: "This is a false positive because the vulnerable code path
# is never executed in your application..."
```

### Prioritizing Fixes

Understand which vulnerabilities need immediate attention:

```bash
dso why CVE-2024-XXXXX
# AI explains: "This is critical because it's in a public API endpoint
# that handles user input..."
```

### Learning Security

Get educational explanations about security issues:

```bash
dso why CVE-2024-XXXXX
# AI explains the vulnerability in detail, helping you understand
# the security concept
```

## How It Works

1. **Context Analysis**: DSO analyzes the vulnerability in the context of your project
2. **AI Explanation**: Local AI (Ollama) provides a natural language explanation
3. **Actionable Advice**: Get specific steps to fix the issue

## See Also

- [`audit`](/commands/audit): Find vulnerabilities to explain
- [`fix`](/commands/fix): Automatically fix issues
- [`check`](/commands/check): Verify Ollama is working

