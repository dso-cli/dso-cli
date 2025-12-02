# `watch` Command

Continuously monitors your repository and notifies about new security issues.

## Usage

```bash
dso watch [path]
```

## Description

The `watch` command runs in continuous mode, periodically scanning your repository and only notifying you about **new** security issues that appear since the last scan.

This is useful for:
- Monitoring active development
- Catching issues as they're introduced
- Continuous security awareness

## Options

### `--interval, -i`

Set the scan interval:

```bash
# Scan every 10 minutes
dso watch --interval 10m .

# Scan every 30 seconds (for testing)
dso watch --interval 30s .

# Scan every hour
dso watch --interval 1h .
```

Default: `5m` (5 minutes)

### `--quiet, -q`

Quiet mode - only shows new issues:

```bash
dso watch --quiet .
```

In quiet mode:
- No scan progress messages
- Only notifications for new issues
- Suppresses "no new issues" messages

## Examples

### Basic Watch Mode

```bash
dso watch .
```

Output:
```
👀 Watching: /path/to/project
⏱️ Interval: 5m0s
 Press Ctrl+C to stop

[15:04:05] 🔍 Scanning...
 Initial scan: 127 findings

[15:09:05] 🔍 Scanning...
 No new issues

[15:14:05] 🔍 Scanning...
🚨 2 new issue(s) detected!
 • [CRITICAL] Hardcoded AWS key in src/config.ts:45
 • [HIGH] XSS vulnerability in components/Form.tsx:23
```

### Custom Interval

```bash
# Scan every 15 minutes
dso watch --interval 15m .
```

### Quiet Mode

```bash
# Only show new issues, no progress messages
dso watch --quiet --interval 10m .
```

## How It Works

1. **Initial Scan**: Performs a full scan to establish baseline
2. **Periodic Scans**: Runs scans at the specified interval
3. **Comparison**: Compares new results with previous scan
4. **Notification**: Only reports findings that are new
5. **Continuous**: Runs until interrupted (Ctrl+C)

## Use Cases

### Active Development

Monitor your codebase while developing:

```bash
# In a separate terminal
dso watch --quiet .
```

### CI/CD Alternative

For projects without CI/CD, use watch mode:

```bash
# Run in background
nohup dso watch --interval 1h . > watch.log 2>&1 &
```

### Team Monitoring

Monitor shared repositories:

```bash
# Team members get notified of new issues
dso watch --interval 30m /path/to/shared/repo
```

## Stopping Watch Mode

Press `Ctrl+C` to stop the watch process.

## Performance Considerations

- **Interval**: Longer intervals reduce CPU usage
- **Quiet Mode**: Reduces output overhead
- **First Scan**: May take longer (establishes baseline)

## Integration

### With Systemd (Linux)

Create a systemd service:

```ini
[Unit]
Description=DSO Watch Service
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/project
ExecStart=/usr/local/bin/dso watch --quiet --interval 1h .
Restart=always

[Install]
WantedBy=multi-user.target
```

### With Launchd (macOS)

Create a plist file for automatic startup.

## See Also

- [`audit`](/commands/audit): Run a one-time audit
- [`fix`](/commands/fix): Fix issues found by watch
- [`ci`](/commands/ci): Set up CI/CD for automated scanning

