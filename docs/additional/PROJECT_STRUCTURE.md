# DSO Project Structure

```text
dso-cli/
├── cmd/                 # Cobra CLI commands
├── internal/            # Core business logic (scanner, llm, fixer, ui, policy, sbom, ci)
├── docs/                # VitePress documentation
├── web/                 # Vue web interface and API server
├── scripts/             # Build and verification scripts
├── templates/           # Prompt templates and static assets
├── .github/workflows/   # CI/CD workflows
├── main.go              # CLI entry point
├── go.mod               # Go module and dependencies
└── Makefile             # Build, test, and release tasks
```

## Runtime Flow (CLI)

1. `main.go` calls `cmd.Execute()`
2. Command handlers in `cmd/` parse args and options
3. Security scanners in `internal/scanner/` collect findings
4. AI analysis in `internal/llm/` enriches and prioritizes output
5. Output is rendered via `internal/ui/` or exported as machine-readable formats

## Key Notes

- Keep command wiring in `cmd/` and implementation logic in `internal/`
- Treat `docs/` and `web/` as first-class deliverables
- Keep generated assets and build artifacts out of version control
