# `fix` Command

Automatically applies safe security fixes to your codebase.

## Usage

```bash
dso fix [path]
```

## Description

The `fix` command scans your codebase and automatically applies safe fixes such as:
- Removing exposed secrets from versioned files
- Updating vulnerable dependencies
- Fixing insecure configurations

## Options

### `--auto, -a`

Apply fixes without confirmation:

```bash
dso fix --auto .
```

### `--confirm, -c`

Ask for confirmation for each fix:

```bash
dso fix --confirm .
```

## Examples

### Automatic Fix with Confirmation

```bash
dso fix .
```

This will:
1. Scan the codebase
2. Identify fixable issues
3. Ask for confirmation before applying each fix

### Automatic Fix Without Confirmation

```bash
dso fix --auto .
```

Applies all safe fixes automatically without prompting.

### Fix Specific Directory

```bash
dso fix ./src
```

## What Gets Fixed

### Secrets

- Removes hardcoded API keys, tokens, and passwords from versioned files
- Asks for confirmation before removing (unless `--auto` is used)

### Dependencies

- Updates vulnerable npm packages via `npm audit fix`
- Updates Go dependencies via `go get -u`
- Updates Python dependencies via `pip-audit` (if available)
- Updates Maven dependencies (if applicable)

### Configuration Files

- Fixes insecure `.env` files
- Removes exposed credentials

## Safety

The `fix` command only applies **safe** fixes:
- ✅ Removes secrets (with confirmation)
- ✅ Updates dependencies to patched versions
- ✅ Fixes configuration issues

It will **NOT**:
- ❌ Modify application logic
- ❌ Change business-critical code
- ❌ Apply fixes that could break functionality

## Output

```
🔍 Quick scan to identify fixes…
🔧 Applying fixes…

✅ 3 fix(es) applied successfully:
  • Secret removed from frontend/.env.production:12
  • npm dependency lodash updated
  • Go dependency github.com/gin-gonic/gin updated
```

## See Also

- [`audit`](/commands/audit): Run a security audit first
- [`pr`](/commands/pr): Create a Pull Request with fixes
- [`why`](/commands/why): Understand why a vulnerability is critical

