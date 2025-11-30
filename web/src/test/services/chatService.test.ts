import { describe, it, expect, vi, beforeEach } from 'vitest'
import { chatService } from '../../services/chatService'

// Mock scanService
vi.mock('../../services/scanService', () => ({
  scanService: {
    checkOllama: vi.fn(() => Promise.resolve({ connected: true, model: 'llama3.1:8b' }))
  }
}))

// Mock fetch
global.fetch = vi.fn()

describe('chatService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    chatService.clearHistory()
  })

  it('checks connection status', async () => {
    const status = await chatService.checkConnection()
    expect(status.connected).toBe(true)
    expect(status.model).toBe('llama3.1:8b')
  })

  it('sends message and adds to history', async () => {
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: 'Test response' })
    })

    const response = await chatService.sendMessage('Test message')
    
    expect(response).toBe('Test response')
    expect(chatService.getHistory().length).toBe(2) // user + assistant
  })

  it('handles rate limit errors', async () => {
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: async () => ({ error: 'Rate limit exceeded' })
    })

    const response = await chatService.sendMessage('Test')
    expect(response).toContain('Trop de requêtes')
  })

  it('maintains conversation history', () => {
    chatService.addToHistory('user', 'Hello')
    chatService.addToHistory('assistant', 'Hi there')
    
    const history = chatService.getHistory()
    expect(history.length).toBe(2)
    expect(history[0].role).toBe('user')
    expect(history[1].role).toBe('assistant')
  })

  it('limits history to 20 messages', () => {
    for (let i = 0; i < 25; i++) {
      chatService.addToHistory('user', `Message ${i}`)
    }
    
    const history = chatService.getHistory()
    expect(history.length).toBe(20)
  })

  it('clears history', () => {
    chatService.addToHistory('user', 'Test')
    chatService.clearHistory()
    
    expect(chatService.getHistory().length).toBe(0)
  })
})

