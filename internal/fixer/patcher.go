package fixer

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

// CreatePullRequest creates a Pull Request with fixes
func CreatePullRequest(projectPath, branch, title, message string, fixes []string) (string, error) {
	// Check that gh is installed
	if _, err := exec.LookPath("gh"); err != nil {
		return "", fmt.Errorf("GitHub CLI (gh) is not installed")
	}

	// Check that we're in a git repo
	if _, err := exec.Command("git", "rev-parse", "--git-dir").Output(); err != nil {
		return "", fmt.Errorf("this directory is not a git repo")
	}

	// Create a new branch
	cmd := exec.Command("git", "checkout", "-b", branch)
	cmd.Dir = projectPath
	if err := cmd.Run(); err != nil {
		// Branch might already exist
		cmd = exec.Command("git", "checkout", branch)
		cmd.Dir = projectPath
		if err := cmd.Run(); err != nil {
			return "", fmt.Errorf("cannot create/checkout branch: %v", err)
		}
	}

	// Add changes
	cmd = exec.Command("git", "add", "-A")
	cmd.Dir = projectPath
	if err := cmd.Run(); err != nil {
		return "", fmt.Errorf("cannot add files: %v", err)
	}

	// Commit
	if message == "" {
		message = fmt.Sprintf("fix(security): automatic dso fixes\n\nApplied fixes:\n%s", strings.Join(fixes, "\n"))
	}
	cmd = exec.Command("git", "commit", "-m", message)
	cmd.Dir = projectPath
	if err := cmd.Run(); err != nil {
		// Maybe there are no changes
		status, _ := exec.Command("git", "status", "--porcelain").Output()
		if len(status) == 0 {
			return "", fmt.Errorf("no changes to commit")
		}
		return "", fmt.Errorf("cannot commit: %v", err)
	}

	// Push
	cmd = exec.Command("git", "push", "-u", "origin", branch)
	cmd.Dir = projectPath
	if err := cmd.Run(); err != nil {
		return "", fmt.Errorf("cannot push: %v", err)
	}

	// Create PR
	if title == "" {
		title = "fix(security): automatic dso fixes"
	}
	cmd = exec.Command("gh", "pr", "create", "--title", title, "--body", message)
	cmd.Dir = projectPath
	output, err := cmd.Output()
	if err != nil {
		return "", fmt.Errorf("cannot create PR: %v", err)
	}

	// Extract PR URL from output
	prURL := strings.TrimSpace(string(output))
	return prURL, nil
}

// ApplyPatch applies a git patch
func ApplyPatch(patch string, projectPath string) error {
	// Create temporary file for patch
	tmpFile := filepath.Join(projectPath, ".dso-patch.tmp")
	if err := os.WriteFile(tmpFile, []byte(patch), 0644); err != nil {
		return err
	}
	defer os.Remove(tmpFile)

	// Apply patch
	cmd := exec.Command("git", "apply", tmpFile)
	cmd.Dir = projectPath
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("cannot apply patch: %v", err)
	}

	return nil
}

