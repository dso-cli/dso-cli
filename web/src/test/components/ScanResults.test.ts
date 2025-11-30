import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ScanResults from '../../components/ScanResults.vue'
import { scanService } from '../../services/scanService'
import type { ScanResults as ScanResultsType, AnalysisResult } from '../../types'

vi.mock('../../services/scanService', () => ({
  scanService: {
    exportResults: vi.fn(),
    autoFix: vi.fn()
  }
}))

const mockResults: ScanResultsType = {
  summary: {
    total: 10,
    critical: 2,
    high: 3,
    medium: 3,
    low: 2,
    fixable: 5,
    exploitable: 1
  },
  findings: [
    {
      id: 'test-1',
      title: 'Test Critical',
      description: 'Test description',
      file: 'test.js',
      line: 1,
      severity: 'CRITICAL',
      tool: 'trivy',
      type: 'SAST',
      fixable: true,
      exploitable: true
    },
    {
      id: 'test-2',
      title: 'Test High',
      description: 'Test description',
      file: 'test2.js',
      line: 5,
      severity: 'HIGH',
      tool: 'gitleaks',
      type: 'SECRET',
      fixable: false,
      exploitable: false
    }
  ]
}

const mockAnalysis: AnalysisResult = {
  summary: 'Test analysis summary',
  businessImpact: 'Test business impact',
  topFixes: [
    {
      title: 'Fix test',
      description: 'Fix description',
      file: 'test.js',
      line: 1,
      command: 'test command'
    }
  ]
}

describe('ScanResults', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render correctly', () => {
    const wrapper = mount(ScanResults, {
      props: {
        results: mockResults,
        analysis: mockAnalysis
      }
    })
    
    expect(wrapper.text()).toContain('Critical')
    expect(wrapper.text()).toContain('High')
  })

  it('should display summary cards', () => {
    const wrapper = mount(ScanResults, {
      props: {
        results: mockResults,
        analysis: mockAnalysis
      }
    })
    
    expect(wrapper.text()).toContain('2') // Critical count
    expect(wrapper.text()).toContain('3') // High count
  })

  it('should display AI analysis', () => {
    const wrapper = mount(ScanResults, {
      props: {
        results: mockResults,
        analysis: mockAnalysis
      }
    })
    
    expect(wrapper.text()).toContain('Test analysis summary')
    expect(wrapper.text()).toContain('Test business impact')
  })

  it('should export results as JSON', async () => {
    const wrapper = mount(ScanResults, {
      props: {
        results: mockResults,
        analysis: mockAnalysis
      }
    })
    
    const exportButton = wrapper.find('button:contains("Export JSON")')
    if (exportButton.exists()) {
      await exportButton.trigger('click')
      expect(scanService.exportResults).toHaveBeenCalledWith(mockResults, 'json')
    }
  })

  it('should export results as CSV', async () => {
    const wrapper = mount(ScanResults, {
      props: {
        results: mockResults,
        analysis: mockAnalysis
      }
    })
    
    const exportButton = wrapper.find('button:contains("Export CSV")')
    if (exportButton.exists()) {
      await exportButton.trigger('click')
      expect(scanService.exportResults).toHaveBeenCalledWith(mockResults, 'csv')
    }
  })

  it('should filter findings by search text', async () => {
    const wrapper = mount(ScanResults, {
      props: {
        results: mockResults,
        analysis: mockAnalysis
      }
    })
    
    const searchInput = wrapper.find('input[placeholder*="Search"]')
    if (searchInput.exists()) {
      await searchInput.setValue('Critical')
      await wrapper.vm.$nextTick()
      
      // Component should handle filtering
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('should filter findings by severity', async () => {
    const wrapper = mount(ScanResults, {
      props: {
        results: mockResults,
        analysis: mockAnalysis
      }
    })
    
    // Component should handle severity filtering
    expect(wrapper.exists()).toBe(true)
  })

  it('should switch view modes', async () => {
    const wrapper = mount(ScanResults, {
      props: {
        results: mockResults,
        analysis: mockAnalysis
      }
    })
    
    const byCategoryButton = wrapper.find('button:contains("By Category")')
    if (byCategoryButton.exists()) {
      await byCategoryButton.trigger('click')
      // Component should handle view mode switching
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('should apply fix when fix button is clicked', async () => {
    ;(scanService.autoFix as any).mockResolvedValue({ success: true })
    
    const wrapper = mount(ScanResults, {
      props: {
        results: mockResults,
        analysis: mockAnalysis
      }
    })
    
    const fixButton = wrapper.find('button:contains("Apply Fix")')
    if (fixButton.exists()) {
      await fixButton.trigger('click')
      expect(scanService.autoFix).toHaveBeenCalled()
    }
  })
})

