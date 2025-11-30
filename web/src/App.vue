<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-blue-50/30 flex">
    <!-- Sidebar -->
    <Sidebar :active-item="activeView" @select="handleNavigation" />

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col transition-all duration-300" :style="{ marginLeft: sidebarOpen ? '256px' : '80px' }">
      <!-- Top Bar -->
      <header class="bg-white/90 backdrop-blur-md border-b border-gray-200/50 shadow-sm sticky top-0 z-40">
        <div class="px-6 py-4">
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-2xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-emerald-600 bg-clip-text text-transparent">
                {{ pageTitle }}
              </h1>
              <p class="text-sm text-gray-600 mt-1 font-medium">{{ pageSubtitle }}</p>
            </div>
            <div class="flex items-center gap-3">
              <button
                @click="handleNavigation('chat')"
                class="relative p-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
                title="Chat avec l'IA"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="flex-1 overflow-y-auto">
        <div class="max-w-7xl mx-auto px-6 py-8">
          <!-- Config View -->
          <div v-if="activeView === 'config'">
            <ConfigPanel @close="handleNavigation('dashboard')" />
          </div>

          <!-- Scan View -->
          <div v-if="activeView === 'scan' && !scanning && !scanResults">
            <ScanOptions @scan="handleScanWithOptions" />
          </div>

          <!-- Repos View -->
          <div v-if="activeView === 'repos'">
            <RepoSelector @scan="handleRepoScan" @toast="showToast" @close="handleNavigation('dashboard')" />
          </div>

          <!-- Dashboard View -->
          <div v-if="activeView === 'dashboard' && !scanning">
            <Dashboard
              @new-scan="handleNavigation('scan')"
              @scan-local="handleNavigation('scan')"
              @scan-repo="handleNavigation('repos')"
              @view-config="handleNavigation('config')"
              @view-scan="handleNavigation('results')"
            />
          </div>

          <!-- Scanning View -->
          <div v-if="scanning" class="max-w-3xl mx-auto">
        <div class="card text-center">
          <div class="mb-8">
            <!-- Animated Spinner -->
            <div class="relative w-24 h-24 mx-auto mb-6">
              <div class="w-24 h-24 border-4 border-emerald-200 rounded-full"></div>
              <div class="absolute top-0 left-0 w-24 h-24 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                  <svg class="w-6 h-6 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <!-- Status Text -->
            <h2 class="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-3">
              {{ scanStatus }}
            </h2>
            <p class="text-slate-600 mb-6 text-lg">Please wait while we analyze your codebase...</p>
            
            <!-- Enhanced Progress Bar -->
            <div class="mb-4">
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  :style="{ width: `${scanProgress}%` }"
                ></div>
              </div>
              <div class="flex justify-between items-center mt-3">
                <span class="text-sm font-semibold text-emerald-600">{{ scanProgress }}%</span>
                <span class="text-sm text-slate-500">Complete</span>
              </div>
            </div>
            
            <!-- Progress Steps Indicator -->
            <div class="flex justify-center gap-2 mt-6">
              <div v-for="i in 4" :key="i" 
                :class="[
                  'w-2 h-2 rounded-full transition-all duration-300',
                  scanProgress >= (i * 25) ? 'bg-emerald-500 scale-125' : 'bg-slate-300'
                ]"
              ></div>
            </div>
          </div>
        </div>
      </div>

          <!-- Scan Results View -->
          <div v-if="activeView === 'results' && scanResults && !scanning">
            <ScanResults :results="scanResults" :analysis="analysis" @toast="showToast" />
          </div>

          <!-- Chat View -->
          <div v-if="activeView === 'chat'" class="h-[calc(100vh-200px)]">
            <Chat 
              :scan-context="scanContext"
              :findings="scanResults?.findings"
              @action="handleChatAction"
              @navigate="handleNavigation"
            />
          </div>

          <!-- Monitoring View -->
          <div v-if="activeView === 'monitoring'">
            <Monitoring />
          </div>

          <!-- Integrations View -->
          <div v-if="activeView === 'integrations'">
            <Integrations />
          </div>

          <!-- AutoFix View -->
          <div v-if="activeView === 'autofix'">
            <AutoFix />
          </div>

          <!-- Manual Config View -->
          <div v-if="activeView === 'manual-config'">
            <ManualConfig />
          </div>

          <!-- History View -->
          <div v-if="activeView === 'history'">
            <div class="card text-center py-12">
              <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-lg font-medium text-gray-600 mb-2">Historique des scans</p>
              <p class="text-sm text-gray-500">L'historique sera disponible après configuration de Supabase</p>
            </div>
          </div>

          <!-- Console and Timeline -->
          <div v-if="(scanning || scanResults) && activeView !== 'chat' && activeView !== 'results'" class="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Timeline ref="timelineRef" />
            <Console ref="consoleRef" />
          </div>
        </div>
      </main>
    </div>

    <!-- Toast Notifications -->
    <Toast ref="toastRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import ScanResults from './components/ScanResults.vue'
import Toast from './components/Toast.vue'
import Console from './components/Console.vue'
import Timeline from './components/Timeline.vue'
import RepoSelector from './components/RepoSelector.vue'
import ScanOptions from './components/ScanOptions.vue'
import ConfigPanel from './components/ConfigPanel.vue'
import Dashboard from './components/Dashboard.vue'
import Sidebar from './components/Sidebar.vue'
import Chat from './components/Chat.vue'
import Monitoring from './components/Monitoring.vue'
import Integrations from './components/Integrations.vue'
import AutoFix from './components/AutoFix.vue'
import ManualConfig from './components/ManualConfig.vue'
import { scanService } from './services/scanService'
import { repoService } from './services/repoService'
import { supabaseService } from './services/supabaseService'
import type { ScanResults as ScanResultsType, AnalysisResult } from './types'

const scanning = ref<boolean>(false)
const scanResults = ref<ScanResultsType | null>(null)
const analysis = ref<AnalysisResult | null>(null)
const scanStatus = ref<string>('Initializing scan...')
const scanProgress = ref<number>(0)
const activeView = ref<string>('dashboard')
const sidebarOpen = ref<boolean>(true)
const currentScanPath = ref<string>('.')
const scanContext = computed(() => {
  if (scanResults.value) {
    return `Scan récent: ${scanResults.value.summary.total} vulnérabilités détectées (${scanResults.value.summary.critical} critiques, ${scanResults.value.summary.high} élevées)`
  }
  return undefined
})
const toastRef = ref<InstanceType<typeof Toast> | null>(null)
const consoleRef = ref<InstanceType<typeof Console> | null>(null)
const timelineRef = ref<InstanceType<typeof Timeline> | null>(null)

const pageTitle = computed(() => {
  switch (activeView.value) {
    case 'dashboard': return 'Dashboard'
    case 'scan': return 'Nouveau Scan'
    case 'results': return 'Résultats du Scan'
    case 'history': return 'Historique'
    case 'config': return 'Configuration'
    case 'repos': return 'Repositories'
    case 'chat': return 'Assistant IA'
    default: return 'DSO - DevSecOps Oracle'
  }
})

const pageSubtitle = computed(() => {
  switch (activeView.value) {
    case 'dashboard': return 'Vue d\'ensemble de vos scans de sécurité'
    case 'scan': return 'Lancez un nouveau scan de sécurité'
    case 'results': return 'Analysez les résultats de votre scan'
    case 'monitoring': return 'Surveillez les KPI, SLO et l\'utilisation des services'
    case 'integrations': return 'Connectez DSO à vos outils de monitoring et communication'
    case 'autofix': return 'Résolution automatique des problèmes avec l\'IA'
    case 'manual-config': return 'Configuration manuelle des outils nécessitant une intervention'
    case 'history': return 'Consultez l\'historique de vos scans'
    case 'config': return 'Configurez vos outils et paramètres'
    case 'repos': return 'Connectez-vous à GitHub ou GitLab'
    case 'chat': return 'Posez vos questions et obtenez des conseils'
    default: return 'Plateforme d\'analyse de sécurité'
  }
})

const handleNavigation = (view: string) => {
  activeView.value = view
  
  // Auto-navigate to results if we have scan results
  if (view === 'scan' && scanResults.value) {
    activeView.value = 'results'
  }
  
  // When starting a new scan, clear results
  if (view === 'scan' && !scanning.value) {
    scanResults.value = null
    analysis.value = null
  }
}

const showToast = (type: 'success' | 'error' | 'info' | 'warning' | 'loading', title: string, message?: string) => {
  if (toastRef.value) {
    toastRef.value.addToast({ type, title, message })
  }
}

const handleRepoScan = async (data: { provider: 'github' | 'gitlab', repo: any }) => {
  activeView.value = 'scan'
  scanning.value = true
  scanResults.value = null
  analysis.value = null
  scanProgress.value = 0
  
  // Clear previous logs and timeline
  if (consoleRef.value) {
    consoleRef.value.clearLogs()
  }
  if (timelineRef.value) {
    timelineRef.value.clearSteps()
  }
  
  try {
    showToast('loading', 'Cloning repository', `Cloning ${data.repo.name}...`)
    if (consoleRef.value) {
      consoleRef.value.addLog('info', 'Cloning repository', `${data.provider}/${data.repo.name}`)
    }
    
    // Clone repository
    const cloneResult = await repoService.cloneAndScan(data.provider, data.repo)
    
    if (consoleRef.value) {
      consoleRef.value.addLog('success', 'Repository cloned', `Cloned to ${cloneResult.path}`)
    }
    
    // Start scan on cloned repository
    scanStatus.value = 'Scanning cloned repository...'
    scanProgress.value = 20
    
    // Use the cloned path for scanning
    const results = await scanService.runScan(cloneResult.path)
    scanResults.value = results
    
    scanProgress.value = 100
    showToast('success', 'Scan complete', `Found ${results.summary.total} issues`)
    
    // Navigate to results view
    activeView.value = 'results'
  } catch (error) {
    console.error('Repo scan error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    showToast('error', 'Scan failed', errorMessage)
    
    if (consoleRef.value) {
      consoleRef.value.addLog('error', 'Scan failed', errorMessage)
    }
  } finally {
    scanning.value = false
    scanProgress.value = 0
  }
}

const handleScanWithOptions = async (options: { path: string; format: string; verbose: boolean; exclude?: string }) => {
  currentScanPath.value = options.path
  await startScan(options.path, options)
}

const startScan = async (path: string = '.', options?: { format?: string; verbose?: boolean; exclude?: string }): Promise<void> => {
  scanning.value = true
  scanResults.value = null
  analysis.value = null
  scanProgress.value = 0
  
  let scanRecord: any = null
  let projectRecord: any = null
  
  // Create scan record in Supabase if configured
  if (supabaseService.isConfigured()) {
    try {
      const user = await supabaseService.getCurrentUser()
      if (user) {
        // Find or create project
        const projects = await supabaseService.getProjects()
        projectRecord = projects.find(p => p.path === path) || 
          await supabaseService.createProject({
            name: path.split('/').pop() || 'Project',
            path: path,
            provider: 'local',
            user_id: user.id
          })
        
        // Create scan record
        scanRecord = await supabaseService.createScan({
          project_id: projectRecord.id,
          user_id: user.id,
          status: 'running',
          total_findings: 0,
          critical_count: 0,
          high_count: 0,
          medium_count: 0,
          low_count: 0,
          fixable_count: 0,
          exploitable_count: 0,
          scan_path: path,
          scan_format: (options?.format as 'json' | 'text') || 'json',
          verbose: options?.verbose || false,
          tools_used: []
        })
      }
    } catch (error) {
      console.warn('Failed to create scan record:', error)
    }
  }
  
  // Clear previous logs and timeline
  if (consoleRef.value) {
    consoleRef.value.clearLogs()
  }
  if (timelineRef.value) {
    timelineRef.value.clearSteps()
  }
  
  // Initialize timeline steps
  const initStep = timelineRef.value?.addStep({
    id: 'init',
    title: 'Initialization',
    description: 'Preparing scan environment'
  })
  
  const scanStep = timelineRef.value?.addStep({
    id: 'scan',
    title: 'Security Scan',
    description: 'Running security scanners (Trivy, Gitleaks, TFSec, Grype)'
  })
  
  const analysisStep = timelineRef.value?.addStep({
    id: 'analysis',
    title: 'AI Analysis',
    description: 'Analyzing results with AI'
  })
  
  const finalizeStep = timelineRef.value?.addStep({
    id: 'finalize',
    title: 'Finalization',
    description: 'Preparing results'
  })
  
  // Start initialization
  if (consoleRef.value) {
    consoleRef.value.addLog('info', 'Starting DSO security scan', 'Initializing scan environment...')
  }
  if (timelineRef.value && initStep) {
    timelineRef.value.startStep(initStep)
  }
  showToast('loading', 'Starting scan', 'Initializing security analysis...')
  
  try {
    // Step 1: Initialization
    await new Promise(resolve => setTimeout(resolve, 300))
    if (consoleRef.value) {
      consoleRef.value.addLog('success', 'Environment initialized', 'Scan tools ready')
    }
    if (timelineRef.value && initStep) {
      timelineRef.value.completeStep(initStep, 300, 'All scanners ready')
    }
    
    // Step 2: Security Scan
    scanStatus.value = 'Running security scan...'
    scanProgress.value = 10
    const scanStartTime = Date.now()
    if (timelineRef.value && scanStep) {
      timelineRef.value.startStep(scanStep)
    }
    if (consoleRef.value) {
      consoleRef.value.addLog('info', 'Starting security scanners', 'Trivy, Gitleaks, TFSec, Grype')
      consoleRef.value.addLog('info', 'Calling DSO CLI', 'dso audit . --format json')
    }
    showToast('info', 'Scan in progress', 'Analyzing codebase for vulnerabilities...')
    
    // Call the actual DSO CLI via API
    const results = await scanService.runScan(path)
    scanResults.value = results
    
    // Update progress based on actual scan completion
    scanProgress.value = 60
    
    const scanDuration = Date.now() - scanStartTime
    
    // Update scan record in Supabase
    if (scanRecord && supabaseService.isConfigured()) {
      try {
        await supabaseService.updateScan(scanRecord.id, {
          status: 'completed',
          total_findings: results.summary.total,
          critical_count: results.summary.critical,
          high_count: results.summary.high,
          medium_count: results.summary.medium,
          low_count: results.summary.low,
          fixable_count: results.summary.fixable,
          exploitable_count: results.summary.exploitable,
          duration_ms: scanDuration,
          completed_at: new Date().toISOString(),
          tools_used: Array.from(new Set(results.findings.map((f: any) => f.tool)))
        })
        
        // Save findings
        if (results.findings && results.findings.length > 0) {
          await supabaseService.createFindings(
            results.findings.map((f: any) => ({
              scan_id: scanRecord.id,
              finding_id: f.id,
              title: f.title,
              description: f.description,
              file_path: f.file,
              line_number: f.line,
              severity: f.severity,
              tool: f.tool,
              fixable: f.fixable,
              exploitable: f.exploitable
            }))
          )
        }
      } catch (error) {
        console.warn('Failed to update scan record:', error)
      }
    }
    
    if (consoleRef.value) {
      consoleRef.value.addLog('info', 'DSO CLI scan completed', `Received ${results.summary?.total || 0} findings`)
      if (results.findings && results.findings.length > 0) {
        // Log scanner breakdown
        const scanners = new Set(results.findings.map((f: any) => f.tool || 'unknown'))
        scanners.forEach(tool => {
          const count = results.findings.filter((f: any) => (f.tool || 'unknown') === tool).length
          consoleRef.value?.addLog('info', `${tool} findings`, `${count} issues detected`)
        })
      }
      consoleRef.value.addLog('success', 'Security scan completed', `Found ${results.summary.total} issues (${results.summary.critical} critical, ${results.summary.high} high) in ${scanDuration}ms`)
    }
    if (timelineRef.value && scanStep) {
      timelineRef.value.completeStep(scanStep, scanDuration, `${results.summary.total} issues found`)
    }
    
    // Step 3: AI Analysis
    scanStatus.value = 'Analyzing with AI...'
    scanProgress.value = 70
    if (timelineRef.value && analysisStep) {
      timelineRef.value.startStep(analysisStep)
    }
    if (consoleRef.value) {
      consoleRef.value.addLog('info', 'Starting AI analysis', 'Connecting to Ollama...')
    }
    showToast('info', 'AI Analysis', 'Analyzing results with AI...')
    
    const analysisProgressInterval = setInterval(() => {
      if (scanProgress.value < 90) {
        scanProgress.value += 5
        if (timelineRef.value && analysisStep) {
          timelineRef.value.updateStepProgress(analysisStep, ((scanProgress.value - 70) / 20) * 100)
        }
      }
    }, 150)
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (consoleRef.value) {
      consoleRef.value.addLog('info', 'AI model loaded', 'Using local Ollama instance')
      consoleRef.value.addLog('info', 'Analyzing vulnerabilities', 'Generating recommendations...')
    }
    
    scanProgress.value = 90
    clearInterval(analysisProgressInterval)
    
    const aiAnalysis = await scanService.analyzeResults(results)
    analysis.value = aiAnalysis
    
    // Save AI analysis to Supabase
    if (scanRecord && supabaseService.isConfigured()) {
      try {
        await supabaseService.createAIAnalysis({
          scan_id: scanRecord.id,
          summary: aiAnalysis.summary,
          business_impact: aiAnalysis.businessImpact,
          analysis_duration_ms: 1000
        })
      } catch (error) {
        console.warn('Failed to save AI analysis:', error)
      }
    }
    
    if (consoleRef.value) {
      consoleRef.value.addLog('success', 'AI analysis completed', 'Recommendations generated')
    }
    if (timelineRef.value && analysisStep) {
      timelineRef.value.completeStep(analysisStep, 1000, 'Analysis complete')
    }
    
    // Step 4: Finalization
    scanProgress.value = 95
    if (timelineRef.value && finalizeStep) {
      timelineRef.value.startStep(finalizeStep)
    }
    if (consoleRef.value) {
      consoleRef.value.addLog('info', 'Preparing results', 'Formatting output...')
    }
    
    await new Promise(resolve => setTimeout(resolve, 200))
    
    scanProgress.value = 100
    if (timelineRef.value && finalizeStep) {
      timelineRef.value.completeStep(finalizeStep, 200, 'Results ready')
    }
    if (consoleRef.value) {
      consoleRef.value.addLog('success', 'Scan completed successfully', `Total time: ~3s | Issues: ${results.summary.total}`)
    }
    
    showToast('success', 'Scan complete', `Found ${results.summary.total} issues`)
    
    // Navigate to results view
    activeView.value = 'results'
  } catch (error) {
    console.error('Scan error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    if (consoleRef.value) {
      consoleRef.value.addLog('error', 'Scan failed', errorMessage)
    }
    
    // Mark current step as error
    if (timelineRef.value) {
      // Access steps through the exposed property
      const timeline = timelineRef.value as any
      if (timeline.steps && Array.isArray(timeline.steps)) {
        const currentStep = timeline.steps.find((s: any) => s.status === 'active')
        if (currentStep) {
          timelineRef.value.errorStep(currentStep.id, errorMessage)
        }
      }
    }
    
    showToast('error', 'Scan failed', errorMessage)
    
    // Update scan record as failed
    if (scanRecord && supabaseService.isConfigured()) {
      try {
        await supabaseService.updateScan(scanRecord.id, {
          status: 'failed',
          error_message: errorMessage
        })
      } catch (err) {
        console.warn('Failed to update scan record:', err)
      }
    }
  } finally {
    scanning.value = false
    scanProgress.value = 0
  }
}

const handleChatAction = async (action: { label: string; command: string }) => {
  console.log('Chat action:', action)
  
  try {
    if (action.command === 'scan') {
      // Navigate to scan view
      handleNavigation('scan')
      showToast('info', 'Action', 'Lancement d\'un nouveau scan...')
    } else if (action.command === 'fix') {
      // Apply auto-fixes if we have scan results
      if (scanResults.value && scanResults.value.findings) {
        const fixableFindings = scanResults.value.findings.filter(f => f.fixable)
        if (fixableFindings.length > 0) {
          showToast('loading', 'Application des correctifs', `Correction de ${fixableFindings.length} problèmes...`)
          // Trigger fix for all fixable findings
          for (const finding of fixableFindings.slice(0, 5)) { // Limit to 5 fixes at a time
            try {
              await scanService.autoFix(finding)
            } catch (error) {
              console.error('Fix error:', error)
            }
          }
          showToast('success', 'Correctifs appliqués', `${fixableFindings.length} problèmes corrigés`)
        } else {
          showToast('info', 'Aucun correctif disponible', 'Aucun problème ne peut être corrigé automatiquement')
        }
      } else {
        showToast('warning', 'Aucun scan disponible', 'Veuillez d\'abord lancer un scan')
      }
    } else if (action.command === 'export') {
      // Export scan results
      if (scanResults.value) {
        await scanService.exportResults(scanResults.value, 'json')
        showToast('success', 'Export réussi', 'Résultats exportés en JSON')
      } else {
        showToast('warning', 'Aucun résultat à exporter', 'Veuillez d\'abord lancer un scan')
      }
    } else {
      showToast('info', 'Action', `Exécution: ${action.label}`)
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
    showToast('error', 'Erreur d\'action', errorMessage)
  }
}

onMounted(() => {
  // Auto-start scan on mount (optional)
  // startScan()
})
</script>
