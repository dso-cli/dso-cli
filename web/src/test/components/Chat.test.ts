import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Chat from '../../components/Chat.vue'
import { chatService } from '../../services/chatService'

// Mock chatService
vi.mock('../../services/chatService', () => ({
  chatService: {
    checkConnection: vi.fn(() => Promise.resolve({ connected: true, model: 'llama3.1:8b' })),
    sendMessage: vi.fn(() => Promise.resolve('Réponse de test'))
  }
}))

// Mock markdown utils
vi.mock('../../utils/markdown', () => ({
  renderMarkdown: vi.fn((text: string) => `<p>${text}</p>`),
  sanitizeInput: vi.fn((text: string) => text.trim()),
  isInputSafe: vi.fn(() => true)
}))

describe('Chat', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly', () => {
    const wrapper = mount(Chat, {
      props: {
        scanContext: 'Test context',
        findings: []
      }
    })

    expect(wrapper.find('.text-slate-900').text()).toContain('Assistant IA DSO')
  })

  it('displays welcome message when no messages', () => {
    const wrapper = mount(Chat, {
      props: {
        scanContext: undefined,
        findings: []
      }
    })

    expect(wrapper.text()).toContain('Bonjour ! Je suis votre assistant DSO')
  })

  it('sends message when user types and submits', async () => {
    const wrapper = mount(Chat, {
      props: {
        scanContext: undefined,
        findings: []
      }
    })

    const textarea = wrapper.find('textarea')
    await textarea.setValue('Test message')
    await textarea.trigger('keydown.enter')

    await wrapper.vm.$nextTick()
    
    // Check if message was sent
    expect(chatService.sendMessage).toHaveBeenCalled()
  })

  it('sanitizes user input before sending', async () => {
    const { sanitizeInput } = await import('../../utils/markdown')
    const wrapper = mount(Chat, {
      props: {
        scanContext: undefined,
        findings: []
      }
    })

    const textarea = wrapper.find('textarea')
    await textarea.setValue('  <script>alert("xss")</script>  ')
    
    const sendButton = wrapper.find('button[type="button"]')
    if (sendButton) {
      await sendButton.trigger('click')
    }

    expect(sanitizeInput).toHaveBeenCalled()
  })

  it('displays connection status', async () => {
    const wrapper = mount(Chat, {
      props: {
        scanContext: undefined,
        findings: []
      }
    })

    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(chatService.checkConnection).toHaveBeenCalled()
  })
})

