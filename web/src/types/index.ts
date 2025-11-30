export interface ScanSummary {
  total: number
  critical: number
  high: number
  medium: number
  low: number
  fixable: number
  exploitable: number
}

export interface Finding {
  id: string
  title: string
  description: string
  file: string
  line: number
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  tool: string
  type?: string // SAST, SECRET, DEPENDENCY, IAC, CONTAINER
  fixable: boolean
  exploitable: boolean
  cvss?: number
}

export interface ScanResults {
  summary: ScanSummary
  findings: Finding[]
}

export interface TopFix {
  title: string
  description: string
  file: string
  line: number
  command?: string
}

export interface AnalysisResult {
  summary: string
  businessImpact?: string
  topFixes?: TopFix[]
}

export interface MenuItem {
  label: string
  icon?: string
  command?: () => void
}

