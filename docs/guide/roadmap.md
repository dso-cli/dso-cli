# Roadmap - Future Features

This document outlines planned bonus features that can be implemented in ~1 hour each.

**Developed by:** Ismail MOUYAHADA - DevSecOps Engineer & Multi-Platform Software Developer

## 1. `dso pr` - Automated Pull Request Creation

**Estimated Time:** ~1 hour 
**Priority:** High 
**Status:** Planned

### Description
Automatically create a GitHub Pull Request with security fixes applied by DSO.

### Features
- Detect fixes applied by `dso fix --auto`
- Create a new branch with fixes
- Generate PR description with:
 - Summary of fixes applied
 - Security findings addressed
 - Before/after comparisons
- Use GitHub CLI (`gh`) or GitHub API
- Support for GitHub and GitLab

### Usage
```bash
# Auto-fix and create PR
dso audit . --fix --pr

# Or explicitly
dso pr --base main --title "Security fixes from DSO audit"
```

### Dependencies
- GitHub CLI (`gh`) - `brew install gh` / `apt install gh`
- Or GitHub API token in `GITHUB_TOKEN` env var

---

## 2. `dso watch` - Real-time Monitoring with Notifications

**Estimated Time:** ~1 hour 
**Priority:** Medium 
**Status:** Planned

### Description
Continuously monitor the repository and send notifications to Slack/Teams when new security issues are detected.

### Features
- Watch mode with configurable interval
- Slack webhook integration
- Microsoft Teams webhook integration
- Email notifications (optional)
- Only notify on **new** findings (not duplicates)
- Configurable severity thresholds

### Usage
```bash
# Watch with Slack notifications
dso watch . --slack-webhook $SLACK_WEBHOOK

# Watch with Teams notifications
dso watch . --teams-webhook $TEAMS_WEBHOOK

# Watch with both
dso watch . --notify slack,teams

# Configure in ~/.dso/notify.yaml
dso watch . --notify-config ~/.dso/notify.yaml
```

### Configuration
```yaml
# ~/.dso/notify.yaml
slack:
 webhook_url: "https://hooks.slack.com/services/..."
 enabled: true
 severity_threshold: "high" # only notify on high/critical

teams:
 webhook_url: "https://outlook.office.com/webhook/..."
 enabled: true
```

---

## 3. Support for Gemini/Claude API

**Estimated Time:** ~1 hour 
**Priority:** Low (Ollama is sufficient for most users) 
**Status:** Planned

### Description
Add support for cloud-based AI models (Google Gemini, Anthropic Claude) for users who want more powerful analysis or don't want to run Ollama locally.

### Features
- Google Gemini API integration
- Anthropic Claude API integration
- Fallback to Ollama if API fails
- Configurable via environment variables
- Cost estimation/warnings

### Usage
```bash
# Use Gemini
export GEMINI_API_KEY="your-key"
dso audit . --ai gemini

# Use Claude
export CLAUDE_API_KEY="your-key"
dso audit . --ai claude

# Use Ollama (default)
dso audit . --ai ollama

# Auto-detect (try Gemini → Claude → Ollama)
dso audit . --ai auto
```

### Configuration
```yaml
# ~/.dso/config
AI_PROVIDER=gemini # or claude, ollama
GEMINI_API_KEY=your-key
CLAUDE_API_KEY=your-key
GEMINI_MODEL=gemini-pro
CLAUDE_MODEL=claude-3-sonnet
```

---

## Implementation Priority

1. **`dso pr`** - High priority (automates workflow)
2. **`dso watch`** - Medium priority (nice to have)
3. **Gemini/Claude** - Low priority (Ollama is sufficient)

---

## Notes

- Each feature can be implemented independently
- All features maintain backward compatibility
- Configuration files use YAML for flexibility
- Error handling and fallbacks are important for production use

For detailed implementation plans, see [ROADMAP.md](../additional/ROADMAP.md).

