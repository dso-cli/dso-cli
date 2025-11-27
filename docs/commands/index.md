# Commands

DSO provides a comprehensive set of commands for security auditing, fixing, and automation.

## Main Commands

### [`audit`](./audit.md)

Run a complete security audit with AI analysis.

```bash
dso audit .
```

### [`fix`](./fix.md)

Automatically apply safe security fixes.

```bash
dso fix --auto .
```

### [`why`](./why.md)

Explain why a vulnerability is critical or if it's a false positive.

```bash
dso why CVE-2024-12345
```

### [`pr`](./pr.md)

Create a Pull Request with automatic fixes.

```bash
dso pr --title "Security fixes"
```

## Tools & Configuration

### [`check`](./check.md)

Verify Ollama connection and available models.

```bash
dso check
```

### [`tools`](./tools.md)

Manage scan tools (detection, installation).

```bash
dso tools --install
```

### [`watch`](./watch.md)

Continuously monitor repository for new issues.

```bash
dso watch --interval 10m .
```

## Generation

### [`policy`](./policy.md)

Generate security policies (OPA/Rego, CODEOWNERS).

```bash
dso policy --type opa .
```

### [`sbom`](./sbom.md)

Generate Software Bill of Materials.

```bash
dso sbom --format cyclonedx .
```

### [`ci`](./ci.md)

Generate CI/CD workflows (GitHub Actions, GitLab CI).

```bash
dso ci --provider github .
```

## Quick Reference

| Command | Purpose | Common Usage |
|---------|---------|--------------|
| `audit` | Security scan + AI analysis | `dso audit .` |
| `fix` | Auto-fix issues | `dso fix --auto .` |
| `why` | Explain vulnerability | `dso why CVE-2024-12345` |
| `pr` | Create PR with fixes | `dso pr` |
| `check` | Verify Ollama | `dso check` |
| `tools` | Manage scanners | `dso tools` |
| `watch` | Continuous monitoring | `dso watch .` |
| `policy` | Generate policies | `dso policy --type opa .` |
| `sbom` | Generate SBOM | `dso sbom .` |
| `ci` | Generate CI/CD | `dso ci --provider github .` |

## Getting Help

For detailed information about any command:

```bash
dso <command> --help
```

For example:
```bash
dso audit --help
dso fix --help
```

## About the Developer

**DSO** is developed by **Ismail MOUYAHADA**, a **DevSecOps Engineer** and **Multi-Platform Software Developer**.

With expertise in security automation, cloud infrastructure, and cross-platform development, Ismail created DSO to bring enterprise-grade security analysis to developers' terminals with zero configuration and complete privacy.

## See Also

- [Getting Started](/guide/getting-started): Learn the basics
- [Configuration](/configuration/): Configure DSO
- [Examples](/examples/): See usage examples

