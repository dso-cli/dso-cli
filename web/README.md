# DSO Web Interface

The `web/` directory contains the Vue-based interface and local API server used for interactive scanning and analysis workflows.

## Features

- Dashboard for scan overview
- Scan execution with progress and logs
- Findings exploration and filtering
- AI chat assistance
- Tool and integration management

## Development

```bash
cd web
npm ci
npm run dev:full
```

This starts frontend and backend together.

## Frontend-only Mode

```bash
cd web
npm ci
npm run dev
```

## Testing

```bash
cd web
npm run type-check
npm run test
npm run test:e2e
```

## Optional Supabase Integration

If you need persistence and collaboration features, configure Supabase as described in `web/SUPABASE_SETUP.md`.
