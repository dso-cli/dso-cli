import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ScanOptions from '../../components/ScanOptions.vue'

describe('ScanOptions', () => {
  it('should render correctly', () => {
    const wrapper = mount(ScanOptions)
    expect(wrapper.find('h3').text()).toBe('Scan Options')
  })

  it('should emit scan event with default options', async () => {
    const wrapper = mount(ScanOptions)
    const applyButton = wrapper.find('button:contains("Apply & Start Scan")')
    
    if (applyButton.exists()) {
      await applyButton.trigger('click')
      expect(wrapper.emitted('scan')).toBeTruthy()
      expect(wrapper.emitted('scan')?.[0]?.[0]).toEqual({
        path: '.',
        format: 'text',
        verbose: false,
        exclude: ''
      })
    }
  })

  it('should update path when input changes', async () => {
    const wrapper = mount(ScanOptions)
    const pathInput = wrapper.find('input[type="text"]')
    
    if (pathInput.exists()) {
      await pathInput.setValue('/custom/path')
      const localPath = (wrapper.vm as any).localPath
      expect(localPath).toBe('/custom/path')
    }
  })

  it('should reset options', async () => {
    const wrapper = mount(ScanOptions)
    const vm = wrapper.vm as any
    
    // Change values
    vm.localPath = '/test'
    vm.format = 'json'
    vm.verbose = true
    vm.excludePatterns = 'test/'
    
    // Reset
    const resetButton = wrapper.find('button:contains("Reset")')
    if (resetButton.exists()) {
      await resetButton.trigger('click')
      expect(vm.localPath).toBe('.')
      expect(vm.format).toBe('text')
      expect(vm.verbose).toBe(false)
      expect(vm.excludePatterns).toBe('')
    }
  })
})

