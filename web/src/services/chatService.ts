import { scanService } from './scanService'

interface ChatContext {
  scanContext?: string
  findings?: any[]
}

interface ChatHistoryEntry {
  role: 'user' | 'assistant'
  content: string
}

// In-memory conversation history (use localStorage in production for persistence)
let conversationHistory: ChatHistoryEntry[] = []

export const chatService = {
  getHistory(): ChatHistoryEntry[] {
    return conversationHistory
  },
  
  addToHistory(role: 'user' | 'assistant', content: string): void {
    conversationHistory.push({ role, content })
    // Keep only last 20 messages
    if (conversationHistory.length > 20) {
      conversationHistory = conversationHistory.slice(-20)
    }
  },
  
  clearHistory(): void {
    conversationHistory = []
  },
  
  async checkConnection(): Promise<{ connected: boolean; model?: string }> {
    try {
      const result = await scanService.checkOllama()
      return {
        connected: result.connected,
        model: result.model
      }
    } catch (error) {
      return { connected: false }
    }
  },

  async sendMessage(message: string, context?: ChatContext): Promise<string> {
    try {
      // Include conversation history for context
      const history = this.getHistory()
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message,
          history: history.slice(-10), // Last 10 messages for context
          context: {
            scanContext: context?.scanContext,
            findings: context?.findings?.slice(0, 10) // Limit to 10 findings for context
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Chat failed' }))
        throw new Error(errorData.message || 'Chat failed')
      }

      const data = await response.json()
      const aiResponse = data.response || data.message || 'Désolé, je n\'ai pas pu générer de réponse.'
      const actions = data.actions || []
      
      // Add to history
      this.addToHistory('user', message)
      this.addToHistory('assistant', aiResponse)
      
      // Return response with actions if available
      if (actions.length > 0) {
        return {
          response: aiResponse,
          actions: actions
        }
      }
      
      return aiResponse
    } catch (error) {
      console.error('Chat API error:', error)
      
      // Check if it's a rate limit error
      if (error instanceof Error && error.message.includes('429')) {
        return '⚠️ Trop de requêtes. Veuillez patienter quelques instants avant de réessayer.'
      }
      
      // Fallback: Generate a helpful response based on keywords
      const fallbackResponse = this.generateFallbackResponse(message, context)
      this.addToHistory('user', message)
      this.addToHistory('assistant', fallbackResponse)
      return fallbackResponse
    }
  },

  generateFallbackResponse(message: string, context?: ChatContext): string {
    const lowerMessage = message.toLowerCase()
    
    // Security advice
    if (lowerMessage.includes('améliorer') || lowerMessage.includes('sécurité') || lowerMessage.includes('security')) {
      return `Pour améliorer la sécurité de votre projet, je recommande :

1. **Mettre à jour les dépendances** : Utilisez \`npm audit fix\` ou \`dso fix --auto\` pour corriger automatiquement les vulnérabilités connues.

2. **Gérer les secrets** : Ne jamais commiter de secrets dans le code. Utilisez des variables d'environnement ou des gestionnaires de secrets comme HashiCorp Vault.

3. **Analyses régulières** : Exécutez \`dso audit .\` régulièrement dans votre CI/CD pour détecter les problèmes tôt.

4. **Configuration sécurisée** : Vérifiez vos configurations (headers HTTP, CORS, authentification) avec les scanners IaC.

${context?.findings && context.findings.length > 0 
  ? `\nD'après votre dernier scan, vous avez ${context.findings.length} problèmes détectés. Commencez par corriger les vulnérabilités critiques.`
  : ''}`
    }
    
    // Vulnerability explanation with SMART format
    if (lowerMessage.includes('vulnérabilité') || lowerMessage.includes('vulnerability') || lowerMessage.includes('explique')) {
      if (context?.findings && context.findings.length > 0) {
        const critical = context.findings.filter((f: any) => f.severity === 'CRITICAL')
        const high = context.findings.filter((f: any) => f.severity === 'HIGH')
        const medium = context.findings.filter((f: any) => f.severity === 'MEDIUM')
        const low = context.findings.filter((f: any) => f.severity === 'LOW')
        
        return `## 📊 Analyse des vulnérabilités (SMART)

### État actuel du projet
- **Critiques**: ${critical.length} (impact: élevé, probabilité: élevée)
- **Élevées**: ${high.length} (impact: moyen-élevé, probabilité: moyenne-élevée)
- **Moyennes**: ${medium.length} (impact: moyen, probabilité: variable)
- **Faibles**: ${low.length} (impact: faible, probabilité: faible)

### 🎯 Plan d'action SMART

#### Phase 1: Vulnérabilités critiques (Priorité 1)
- **Spécifique**: Corriger ${critical.length} vulnérabilités critiques
- **Mesurable**: Réduire de ${critical.length} à 0
- **Atteignable**: Utiliser \`dso fix --auto\` + corrections manuelles
- **Pertinent**: Impact direct sur la sécurité
- **Temporel**: **24-48 heures** maximum

**Types de vulnérabilités critiques courantes:**
- Secrets exposés (clés API, tokens, mots de passe)
- Dépendances avec CVE critiques (CVSS ≥ 9.0)
- Configurations de sécurité manquantes (headers, CORS, etc.)

#### Phase 2: Vulnérabilités élevées (Priorité 2)
- **Spécifique**: Corriger ${high.length} vulnérabilités élevées
- **Mesurable**: Réduire de ${high.length} à 0
- **Atteignable**: Corrections progressives
- **Pertinent**: Réduction du risque global
- **Temporel**: **7 jours**

### 📈 Métriques de suivi
- **Taux de correction**: 0% → 100% (objectif)
- **Temps moyen de correction**: Mesurer et optimiser
- **Réduction du risque**: Calculer le score de risque avant/après

### 🔧 Actions immédiates
1. \`dso fix --auto .\` pour les corrections automatiques
2. Examiner chaque vulnérabilité critique manuellement
3. Prioriser selon l'exploitabilité et l'impact business`
      }
      
      return `## 🔍 Qu'est-ce qu'une vulnérabilité ? (SMART)

### Définition
Une **vulnérabilité** est une faiblesse dans votre code, configuration ou dépendances qui peut être exploitée par des attaquants.

### Types de vulnérabilités (classés par priorité)

#### 1. Secrets exposés (CRITICAL)
- **Spécifique**: Clés API, tokens, mots de passe dans le code
- **Impact**: Accès non autorisé, compromission complète
- **Mesurable**: Nombre de secrets exposés
- **Correction**: Retirer immédiatement, utiliser des variables d'environnement

#### 2. Dépendances vulnérables (CRITICAL à HIGH)
- **Spécifique**: Bibliothèques avec CVE connues
- **Impact**: Exploitation de failles connues
- **Mesurable**: CVSS score (0-10), nombre de dépendances affectées
- **Correction**: Mise à jour vers version sécurisée

#### 3. Configurations incorrectes (MEDIUM à HIGH)
- **Spécifique**: Headers de sécurité manquants, CORS trop permissif
- **Impact**: Exposition à des attaques courantes
- **Mesurable**: Nombre de configurations à corriger
- **Correction**: Appliquer les bonnes pratiques de sécurité

#### 4. Code vulnérable (Variable)
- **Spécifique**: Injection SQL, XSS, CSRF, etc.
- **Impact**: Dépend de la vulnérabilité
- **Mesurable**: Nombre de points d'injection
- **Correction**: Refactoring sécurisé

### 🎯 Objectif SMART
- **Spécifique**: Réduire à 0 vulnérabilités critiques
- **Mesurable**: Suivre le nombre par sévérité
- **Atteignable**: Utiliser DSO pour détection et correction
- **Pertinent**: Amélioration continue de la sécurité
- **Temporel**: Corrections critiques dans 48h, autres dans 7-14 jours

### 📊 Détection
Utilisez \`dso audit .\` pour obtenir une analyse complète et quantifiée de votre projet.`
    }
    
    // Fix advice
    if (lowerMessage.includes('corriger') || lowerMessage.includes('fix') || lowerMessage.includes('réparer')) {
      return `Pour corriger les problèmes détectés :

1. **Correction automatique** : \`dso fix --auto .\` corrige automatiquement les problèmes sûrs
2. **Correction manuelle** : Pour les problèmes complexes, DSO vous donne des commandes spécifiques
3. **Pull Request automatique** : \`dso pr .\` crée une PR avec tous les correctifs

Les corrections automatiques incluent :
- Suppression de secrets exposés
- Mise à jour de dépendances vulnérables
- Correction de configurations

Après correction, relancez \`dso audit .\` pour vérifier que tout est résolu.`
    }
    
    // Best practices
    if (lowerMessage.includes('pratique') || lowerMessage.includes('best practice') || lowerMessage.includes('conseil')) {
      return `Meilleures pratiques DevSecOps :

1. **Shift Left** : Intégrez la sécurité dès le développement
   - Scans dans le CI/CD
   - Pre-commit hooks avec DSO
   - Reviews de code avec focus sécurité

2. **Automatisation** : 
   - \`dso watch .\` pour surveillance continue
   - \`dso ci --provider github .\` pour intégration CI/CD

3. **Gestion des secrets** :
   - Jamais dans le code
   - Utiliser des gestionnaires de secrets
   - Rotation régulière

4. **Dépendances** :
   - Mises à jour régulières
   - SBOM pour traçabilité
   - Scan automatique des nouvelles dépendances

5. **Monitoring** :
   - Alertes sur nouvelles vulnérabilités
   - Dashboard avec métriques
   - Rapports réguliers`
    }
    
    // Default response
    return `Je suis votre assistant DSO (DevSecOps Oracle). Je peux vous aider à :

- Comprendre les vulnérabilités détectées
- Proposer des solutions de correction
- Expliquer les problèmes de sécurité
- Donner des conseils DevSecOps
- Analyser vos résultats de scan

Posez-moi une question spécifique ou demandez des conseils sur la sécurité de votre projet !`
  }
}
