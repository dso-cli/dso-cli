# 🧪 Guide de Test - DSO CLI

Ce document décrit comment tester DSO CLI de manière complète.

## 📋 Types de Tests

### 1. Tests Unitaires Go

Testent les composants internes du CLI.

```bash
# Tous les tests
go test ./...

# Avec couverture
go test -cover ./...

# Package spécifique
go test ./internal/scanner/...

# Mode verbeux
go test -v ./...
```

### 2. Tests TypeScript/Vue

Testent les composants de l'interface web.

```bash
cd web

# Type checking
npm run type-check

# Tests unitaires
npm run test

# Tests avec couverture
npm run test:coverage

# Interface de test
npm run test:ui
```

### 3. Tests d'Intégration API

Testent les endpoints API du serveur.

```bash
cd web

# Démarrer le serveur
npm run server

# Dans un autre terminal, lancer les tests
npm run test:e2e
```

Les tests d'intégration vérifient :
- `GET /api/autofix/issues` - Détection des problèmes
- `GET /api/tools/config` - Configuration des outils
- `POST /api/tools/config` - Sauvegarde de configuration
- `POST /api/monitoring/services/diagnose` - Diagnostic Ollama
- `GET /api/monitoring/services` - Statut des services
- `GET /api/integrations` - Liste des intégrations

### 4. Tests E2E (End-to-End)

Testent l'interface web complète avec Playwright.

```bash
cd web

# Installer Playwright
npx playwright install

# Lancer les tests E2E
npm run test:e2e

# Interface UI pour déboguer
npm run test:e2e:ui
```

Les tests E2E couvrent :
- Navigation dans l'interface
- Fonctionnalités de scan
- Assistant IA (chat)
- Composant AutoFix
- Gestion des intégrations
- Monitoring des services

## 🚀 Tests Automatisés

### Avec Make

```bash
# Tous les tests
make test-all

# Tests E2E uniquement
make test-e2e
```

### CI/CD

Les tests sont automatiquement exécutés sur :
- Push sur `main` ou `develop`
- Pull Requests

Voir `.github/workflows/test.yml` pour les détails.

## 📊 Couverture de Code

### Go

```bash
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out
```

### TypeScript/Vue

```bash
cd web
npm run test:coverage
```

## 🔍 Tests Manuels

### CLI

```bash
# Vérifier la version
./dso --version

# Vérifier Ollama
./dso check

# Lister les outils
./dso tools

# Test d'audit (sur le projet lui-même)
./dso audit . --verbose
```

### Interface Web

1. Démarrer le serveur :
```bash
cd web
npm run dev:full
```

2. Ouvrir `http://localhost:3000`

3. Tester les fonctionnalités :
   - Dashboard
   - Nouveau scan
   - Assistant IA
   - AutoFix
   - Intégrations
   - Monitoring

## 🐛 Débogage

### Tests Go qui échouent

```bash
# Mode verbeux
go test -v ./...

# Test spécifique
go test -v -run TestFunctionName ./...

# Avec race detector
go test -race ./...
```

### Tests E2E qui échouent

```bash
cd web

# Mode UI pour voir ce qui se passe
npm run test:e2e:ui

# Mode debug
PWDEBUG=1 npm run test:e2e

# Screenshots automatiques en cas d'échec
# Voir playwright-report/
```

### Tests API

Vérifier que le serveur tourne :
```bash
curl http://localhost:3001/health
```

Tester un endpoint :
```bash
curl http://localhost:3001/api/monitoring/services
```

## ✅ Checklist de Test

Avant de commit :

- [ ] Tests Go passent : `go test ./...`
- [ ] Type-check passe : `cd web && npm run type-check`
- [ ] Tests unitaires web passent : `cd web && npm run test`
- [ ] CLI compile : `go build -o dso .`
- [ ] Commande `check` fonctionne : `./dso check`
- [ ] Aucune erreur de linting

Avant un release :

- [ ] Tous les tests passent : `make test-all`
- [ ] Tests E2E passent : `cd web && npm run test:e2e`
- [ ] Build multi-plateforme : `make build-all`
- [ ] Documentation à jour
- [ ] Changelog mis à jour

## 📝 Écrire de Nouveaux Tests

### Test Go

```go
package scanner

import "testing"

func TestFunctionName(t *testing.T) {
    // Arrange
    input := "test"
    
    // Act
    result := FunctionName(input)
    
    // Assert
    if result != "expected" {
        t.Errorf("Expected %s, got %s", "expected", result)
    }
}
```

### Test Vue Component

```typescript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

describe('Component', () => {
  it('should render correctly', () => {
    const wrapper = mount(Component)
    expect(wrapper.text()).toContain('Expected text')
  })
})
```

### Test E2E

```typescript
import { test, expect } from '@playwright/test'

test('should do something', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toBeVisible()
})
```

## 🎯 Objectifs de Couverture

- **Go** : > 70% de couverture
- **TypeScript/Vue** : > 60% de couverture
- **E2E** : Toutes les fonctionnalités principales

