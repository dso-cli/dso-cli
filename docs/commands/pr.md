# `pr` Command

Creates a Pull Request with automatic security fixes.

## Usage

```bash
dso pr [path]
```

## Description

The `pr` command:
1. Scans your codebase
2. Applies automatic fixes
3. Creates a new git branch
4. Commits the changes
5. Pushes to remote
6. Opens a Pull Request on GitHub/GitLab

## Options

### `--title, -t`

Custom PR title:

```bash
dso pr --title "fix(security): critical vulnerabilities"
```

Default: `"fix(security): automatic dso fixes"`

### `--message, -m`

Custom PR message:

```bash
dso pr --message "Fixes critical security issues found by DSO audit"
```

### `--branch, -b`

Custom branch name:

```bash
dso pr --branch security/dso-fixes
```

Default: `"dso/security-fixes"`

## Examples

### Create PR with Default Settings

```bash
dso pr .
```

### Create PR with Custom Title and Branch

```bash
dso pr --title "Security fixes" --branch security/patches .
```

### Create PR with Detailed Message

```bash
dso pr --message "This PR fixes:
- Removed hardcoded AWS keys
- Updated vulnerable dependencies
- Fixed insecure configurations"
```

## Prerequisites

### Required Tools

- **Git**: Must be in a git repository
- **GitHub CLI (gh)**: For GitHub PRs
 - Install: `brew install gh` (macOS) or `winget install GitHub.cli` (Windows)
 - Authenticate: `gh auth login`

### Git Configuration

Ensure your git is configured:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## Workflow

1. **Scan**: DSO scans the codebase for security issues
2. **Fix**: Applies automatic fixes
3. **Branch**: Creates/checks out a new branch
4. **Commit**: Commits all changes
5. **Push**: Pushes to remote repository
6. **PR**: Opens a Pull Request

## Output

```
🔍 Scanning and applying fixes…
 Applying fixes…

 3 fix(es) applied successfully:
 • Secret removed from frontend/.env.production:12
 • npm dependency lodash updated
 • Go dependency github.com/gin-gonic/gin updated

 Creating Pull Request…

 Pull Request created: https://github.com/user/repo/pull/123
```

## Error Handling

### No Fixes Available

If no fixes are available:

```
 No fixes to apply.
```

### Git Not Initialized

If not in a git repository:

```
 Error: this directory is not a git repo
```

### GitHub CLI Not Installed

If `gh` is not installed:

```
 Error: GitHub CLI (gh) is not installed
 Make sure you have GitHub CLI (gh) installed and configured.
```

## Integration with CI/CD

The PR will trigger your CI/CD pipeline, which can:
- Run additional security scans
- Verify the fixes
- Run tests
- Deploy to staging

## See Also

- [`fix`](/commands/fix): Apply fixes without creating a PR
- [`audit`](/commands/audit): Run an audit first
- [`ci`](/commands/ci): Generate CI/CD workflows

