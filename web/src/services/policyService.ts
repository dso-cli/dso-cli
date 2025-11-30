/**
 * Security Policy Service
 * Manages OPA policies and security rules
 */

import type { OPAPolicy, CICDWorkflow } from '../types'

export const policyService = {
  /**
   * Generate OPA policy from template
   */
  async generateOPAPolicy(
    name: string,
    rules: string[]
  ): Promise<OPAPolicy> {
    try {
      const response = await fetch('/api/policy/opa/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, rules })
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Policy generation failed' }))
        throw new Error(error.message || 'Policy generation failed')
      }

      return await response.json()
    } catch (error) {
      console.error('OPA policy generation error:', error)
      throw error
    }
  },

  /**
   * Generate CI/CD workflow
   */
  async generateCICDWorkflow(
    provider: CICDWorkflow['provider'],
    config: Partial<CICDWorkflow>
  ): Promise<CICDWorkflow> {
    try {
      const response = await fetch('/api/cicd/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ provider, ...config })
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Workflow generation failed' }))
        throw new Error(error.message || 'Workflow generation failed')
      }

      return await response.json()
    } catch (error) {
      console.error('CI/CD workflow generation error:', error)
      throw error
    }
  },

  /**
   * Generate CODEOWNERS file
   */
  async generateCODEOWNERS(
    rules: Array<{ pattern: string; owners: string[] }>
  ): Promise<string> {
    try {
      const response = await fetch('/api/policy/codeowners/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rules })
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'CODEOWNERS generation failed' }))
        throw new Error(error.message || 'CODEOWNERS generation failed')
      }

      const data = await response.json()
      return data.content || ''
    } catch (error) {
      console.error('CODEOWNERS generation error:', error)
      throw error
    }
  },

  /**
   * Download policy file
   */
  downloadPolicy(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }
}

