import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Toast from '../../components/Toast.vue'

describe('Toast', () => {
  let wrapper: ReturnType<typeof mount>

  beforeEach(() => {
    vi.useFakeTimers()
    wrapper = mount(Toast)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should render correctly', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('should add toast', () => {
    const toastComponent = wrapper.vm as any
    const toastId = toastComponent.addToast({
      type: 'success',
      title: 'Success',
      message: 'Operation completed'
    })
    
    expect(toastId).toBeTruthy()
    const toasts = (wrapper.vm as any).toasts || []
    expect(toasts.length).toBe(1)
    expect(toasts[0].title).toBe('Success')
  })

  it('should remove toast', () => {
    const toastComponent = wrapper.vm as any
    const toastId = toastComponent.addToast({
      type: 'info',
      title: 'Info',
      message: 'Test'
    })
    
    const toastsBefore = (wrapper.vm as any).toasts || []
    expect(toastsBefore.length).toBe(1)
    
    toastComponent.removeToast(toastId)
    const toastsAfter = (wrapper.vm as any).toasts || []
    expect(toastsAfter.length).toBe(0)
  })

  it('should auto-dismiss toast after duration', () => {
    const toastComponent = wrapper.vm as any
    toastComponent.addToast({
      type: 'success',
      title: 'Success',
      duration: 5000
    })
    
    const toastsBefore = (wrapper.vm as any).toasts || []
    expect(toastsBefore.length).toBe(1)
    
    vi.advanceTimersByTime(5000)
    
    // Toast should be removed
    const toastsAfter = (wrapper.vm as any).toasts || []
    expect(toastsAfter.length).toBe(0)
  })

  it('should not auto-dismiss loading toasts', () => {
    const toastComponent = wrapper.vm as any
    toastComponent.addToast({
      type: 'loading',
      title: 'Loading',
      duration: 5000
    })
    
    const toastsBefore = (wrapper.vm as any).toasts || []
    expect(toastsBefore.length).toBe(1)
    
    vi.advanceTimersByTime(5000)
    
    // Loading toast should not be auto-dismissed
    const toastsAfter = (wrapper.vm as any).toasts || []
    expect(toastsAfter.length).toBe(1)
  })

  it('should update toast progress', () => {
    const toastComponent = wrapper.vm as any
    const toastId = toastComponent.addToast({
      type: 'info',
      title: 'Progress',
      progress: 0
    })
    
    toastComponent.updateToastProgress(toastId, 50)
    
    const toasts = (wrapper.vm as any).toasts || []
    const toast = toasts.find((t: any) => t.id === toastId)
    expect(toast?.progress).toBe(50)
  })
})

