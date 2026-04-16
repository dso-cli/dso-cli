import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Chat from '../../components/Chat.vue'
import { chatService } from '../../services/chatService'

// Mock chatService
vi.mock('../../services/chatService', () => ({
  chatService: {
    checkConnection: vi.fn(() => Promise.resolve({ connected: true, model: 'llama3.1:8b' })),
    sendMessage: vi.fn(() => Promise.resolve('Test response'))
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

    expect(wrapper.find('.text-slate-900').text()).toContain('DSO AI Assistant')
  })

  it('displays welcome message when no messages', () => {
    const wrapper = mount(Chat, {
      props: {
        scanContext: undefined,
        findings: []
      }
    })

    expect(wrapper.text()).toContain('Hello! I am your DSO assistant')
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

  it('clears textarea after sending message', async () => {
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

    expect((textarea.element as HTMLTextAreaElement).value).toBe('')
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

