export interface Issue {
  id: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'detected' | 'diagnosing' | 'solved' | 'resolved'
  solution?: string
  commands?: string[]
  resolvedAt?: Date
  osInfo?: {
    platform: string
    osName: string
    osType: string
    packageManager: string
    shell: string
  }
}

export const autofixService = {
  async diagnoseIssue(issue: { title: string; description: string }): Promise<{ solution: string; commands: string[]; osInfo?: any }> {
    const response = await fetch('/api/autofix/diagnose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ issue })
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Diagnosis failed' }))
      throw new Error(error.error || 'Failed to diagnose issue')
    }
    const data = await response.json()
    return {
      solution: data.solution || 'Aucune solution trouvée',
      commands: data.commands || [],
      osInfo: data.osInfo
    }
  },

  async applySolution(commands: string[]): Promise<Array<{ command: string; success: boolean; output?: string; error?: string }>> {
    const response = await fetch('/api/autofix/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commands })
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to apply solution' }))
      throw new Error(error.error || 'Failed to apply solution')
    }
    const data = await response.json()
    return data.results || []
  }
}

