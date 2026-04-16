# DSO Feature Overview

## CLI Security Workflow

- `dso audit` for multi-tool security scanning and AI-assisted prioritization
- `dso fix` for safe automatic remediation steps
- `dso why` for vulnerability explanations and context
- `dso pr` for fix branch and pull request automation

## Platform and Security Integrations

- Local AI via Ollama (`DSO_MODEL`, `OLLAMA_HOST`)
- Scanner ecosystem support (SAST, secrets, dependency, IaC, container, SBOM)
- CI workflow generation for GitHub Actions and GitLab CI
- Policy generation (OPA/Rego and CODEOWNERS)

## Developer Experience

- Interactive terminal UI for navigating findings
- Watch mode for continuous monitoring
- Shell completion support (`bash`, `zsh`, `fish`, `powershell`)
- Web interface (`web/`) for dashboard and API-based operations

## Design Principles

- Local-first execution
- Clear remediation guidance
- Automation with explicit user control
- Open source collaboration readiness
