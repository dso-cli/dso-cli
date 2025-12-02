import { test, expect } from '@playwright/test'

const API_BASE = 'http://localhost:3001'

test.describe('API Integration Tests', () => {
  test('GET /api/autofix/issues - should return issues list', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/autofix/issues`)
    expect(response.ok()).toBeTruthy()
    
    const data = await response.json()
    expect(data).toHaveProperty('issues')
    expect(Array.isArray(data.issues)).toBeTruthy()
  })

  test('GET /api/tools/config - should return tools configuration', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/tools/config`)
    expect(response.ok()).toBeTruthy()
    
    const data = await response.json()
    expect(data).toHaveProperty('configs')
    expect(Array.isArray(data.configs)).toBeTruthy()
  })

  test('POST /api/tools/config - should save tool configuration', async ({ request }) => {
    const response = await request.post(`${API_BASE}/api/tools/config`, {
      data: {
        toolId: 'test-tool',
        configured: true
      }
    })
    expect(response.ok()).toBeTruthy()
    
    const data = await response.json()
    expect(data).toHaveProperty('success', true)
  })

  test('POST /api/monitoring/services/diagnose - should diagnose service with Ollama', async ({ request }) => {
    const response = await request.post(`${API_BASE}/api/monitoring/services/diagnose`, {
      data: {
        serviceName: 'Trivy',
        status: 'down'
      }
    })
    
    // May fail if Ollama is not running, but should not crash
    if (response.ok()) {
      const data = await response.json()
      expect(data).toHaveProperty('diagnosis')
    } else {
      // If Ollama is not available, should return proper error
      expect(response.status()).toBeGreaterThanOrEqual(400)
    }
  })

  test('GET /api/monitoring/services - should return services status', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/monitoring/services`)
    expect(response.ok()).toBeTruthy()
    
    const data = await response.json()
    expect(data).toHaveProperty('services')
    expect(Array.isArray(data.services)).toBeTruthy()
    
    if (data.services.length > 0) {
      const service = data.services[0]
      expect(service).toHaveProperty('name')
      expect(service).toHaveProperty('status')
    }
  })

  test('GET /api/integrations - should return integrations list', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/integrations`)
    expect(response.ok()).toBeTruthy()
    
    const data = await response.json()
    expect(data).toHaveProperty('integrations')
    expect(Array.isArray(data.integrations)).toBeTruthy()
  })

  test('POST /api/integrations/:id/disconnect - should disconnect integration', async ({ request }) => {
    const response = await request.post(`${API_BASE}/api/integrations/test-id/disconnect`)
    expect(response.ok()).toBeTruthy()
    
    const data = await response.json()
    expect(data).toHaveProperty('success', true)
  })

  test('GET /health - should return health status', async ({ request }) => {
    const response = await request.get(`${API_BASE}/health`)
    expect(response.ok()).toBeTruthy()
    
    const data = await response.json()
    expect(data).toHaveProperty('status', 'ok')
  })
})

