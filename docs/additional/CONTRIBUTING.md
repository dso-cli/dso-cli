# Guide de Contribution

Merci de ton intérêt pour contribuer à DSO ! 

## Comment Contribuer

### 1. Fork et Clone

```bash
git clone https://github.com/ton-username/dso.git
cd dso
```

### 2. Créer une Branche

```bash
git checkout -b feature/ma-nouvelle-fonctionnalite
```

### 3. Développer

- Suis les conventions de code Go
- Ajoute des tests pour les nouvelles fonctionnalités
- Documente ton code

### 4. Tester

```bash
make test
make build
```

### 5. Commit et Push

```bash
git commit -m "feat: ajoute ma fonctionnalité"
git push origin feature/ma-nouvelle-fonctionnalite
```

### 6. Ouvrir une Pull Request

Crée une PR sur GitHub avec une description claire de tes changements.

## Conventions

### Messages de Commit

Utilise le format [Conventional Commits](https://www.conventionalcommits.org/) :

- `feat:` Nouvelle fonctionnalité
- `fix:` Correction de bug
- `docs:` Documentation
- `refactor:` Refactoring
- `test:` Tests
- `chore:` Maintenance

Exemples :
```
feat: ajoute le support de GitHub Actions
fix: corrige le parsing des résultats Trivy
docs: met à jour le README
```

### Code Style

- Utilise `gofmt` pour formater le code
- Suis les conventions Go standard
- Commente les fonctions publiques
- Garde les fonctions courtes et focalisées

### Tests

Ajoute des tests pour :
- Les nouvelles fonctionnalités
- Les corrections de bugs
- Les cas limites

## Idées de Contributions

### Faciles (Good First Issues)

- [ ] Améliorer les messages d'erreur
- [ ] Ajouter plus de langages supportés
- [ ] Améliorer la documentation
- [ ] Ajouter des exemples

### Intermédiaires

- [ ] Support de plus de scanners
- [ ] Améliorer l'analyse IA
- [ ] Ajouter des tests d'intégration
- [ ] Support de GitLab (en plus de GitHub)

### Avancées

- [ ] Mode watch (surveillance continue)
- [ ] Intégration Slack/Teams
- [ ] Génération de politiques OPA/Rego
- [ ] Support de modèles IA externes (OpenAI, Anthropic)

## Questions ?

Ouvre une issue pour discuter de tes idées avant de commencer à coder !

## Code de Conduite

Sois respectueux, inclusif et constructif. On est tous là pour apprendre et améliorer DSO ensemble. 

