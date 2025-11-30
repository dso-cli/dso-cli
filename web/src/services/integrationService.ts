export interface Integration {
  id: string
  name: string
  category: string
  description: string
  connected: boolean
  logo?: string
  config?: any
}

export const integrationService = {
  async getIntegrations(): Promise<Integration[]> {
    const response = await fetch('/api/integrations')
    if (!response.ok) throw new Error('Failed to fetch integrations')
    const data = await response.json()
    return data.integrations || []
  },

  async connectIntegration(id: string, config: any): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`/api/integrations/${id}/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to connect' }))
      throw new Error(error.error || 'Failed to connect integration')
    }
    return response.json()
  },

  async disconnectIntegration(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`/api/integrations/${id}/disconnect`, {
      method: 'POST'
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to disconnect' }))
      throw new Error(error.error || 'Failed to disconnect integration')
    }
    return response.json()
  },

  async testIntegration(id: string, config: any): Promise<{ success: boolean; message?: string; error?: string }> {
    const response = await fetch(`/api/integrations/${id}/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    })
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || 'Connection test failed')
    }
    return data
  }
}

