# Build and Release Guide

This document explains how to build DSO for all platforms and create releases.

## Quick Build

### Build for Current Platform

```bash
make build
# or
go build -o dso .
```

### Build for All Platforms

```bash
make build-all
```

This creates binaries in `dist/` directory:
- `dist/dso-linux-amd64/dso`
- `dist/dso-linux-arm64/dso`
- `dist/dso-darwin-amd64/dso`
- `dist/dso-darwin-arm64/dso`
- `dist/dso-windows-amd64/dso.exe`
- `dist/dso-windows-arm64/dso.exe`

### Create Release Packages

```bash
make release
```

This will:
1. Build all platforms
2. Create checksums
3. Create release archives (`.tar.gz` for Unix, `.zip` for Windows)

## Using Build Scripts

### Linux/macOS

```bash
./scripts/build-release.sh [version]
```

Example:
```bash
./scripts/build-release.sh v0.1.0
```

### Windows (PowerShell)

```powershell
.\scripts\build-release.ps1 [version]
```

Example:
```powershell
.\scripts\build-release.ps1 v0.1.0
```

## CI/CD Builds

### GitHub Actions

The project includes two GitHub Actions workflows:

1. **`.github/workflows/ci.yml`** - Runs on every push/PR
   - Tests the code
   - Builds on multiple platforms to verify compilation

2. **`.github/workflows/release.yml`** - Runs on tags
   - Builds for all platforms
   - Creates release archives
   - Publishes to GitHub Releases

To create a release:
```bash
git tag v0.1.0
git push origin v0.1.0
```

Or use GitHub UI: Actions → Release → Run workflow

### GitLab CI

The `.gitlab-ci.yml` file builds for all platforms on:
- Every merge request (test stage)
- Tagged releases (build + release stages)

## Manual Cross-Compilation

### Linux

```bash
# AMD64
GOOS=linux GOARCH=amd64 go build -o dso-linux-amd64 .

# ARM64
GOOS=linux GOARCH=arm64 go build -o dso-linux-arm64 .
```

### macOS

```bash
# AMD64 (Intel)
GOOS=darwin GOARCH=amd64 go build -o dso-darwin-amd64 .

# ARM64 (Apple Silicon)
GOOS=darwin GOARCH=arm64 go build -o dso-darwin-arm64 .
```

### Windows

```bash
# AMD64
GOOS=windows GOARCH=amd64 go build -o dso-windows-amd64.exe .

# ARM64
GOOS=windows GOARCH=arm64 go build -o dso-windows-arm64.exe .
```

## Build Flags

The build uses these flags for optimization:

- `-w`: Omit the DWARF symbol table
- `-s`: Omit the symbol table and debug information
- `CGO_ENABLED=0`: Disable CGO for static binaries

## Release Checklist

1. **Update version** in code (if needed)
2. **Run tests**: `make test`
3. **Build all platforms**: `make build-all`
4. **Test binaries** on each platform
5. **Create release**: `make release`
6. **Create tag**: `git tag v0.1.0`
7. **Push tag**: `git push origin v0.1.0`
8. **GitHub Actions** will automatically create the release

## Supported Platforms

| OS      | Architecture | Binary Name |
|---------|--------------|-------------|
| Linux   | amd64        | dso         |
| Linux   | arm64        | dso         |
| macOS   | amd64        | dso         |
| macOS   | arm64        | dso         |
| Windows | amd64        | dso.exe     |
| Windows | arm64        | dso.exe     |

## Troubleshooting

### Build fails on Windows

Make sure you have Go installed and in PATH:
```powershell
go version
```

### Checksums don't match

On Windows, use PowerShell or Git Bash for checksums. The scripts handle this automatically.

### Cross-compilation issues

Ensure you're using Go 1.21+ and have CGO disabled:
```bash
CGO_ENABLED=0 go build ...
```

