# DSO Documentation

Documentation built with VitePress and the Catppuccin theme.

**Developed by:** Ismail MOUYAHADA - DevSecOps Engineer & Multi-Platform Software Developer

## Development

### Using PM2 (Recommended)

```bash
# Start with PM2
pm2 start ecosystem.config.js

# View status
pm2 status

# View logs
pm2 logs dso-docs

# Stop
pm2 stop dso-docs

# Restart
pm2 restart dso-docs

# Delete
pm2 delete dso-docs
```

The documentation will be accessible at `http://localhost:5173`.

### Using npm directly

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Generated files will be in `docs/.vitepress/dist`.

## Preview

```bash
npm run preview
```

## Structure

```
docs/
├── .vitepress/
│   ├── config.mjs      # VitePress configuration
│   └── theme/         # Custom theme
├── guide/             # Usage guides
├── commands/          # Command documentation
├── configuration/     # Configuration guide
├── examples/          # Examples
├── public/
│   └── icons/        # SVG icons
└── ecosystem.config.js # PM2 configuration
```

## PM2 Management

The documentation can be run with PM2 for production-like management:

- **Auto-restart**: Automatically restarts if the process crashes
- **Logs**: All logs are saved in `logs/` directory
- **Monitoring**: Use `pm2 monit` to monitor resource usage
- **Startup**: Use `pm2 startup` to auto-start on system boot
