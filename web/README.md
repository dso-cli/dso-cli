# 🌐 DSO Web UI

Interface web moderne et performante pour DSO (DevSecOps Oracle).

## ✨ Caractéristiques

- **Design moderne** : Interface élégante avec Tailwind CSS
- ⚡ **Performant** : Optimisé pour la vitesse et la réactivité
- **Dashboard complet** : Vue d'ensemble avec statistiques
- 🔍 **Scans avancés** : Options de scan personnalisables
- **Analytics** : Suivi et tendances avec Supabase
- 💾 **Persistance** : Sauvegarde automatique des résultats
- **Facile à utiliser** : Interface intuitive et bien documentée

## Installation

```bash
# Installer les dépendances
npm install

# Configurer Supabase (optionnel)
cp .env.example .env
# Remplir VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY
```

## Utilisation

### Mode développement complet

```bash
# Démarre frontend + backend
npm run dev:full
```

### Mode développement frontend uniquement

```bash
# Frontend uniquement (données mockées)
npm run dev
```

### Backend uniquement

```bash
# Backend API uniquement
npm run server
```

## Prérequis

- Node.js 18+
- DSO CLI installé et dans le PATH
- (Optionnel) Projet Supabase configuré

## Fonctionnalités

### Dashboard
- Vue d'ensemble des scans
- Statistiques en temps réel
- Accès rapide aux actions

### Scans
- Scan local avec chemin personnalisé
- Scan de repos GitHub/GitLab
- Options de format (text/json)
- Mode verbose
- Exclusions personnalisées

### Résultats
- Affichage détaillé des findings
- Filtres et recherche
- Export JSON/CSV
- Application de fixes
- Analyse IA intégrée

### Configuration
- Statut Ollama
- Statut des outils de scan
- Version DSO CLI

## Supabase (Optionnel)

Pour activer la persistance et les analytics :

1. Créez un projet sur [supabase.com](https://supabase.com)
2. Exécutez `web/supabase/schema.sql` dans SQL Editor
3. Configurez `.env` avec vos clés Supabase

Voir [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) pour plus de détails.

## Performance

- **Lazy loading** : Composants chargés à la demande
- **Optimisations** : Code splitting et tree shaking
- **Caching** : Mise en cache des résultats
- **Compression** : Assets optimisés

## Documentation

- [PROJECT_PURPOSE.md](../docs/PROJECT_PURPOSE.md) : À quoi sert DSO
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) : Configuration Supabase
- [../README.md](../README.md) : Documentation principale

## Technologies

- **Vue.js 3** : Framework frontend
- **TypeScript** : Typage statique
- **Tailwind CSS** : Styling
- **Supabase** : Backend et base de données
- **Express.js** : API backend
- **Vite** : Build tool

## Design

- **Couleurs** : Emerald (vert) et Dark Blue (bleu foncé)
- **Typographie** : Système de polices natif
- **Animations** : Transitions fluides
- **Responsive** : Mobile-first design

## Roadmap

- [ ] Mode sombre
- [ ] Notifications en temps réel
- [ ] Partage de résultats
- [ ] Intégration CI/CD
- [ ] Rapports PDF
- [ ] API GraphQL
