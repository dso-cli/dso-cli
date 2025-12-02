# Changelog

Tous les changements notables de ce projet seront documentés dans ce fichier.

## [Unreleased]

### Ajouté
- Tests d'intégration API complets
- Tests E2E pour AutoFix et Integrations
- Workflow CI/CD GitHub Actions
- Complete testing documentation (`docs/additional/TESTING.md`)
- Documentation index (`docs/DOCUMENTATION_INDEX.md`)
- All documentation files organized in `/docs` directory
- Commandes Make pour tests (`make test-all`, `make test-e2e`)
- Endpoint `/api/autofix/issues` pour détection automatique des problèmes
- Endpoint `/api/monitoring/services/diagnose` avec diagnostic Ollama
- Endpoints `/api/tools/config` pour gestion des configurations
- Fonctionnalité de déconnexion d'intégrations
- Sauvegarde/chargement des configurations d'outils

### Amélioré
- Détection automatique des problèmes de services
- Diagnostic IA des services avec Ollama
- Gestion des configurations d'outils persistante
- Tests E2E plus complets

### Corrigé
- Doublons de commandes CLI supprimés
- Tous les TODOs implémentés

## [0.1.0] - 2024-01-XX

### Ajouté
- CLI Go avec commandes principales (audit, fix, why, pr, check, tools, watch, policy, sbom, ci)
- Interface web Vue.js avec dashboard
- Intégration Ollama pour analyse IA
- Support de multiples scanners (Trivy, Grype, Gitleaks, etc.)
- Génération de SBOM (CycloneDX, SPDX)
- Génération de politiques de sécurité (OPA/Rego, CODEOWNERS)
- Génération de workflows CI/CD (GitHub Actions, GitLab CI)
- Mode watch pour surveillance continue
- Auto-fix pour corrections automatiques

