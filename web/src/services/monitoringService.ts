export interface KPI {
  uptime: { value: string; trend: number }
  scans: { value: number; trend: number }
  findings: { value: number; trend: number }
  response: { value: string; trend: number }
}

export interface SLO {
  id: string
  name: string
  current: number
  target: number
  status: 'healthy' | 'warning' | 'critical'
  description: string
}

export interface Service {
  id?: string
  name: string
  status: 'healthy' | 'degraded' | 'down'
  uptime: number
  latency: number
  errors: number
}

export const monitoringService = {
  async getKPIs(): Promise<KPI> {
    const response = await fetch('/api/monitoring/kpis')
    if (!response.ok) throw new Error('Failed to fetch KPIs')
    return response.json()
  },

  async getSLOs(): Promise<SLO[]> {
    const response = await fetch('/api/monitoring/slos')
    if (!response.ok) throw new Error('Failed to fetch SLOs')
    const data = await response.json()
    return data
  },

  async getServices(): Promise<Service[]> {
    const response = await fetch('/api/monitoring/services')
    if (!response.ok) throw new Error('Failed to fetch services')
    const data = await response.json()
    return data.services || []
  }
}

