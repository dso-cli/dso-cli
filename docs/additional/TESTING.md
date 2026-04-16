# Testing Guide

This guide explains how to validate DSO locally and in CI.

## Prerequisites

- Go 1.24+
- Node.js 20+ (for `web/`)
- Optional: Ollama running locally for AI-enabled flows

## Run Core Go Tests

```bash
go test ./...
```

## Run Full Test Suite

```bash
make test-all
```

## Run Web Tests

```bash
cd web
npm ci
npm run type-check
npm run test
```

## Run E2E Tests

```bash
cd web
npm run test:e2e
```

## CI Validation

Workflows under `.github/workflows/` run:
- Go tests and lint checks
- Cross-platform build verification
- Web unit and E2E checks (where configured)

## Troubleshooting

- If Go tests fail, verify your Go version matches `go.mod`
- If web tests fail, remove `node_modules` and reinstall
- If AI checks fail, verify `ollama serve` and model availability
