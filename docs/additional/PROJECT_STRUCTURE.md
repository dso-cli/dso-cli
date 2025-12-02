# Structure du Projet DSO

```
dso/
├── main.go # Point d'entrée
├── go.mod # Dépendances Go
├── Makefile # Commandes de build
├── install.sh # Script d'installation
│
├── cmd/ # Commandes CLI (Cobra)
│ ├── root.go # Commande racine
│ ├── audit.go # dso audit
│ ├── fix.go # dso fix
│ ├── why.go # dso why
│ └── pr.go # dso pr
│
├── internal/
│ ├── scanner/ # Scanners de sécurité
│ │ ├── scanner.go # Orchestration des scans
│ │ └── models.go # Structures de données
│ │
│ ├── llm/ # Intégration IA locale
│ │ ├── ollama.go # Client Ollama
│ │ └── prompts.go # Gestion des prompts
│ │
│ ├── fixer/ # Auto-correction
│ │ ├── autofix.go # Application des correctifs
│ │ └── patcher.go # Gestion des patches
│ │
│ └── ui/ # Interface terminal
│ └── rich.go # Affichage avec lipgloss
│
├── templates/ # Templates de prompts
│ └── prompt_system.txt # Prompt système pour l'IA
│
├── examples/ # Exemples de projets de test
│
├── README.md # Documentation principale
├── docs/
│ ├── additional/
│ │ ├── INSTALL.md # Guide d'installation
│ │ └── CONTRIBUTING.md # Guide de contribution
├── LICENSE # Licence MIT
└── .gitignore # Fichiers à ignorer
```

## Flux d'Exécution

### `dso audit .`

1. **cmd/audit.go** → Parse les arguments
2. **scanner/scanner.go** → Lance les scans (Trivy, grype, etc.)
3. **scanner/models.go** → Structure les résultats
4. **llm/prompts.go** → Formate pour l'IA
5. **llm/ollama.go** → Appelle Ollama
6. **llm/prompts.go** → Parse la réponse IA
7. **ui/rich.go** → Affiche le résultat

### `dso fix --auto`

1. **cmd/fix.go** → Parse les arguments
2. **scanner/scanner.go** → Scan rapide
3. **fixer/autofix.go** → Applique les correctifs
4. Affichage des résultats

### `dso why <vuln-id>`

1. **cmd/why.go** → Parse l'ID
2. **llm/ollama.go** → Appelle Ollama avec contexte
3. Affichage de l'explication

## Dépendances Externes

### Requises
- **Go 1.21+**
- **Ollama** (pour l'IA locale)

### Optionnelles (mais recommandées)
- **Trivy** (scanner principal)
- **Grype** (complémentaire)
- **gitleaks** (secrets)
- **tfsec** (Terraform)
- **gh** (pour `dso pr`)

## Architecture

- **Modulaire** : Chaque composant est indépendant
- **Extensible** : Facile d'ajouter de nouveaux scanners
- **Local-first** : Tout fonctionne en local
- **Zero-config** : Détection automatique des langages

