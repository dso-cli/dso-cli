package sbom

import (
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/dso-cli/dso-cli/internal/constants"
)

func TestGenerateSBOM_unsupportedFormat(t *testing.T) {
	t.Parallel()
	_, err := GenerateSBOM(t.TempDir(), "not-a-format")
	if err == nil {
		t.Fatal("expected error for unsupported format")
	}
	if !strings.Contains(err.Error(), "unsupported format") {
		t.Fatalf("unexpected error: %v", err)
	}
}

func TestGenerateSBOM_cycloneDX(t *testing.T) {
	t.Parallel()
	dir := t.TempDir()
	goMod := `module example.com/demo

go 1.24.0

require github.com/spf13/cobra v1.8.0
`
	if err := os.WriteFile(filepath.Join(dir, "go.mod"), []byte(goMod), 0o600); err != nil {
		t.Fatal(err)
	}
	out, err := GenerateSBOM(dir, "cyclonedx")
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(out, "CycloneDX") {
		t.Fatal("expected CycloneDX in output")
	}
	if !strings.Contains(out, "spf13/cobra") {
		t.Fatal("expected go.mod dependency in SBOM")
	}
}

func TestGenerateSBOM_spdx(t *testing.T) {
	t.Parallel()
	dir := t.TempDir()
	if err := os.WriteFile(filepath.Join(dir, "go.mod"), []byte("module x\n\ngo 1.24.0\n"), 0o600); err != nil {
		t.Fatal(err)
	}
	out, err := GenerateSBOM(dir, constants.FormatSPDX)
	if err != nil {
		t.Fatal(err)
	}
	if !strings.HasPrefix(out, "SPDXVersion:") {
		prefixLen := min(40, len(out))
		t.Fatalf("unexpected SPDX prefix: %q", out[:prefixLen])
	}
}
