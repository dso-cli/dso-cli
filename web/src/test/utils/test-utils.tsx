import { mount, VueWrapper } from '@vue/test-utils'
import { Component } from 'vue'
import { vi } from 'vitest'

/**
 * Helper function to mount components with common setup
 */
export function mountComponent<T extends Component>(
  component: T,
  options?: any
): VueWrapper<any> {
  return mount(component, {
    global: {
      stubs: {
        // Stub common components if needed
      }
    },
    ...options
  })
}

/**
 * Wait for next tick
 */
export async function waitForNextTick(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 0))
}

/**
 * Mock fetch responses
 */
export function mockFetch(response: any, ok: boolean = true) {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok,
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response)),
    } as Response)
  ) as any
}

