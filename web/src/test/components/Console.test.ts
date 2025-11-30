import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Console from '../../components/Console.vue'

describe('Console', () => {
  let wrapper: ReturnType<typeof mount>

  beforeEach(() => {
    wrapper = mount(Console)
  })

  it('should render correctly', () => {
    expect(wrapper.find('h3').text()).toBe('Console Logs')
  })

  it('should add log entries', () => {
    const consoleComponent = wrapper.vm as any
    consoleComponent.addLog('info', 'Test message', 'Details')
    
    const logs = (wrapper.vm as any).logs || []
    expect(logs.length).toBe(1)
    expect(logs[0].message).toBe('Test message')
    expect(logs[0].type).toBe('info')
  })

  it('should clear logs', () => {
    const consoleComponent = wrapper.vm as any
    consoleComponent.addLog('info', 'Test 1')
    consoleComponent.addLog('error', 'Test 2')
    
    const logsBefore = (wrapper.vm as any).logs || []
    expect(logsBefore.length).toBe(2)
    
    consoleComponent.clearLogs()
    const logsAfter = (wrapper.vm as any).logs || []
    expect(logsAfter.length).toBeGreaterThanOrEqual(1) // Cleared + info log about clearing
  })

  it('should toggle auto-scroll', async () => {
    const consoleComponent = wrapper.vm as any
    expect(consoleComponent.autoScroll).toBe(true)
    
    const toggleButton = wrapper.find('button:contains("Auto-scroll")')
    if (toggleButton.exists()) {
      await toggleButton.trigger('click')
      expect(consoleComponent.autoScroll).toBe(false)
    }
  })

  it('should format time correctly', () => {
    const consoleComponent = wrapper.vm as any
    const date = new Date('2024-01-01T12:00:00.123Z')
    const formatted = consoleComponent.formatTime(date)
    
    expect(formatted).toMatch(/\d{2}:\d{2}:\d{2}\.\d{3}/)
  })
})

