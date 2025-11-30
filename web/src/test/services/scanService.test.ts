import { describe, it, expect, vi, beforeEach } from 'vitest'
import { scanService } from '../../services/scanService'

// Mock fetch globally
global.fetch = vi.fn()

describe('scanService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('runScan', () => {
    it('should run a scan successfully', async () => {
      const mockResults = {
        summary: {
          total: 10,
          critical: 2,
          high: 3,
          medium: 3,
          low: 2,
          fixable: 5,
          exploitable: 1
        },
        findings: []
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResults
      })

      const results = await scanService.runScan('.')
      expect(results).toEqual(mockResults)
      expect(global.fetch).toHaveBeenCalledWith('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: '.' })
      })
    })

    it('should handle scan errors', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Scan failed' })
      })

      await expect(scanService.runScan('.')).rejects.toThrow('Scan failed')
    })
  })

  describe('analyzeResults', () => {
    it('should analyze results successfully', async () => {
      const mockAnalysis = {
        summary: 'Test summary',
        businessImpact: 'Test impact',
        topFixes: []
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAnalysis
      })

      const results = {
        summary: { total: 10, critical: 2, high: 3, medium: 3, low: 2, fixable: 5, exploitable: 1 },
        findings: []
      }

      const analysis = await scanService.analyzeResults(results)
      expect(analysis).toEqual(mockAnalysis)
    })
  })

  describe('autoFix', () => {
    it('should apply auto-fix successfully', async () => {
      const mockFix = {
        success: true,
        message: 'Fix applied'
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockFix
      })

      const finding = {
        id: 'test-1',
        title: 'Test finding',
        description: 'Test',
        file: 'test.js',
        line: 1,
        severity: 'HIGH' as const,
        tool: 'trivy',
        fixable: true,
        exploitable: false
      }

      const result = await scanService.autoFix(finding)
      expect(result).toEqual(mockFix)
    })
  })

  describe('getVersion', () => {
    it('should get version successfully', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ version: '0.1.0' })
      })

      const version = await scanService.getVersion()
      expect(version).toBe('0.1.0')
    })

    it('should return Unknown on error', async () => {
      ;(global.fetch as any).mockRejectedValueOnce(new Error('Network error'))
      const version = await scanService.getVersion()
      expect(version).toBe('Unknown')
    })
  })

  describe('checkOllama', () => {
    it('should check Ollama status successfully', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ connected: true, model: 'qwen2.5:7b' })
      })

      const result = await scanService.checkOllama()
      expect(result.connected).toBe(true)
      expect(result.model).toBe('qwen2.5:7b')
    })

    it('should handle Ollama not connected', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ connected: false, error: 'Not running' })
      })

      const result = await scanService.checkOllama()
      expect(result.connected).toBe(false)
      expect(result.error).toBe('Not running')
    })
  })

  describe('getToolsStatus', () => {
    it('should get tools status successfully', async () => {
      const mockTools = [
        { name: 'Trivy', installed: true, version: '0.45.0' },
        { name: 'Grype', installed: false, version: null }
      ]

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tools: mockTools })
      })

      const tools = await scanService.getToolsStatus()
      expect(tools).toEqual(mockTools)
    })

    it('should return default tools on error', async () => {
      ;(global.fetch as any).mockRejectedValueOnce(new Error('Network error'))
      const tools = await scanService.getToolsStatus()
      expect(tools.length).toBeGreaterThan(0)
      expect(tools[0].name).toBe('Trivy')
    })
  })

  describe('installTool', () => {
    it('should install tool successfully', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'Installed' })
      })

      const result = await scanService.installTool('trivy')
      expect(result.success).toBe(true)
      expect(result.message).toBe('Installed')
    })

    it('should handle installation failure', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Installation failed' })
      })

      const result = await scanService.installTool('trivy')
      expect(result.success).toBe(false)
    })
  })

  describe('exportResults', () => {
    it('should export results as JSON', async () => {
      const results = {
        summary: { total: 10, critical: 2, high: 3, medium: 3, low: 2, fixable: 5, exploitable: 1 },
        findings: []
      }

      const createElementSpy = vi.spyOn(document, 'createElement')
      const clickSpy = vi.fn()
      const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL')

      createElementSpy.mockReturnValue({
        href: '',
        download: '',
        click: clickSpy
      } as any)

      await scanService.exportResults(results, 'json')
      
      expect(createElementSpy).toHaveBeenCalledWith('a')
      expect(clickSpy).toHaveBeenCalled()
      expect(revokeObjectURLSpy).toHaveBeenCalled()
    })

    it('should export results as CSV', async () => {
      const results = {
        summary: { total: 1, critical: 0, high: 0, medium: 1, low: 0, fixable: 0, exploitable: 0 },
        findings: [{
          id: 'test-1',
          title: 'Test',
          description: 'Test',
          file: 'test.js',
          line: 1,
          severity: 'MEDIUM' as const,
          tool: 'trivy',
          fixable: false,
          exploitable: false
        }]
      }

      const createElementSpy = vi.spyOn(document, 'createElement')
      const clickSpy = vi.fn()

      createElementSpy.mockReturnValue({
        href: '',
        download: '',
        click: clickSpy
      } as any)

      await scanService.exportResults(results, 'csv')
      
      expect(createElementSpy).toHaveBeenCalledWith('a')
      expect(clickSpy).toHaveBeenCalled()
    })
  })
})

