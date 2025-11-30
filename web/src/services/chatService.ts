import { scanService } from './scanService'

interface ChatContext {
  scanContext?: string
  findings?: any[]
}

export const chatService = {
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
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message,
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
      return data.response || data.message || 'Désolé, je n\'ai pas pu générer de réponse.'
    } catch (error) {
      console.error('Chat API error:', error)
      
      // Fallback: Generate a helpful response based on keywords
      return this.generateFallbackResponse(message, context)
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
    
    // Vulnerability explanation
    if (lowerMessage.includes('vulnérabilité') || lowerMessage.includes('vulnerability') || lowerMessage.includes('explique')) {
      if (context?.findings && context.findings.length > 0) {
        const critical = context.findings.filter((f: any) => f.severity === 'CRITICAL')
        const high = context.findings.filter((f: any) => f.severity === 'HIGH')
        
        return `D'après votre scan, vous avez :
- ${critical.length} vulnérabilités **critiques** : nécessitent une attention immédiate
- ${high.length} vulnérabilités **élevées** : doivent être corrigées rapidement

Les vulnérabilités critiques sont généralement :
- Des secrets exposés (clés API, mots de passe)
- Des dépendances avec des CVE critiques
- Des configurations de sécurité manquantes

Je recommande de commencer par corriger les vulnérabilités critiques avec \`dso fix --auto\` pour les problèmes automatiquement corrigeables.`
      }
      
      return `Une vulnérabilité est une faiblesse dans votre code qui peut être exploitée par des attaquants. 

Les types courants incluent :
- **Secrets exposés** : Clés API, tokens, mots de passe dans le code
- **Dépendances vulnérables** : Bibliothèques avec des CVE connues
- **Configurations incorrectes** : Headers de sécurité manquants, permissions trop permissives
- **Code vulnérable** : Injection SQL, XSS, etc.

Utilisez \`dso audit .\` pour détecter ces problèmes dans votre projet.`
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
