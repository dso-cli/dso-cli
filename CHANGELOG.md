# Changelog

All notable changes to this project are documented in this file.

## [Unreleased]

### Added
- Commande `dso completion` (bash, zsh, fish, PowerShell)
- Go unit tests (`internal/...`) for SBOM, policy, CI, config, and tool categories
- Full API integration tests
- E2E tests for AutoFix and Integrations
- Workflow CI/CD GitHub Actions
- Complete testing documentation (`docs/additional/TESTING.md`)
- Documentation index (`docs/DOCUMENTATION_INDEX.md`)
- All documentation files organized in `/docs` directory
- Make targets for tests (`make test-all`, `make test-e2e`)
- Endpoint `/api/autofix/issues` for automatic issue detection
- Endpoint `/api/monitoring/services/diagnose` with Ollama diagnostics
- Endpoints `/api/tools/config` for tool configuration management
- Integration disconnect feature
- Tool configuration save/load

### Improved
- CI GitHub Actions : `go-version-file: go.mod`, actions `setup-go@v5`, `golangci-lint-action@v6`, artefacts v4
- Makefile: `make test-all` / `make test-e2e` now fail correctly when tests fail
- Documentation and scripts aligned with Go 1.24+ and default Ollama model `qwen2.5:7b`
- Automatic service issue detection
- AI-powered service diagnostics with Ollama
- Persistent tool configuration management
- More complete E2E coverage

### Fixed
- Removed CI "auto tag" job on every push to `main` (versions are published via manual tags/releases)
- Removed duplicate CLI command registration
- Implemented all TODO items

## [0.1.0] - 2024-01-XX

### Added
- Go CLI with core commands (audit, fix, why, pr, check, tools, watch, policy, sbom, ci)
- Interface web Vue.js avec dashboard
- Ollama integration for AI analysis
- Multi-scanner support (Trivy, Grype, Gitleaks, etc.)
- SBOM generation (CycloneDX, SPDX)
- Security policy generation (OPA/Rego, CODEOWNERS)
- CI/CD workflow generation (GitHub Actions, GitLab CI)
- Mode watch pour surveillance continue
- Auto-fix pour corrections automatiques

