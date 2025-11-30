# Documentation CLI et API - DSO (DevSecOps Oracle)

## Table des matières

1. [Documentation API](#documentation-api)
2. [Documentation CLI](#documentation-cli)
3. [Exemples d'utilisation](#exemples-dutilisation)

---

## Documentation API

### Accès à la documentation Swagger

Une fois le serveur démarré, accédez à la documentation Swagger interactive à l'adresse :

```
http://localhost:3001/api-docs
```

### Endpoints principaux

#### Health & Status

- **GET /health** - Vérifie l'état de santé de l'API
- **GET /api/version** - Récupère la version de DSO CLI
- **GET /api/check** - Vérifie le statut de connexion à Ollama

#### Scan

- **POST /api/scan** - Exécute un scan de sécurité
  - Body: `{ "path": ".", "format": "json", "verbose": false }`
  - Retourne: `ScanResults`

#### Analysis

- **POST /api/analyze** - Analyse les résultats avec l'IA
  - Body: `{ "results": ScanResults }`
  - Retourne: `AnalysisResult`

#### Fix

- **POST /api/fix** - Applique un correctif automatique
  - Body: `{ "finding": Finding }`
  - Retourne: `{ "success": boolean, "message": string }`

#### Tools

- **GET /api/tools** - Liste tous les outils et leur statut
- **POST /api/tools/install** - Installe ou met à jour un outil
  - Body: `{ "tool": "trivy", "update": false }`

#### Monitoring

- **GET /api/monitoring/kpis** - Récupère les KPI
- **GET /api/monitoring/slos** - Récupère les SLO
- **GET /api/monitoring/services** - Statut de santé des services

#### Repositories

- **POST /api/repos/{provider}/auth** - Authentifie avec GitHub/GitLab
- **GET /api/repos/{provider}/auth/status** - Statut d'authentification
- **GET /api/repos/{provider}/list** - Liste les dépôts
- **POST /api/repos/{provider}/clone** - Clone un dépôt

#### Integrations

- **GET /api/integrations** - Liste les intégrations
- **POST /api/integrations/{id}/connect** - Connecte une intégration
- **POST /api/integrations/{id}/test** - Teste une intégration

#### AutoFix

- **POST /api/autofix/diagnose** - Diagnostique un problème avec Ollama
- **POST /api/autofix/apply** - Applique les commandes de résolution

---

## Documentation CLI

### Installation

```bash
# macOS
brew install dso-cli/dso-cli/dso

# Linux
curl -L https://github.com/dso-cli/dso-cli/releases/latest/download/dso_Linux_x86_64.tar.gz | tar -xz
sudo mv dso /usr/local/bin/

# Windows
scoop install dso
# ou
winget install DSO-CLI.DSO
```

### Commandes principales

#### `dso audit [path]`

Exécute un scan de sécurité complet sur un projet avec analyse IA.

```bash
# Scan du répertoire courant
dso audit

# Scan d'un chemin spécifique
dso audit /path/to/project

# Format de sortie
dso audit --format json
dso audit --format text

# Mode verbeux
dso audit --verbose

# Mode interactif
dso audit --interactive
```

**Options:**
- `--format, -f` - Format de sortie (json, text, sarif)
- `--verbose, -v` - Mode verbeux avec détails
- `--interactive, -i` - Mode interactif avec progression

**Description:**
Exécute un scan complet avec tous les outils disponibles (Trivy, Grype, Gitleaks, TFSec, etc.) puis analyse les résultats avec l'IA locale (Ollama) pour identifier les 3-5 problèmes critiques.

#### `dso check`

Vérifie la configuration et le statut des outils.

```bash
# Vérifier Ollama
dso check

# Vérifier un outil spécifique
dso check trivy

# Vérifier tous les outils
dso check --all
```

**Options:**
- `--all, -a` - Vérifier tous les outils
- `--json, -j` - Sortie JSON

#### `dso tools`

Gère les outils DevSecOps.

```bash
# Lister tous les outils
dso tools

# Installer un outil
dso tools install trivy

# Mettre à jour un outil
dso tools update trivy

# Vérifier le statut
dso tools status
```

**Sous-commandes:**
- `list` - Liste tous les outils disponibles
- `install <tool>` - Installe un outil
- `update <tool>` - Met à jour un outil
- `status` - Affiche le statut de tous les outils

#### `dso why [finding]`

Explique pourquoi une vulnérabilité est importante et son impact.

```bash
# Expliquer une vulnérabilité
dso why "SQL Injection in login.php"

# Avec contexte de scan
dso why "CVE-2023-1234" --scan-results results.json
```

**Options:**
- `--scan-results, -r` - Fichier de résultats de scan pour contexte
- `--verbose, -v` - Explication détaillée

**Description:**
Utilise l'IA locale pour expliquer l'impact business et technique d'une vulnérabilité spécifique.

#### `dso fix [path]`

Applique des correctifs automatiques aux vulnérabilités détectées.

```bash
# Corriger toutes les vulnérabilités fixables dans le répertoire courant
dso fix

# Corriger dans un chemin spécifique
dso fix /path/to/project

# Mode dry-run (simulation)
dso fix --dry-run

# Appliquer automatiquement sans confirmation
dso fix --auto
```

**Options:**
- `--dry-run, -d` - Simulation sans appliquer les correctifs
- `--auto, -a` - Appliquer automatiquement sans confirmation
- `--verbose, -v` - Mode verbeux

**Description:**
Analyse les résultats d'un scan précédent et applique automatiquement les correctifs disponibles pour les vulnérabilités fixables.

#### `dso config`

Gère la configuration.

```bash
# Afficher la configuration
dso config

# Configurer Ollama
dso config ollama --url http://localhost:11434
dso config ollama --model llama3.1:8b

# Configurer les outils
dso config tools --path /usr/local/bin
```

**Sous-commandes:**
- `ollama` - Configuration Ollama
- `tools` - Configuration des outils
- `scan` - Configuration des scans

#### `dso policy [path]`

Génère des politiques de sécurité (OPA, CODEOWNERS).

```bash
# Générer une politique OPA
dso policy --type opa

# Générer un fichier CODEOWNERS
dso policy --type codeowners

# Générer dans un chemin spécifique
dso policy /path/to/project --type opa
```

**Options:**
- `--type, -t` - Type de politique (opa, codeowners)
- `--output, -o` - Fichier de sortie

#### `dso ci [path]`

Génère des workflows CI/CD (GitHub Actions, GitLab CI).

```bash
# Générer un workflow GitHub Actions
dso ci --provider github

# Générer un workflow GitLab CI
dso ci --provider gitlab

# Spécifier le répertoire de sortie
dso ci --output .github/workflows
```

**Options:**
- `--provider, -p` - Fournisseur CI/CD (github, gitlab)
- `--output, -o` - Répertoire de sortie

#### `dso sbom [path]`

Génère un SBOM (Software Bill of Materials).

```bash
# Générer un SBOM CycloneDX
dso sbom --format cyclonedx

# Générer un SBOM SPDX
dso sbom --format spdx

# Format JSON
dso sbom --format json
```

**Options:**
- `--format, -f` - Format du SBOM (cyclonedx, spdx, json)
- `--output, -o` - Fichier de sortie

#### `dso pr [path]`

Crée une Pull Request avec les correctifs appliqués.

```bash
# Créer une PR avec les correctifs
dso pr

# Spécifier la branche
dso pr --branch security-fixes

# Mode dry-run
dso pr --dry-run
```

**Options:**
- `--branch, -b` - Nom de la branche
- `--dry-run, -d` - Simulation sans créer la PR
- `--auto` - Appliquer les correctifs automatiquement

#### `dso watch [path]`

Surveille un répertoire et exécute des scans automatiques.

```bash
# Surveiller le répertoire courant
dso watch

# Surveiller un chemin spécifique
dso watch /path/to/project

# Intervalle de scan
dso watch --interval 5m
```

**Options:**
- `--interval, -i` - Intervalle entre les scans (ex: 5m, 1h)
- `--format, -f` - Format de sortie

---

## Exemples d'utilisation

### Exemple 1: Scan complet avec analyse IA

```bash
# 1. Exécuter le scan
dso audit --format json > scan-results.json

# 2. Analyser avec l'IA (via API)
curl -X POST http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -d @scan-results.json

# 3. Appliquer les correctifs
dso fix --auto
```

### Exemple 2: Intégration dans CI/CD

```yaml
# .github/workflows/security.yml
name: Security Scan

on: [push, pull_request]

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run DSO Scan
        run: |
          dso audit --format json --output scan-results.json
      - name: Upload Results
        uses: actions/upload-artifact@v3
        with:
          name: scan-results
          path: scan-results.json
```

### Exemple 3: Utilisation de l'API

```javascript
// Exemple Node.js
const response = await fetch('http://localhost:3001/api/scan', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    path: './my-project',
    format: 'json',
    verbose: false
  })
})

const results = await response.json()
console.log(`Found ${results.summary.total} vulnerabilities`)
```

### Exemple 4: Résolution automatique de problème

```bash
# Via CLI
dso autofix "Trivy not found"

# Via API
curl -X POST http://localhost:3001/api/autofix/diagnose \
  -H "Content-Type: application/json" \
  -d '{
    "issue": {
      "title": "Trivy not found",
      "description": "Trivy command not found in PATH"
    }
  }'
```

---

## Schémas de données

### ScanResults

```json
{
  "summary": {
    "total": 42,
    "critical": 5,
    "high": 12,
    "medium": 15,
    "low": 10,
    "fixable": 8,
    "exploitable": 3
  },
  "findings": [
    {
      "id": "vuln-1",
      "title": "SQL Injection",
      "description": "Potential SQL injection in login.php",
      "file": "src/login.php",
      "line": 45,
      "severity": "CRITICAL",
      "tool": "semgrep",
      "type": "SAST",
      "fixable": true,
      "exploitable": true,
      "cvss": 9.8
    }
  ]
}
```

### AnalysisResult

```json
{
  "summary": "5 vulnérabilités critiques détectées nécessitent une attention immédiate...",
  "businessImpact": "Ces vulnérabilités pourraient permettre un accès non autorisé...",
  "topFixes": [
    {
      "title": "Fix SQL Injection",
      "description": "Utiliser des requêtes préparées",
      "file": "src/login.php",
      "line": 45,
      "command": "sed -i 's/mysql_query/prepared_statement/g' src/login.php"
    }
  ]
}
```

---

## Codes de retour

- `0` - Succès
- `1` - Erreur générale
- `2` - Erreur de configuration
- `3` - Erreur de scan
- `4` - Ollama non disponible

---

## Support

Pour plus d'informations, consultez :
- Documentation complète : https://dso.dev/docs
- GitHub : https://github.com/dso-cli/dso-cli
- Issues : https://github.com/dso-cli/dso-cli/issues

