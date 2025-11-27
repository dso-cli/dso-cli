# `ci` Command

Generates CI/CD workflows for GitHub Actions and GitLab CI.

## Usage

```bash
dso ci [path]
```

## Description

The `ci` command automatically generates CI/CD workflow files that integrate DSO security audits into your pipeline. It supports:

- **GitHub Actions**: `.github/workflows/dso.yml`
- **GitLab CI**: `.gitlab-ci.yml` or `.gitlab-ci-dso.yml`

## Options

### `--provider, -p`

CI/CD provider:

```bash
# Generate GitHub Actions workflow
dso ci --provider github .

# Generate GitLab CI pipeline
dso ci --provider gitlab .
```

Default: `github`

Supported providers:
- `github` or `github-actions`: GitHub Actions
- `gitlab` or `gitlab-ci`: GitLab CI

### `--output, -o`

Custom output file path:

```bash
# Custom location
dso ci --provider github --output .github/workflows/security.yml .
```

Default locations:
- GitHub: `.github/workflows/dso.yml`
- GitLab: `.gitlab-ci.yml` (or `.gitlab-ci-dso.yml` if existing)

## Examples

### Generate GitHub Actions Workflow

```bash
dso ci --provider github .
```

Creates `.github/workflows/dso.yml` that:
- Runs on pull requests and pushes
- Installs DSO and security tools
- Runs security audit
- Comments on PRs with results
- Fails if critical issues found

### Generate GitLab CI Pipeline

```bash
dso ci --provider gitlab .
```

Creates `.gitlab-ci.yml` (or `.gitlab-ci-dso.yml` if one exists) that:
- Runs on merge requests
- Installs DSO and security tools
- Runs security audit
- Uploads results as artifacts
- Integrates with GitLab Security Dashboard

### Custom Output Location

```bash
dso ci --provider github --output .github/workflows/security-audit.yml .
```

## Generated Workflows

### GitHub Actions

The generated workflow includes:

```yaml
name: DSO Security Audit

on:
  pull_request:
    branches: [ main, master, develop ]
  push:
    branches: [ main, master ]
  schedule:
    - cron: '0 9 * * 1'  # Weekly on Mondays
  workflow_dispatch:

jobs:
  security-audit:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Go
        uses: actions/setup-go@v4
        with:
          go-version: '1.21'
      
      - name: Install DSO
        run: go install github.com/dso-cli/dso-cli@latest
      
      - name: Install security tools
        run: |
          # Install Trivy, gitleaks, etc.
      
      - name: Run DSO audit
        run: dso audit . --format json > dso-results.json
      
      - name: Comment PR with results
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        # Comments on PR with audit results
```

### GitLab CI

The generated pipeline includes:

```yaml
stages:
  - security

dso-audit:
  stage: security
  image: golang:1.21
  before_script:
    - # Install DSO and security tools
  script:
    - dso audit . --format json > dso-results.json
  artifacts:
    paths:
      - dso-results.json
    reports:
      sast: dso-results.json  # GitLab Security Dashboard
```

## Features

### Automatic Tool Installation

The workflows automatically install:
- DSO (via `go install`)
- Ollama and AI model
- Trivy
- gitleaks
- Other security tools

### PR Comments

GitHub Actions workflow automatically comments on PRs with:
- Summary of findings
- Critical and high severity counts
- Actionable recommendations

### Artifact Upload

Both workflows upload audit results as artifacts for:
- Download and review
- Integration with security dashboards
- Historical tracking

### Failure on Critical Issues

Workflows fail if critical or high severity issues are found, blocking merges until fixed.

## Integration Steps

1. **Generate Workflow**:
   ```bash
   dso ci --provider github .
   ```

2. **Commit and Push**:
   ```bash
   git add .github/workflows/dso.yml
   git commit -m "ci: add DSO security audit"
   git push
   ```

3. **Verify**: The workflow runs automatically on the next PR or push.

## Customization

After generation, you can customize the workflow:

- **Schedule**: Change the cron schedule
- **Branches**: Modify which branches trigger the workflow
- **Tools**: Add or remove security tools
- **Thresholds**: Adjust failure conditions

## Best Practices

### Regular Audits

Schedule weekly audits:

```yaml
schedule:
  - cron: '0 9 * * 1'  # Every Monday at 9 AM
```

### Branch Protection

Combine with branch protection rules:
- Require security checks to pass
- Block merges with critical issues

### Notifications

Add Slack/Teams notifications for critical findings.

## See Also

- [`audit`](/commands/audit): Run manual audits
- [`watch`](/commands/watch): Continuous monitoring alternative
- [`policy`](/commands/policy): Generate security policies
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitLab CI Documentation](https://docs.gitlab.com/ee/ci/)

