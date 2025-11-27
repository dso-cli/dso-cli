# `sbom` Command

Generates a Software Bill of Materials (SBOM) for your project.

## Usage

```bash
dso sbom [path]
```

## Description

The `sbom` command generates a detailed SBOM listing all components, dependencies, and their versions in your project. SBOMs are essential for:
- **Compliance**: Meeting regulatory requirements
- **Security**: Tracking vulnerable dependencies
- **Licensing**: Understanding license obligations
- **Supply Chain**: Managing software supply chain risks

## Options

### `--format, -f`

SBOM format:

```bash
# CycloneDX format (default)
dso sbom --format cyclonedx .

# SPDX format
dso sbom --format spdx .
```

Supported formats:
- `cyclonedx`: CycloneDX JSON format (default)
- `spdx`: SPDX 2.3 format

### `--output, -o`

Output file path:

```bash
# Custom output file
dso sbom --output my-sbom.json .

# Default: sbom.json (CycloneDX) or sbom.spdx (SPDX)
```

## Examples

### Generate CycloneDX SBOM

```bash
dso sbom .
```

Generates `sbom.json` in CycloneDX format.

### Generate SPDX SBOM

```bash
dso sbom --format spdx .
```

Generates `sbom.spdx` in SPDX format.

### Custom Output File

```bash
dso sbom --output compliance/sbom.json .
```

## SBOM Formats

### CycloneDX

CycloneDX is a lightweight SBOM standard:

```json
{
  "bomFormat": "CycloneDX",
  "specVersion": "1.4",
  "version": 1,
  "metadata": {
    "timestamp": "2024-01-15T10:00:00Z",
    "tools": [{
      "name": "dso",
      "version": "0.1.0"
    }],
    "component": {
      "type": "application",
      "name": "my-project",
      "version": "1.0.0"
    }
  },
  "components": [
    {
      "type": "library",
      "name": "lodash",
      "version": "4.17.21",
      "purl": "pkg:npm/lodash@4.17.21"
    }
  ]
}
```

### SPDX

SPDX is a widely adopted SBOM format:

```
SPDXVersion: SPDX-2.3
DataLicense: CC0-1.0
SPDXID: SPDXRef-DOCUMENT
DocumentName: my-project
Creator: Tool: dso-0.1.0

PackageName: lodash
SPDXID: SPDXRef-Package-1
PackageVersion: 4.17.21
PackageDownloadLocation: NOASSERTION
```

## Detected Components

DSO automatically detects components from:

### Node.js

- `package.json` dependencies
- Uses `npm list` if available

### Go

- `go.mod` dependencies
- Parses require statements

### Python

- `requirements.txt` dependencies
- `Pipfile` dependencies

### Java

- `pom.xml` (Maven)
- `build.gradle` (Gradle)

## Use Cases

### Compliance Reporting

Generate SBOMs for compliance audits:

```bash
dso sbom --format cyclonedx --output compliance/sbom.json .
```

### Security Scanning

Use SBOM with security scanners:

```bash
# Generate SBOM
dso sbom .

# Scan SBOM with Trivy
trivy sbom sbom.json
```

### License Management

Track licenses of all dependencies:

```bash
dso sbom --format spdx .
# SPDX format includes license information
```

## Integration

### With CI/CD

Generate SBOMs in your CI/CD pipeline:

```yaml
- name: Generate SBOM
  run: dso sbom --format cyclonedx --output sbom.json .

- name: Upload SBOM
  uses: actions/upload-artifact@v3
  with:
    name: sbom
    path: sbom.json
```

### With Security Tools

Many security tools accept SBOMs:

- **Trivy**: `trivy sbom sbom.json`
- **Grype**: `grype sbom:sbom.json`
- **Snyk**: `snyk test --file=sbom.json`

## See Also

- [`audit`](/commands/audit): Security audit (complements SBOM)
- [`tools`](/commands/tools): Check available dependency managers
- [CycloneDX Specification](https://cyclonedx.org/specification/)
- [SPDX Specification](https://spdx.dev/specifications/)

