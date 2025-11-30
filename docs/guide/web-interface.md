# Web Interface

DSO includes a modern web interface built with Vue.js and Tailwind CSS for comprehensive project analysis and management.

## Overview

The web interface provides a complete graphical environment for:
- Running security scans with real-time progress
- Viewing results in multiple formats (All, By Category, By Tool)
- Chatting with AI for security advice
- Managing repositories (GitHub/GitLab)
- Monitoring tool status and configuration

## Getting Started

### Prerequisites

- Node.js 18+ installed
- DSO CLI compiled and in PATH
- Ollama running (for AI features)

### Installation

```bash
# Navigate to web directory
cd web

# Install dependencies
npm install

# Start both frontend and backend
npm run dev:full
```

This will start:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

### Development Mode

```bash
# Frontend only (Vite dev server)
npm run dev

# Backend only (Express API)
npm run server

# Both (recommended)
npm run dev:full
```

## Features

### Dashboard

The dashboard provides an overview of:
- Recent scans with statistics
- Quick actions (New Scan, View History, Configuration)
- Project summary and trends

### Scanning

Run comprehensive security scans with:
- **Real-time Progress**: Visual progress bars and step indicators
- **Console Logs**: Live console output showing scan activities
- **Timeline**: Step-by-step timeline of scan phases
- **Toast Notifications**: Real-time notifications for scan events

### Results View

View scan results in three modes:

1. **All**: Traditional table view with all findings
2. **By Category**: Grouped by type (SAST, SECRET, DEPENDENCY, IAC, CONTAINER)
3. **By Tool**: Grouped by scanning tool (Trivy, Gitleaks, etc.)

Each view includes:
- Severity badges
- File locations with line numbers
- Tool identification
- Fixable indicators
- Export options (JSON, CSV)

### AI Chat

Interactive chat with your local AI model for:
- Asking questions about vulnerabilities
- Getting security advice
- Requesting explanations
- Receiving recommendations

The chat understands scan context and can suggest actions like:
- Launching a new scan
- Applying fixes
- Exporting results

### Repository Integration

Connect to GitHub or GitLab to:
- List your repositories
- Clone and scan remote repositories
- Authenticate with Personal Access Tokens
- Scan repositories without local cloning

### Configuration Panel

Monitor and manage:
- **Ollama Status**: Connection status and active model
- **DevSecOps Tools**: Status of all 20+ integrated tools by category
- **DSO CLI Version**: Current CLI version

Tools are organized by category:
- SAST (6 tools)
- Dependencies (5 tools)
- Secrets (3 tools)
- IaC (4 tools)
- Containers (2 tools)
- SBOM (1 tool)
- Compliance (1 tool)

## Architecture

```
┌─────────────────────────────────────────┐
│         Vue.js Frontend (Port 3000)     │
│  - Dashboard, Scanning, Results, Chat   │
└──────────────┬──────────────────────────┘
               │ HTTP/API
┌──────────────▼──────────────────────────┐
│      Express.js Backend (Port 3001)      │
│  - API endpoints, DSO CLI integration   │
└──────────────┬───────────────────────────┘
               │
┌──────────────▼───────────────────────────┐
│           DSO CLI                        │
│  - Security scanning                     │
│  - Tool detection                        │
│  - AI analysis via Ollama                │
└─────────────────────────────────────────┘
```

## API Endpoints

The backend provides RESTful API endpoints:

- `GET /api/version` - Get DSO CLI version
- `GET /api/check` - Check Ollama status
- `GET /api/tools` - Get all tools status
- `POST /api/scan` - Run security scan
- `POST /api/analyze` - Analyze scan results with AI
- `POST /api/fix` - Apply automatic fixes
- `POST /api/chat` - Chat with AI
- `POST /api/repos/:provider/auth` - Authenticate with Git provider
- `GET /api/repos/:provider/list` - List repositories
- `POST /api/repos/:provider/clone` - Clone repository

## Supabase Integration (Optional)

DSO can store scan results and analytics in a Supabase database:

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Apply the schema from `web/supabase/schema.sql`
3. Set environment variables in `web/.env`:
   ```
   VITE_SUPABASE_URL="your-supabase-url"
   VITE_SUPABASE_ANON_KEY="your-anon-key"
   ```

This enables:
- Historical scan tracking
- Analytics and trends
- Multi-user support
- Project management

## Keyboard Shortcuts

- `Ctrl/Cmd + K`: Quick search
- `Esc`: Close modals
- `Enter`: Submit forms
- Navigation arrows for lists

## Customization

### Themes

The interface uses Tailwind CSS with a custom color scheme:
- **Primary**: Emerald green (`emerald-500`)
- **Secondary**: Dark blue (`darkblue-500`)
- **Accent**: Gradient combinations

### Configuration

Edit `web/tailwind.config.js` to customize colors and styling.

## Troubleshooting

### Backend not starting

```bash
# Check if port 3001 is available
lsof -ti:3001

# Check backend logs
tail -f /tmp/dso-backend.log
```

### Frontend not loading

```bash
# Clear Vite cache
rm -rf web/node_modules/.vite

# Reinstall dependencies
cd web && npm install
```

### DSO CLI not found

Ensure the DSO binary is in your PATH or update the backend's `findDSOCLI()` function in `web/server.js`.

## Next Steps

- [Getting Started](/guide/getting-started.md) - Learn the basics
- [Commands](/commands/) - Explore all CLI commands
- [Scanners](/guide/scanners.md) - Understand all integrated tools

