import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

let supabase: SupabaseClient | null = null

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
}

// Types
export interface Project {
  id?: string
  user_id?: string
  name: string
  path: string
  repository_url?: string
  provider?: 'github' | 'gitlab' | 'local'
  language?: string
  framework?: string
  created_at?: string
  updated_at?: string
}

export interface Scan {
  id?: string
  project_id?: string
  user_id?: string
  status: 'running' | 'completed' | 'failed'
  total_findings: number
  critical_count: number
  high_count: number
  medium_count: number
  low_count: number
  fixable_count: number
  exploitable_count: number
  duration_ms?: number
  scan_path: string
  scan_format: 'json' | 'text'
  verbose: boolean
  tools_used: string[]
  created_at?: string
  completed_at?: string
  error_message?: string
}

export interface Finding {
  id?: string
  scan_id?: string
  finding_id: string
  title: string
  description?: string
  file_path: string
  line_number: number
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  tool: string
  type?: string
  fixable: boolean
  exploitable: boolean
  cvss_score?: number
  cve_id?: string
  status?: 'open' | 'fixed' | 'ignored' | 'false_positive'
  fixed_at?: string
  fixed_by?: string
  created_at?: string
}

export interface Fix {
  id?: string
  finding_id: string
  scan_id: string
  user_id?: string
  fix_type: 'auto' | 'manual'
  fix_command?: string
  status: 'applied' | 'failed' | 'reverted'
  applied_at?: string
  reverted_at?: string
  error_message?: string
}

export interface AIAnalysis {
  id?: string
  scan_id: string
  summary: string
  business_impact?: string
  model_used?: string
  analysis_duration_ms?: number
  created_at?: string
}

export const supabaseService = {
  // Check if Supabase is configured
  isConfigured(): boolean {
    return supabase !== null && supabaseUrl !== '' && supabaseAnonKey !== ''
  },

  // Authentication
  async signIn(email: string, password: string) {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  },

  async signUp(email: string, password: string) {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    return data
  },

  async signOut() {
    if (!supabase) throw new Error('Supabase not configured')
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getCurrentUser() {
    if (!supabase) return null
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  // Projects
  async createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async getProjects(): Promise<Project[]> {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('updated_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  async getProject(id: string): Promise<Project> {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  // Scans
  async createScan(scan: Omit<Scan, 'id' | 'created_at' | 'completed_at'>): Promise<Scan> {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase
      .from('scans')
      .insert(scan)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async updateScan(id: string, updates: Partial<Scan>): Promise<Scan> {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase
      .from('scans')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async getScans(projectId?: string): Promise<Scan[]> {
    if (!supabase) throw new Error('Supabase not configured')
    let query = supabase
      .from('scans')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (projectId) {
      query = query.eq('project_id', projectId)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  async getScan(id: string): Promise<Scan> {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase
      .from('scans')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  // Findings
  async createFindings(findings: Omit<Finding, 'id' | 'created_at'>[]): Promise<Finding[]> {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase
      .from('findings')
      .insert(findings)
      .select()
    if (error) throw error
    return data || []
  },

  async getFindings(scanId: string): Promise<Finding[]> {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase
      .from('findings')
      .select('*')
      .eq('scan_id', scanId)
      .order('severity', { ascending: false })
    if (error) throw error
    return data || []
  },

  async updateFinding(id: string, updates: Partial<Finding>): Promise<Finding> {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase
      .from('findings')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  // Fixes
  async createFix(fix: Omit<Fix, 'id' | 'applied_at'>): Promise<Fix> {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase
      .from('fixes')
      .insert(fix)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async getFixes(scanId?: string): Promise<Fix[]> {
    if (!supabase) throw new Error('Supabase not configured')
    let query = supabase
      .from('fixes')
      .select('*')
      .order('applied_at', { ascending: false })
    
    if (scanId) {
      query = query.eq('scan_id', scanId)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  // AI Analysis
  async createAIAnalysis(analysis: Omit<AIAnalysis, 'id' | 'created_at'>): Promise<AIAnalysis> {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase
      .from('ai_analysis')
      .insert(analysis)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async getAIAnalysis(scanId: string): Promise<AIAnalysis | null> {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase
      .from('ai_analysis')
      .select('*')
      .eq('scan_id', scanId)
      .single()
    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }
    return data
  },

  // Analytics
  async getScanStatistics(days: number = 30) {
    if (!supabase) throw new Error('Supabase not configured')
    const user = await this.getCurrentUser()
    if (!user) throw new Error('Not authenticated')
    
    const { data, error } = await supabase.rpc('get_scan_statistics', {
      user_uuid: user.id,
      days
    })
    if (error) throw error
    return data?.[0] || null
  },

  async getFindingTrends(projectId: string, days: number = 30) {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase.rpc('get_finding_trends', {
      project_uuid: projectId,
      days
    })
    if (error) throw error
    return data || []
  }
}

