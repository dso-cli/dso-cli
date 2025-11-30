# API Endpoints Documentation

## Base URL
- Development: `http://localhost:3001`
- Production: TBD

## Health & Status

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "service": "DSO API"
}
```

## Version & Configuration

### GET /api/version
Get DSO CLI version.

**Response:**
```json
{
  "version": "0.1.0"
}
```

### GET /api/check
Check Ollama connection status.

**Response:**
```json
{
  "connected": true,
  "model": "qwen2.5:7b"
}
```

## Scanning

### POST /api/scan
Run a security scan on a directory.

**Request:**
```json
{
  "path": ".",
  "format": "json",
  "verbose": false,
  "exclude": "test/, *.log"
}
```

**Response:**
```json
{
  "summary": {
    "total": 10,
    "critical": 2,
    "high": 3,
    "medium": 3,
    "low": 2,
    "fixable": 5,
    "exploitable": 1
  },
  "findings": [...]
}
```

### POST /api/analyze
Analyze scan results with AI.

**Request:**
```json
{
  "results": {
    "summary": {...},
    "findings": [...]
  }
}
```

**Response:**
```json
{
  "summary": "Analysis summary",
  "businessImpact": "Business impact description",
  "topFixes": [...]
}
```

### POST /api/fix
Apply auto-fix to a finding.

**Request:**
```json
{
  "finding": {
    "id": "finding-1",
    "file": "test.js",
    "line": 10,
    "fix": "command to fix"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Fix applied successfully"
}
```

## Tools Management

### GET /api/tools
Get status of all DevSecOps tools.

**Response:**
```json
{
  "tools": [
    {
      "name": "Trivy",
      "installed": true,
      "version": "0.45.0"
    },
    {
      "name": "Grype",
      "installed": false,
      "version": null
    }
  ]
}
```

### POST /api/tools/install
Install a DevSecOps tool.

**Request:**
```json
{
  "tool": "trivy"
}
```

**Response:**
```json
{
  "success": true,
  "message": "trivy installed successfully",
  "output": "..."
}
```

## AI Chat

### POST /api/chat
Send a message to the AI assistant.

**Request:**
```json
{
  "message": "What are the critical vulnerabilities?",
  "history": [
    {"role": "user", "content": "Hello"},
    {"role": "assistant", "content": "Hi!"}
  ],
  "context": {
    "scanContext": "Recent scan context",
    "findings": [...]
  }
}
```

**Response:**
```json
{
  "response": "AI response text",
  "actions": [
    {
      "label": "Lancer un scan",
      "command": "scan",
      "icon": "scan"
    }
  ]
}
```

### POST /api/chat/explain
Explain a finding in detail.

**Request:**
```json
{
  "finding": {
    "id": "finding-1",
    "title": "SQL Injection",
    "description": "..."
  }
}
```

**Response:**
```json
{
  "explanation": "Detailed explanation..."
}
```

### POST /api/chat/recommendations
Get SMART recommendations based on scan results.

**Request:**
```json
{
  "scanResults": {
    "summary": {...},
    "findings": [...]
  }
}
```

**Response:**
```json
{
  "recommendations": "Markdown formatted recommendations..."
}
```

### POST /api/chat/action
Execute an action suggested by the AI.

**Request:**
```json
{
  "action": "scan",
  "params": {}
}
```

**Response:**
```json
{
  "success": true,
  "result": "..."
}
```

## Repository Management

### POST /api/repos/:provider/auth
Authenticate with GitHub or GitLab using Personal Access Token.

**Request:**
```json
{
  "token": "ghp_xxxxxxxxxxxx"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "login": "username",
    "name": "User Name",
    "avatar_url": "https://..."
  }
}
```

### GET /api/repos/:provider/auth/status
Check authentication status.

**Response:**
```json
{
  "authenticated": true,
  "user": {
    "login": "username",
    "name": "User Name"
  }
}
```

### POST /api/repos/:provider/auth/disconnect
Disconnect from provider.

**Response:**
```json
{
  "success": true
}
```

### GET /api/repos/:provider/list
List repositories for authenticated user.

**Response:**
```json
{
  "repos": [
    {
      "id": 123,
      "name": "repo-name",
      "full_name": "user/repo-name",
      "description": "Repository description",
      "private": false,
      "language": "JavaScript",
      "stargazers_count": 42,
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST /api/repos/:provider/clone
Clone a repository and prepare for scanning.

**Request:**
```json
{
  "repo": "user/repo-name",
  "clone_url": "https://github.com/user/repo-name.git"
}
```

**Response:**
```json
{
  "success": true,
  "path": "/tmp/dso-clone-12345",
  "message": "Repository cloned successfully"
}
```

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "error": "Error message",
  "message": "Detailed error description"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error

