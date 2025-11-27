# Documentation VitePress avec Catppuccin

Cette documentation utilise VitePress avec les thèmes Catppuccin pour le code highlighting.

## Installation

```bash
cd docs
npm install
```

## Développement

```bash
npm run dev
```

La documentation sera accessible sur `http://localhost:5173`.

## Build

```bash
npm run build
```

Les fichiers générés seront dans `.vitepress/dist/`.

## Preview

```bash
npm run preview
```

## Thèmes Catppuccin

La documentation utilise les thèmes Catppuccin pour le code highlighting :

- **Light mode** : `catppuccin-latte`
- **Dark mode** : `catppuccin-mocha`

Ces thèmes sont configurés dans `.vitepress/config.mjs` via Shiki.

## Structure

```
docs/
├── .vitepress/
│   ├── config.mjs      # Configuration VitePress
│   └── theme/
│       ├── index.js    # Thème personnalisé
│       └── custom.css  # Styles Catppuccin
├── guide/             # Guide d'utilisation
├── commands/          # Documentation des commandes
├── configuration/     # Guide de configuration
├── examples/          # Exemples
└── index.md          # Page d'accueil
```

## Personnalisation

Les couleurs Catppuccin sont définies dans `.vitepress/theme/custom.css` :

- **Mocha (dark)** : `#1e1e2e` (background), `#8aadf4` (blue)
- **Latte (light)** : `#eff1f5` (background), `#1e66f5` (blue)

## Déploiement

### GitHub Pages

1. Build la documentation : `npm run build`
2. Configurer GitHub Pages pour servir `.vitepress/dist/`

### Netlify / Vercel

Les plateformes modernes détectent automatiquement VitePress et le build.

## Support

Pour toute question sur la documentation, ouvre une issue sur GitHub.

