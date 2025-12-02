# Quick Build Guide

## Important: Exécuter depuis la racine du projet

Les commandes de build doivent être exécutées depuis la **racine du projet**, pas depuis `docs/`.

```bash
# Aller à la racine
cd /Users/isma-dev/Desktop/DevSecOps-Cli

# Ou depuis n'importe où
cd "$(git rev-parse --show-toplevel)"
```

## Commandes rapides

### Build pour toutes les plateformes
```bash
make build-all
```

### Créer un release complet
```bash
make release
```

### Utiliser le script de build
```bash
./scripts/build-release.sh v0.1.0
```

## Résultat

Les binaires seront créés dans `dist/`:
- `dist/dso-linux-amd64/dso`
- `dist/dso-linux-arm64/dso`
- `dist/dso-darwin-amd64/dso`
- `dist/dso-darwin-arm64/dso`
- `dist/dso-windows-amd64/dso.exe`
- `dist/dso-windows-arm64/dso.exe`

Et les archives dans `dist/`:
- `dist/dso-*.tar.gz` (Linux/macOS)
- `dist/dso-*.zip` (Windows)

## 🔍 Vérifier que vous êtes au bon endroit

```bash
# Doit afficher: /Users/isma-dev/Desktop/DevSecOps-Cli
pwd

# Doit trouver le Makefile
test -f Makefile && echo " Bon répertoire" || echo " Mauvais répertoire"
```

