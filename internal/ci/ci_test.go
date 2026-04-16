package ci

import "testing"

func TestGenerateGitHubActions_defaultPath(t *testing.T) {
	t.Parallel()
	dir := t.TempDir()
	content, outPath, err := GenerateGitHubActions(dir, "")
	if err != nil {
		t.Fatal(err)
	}
	const wantPath = ".github/workflows/dso.yml"
	if outPath != wantPath {
		t.Fatalf("unexpected output path: %q, want %q", outPath, wantPath)
	}
	if len(content) < 200 {
		t.Fatalf("workflow content unexpectedly short: %d bytes", len(content))
	}
	if content == "" {
		t.Fatal("empty workflow")
	}
}

func TestGenerateGitHubActions_customOutput(t *testing.T) {
	t.Parallel()
	dir := t.TempDir()
	custom := "custom-workflow.yml"
	_, outPath, err := GenerateGitHubActions(dir, custom)
	if err != nil {
		t.Fatal(err)
	}
	if outPath != custom {
		t.Fatalf("got path %q, want %q", outPath, custom)
	}
}

func TestGenerateGitLabCI_defaultPath(t *testing.T) {
	t.Parallel()
	dir := t.TempDir()
	_, outPath, err := GenerateGitLabCI(dir, "")
	if err != nil {
		t.Fatal(err)
	}
	if outPath != ".gitlab-ci.yml" {
		t.Fatalf("unexpected output path: %q", outPath)
	}
}
