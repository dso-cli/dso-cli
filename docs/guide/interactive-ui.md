# Interactive UI Guide

DSO features a beautiful Terminal User Interface (TUI) built with Bubbletea for an enhanced user experience when exploring scan results.

## Launching Interactive Mode

```bash
# Launch interactive TUI
dso audit . --interactive

# Or use the short flag
dso audit . -i
```

## Features

### Navigation Tabs

The interface provides several tabs for different views:

- **Summary**: Overview with statistics, AI summary, and business impact
- **Top Fixes**: Priority fixes recommended by AI
- **Critical**: Only critical severity findings
- **High**: High severity findings
- **All Findings**: Complete list of all findings

### Real-time Search

- Type `/` to start searching in list views
- Filter findings as you type
- Search works across all tabs

### Progress Bars

Visual representation of severity distribution:
- Critical findings (red)
- High findings (orange)
- Medium findings (yellow)
- Low findings (blue)

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` / `→` | Next tab |
| `Shift+Tab` / `←` | Previous tab |
| `↑` / `k` | Move up in list |
| `↓` / `j` | Move down in list |
| `/` | Start search (in lists) |
| `q` / `Ctrl+C` | Quit |

## Interface Layout

```
┌─────────────────────────────────────────────────────┐
│ DSO - DevSecOps Oracle │
│ Total: 127 | Critical: 3 | High: 12 | Medium: 45... │
├─────────────────────────────────────────────────────┤
│ [Summary] [Top Fixes] [Critical] [High] [All] │
├─────────────────────────────────────────────────────┤
│ │
│ AI Summary │
│ ─────────────────────────────────────────────────── │
│ You have 127 alerts but only 3 are critical... │
│ │
│ Statistics │
│ ─────────────────────────────────────────────────── │
│ Critical: 3 [████████░░░░░░░░░░░░] │
│ High: 12 [████████████████░░░░] │
│ Medium: 45 [████████████████████] │
│ Low: 67 [████████████████████] │
│ │
│ Business Impact │
│ ─────────────────────────────────────────────────── │
│ The 3 critical vulnerabilities are in... │
│ │
├─────────────────────────────────────────────────────┤
│ q/ctrl+c: quit | tab/→: next | shift+tab/←: prev │
└─────────────────────────────────────────────────────┘
```

## List View

When viewing lists (Top Fixes, Critical, High, All Findings):

```
┌─────────────────────────────────────────────────────┐
│ Top Fixes │
├─────────────────────────────────────────────────────┤
│ > Hardcoded AWS key in frontend/.env.production │
│ frontend/.env.production:12 │
│ Secret detected in a versioned file │
│ │
│ Vulnerable dependency: lodash@4.17.20 │
│ package.json:45 │
│ CVE-2021-23337: Prototype pollution │
│ │
│ Missing security headers │
│ server.js:23 │
│ X-Frame-Options header not set │
│ │
├─────────────────────────────────────────────────────┤
│ q: quit | ↑/k: up | ↓/j: down | /: search │
└─────────────────────────────────────────────────────┘
```

## Color Coding

Findings are color-coded by severity:

- **Critical** ( Red): Immediate action required
- **High** ( Orange): Should be addressed soon
- **Medium** ( Yellow): Moderate priority
- **Low** ( Blue): Low priority, informational

## Tips

1. **Quick Navigation**: Use `Tab` to quickly switch between tabs
2. **Efficient Search**: Press `/` and start typing to filter findings
3. **Vim-like Movement**: Use `j`/`k` for up/down navigation
4. **Exit Anytime**: Press `q` or `Ctrl+C` to exit

## Comparison with Standard Mode

| Feature | Standard Mode | Interactive Mode |
|---------|--------------|-------------------|
| Output | Static text | Dynamic TUI |
| Navigation | Scroll only | Tab navigation |
| Search | Manual grep | Real-time filtering |
| Statistics | Text only | Visual progress bars |
| Experience | Basic | Enhanced |

## Troubleshooting

### Interface doesn't launch

- Ensure your terminal supports TUI (most modern terminals do)
- Check terminal size (minimum 80x24 recommended)
- Try running with `--verbose` flag for debugging

### Colors not displaying

- Ensure your terminal supports 256 colors
- Check `TERM` environment variable: `echo $TERM`
- Try setting: `export TERM=xterm-256color`

### Performance issues

- Large projects may take time to render
- Use filters to reduce displayed items
- Consider using standard mode for very large scans

## Next Steps

- [Commands](/commands/): Learn about all DSO commands
- [Getting Started](/guide/getting-started): Basic usage guide
- [Configuration](/configuration/): Configure DSO settings

