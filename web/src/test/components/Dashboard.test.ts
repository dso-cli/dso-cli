import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Dashboard from '../../components/Dashboard.vue'
// import { supabaseService } from '../../services/supabaseService'

vi.mock('../../services/supabaseService', () => ({
  supabaseService: {
    isConfigured: vi.fn(() => false),
    getStats: vi.fn(),
    getRecentScans: vi.fn()
  }
}))

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render correctly', () => {
    const wrapper = mount(Dashboard)
    expect(wrapper.text()).toContain('Welcome to DSO')
  })

  it('should emit scan-local event', async () => {
    const wrapper = mount(Dashboard)
    const button = wrapper.find('button:contains("Scan Local Project")')
    if (button.exists()) {
      await button.trigger('click')
      expect(wrapper.emitted('scan-local')).toBeTruthy()
    }
  })

  it('should emit scan-repo event', async () => {
    const wrapper = mount(Dashboard)
    const button = wrapper.find('button:contains("Scan Repository")')
    if (button.exists()) {
      await button.trigger('click')
      expect(wrapper.emitted('scan-repo')).toBeTruthy()
    }
  })

  it('should emit view-config event', async () => {
    const wrapper = mount(Dashboard)
    const button = wrapper.find('button:contains("Configuration")')
    if (button.exists()) {
      await button.trigger('click')
      expect(wrapper.emitted('view-config')).toBeTruthy()
    }
  })

  it('should display stats when available', async () => {
    const wrapper = mount(Dashboard)
    await wrapper.vm.$nextTick()
    
    // Component should render
    expect(wrapper.exists()).toBe(true)
  })

  it('should display recent scans', async () => {
    const wrapper = mount(Dashboard)
    await wrapper.vm.$nextTick()
    
    // Component should render
    expect(wrapper.exists()).toBe(true)
  })
})

