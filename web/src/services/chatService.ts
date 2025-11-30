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

  async sendMessage(message: string, context?: ChatContext): Promise<string | { response: string; actions?: any[] }> {
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
      
      // Return error message - no fallback responses
      const errorMsg = error instanceof Error ? error.message : 'Erreur inconnue'
      this.addToHistory('user', message)
      this.addToHistory('assistant', `Désolé, une erreur s'est produite: ${errorMsg}. Veuillez réessayer.`)
      throw error
    }
  },

  // Removed generateFallbackResponse - AI should always respond freely
}
