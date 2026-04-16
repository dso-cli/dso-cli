# CLI and API Documentation

This page provides a compact reference for DSO CLI usage and the web API surface.

## CLI Commands

- `dso audit [path]` - Run security scan and AI-assisted analysis
- `dso fix [path]` - Apply safe automatic fixes
- `dso why <id>` - Explain a vulnerability or finding
- `dso check` - Verify Ollama connectivity and models
- `dso tools` - Detect tools and show installation guidance
- `dso sbom [path]` - Generate SBOM (`cyclonedx` or `spdx`)
- `dso policy [path]` - Generate policy files (`opa`, `codeowners`)
- `dso ci [path]` - Generate CI templates (`github`, `gitlab`)
- `dso watch [path]` - Run scheduled repeated scans
- `dso completion <shell>` - Generate shell completion script

For full command options, run:

```bash
dso --help
dso <command> --help
```

## Web API (High-Level)

The web application exposes endpoints through `web/server.js` for:
- Health and service status
- Scan execution and result retrieval
- Tool configuration and diagnostics
- Integrations and repository flows
- Auto-fix suggestions and action execution

## Best Practice

Use CLI docs in `docs/commands/` for detailed flags and examples, and treat this page as a quick API/CLI index.
