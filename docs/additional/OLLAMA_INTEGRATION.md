# 🧠 Intégration Ollama - Documentation Technique

## Vue d'ensemble

DSO utilise Ollama pour l'analyse IA locale des résultats de scan. L'intégration est complète et robuste avec support de l'API chat moderne.

## Fonctionnalités

### ✅ API Chat Moderne

DSO utilise l'API `/api/chat` d'Ollama (au lieu de `/api/generate`) pour :
- Meilleure gestion du contexte
- Support des conversations multi-tours
- Format plus standardisé

### ✅ Streaming (optionnel)

Support du streaming pour afficher la progression en temps réel :

```go
client.GenerateStream(prompt, func(chunk string) {
    fmt.Print(chunk) // Affiche au fur et à mesure
})
```

### ✅ Gestion d'erreurs robuste

- Retry automatique pour les connexions
- Messages d'erreur clairs avec solutions
- Vérification préalable de la disponibilité

### ✅ Configuration flexible

- **Modèle** : Variable `DSO_MODEL` (défaut: `llama3.1:8b`)
- **URL** : Variable `OLLAMA_HOST` (défaut: `http://localhost:11434`)
- Détection automatique des modèles disponibles

### ✅ Téléchargement automatique

Si le modèle configuré n'est pas installé, DSO le télécharge automatiquement avec affichage de la progression.

## Architecture

```
cmd/audit.go
    ↓
internal/llm/prompts.go (Analyze)
    ↓
internal/llm/ollama.go (OllamaClient)
    ↓
Ollama API (/api/chat)
```

## Utilisation

### Client de base

```go
client := llm.NewOllamaClient()
response, err := client.Generate("Analyse ces résultats...")
```

### Avec contexte

```go
context := []map[string]string{
    {"role": "system", "content": "Tu es un expert sécurité"},
    {"role": "user", "content": "Question précédente"},
}
response, err := client.GenerateWithContext("Nouvelle question", context)
```

### Streaming

```go
response, err := client.GenerateStream(prompt, func(chunk string) {
    fmt.Print(chunk)
    os.Stdout.Sync()
})
```

## Commandes CLI

### `dso check`

Vérifie l'état d'Ollama :
- Connexion
- Modèles disponibles
- Modèle configuré installé

### `dso audit .`

Utilise automatiquement Ollama pour analyser les résultats.

## Dépannage

### Ollama non accessible

```bash
# Vérifier que Ollama tourne
ollama serve

# Vérifier la connexion
dso check
```

### Modèle non trouvé

```bash
# Lister les modèles
ollama list

# Télécharger le modèle
ollama pull llama3.1:8b
```

### Timeout

Les timeouts sont configurés à 5 minutes par défaut. Pour les analyses très longues, augmente la valeur dans `ollama.go`.

## Améliorations futures

- [ ] Cache des réponses pour éviter les appels répétés
- [ ] Support de plusieurs modèles en parallèle
- [ ] Métriques de performance (latence, tokens/s)
- [ ] Support des modèles externes (OpenAI, Anthropic) en fallback

