/**
 * Enterprise-grade type definitions for DSO
 * Following industry standards for commercial software
 */

/**
 * SBOM (Software Bill of Materials) formats
 */
export type SBOMFormat = 'cyclonedx' | 'spdx' | 'json'

/**
 * SBOM Component
 */
export interface SBOMComponent {
  type: 'library' | 'application' | 'container' | 'operating-system'
  name: string
  version: string
  purl?: string // Package URL
  licenses?: string[]
  vulnerabilities?: SBOMVulnerability[]
}

/**
 * SBOM Vulnerability
 */
export interface SBOMVulnerability {
  id: string // CVE ID
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  score?: number // CVSS score
  description?: string
  fixedIn?: string[]
}

/**
 * SBOM Document
 */
export interface SBOMDocument {
  format: SBOMFormat
  version: string
  components: SBOMComponent[]
  metadata: {
    timestamp: string
    tools: string[]
    author?: string
  }
}

/**
 * OPA Policy
 */
export interface OPAPolicy {
  id: string
  name: string
  description: string
  rego: string
  enabled: boolean
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
}

/**
 * CI/CD Provider
 */
export type CICDProvider = 'github' | 'gitlab' | 'jenkins' | 'azure' | 'circleci' | 'travis'

/**
 * CI/CD Workflow Configuration
 */
export interface CICDWorkflow {
  provider: CICDProvider
  name: string
  triggers: string[] // e.g., ['push', 'pull_request']
  steps: CICDStep[]
  enabled: boolean
}

/**
 * CI/CD Step
 */
export interface CICDStep {
  name: string
  command: string
  condition?: string
  timeout?: number
}

/**
 * Security Policy
 */
export interface SecurityPolicy {
  id: string
  name: string
  description: string
  rules: SecurityPolicyRule[]
  enforcement: 'block' | 'warn' | 'audit'
}

/**
 * Security Policy Rule
 */
export interface SecurityPolicyRule {
  type: 'severity' | 'cve' | 'license' | 'secret' | 'dependency'
  condition: string
  action: 'block' | 'warn' | 'allow'
}

/**
 * Compliance Framework
 */
export type ComplianceFramework = 'OWASP' | 'NIST' | 'ISO27001' | 'SOC2' | 'PCI-DSS' | 'HIPAA'

/**
 * Compliance Report
 */
export interface ComplianceReport {
  framework: ComplianceFramework
  score: number // 0-100
  requirements: ComplianceRequirement[]
  passed: number
  failed: number
  timestamp: string
}

/**
 * Compliance Requirement
 */
export interface ComplianceRequirement {
  id: string
  name: string
  description: string
  status: 'passed' | 'failed' | 'warning'
  evidence?: string[]
}

/**
 * Risk Assessment
 */
export interface RiskAssessment {
  id: string
  projectId: string
  timestamp: string
  overallRisk: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  risks: Risk[]
  recommendations: string[]
}

/**
 * Risk
 */
export interface Risk {
  id: string
  title: string
  description: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  likelihood: 'HIGH' | 'MEDIUM' | 'LOW'
  impact: 'HIGH' | 'MEDIUM' | 'LOW'
  mitigation?: string
}

/**
 * Audit Log Entry
 */
export interface AuditLogEntry {
  id: string
  timestamp: string
  userId?: string
  action: string
  resource: string
  result: 'success' | 'failure'
  details?: Record<string, unknown>
}

/**
 * API Response with pagination
 */
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

/**
 * Error Response
 */
export interface ErrorResponse {
  error: string
  message: string
  code?: string
  details?: Record<string, unknown>
  timestamp: string
}

