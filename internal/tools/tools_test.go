package tools

import "testing"

func TestGetToolCategory(t *testing.T) {
	t.Parallel()
	cases := []struct {
		name     string
		tool     string
		expected string
	}{
		{"trivy", "trivy", "SAST"},
		{"case_insensitive", "TRIVY", "SAST"},
		{"gitleaks", "gitleaks", "Secrets"},
		{"tfsec", "tfsec", "IaC"},
		{"syft", "syft", "SBOM"},
		{"unknown", "not-a-real-scanner", "Other"},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			if got := GetToolCategory(tc.tool); got != tc.expected {
				t.Fatalf("GetToolCategory(%q) = %q, want %q", tc.tool, got, tc.expected)
			}
		})
	}
}
