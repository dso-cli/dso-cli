import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Sidebar from '../../components/Sidebar.vue'

// Mock scanService
vi.mock('../../services/scanService', () => ({
  scanService: {
    getVersion: vi.fn(() => Promise.resolve('0.1.0'))
  }
}))

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly', () => {
    const wrapper = mount(Sidebar, {
      props: {
        activeItem: 'dashboard'
      }
    })

    expect(wrapper.find('aside').exists()).toBe(true)
    expect(wrapper.text()).toContain('DSO')
  })

  it('emits select event when item is clicked', async () => {
    const wrapper = mount(Sidebar, {
      props: {
        activeItem: 'dashboard'
      }
    })

    const scanButton = wrapper.findAll('button').find(btn => 
      btn.text().includes('Nouveau Scan')
    )

    if (scanButton) {
      await scanButton.trigger('click')
      expect(wrapper.emitted('select')).toBeTruthy()
      expect(wrapper.emitted('select')?.[0]).toEqual(['scan'])
    }
  })

  it('updates active item when prop changes', async () => {
    const wrapper = mount(Sidebar, {
      props: {
        activeItem: 'dashboard'
      }
    })

    await wrapper.setProps({ activeItem: 'chat' })
    expect(wrapper.vm.activeItem).toBe('chat')
  })

  it('toggles sidebar open/closed', async () => {
    const wrapper = mount(Sidebar, {
      props: {
        activeItem: 'dashboard'
      }
    })

    const toggleButton = wrapper.find('button[aria-label], button:has(svg)')
    if (toggleButton) {
      await toggleButton.trigger('click')
      // Check if sidebar width changed
      const aside = wrapper.find('aside')
      expect(aside.classes()).toContain('w-20')
    }
  })
})

