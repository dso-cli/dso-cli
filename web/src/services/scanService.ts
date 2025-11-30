import type { ScanResults, AnalysisResult, Finding } from '../types'

export const scanService = {
  async runScan(path: string = '.'): Promise<ScanResults> {
    // Call the DSO CLI via backend API
    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ path })
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Scan failed' }))
        throw new Error(errorData.message || 'Scan failed')
      }
      
      const results = await response.json()
      
      // Transform DSO CLI output to our format if needed
      if (results.summary && results.findings) {
        return results
      }
      
      // If format is different, transform it
      return this.transformDSOOutput(results)
    } catch (error) {
      console.error('Scan API error:', error)
      // Fallback to mock data only if API is completely unavailable
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.warn('API server not available, using mock data')
        return this.getMockResults()
      }
      throw error
    }
  },
  
  transformDSOOutput(dsoOutput: any): ScanResults {
    // Transform DSO CLI JSON output to our format
    return {
      summary: dsoOutput.summary || {
        total: dsoOutput.total || 0,
        critical: dsoOutput.critical || 0,
        high: dsoOutput.high || 0,
        medium: dsoOutput.medium || 0,
        low: dsoOutput.low || 0,
        fixable: dsoOutput.fixable || 0,
        exploitable: dsoOutput.exploitable || 0
      },
      findings: dsoOutput.findings || dsoOutput.issues || []
    }
  },

  async analyzeResults(results: ScanResults): Promise<AnalysisResult> {
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ results })
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Analysis failed' }))
        throw new Error(errorData.message || 'Analysis failed')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Analysis API error:', error)
      // Fallback to mock data only if API is completely unavailable
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.warn('API server not available, using mock analysis')
        return this.getMockAnalysis()
      }
      throw error
    }
  },

  async autoFix(finding: Finding): Promise<void> {
    // Call the DSO CLI via backend API
    try {
      const response = await fetch('/api/fix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ finding })
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Fix failed' }))
        throw new Error(errorData.message || 'Fix failed')
      }
      
      const result = await response.json()
      console.log('Fix applied:', result)
      return
    } catch (error) {
      console.error('Fix API error:', error)
      // Only simulate if API is completely unavailable
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.warn('API server not available, simulating fix')
        return this.simulateAutoFix(finding)
      }
      throw error
    }
  },

  async simulateAutoFix(finding: Finding): Promise<void> {
    // Simulate auto-fix for development/demo purposes
    // In production, this would call: dso fix --auto <path>
    
    return new Promise((resolve, reject) => {
      // Simulate API delay
      setTimeout(() => {
        // Check if this is a fixable finding
        if (!finding.fixable) {
          reject(new Error('This finding is not automatically fixable'))
          return
        }

        // Simulate different fix types
        if (finding.tool === 'gitleaks' || finding.title.toLowerCase().includes('secret')) {
          // Secret fix: would remove the line or replace with placeholder
          console.log(`[Simulated] Secret removed from ${finding.file}:${finding.line}`)
          resolve()
        } else if (finding.tool === 'trivy' && finding.title.toLowerCase().includes('dependency')) {
          // Dependency fix: would update the package
          console.log(`[Simulated] Dependency updated for ${finding.file}`)
          resolve()
        } else if (finding.tool === 'tfsec' || finding.title.toLowerCase().includes('header')) {
          // Config fix: would add security headers
          console.log(`[Simulated] Security configuration updated for ${finding.file}`)
          resolve()
        } else {
          // Generic fix
          console.log(`[Simulated] Fix applied for ${finding.title} in ${finding.file}:${finding.line}`)
          resolve()
        }
      }, 500) // Simulate 500ms delay
    })
  },

  getMockResults(): ScanResults {
    return {
      summary: {
        total: 127,
        critical: 3,
        high: 12,
        medium: 45,
        low: 67,
        fixable: 89,
        exploitable: 3
      },
      findings: [
        {
          id: '1',
          title: 'Hardcoded AWS key in frontend/.env.production',
          description: 'Secret detected in a versioned file',
          file: 'frontend/.env.production',
          line: 12,
          severity: 'CRITICAL',
          tool: 'gitleaks',
          fixable: true,
          exploitable: true
        },
        {
          id: '2',
          title: 'Vulnerable dependency: lodash@4.17.20',
          description: 'CVE-2021-23337: Prototype pollution',
          file: 'package.json',
          line: 45,
          severity: 'HIGH',
          tool: 'trivy',
          fixable: true,
          exploitable: false
        },
        {
          id: '3',
          title: 'Missing security headers',
          description: 'X-Frame-Options header not set',
          file: 'server.js',
          line: 23,
          severity: 'MEDIUM',
          tool: 'trivy',
          fixable: true,
          exploitable: false
        }
      ]
    }
  },

          getMockAnalysis(): AnalysisResult {
            return {
              summary: 'You have 127 alerts but only 3 are critical and exploitable in prod.',
              businessImpact: 'The 3 critical vulnerabilities are in public exposed endpoints.',
              topFixes: [
                {
                  title: 'Hardcoded AWS key in frontend/.env.production',
                  description: 'Secret detected in a versioned file',
                  file: 'frontend/.env.production',
                  line: 12,
                  command: "sed -i '12d' frontend/.env.production"
                },
                {
                  title: 'Vulnerable dependency: lodash@4.17.20',
                  description: 'CVE-2021-23337: Prototype pollution',
                  file: 'package.json',
                  line: 45,
                  command: 'npm update lodash'
                }
              ]
            }
          },

          async installTool(toolName: string, update: boolean = false): Promise<{ success: boolean; message?: string; error?: string; alreadyInstalled?: boolean; version?: string; canUpdate?: boolean }> {
    try {
      const response = await fetch('/api/tools/install', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tool: toolName, update })
      })
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Installation failed' }))
        return { 
          success: false, 
          message: error.message || error.error || 'Installation failed',
          error: error.error
        }
      }
      
      const data = await response.json()
      return { 
        success: data.success || false, 
        message: data.message,
        alreadyInstalled: data.alreadyInstalled || false,
        version: data.version,
        canUpdate: data.canUpdate || false
      }
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Installation failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  },

  async getVersion(): Promise<string> {
            try {
              const response = await fetch('/api/version')
              if (!response.ok) {
                throw new Error('Failed to get version')
              }
              const data = await response.json()
              return data.version || 'Unknown'
            } catch (error) {
              console.error('Version API error:', error)
              return 'Unknown'
            }
          },

          async checkOllama(): Promise<{ connected: boolean; model?: string; error?: string }> {
            try {
              const response = await fetch('/api/check')
              if (!response.ok) {
                throw new Error('Failed to check Ollama')
              }
              const data = await response.json()
              return {
                connected: data.connected || false,
                model: data.model || undefined,
                error: data.error || undefined
              }
            } catch (error) {
              console.error('Ollama check API error:', error)
              return {
                connected: false,
                error: error instanceof Error ? error.message : 'Unknown error'
              }
            }
          },

          async getToolsStatus(): Promise<Array<{ name: string; installed: boolean; version?: string }>> {
            try {
              const response = await fetch('/api/tools', {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json'
                }
              })
              
              // Even if response is not ok, try to parse the JSON (it might contain default tools list)
              const data = await response.json().catch(() => ({ 
                tools: [
                  { name: 'Trivy', installed: false, version: undefined },
                  { name: 'Grype', installed: false, version: undefined },
                  { name: 'Gitleaks', installed: false, version: undefined },
                  { name: 'TFSec', installed: false, version: undefined }
                ]
              }))
              
              if (!response.ok) {
                console.warn('Tools status API error:', data.error || data.message)
                // Return default tools list instead of empty array
                return data.tools || [
                  { name: 'Trivy', installed: false, version: undefined },
                  { name: 'Grype', installed: false, version: undefined },
                  { name: 'Gitleaks', installed: false, version: undefined },
                  { name: 'TFSec', installed: false, version: undefined }
                ]
              }
              
              return data.tools || []
            } catch (error) {
              console.error('Tools status API error:', error)
              // Return default tools list instead of empty array
              return [
                { name: 'Trivy', installed: false, version: undefined },
                { name: 'Grype', installed: false, version: undefined },
                { name: 'Gitleaks', installed: false, version: undefined },
                { name: 'TFSec', installed: false, version: undefined }
              ]
            }
          },

          async exportResults(results: ScanResults, format: 'json' | 'csv' = 'json'): Promise<void> {
            if (format === 'json') {
              const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `dso-scan-results-${new Date().toISOString()}.json`
              a.click()
              URL.revokeObjectURL(url)
            } else if (format === 'csv') {
              // Convert to CSV
              const headers = ['ID', 'Title', 'Severity', 'File', 'Line', 'Tool', 'Fixable', 'Exploitable']
              const rows = results.findings.map(f => [
                f.id,
                f.title,
                f.severity,
                f.file,
                f.line.toString(),
                f.tool,
                f.fixable.toString(),
                f.exploitable.toString()
              ])
              const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n')
              const blob = new Blob([csv], { type: 'text/csv' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `dso-scan-results-${new Date().toISOString()}.csv`
              a.click()
              URL.revokeObjectURL(url)
            }
          }
        }

