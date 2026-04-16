# Quick Build Guide

## Important

Run commands from the repository root:

```bash
cd "$(git rev-parse --show-toplevel)"
```

## Build Commands

```bash
# Build current platform binary
make build

# Build all target platforms
make build-all

# Build and package release artifacts
make release
```

## Output

Artifacts are generated in `dist/` (platform binaries, checksums, and archives).

## Quick Directory Check

```bash
test -f Makefile && echo "Correct directory" || echo "Wrong directory"
```
