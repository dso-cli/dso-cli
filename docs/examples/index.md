# Examples

Concrete examples of using DSO in different scenarios.

## Example 1: Node.js Project Audit

```bash
# Complete audit
dso audit .

# Typical result
# 🔴 1 critical: GitHub token secret in .env
# 🟠 3 high: Vulnerable dependencies (lodash, axios)
# 🟡 12 medium: Insecure configurations

# Automatic fix
dso fix --auto .

# Create a PR
dso pr --title "fix(security): automatic fixes"
```

## Example 2: Terraform Project

```bash
# Audit with IaC focus
dso audit .

# Generate OPA policy
dso policy --type opa .

# Integrate in CI/CD
dso ci --provider github .
```

## Example 3: Continuous Monitoring

```bash
# Monitor repo every 10 minutes
dso watch --interval 10m .

# Quiet mode (notifications only)
dso watch --quiet .
```

## Example 4: SBOM Generation

```bash
# For compliance
dso sbom --format cyclonedx . > sbom.json

# SPDX format
dso sbom --format spdx . > sbom.spdx
```

## Example 5: Complete CI/CD Workflow

```bash
# 1. Generate workflow
dso ci --provider github .

# 2. Commit
git add .github/workflows/dso.yml
git commit -m "ci: add DSO security audit"

# 3. Push (workflow will run automatically)
git push
```

## Example 6: Vulnerability Explanation

```bash
# Understand why a CVE is critical
dso why CVE-2024-12345

# Output:
# This vulnerability is critical because it allows remote code
# execution in a public endpoint. It is exploitable in production
# because the /api/upload endpoint is accessible without
# authentication. To fix: update the dependency to version 2.3.4
# or apply the provided patch.
```
