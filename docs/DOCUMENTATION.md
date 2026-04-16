# Documentation Overview

This documentation uses VitePress with a custom theme.

## Local Development

```bash
cd docs
npm install
npm run dev
```

The docs site is available at `http://localhost:5173`.

## Build and Preview

```bash
npm run build
npm run preview
```

Generated static files are in `docs/.vitepress/dist/`.

## Deploy

GitHub Pages deployment is handled by `.github/workflows/docs-pages.yml`.
