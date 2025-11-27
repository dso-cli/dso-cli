# Documentation DSO

Documentation générée avec VitePress et le thème Catppuccin.

## Développement

```bash
cd docs
npm install
npm run dev
```

La documentation sera accessible sur `http://localhost:5173`.

## Build

```bash
npm run build
```

Les fichiers générés seront dans `docs/.vitepress/dist`.

## Preview

```bash
npm run preview
```

## Structure

```
docs/
├── .vitepress/
│   ├── config.js      # Configuration VitePress
│   └── theme/         # Thème personnalisé
├── guide/             # Guide d'utilisation
├── commands/          # Documentation des commandes
├── configuration/     # Guide de configuration
├── examples/          # Exemples
└── api/               # Documentation API
```

