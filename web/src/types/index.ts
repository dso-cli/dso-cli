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

export interface OPAPolicy {
  name: string
  rules: string[]
  content: string
}

export interface SecurityPolicy {
  name: string
  type: 'opa' | 'codeowners' | 'cicd'
  content: string
}

export interface CICDWorkflow {
  provider: 'github' | 'gitlab'
  name: string
  content: string
  triggers?: string[]
}

export interface SBOMDocument {
  format: SBOMFormat
  version: string
  components: Array<{
    type: string
    name: string
    version: string
    purl?: string
  }>
}

export type SBOMFormat = 'cyclonedx' | 'spdx'

