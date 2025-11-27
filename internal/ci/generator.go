package ci

import (
	"os"
	"path/filepath"
)

// GenerateGitHubActions generates a GitHub Actions workflow
func GenerateGitHubActions(projectPath string, customOutput string) (string, string, error) {
	workflow := `name: DSO Security Audit

on:
  pull_request:
    branches: [ main, master, develop ]
  push:
    branches: [ main, master ]
  schedule:
    # Exécute tous les lundis à 9h
    - cron: '0 9 * * 1'
  workflow_dispatch:

jobs:
  security-audit:
    runs-on: ubuntu-latest
    name: Security Audit with DSO
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Set up Go
      uses: actions/setup-go@v4
      with:
        go-version: '1.21'
        
    - name: Install DSO
      run: |
        go install github.com/dso-cli/dso-cli@latest
        
    - name: Install Ollama
      run: |
        curl -fsSL https://ollama.ai/install.sh | sh
        
    - name: Pull Ollama model
      run: |
        ollama pull llama3.1:8b
        
    - name: Install security tools
      run: |
        sudo apt-get update
        sudo apt-get install -y wget
        # Install Trivy
        wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
        echo "deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | sudo tee -a /etc/apt/sources.list.d/trivy.list
        sudo apt-get update
        sudo apt-get install -y trivy
        # Install gitleaks
        wget https://github.com/gitleaks/gitleaks/releases/latest/download/gitleaks-linux-amd64 -O /tmp/gitleaks
        chmod +x /tmp/gitleaks
        sudo mv /tmp/gitleaks /usr/local/bin/gitleaks
        
    - name: Run DSO audit
      run: |
        export PATH=$PATH:$(go env GOPATH)/bin
        dso audit . --format json > dso-results.json || true
        
    - name: Upload results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: dso-results
        path: dso-results.json
        
    - name: Comment PR with results
      if: github.event_name == 'pull_request'
      uses: actions/github-script@v6
      with:
        script: |
          const fs = require('fs');
          try {
            const results = JSON.parse(fs.readFileSync('dso-results.json', 'utf8'));
            const summary = results.analysis.summary;
            const critical = results.results.summary.critical || 0;
            const high = results.results.summary.high || 0;
            
            let comment = '## 🔒 DSO Security Audit Results\n\n';
            comment += '**Summary:** ' + summary + '\n\n';
            comment += '**Findings:** ' + critical + ' critical, ' + high + ' high severity\n\n';
            
            if (critical > 0 || high > 0) {
              comment += '⚠️ **Action required:** Please review and fix the security issues.\n';
            } else {
              comment += '✅ No critical or high severity issues found.\n';
            }
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });
          } catch (error) {
            console.log('Could not parse results or create comment:', error);
          }
          
    - name: Fail if critical issues
      if: failure()
      run: |
        echo "❌ Security audit found critical issues. Please review the results."
        exit 1
`

	filename := customOutput
	if filename == "" {
		filename = ".github/workflows/dso.yml"
	}

	return workflow, filename, nil
}

// GenerateGitLabCI generates a GitLab CI pipeline
func GenerateGitLabCI(projectPath string, customOutput string) (string, string, error) {
	workflow := `stages:
  - security

dso-audit:
  stage: security
  image: golang:1.21
  before_script:
    - apt-get update && apt-get install -y wget curl
    # Install Ollama
    - curl -fsSL https://ollama.ai/install.sh | sh
    - ollama serve &
    - sleep 5
    - ollama pull llama3.1:8b
    # Install Trivy
    - wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | apt-key add -
    - echo "deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | tee -a /etc/apt/sources.list.d/trivy.list
    - apt-get update
    - apt-get install -y trivy
    # Install gitleaks
    - wget https://github.com/gitleaks/gitleaks/releases/latest/download/gitleaks-linux-amd64 -O /usr/local/bin/gitleaks
    - chmod +x /usr/local/bin/gitleaks
    # Install DSO
    - go install github.com/dso-cli/dso-cli@latest
    - export PATH=$PATH:$(go env GOPATH)/bin
  script:
    - dso audit . --format json > dso-results.json || true
    - |
      if [ -f dso-results.json ]; then
        CRITICAL=$(jq -r '.results.summary.critical // 0' dso-results.json)
        HIGH=$(jq -r '.results.summary.high // 0' dso-results.json)
        if [ "$CRITICAL" -gt 0 ] || [ "$HIGH" -gt 0 ]; then
          echo "❌ Security audit found $CRITICAL critical and $HIGH high severity issues"
          exit 1
        fi
      fi
  artifacts:
    when: always
    paths:
      - dso-results.json
    reports:
      # GitLab Security Dashboard
      sast: dso-results.json
  only:
    - merge_requests
    - main
    - master
    - develop
  allow_failure: false
`

	filename := customOutput
	if filename == "" {
		filename = ".gitlab-ci.yml"
		// Check if .gitlab-ci.yml already exists
		if _, err := os.Stat(filepath.Join(projectPath, ".gitlab-ci.yml")); err == nil {
			// Create a separate file
			filename = ".gitlab-ci-dso.yml"
		}
	}

	return workflow, filename, nil
}

