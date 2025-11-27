# Architecture

Understanding how DSO works under the hood.

## Overview

DSO is built with a modular architecture that separates concerns:

```
┌─────────────────────────────────────────┐
│           CLI Commands (Cobra)          │
│  audit │ fix │ why │ pr │ check │ ...  │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Internal Packages                  │
├───────────────────────────────────────────┤
│  scanner/  │  llm/  │  fixer/  │  ui/   │
│  tools/    │  policy│  sbom/   │  ci/   │
└──────────────┬───────────────────────────┘
               │
┌──────────────▼───────────────────────────┐
│      External Tools & Services            │
│  Trivy │ Grype │ gitleaks │ Ollama       │
└──────────────────────────────────────────┘
```

## Core Components

### CLI Layer (`cmd/`)

The command layer uses [Cobra](https://github.com/spf13/cobra) for CLI structure:

- **`root.go`**: Main command and version
- **`audit.go`**: Security audit orchestration
- **`fix.go`**: Automatic fix application
- **`why.go`**: Vulnerability explanation
- **`pr.go`**: Pull Request creation
- **`check.go`**: Ollama status check
- **`tools.go`**: Tool management
- **`watch.go`**: Continuous monitoring
- **`policy.go`**: Policy generation
- **`sbom.go`**: SBOM generation
- **`ci.go`**: CI/CD workflow generation

### Scanner (`internal/scanner/`)

Orchestrates multiple security scanners:

- **`scanner.go`**: Main scanning logic
- **`models.go`**: Data structures
- **`progress.go`**: Progress tracking

**Supported Scanners**:
- Trivy (SAST, dependencies, IaC)
- Grype (dependencies)
- gitleaks (secrets)
- tfsec (Terraform)

### LLM Integration (`internal/llm/`)

Local AI integration with Ollama:

- **`ollama.go`**: Ollama API client
- **`prompts.go`**: AI prompts and response parsing

**Features**:
- Streaming responses
- Context management
- Automatic model download
- Error handling with retries

### Fixer (`internal/fixer/`)

Automatic fix application:

- **`autofix.go`**: Fix logic for secrets and dependencies
- **`patcher.go`**: Git patch application and PR creation

### UI (`internal/ui/`)

Beautiful terminal output:

- **`rich.go`**: Formatted output with colors and emojis
- Uses [Lipgloss](https://github.com/charmbracelet/lipgloss) for styling

### Tools (`internal/tools/`)

Tool detection and management:

- **`detector.go`**: Detects installed tools
- Platform-specific installation commands
- Interactive installation prompts

### Policy (`internal/policy/`)

Security policy generation:

- **`generator.go`**: OPA/Rego and CODEOWNERS generation

### SBOM (`internal/sbom/`)

SBOM generation:

- **`generator.go`**: CycloneDX and SPDX format support

### CI (`internal/ci/`)

CI/CD workflow generation:

- **`generator.go`**: GitHub Actions and GitLab CI templates

## Data Flow

### Audit Flow

```
1. User runs: dso audit .
   │
   ├─► Check tools availability
   │
   ├─► Run scanners (parallel)
   │   ├─► Trivy (SAST, dependencies)
   │   ├─► Grype (dependencies)
   │   ├─► gitleaks (secrets)
   │   └─► tfsec (Terraform)
   │
   ├─► Aggregate results
   │
   ├─► Format for AI
   │
   ├─► Send to Ollama
   │
   ├─► Parse AI response
   │
   └─► Display beautiful summary
```

### Fix Flow

```
1. User runs: dso fix .
   │
   ├─► Scan codebase
   │
   ├─► Identify fixable issues
   │
   ├─► For each fix:
   │   ├─► Ask confirmation (if not --auto)
   │   ├─► Apply fix
   │   └─► Track applied fixes
   │
   └─► Report results
```

## Design Principles

### 1. Modularity

Each component is independent and can be tested separately.

### 2. Extensibility

Easy to add new scanners, fixers, or output formats.

### 3. Local-First

Everything runs locally - no external API calls (except Ollama).

### 4. Zero Configuration

Automatic detection of languages, tools, and project structure.

### 5. User-Friendly

Beautiful output, clear error messages, helpful suggestions.

## Technology Stack

- **Language**: Go 1.21+
- **CLI Framework**: [Cobra](https://github.com/spf13/cobra)
- **UI**: [Lipgloss](https://github.com/charmbracelet/lipgloss)
- **AI**: [Ollama](https://ollama.ai) (local)
- **Scanners**: Trivy, Grype, gitleaks, tfsec

## Extension Points

### Adding a New Scanner

1. Add scanner function in `internal/scanner/scanner.go`
2. Add to `RunFullScan` steps
3. Update tool detection in `internal/tools/detector.go`

### Adding a New Fix Type

1. Add fix function in `internal/fixer/autofix.go`
2. Add to `AutoFix` switch statement
3. Implement fix logic

### Adding a New Output Format

1. Add format option in command
2. Add formatter in `internal/ui/rich.go`
3. Update help text

## Performance Considerations

- **Parallel Scanning**: Scanners run in parallel when possible
- **Progress Tracking**: Real-time feedback for long operations
- **Caching**: Results can be cached (future feature)
- **Streaming**: AI responses stream for better UX

## Security Considerations

- **Local Execution**: No code leaves your machine
- **Sandboxing**: Scanners run in isolated processes
- **Input Validation**: All user input is validated
- **Error Handling**: Graceful degradation on failures

## About the Developer

**DSO** is developed by **Ismail MOUYAHADA**, a **DevSecOps Engineer** and **Multi-Platform Software Developer**.

With expertise in security automation, cloud infrastructure, and cross-platform development, Ismail created DSO to bring enterprise-grade security analysis to developers' terminals with zero configuration and complete privacy.

## See Also

- [Getting Started](/guide/getting-started): Start using DSO
- [Ollama Integration](/guide/ollama): AI integration details
- [Scanners](/guide/scanners): Scanner details

