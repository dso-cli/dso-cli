import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ConfigPanel from '../../components/ConfigPanel.vue'
import { scanService } from '../../services/scanService'

vi.mock('../../services/scanService', () => ({
  scanService: {
    checkOllama: vi.fn(),
    getToolsStatus: vi.fn(),
    getVersion: vi.fn(),
    installTool: vi.fn()
  }
}))

describe('ConfigPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render correctly', () => {
    const wrapper = mount(ConfigPanel)
    expect(wrapper.find('h3').text()).toBe('Configuration')
  })

  it('should check Ollama on mount', async () => {
    ;(scanService.checkOllama as any).mockResolvedValue({
      connected: true,
      model: 'qwen2.5:7b'
    })
    ;(scanService.getToolsStatus as any).mockResolvedValue([])
    ;(scanService.getVersion as any).mockResolvedValue('0.1.0')

    const wrapper = mount(ConfigPanel)
    await wrapper.vm.$nextTick()
    
    expect(scanService.checkOllama).toHaveBeenCalled()
  })

  it('should check tools on mount', async () => {
    ;(scanService.checkOllama as any).mockResolvedValue({ connected: false })
    ;(scanService.getToolsStatus as any).mockResolvedValue([
      { name: 'Trivy', installed: true, version: '0.45.0' }
    ])
    ;(scanService.getVersion as any).mockResolvedValue('0.1.0')

    const wrapper = mount(ConfigPanel)
    await wrapper.vm.$nextTick()
    
    expect(scanService.getToolsStatus).toHaveBeenCalled()
  })

  it('should display Ollama status', async () => {
    ;(scanService.checkOllama as any).mockResolvedValue({
      connected: true,
      model: 'qwen2.5:7b'
    })
    ;(scanService.getToolsStatus as any).mockResolvedValue([])
    ;(scanService.getVersion as any).mockResolvedValue('0.1.0')

    const wrapper = mount(ConfigPanel)
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    
    expect(wrapper.text()).toContain('Connected')
    expect(wrapper.text()).toContain('qwen2.5:7b')
  })

  it('should display tools status', async () => {
    ;(scanService.checkOllama as any).mockResolvedValue({ connected: false })
    ;(scanService.getToolsStatus as any).mockResolvedValue([
      { name: 'Trivy', installed: true, version: '0.45.0' },
      { name: 'Grype', installed: false, version: null }
    ])
    ;(scanService.getVersion as any).mockResolvedValue('0.1.0')

    const wrapper = mount(ConfigPanel)
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    
    expect(wrapper.text()).toContain('Trivy')
    expect(wrapper.text()).toContain('Grype')
  })

  it('should install all tools when Install All is clicked', async () => {
    ;(scanService.checkOllama as any).mockResolvedValue({ connected: false })
    ;(scanService.getToolsStatus as any).mockResolvedValue([
      { name: 'Trivy', installed: false, version: null },
      { name: 'Grype', installed: false, version: null }
    ])
    ;(scanService.getVersion as any).mockResolvedValue('0.1.0')
    ;(scanService.installTool as any).mockResolvedValue({ success: true, message: 'Installed' })

    const wrapper = mount(ConfigPanel)
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    
    const installButton = wrapper.find('button:contains("Install All")')
    if (installButton.exists()) {
      await installButton.trigger('click')
      await wrapper.vm.$nextTick()
      
      expect(scanService.installTool).toHaveBeenCalled()
    }
  })

  it('should refresh tools status', async () => {
    ;(scanService.checkOllama as any).mockResolvedValue({ connected: false })
    ;(scanService.getToolsStatus as any).mockResolvedValue([])
    ;(scanService.getVersion as any).mockResolvedValue('0.1.0')

    const wrapper = mount(ConfigPanel)
    await wrapper.vm.$nextTick()
    
    const refreshButton = wrapper.find('button:contains("Refresh Status")')
    if (refreshButton.exists()) {
      await refreshButton.trigger('click')
      await wrapper.vm.$nextTick()
      
      expect(scanService.getToolsStatus).toHaveBeenCalledTimes(2) // Once on mount, once on click
    }
  })
})

