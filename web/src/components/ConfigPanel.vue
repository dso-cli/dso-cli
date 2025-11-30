<template>
  <div class="card">
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-lg font-semibold text-gray-900">Configuration</h3>
      <button
        @click="$emit('close')"
        class="text-gray-400 hover:text-gray-600"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <div class="space-y-6">
      <!-- Ollama Status -->
      <div>
        <h4 class="text-sm font-semibold text-gray-700 mb-3">Ollama Status</h4>
        <div class="flex items-center gap-3 mb-2">
          <div :class="[
            'w-3 h-3 rounded-full transition-all',
            ollamaStatus.connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
          ]"></div>
          <span :class="[
            'text-sm font-medium',
            ollamaStatus.connected ? 'text-green-700' : 'text-red-700'
          ]">
            {{ ollamaStatus.connected ? 'Connected' : 'Not Connected' }}
          </span>
        </div>
        <div v-if="ollamaStatus.connected && ollamaStatus.model" class="text-sm text-gray-600 mb-2">
          <span class="font-medium">Model:</span> 
          <span class="font-mono text-emerald-600">{{ ollamaStatus.model }}</span>
        </div>
        <div v-if="!ollamaStatus.connected && ollamaError" class="text-xs text-red-600 mb-2 p-2 bg-red-50 rounded">
          {{ ollamaError }}
        </div>
        <button
          @click="checkOllama"
          class="btn btn-secondary text-sm mt-2"
          :disabled="checkingOllama"
        >
          <span v-if="checkingOllama" class="flex items-center gap-2">
            <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Checking...
          </span>
          <span v-else>Check Status</span>
        </button>
      </div>

      <!-- Tools Status -->
      <div>
        <h4 class="text-sm font-semibold text-gray-700 mb-3">DevSecOps Tools</h4>
        
        <!-- Group tools by category -->
        <div class="space-y-4">
          <div v-for="(categoryTools, category) in groupedTools" :key="category" class="border-b border-gray-200 pb-3 last:border-b-0">
            <h5 class="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
              {{ category }} ({{ categoryTools.installed }}/{{ categoryTools.total }})
            </h5>
            <div class="space-y-1.5">
              <div
                v-for="tool in categoryTools.tools"
                :key="tool.name"
                :class="[
                  'flex items-center justify-between p-2 rounded-lg transition-all text-xs',
                  tool.installed ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                ]"
              >
                <div class="flex items-center gap-2">
                  <div :class="[
                    'w-2 h-2 rounded-full transition-all',
                    tool.installed ? 'bg-green-500' : 'bg-red-500'
                  ]"></div>
                  <span :class="[
                    'text-xs font-medium',
                    tool.installed ? 'text-green-800' : 'text-gray-700'
                  ]">{{ tool.name }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span :class="[
                    'text-xs font-mono',
                    tool.installed ? 'text-green-700' : 'text-gray-500'
                  ]">
                    {{ tool.installed ? (tool.version || '✓') : '✗' }}
                  </span>
                  <button
                    v-if="tool.installed"
                    @click.stop="updateTool(tool.name)"
                    class="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    :disabled="installingTools"
                    title="Update tool"
                  >
                    ↻
                  </button>
                  <button
                    v-else
                    @click.stop="installSingleTool(tool.name)"
                    class="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    :disabled="installingTools"
                    title="Install tool"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex gap-2 mt-4">
          <button
            @click="checkTools"
            class="btn btn-secondary text-sm flex-1"
            :disabled="checkingTools || installingTools"
          >
            <span v-if="checkingTools" class="flex items-center justify-center gap-2">
              <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Checking...
            </span>
            <span v-else>Refresh Status</span>
          </button>
          <button
            v-if="missingToolsCount > 0"
            @click="installAllTools"
            class="btn bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm flex-1"
            :disabled="checkingTools || installingTools"
          >
            <span v-if="installingTools" class="flex items-center justify-center gap-2">
              <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Installing...
            </span>
            <span v-else class="flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Install All ({{ missingToolsCount }})
            </span>
          </button>
        </div>
        
        <!-- Installation Progress -->
        <div v-if="installingTools && installationProgress.length > 0" class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div class="text-xs font-semibold text-blue-900 mb-2">Installation Progress</div>
          <div class="space-y-1 max-h-32 overflow-y-auto">
            <div
              v-for="(progress, idx) in installationProgress"
              :key="idx"
              class="flex items-center gap-2 text-xs"
            >
              <svg v-if="progress.status === 'success'" class="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <svg v-else-if="progress.status === 'error'" class="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              <svg v-else class="w-3 h-3 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span :class="[
                'flex-1',
                progress.status === 'success' ? 'text-green-700' :
                progress.status === 'error' ? 'text-red-700' : 'text-blue-700'
              ]">
                {{ progress.tool }}: {{ progress.message }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- DSO Version -->
      <div>
        <h4 class="text-sm font-semibold text-gray-700 mb-3">DSO CLI</h4>
        <div class="text-sm text-gray-600 mb-2">
          Version: <span class="font-mono font-semibold">{{ dsoVersion || 'Unknown' }}</span>
        </div>
        <button
          @click="checkVersion"
          class="btn btn-secondary text-sm"
          :disabled="checkingVersion"
        >
          {{ checkingVersion ? 'Checking...' : 'Check Version' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { scanService } from '../services/scanService'

defineEmits(['close'])

const ollamaStatus = ref<{ connected: boolean; model?: string }>({ connected: false })
const ollamaError = ref<string>('')
const toolsStatus = ref<Array<{ name: string; installed: boolean; version?: string }>>([])
const dsoVersion = ref<string>('')
const checkingOllama = ref(false)
const checkingTools = ref(false)
const checkingVersion = ref(false)
const installingTools = ref(false)
const installationProgress = ref<Array<{ tool: string; status: 'pending' | 'success' | 'error'; message: string }>>([])

const checkOllama = async () => {
  checkingOllama.value = true
  ollamaError.value = ''
  try {
    const result = await scanService.checkOllama()
    ollamaStatus.value = {
      connected: result.connected || false,
      model: result.model
    }
    if (result.error && !result.connected) {
      ollamaError.value = result.error || 'Ollama is not accessible. Make sure Ollama is running (ollama serve)'
      console.warn('Ollama check error:', result.error)
    } else if (!result.connected) {
      ollamaError.value = 'Ollama is not running or not accessible. Start it with: ollama serve'
    }
  } catch (error) {
    console.error('Error checking Ollama:', error)
    ollamaStatus.value = { connected: false }
    ollamaError.value = error instanceof Error ? error.message : 'Failed to check Ollama status'
  } finally {
    checkingOllama.value = false
  }
}

// Tool categories mapping
const toolCategories: Record<string, string[]> = {
  'SAST': ['Trivy', 'Semgrep', 'Bandit', 'ESLint', 'Gosec', 'Brakeman'],
  'Dependencies': ['Grype', 'npm', 'pip-audit', 'Snyk', 'dependency-check'],
  'Secrets': ['Gitleaks', 'TruffleHog', 'detect-secrets'],
  'IaC': ['TFSec', 'Checkov', 'Terrascan', 'Kics'],
  'Containers': ['Hadolint', 'docker-bench-security'],
  'SBOM': ['Syft'],
  'Compliance': ['OPA']
}

const groupedTools = computed(() => {
  const groups: Record<string, { tools: any[], installed: number, total: number }> = {}
  
  // Initialize groups
  Object.keys(toolCategories).forEach(cat => {
    groups[cat] = { tools: [], installed: 0, total: 0 }
  })
  
  // Group tools by category
  toolsStatus.value.forEach(tool => {
    for (const [category, toolNames] of Object.entries(toolCategories)) {
      if (toolNames.includes(tool.name)) {
        if (!groups[category]) {
          groups[category] = { tools: [], installed: 0, total: 0 }
        }
        groups[category].tools.push(tool)
        groups[category].total++
        if (tool.installed) {
          groups[category].installed++
        }
        break
      }
    }
  })
  
  // Add missing tools to their categories
  Object.entries(toolCategories).forEach(([category, toolNames]) => {
    const existingNames = new Set(groups[category].tools.map(t => t.name))
    toolNames.forEach(toolName => {
      if (!existingNames.has(toolName)) {
        groups[category].tools.push({
          name: toolName,
          installed: false,
          version: undefined
        })
        groups[category].total++
      }
    })
  })
  
  return groups
})

const checkTools = async () => {
  checkingTools.value = true
  try {
    const tools = await scanService.getToolsStatus()
    // Store all tools (they will be grouped by computed property)
    toolsStatus.value = tools
  } catch (error) {
    console.error('Error checking tools:', error)
    // Fallback to empty list (will be populated by groupedTools computed)
    toolsStatus.value = []
  } finally {
    checkingTools.value = false
  }
}

const checkVersion = async () => {
  checkingVersion.value = true
  try {
    const version = await scanService.getVersion()
    dsoVersion.value = version
  } catch (error) {
    console.error('Error checking version:', error)
    dsoVersion.value = 'Error'
  } finally {
    checkingVersion.value = false
  }
}

const missingToolsCount = computed(() => {
  return toolsStatus.value.filter(t => !t.installed).length
})

const installAllTools = async () => {
  // Get all tools (both missing and installed)
  const allTools = toolsStatus.value
  const toolsToProcess = allTools.filter(t => {
    // Include missing tools or tools that might need update
    return !t.installed || true // Process all tools to check for updates
  })
  
  if (toolsToProcess.length === 0) {
    return
  }
  
  installingTools.value = true
  installationProgress.value = []
  
  try {
    for (const tool of toolsToProcess) {
      const toolName = tool.name
      
      // Check if already installed
      if (tool.installed) {
        // Ask user if they want to update (for now, skip installed tools)
        installationProgress.value.push({
          tool: toolName,
          status: 'success',
          message: `Already installed (${tool.version || 'version unknown'}) - Skipped`
        })
        continue
      }
      
      // Tool is not installed, install it
      installationProgress.value.push({
        tool: toolName,
        status: 'pending',
        message: 'Installing...'
      })
      
      try {
        const result = await scanService.installTool(toolName, false)
        const progressIndex = installationProgress.value.findIndex(p => p.tool === toolName)
        if (progressIndex !== -1) {
          if (result.alreadyInstalled) {
            installationProgress.value[progressIndex] = {
              tool: toolName,
              status: 'success',
              message: `Already installed (${result.version || 'version unknown'})`
            }
          } else if (result.success) {
            installationProgress.value[progressIndex] = {
              tool: toolName,
              status: 'success',
              message: result.message || 'Installed successfully'
            }
          } else {
            installationProgress.value[progressIndex] = {
              tool: toolName,
              status: 'error',
              message: result.message || result.error || 'Installation failed'
            }
          }
        }
      } catch (error) {
        const progressIndex = installationProgress.value.findIndex(p => p.tool === toolName)
        if (progressIndex !== -1) {
          installationProgress.value[progressIndex] = {
            tool: toolName,
            status: 'error',
            message: error instanceof Error ? error.message : 'Installation failed'
          }
        }
      }
      
      // Small delay between installations to avoid overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    // Refresh tools status after installation
    await checkTools()
  } catch (error) {
    console.error('Error installing tools:', error)
  } finally {
    installingTools.value = false
    // Clear progress after 10 seconds
    setTimeout(() => {
      installationProgress.value = []
    }, 10000)
  }
}

const installSingleTool = async (toolName: string) => {
  installingTools.value = true
  installationProgress.value = []
  
  installationProgress.value.push({
    tool: toolName,
    status: 'pending',
    message: 'Installing...'
  })
  
  try {
    const result = await scanService.installTool(toolName, false)
    const progressIndex = installationProgress.value.findIndex(p => p.tool === toolName)
    if (progressIndex !== -1) {
      if (result.alreadyInstalled) {
        installationProgress.value[progressIndex] = {
          tool: toolName,
          status: 'success',
          message: `Already installed (${result.version || 'version unknown'})`
        }
      } else if (result.success) {
        installationProgress.value[progressIndex] = {
          tool: toolName,
          status: 'success',
          message: result.message || 'Installed successfully'
        }
      } else {
        installationProgress.value[progressIndex] = {
          tool: toolName,
          status: 'error',
          message: result.message || result.error || 'Installation failed'
        }
      }
    }
    
    // Refresh tools status
    await checkTools()
  } catch (error) {
    const progressIndex = installationProgress.value.findIndex(p => p.tool === toolName)
    if (progressIndex !== -1) {
      installationProgress.value[progressIndex] = {
        tool: toolName,
        status: 'error',
        message: error instanceof Error ? error.message : 'Installation failed'
      }
    }
  } finally {
    installingTools.value = false
    setTimeout(() => {
      installationProgress.value = []
    }, 5000)
  }
}

const updateTool = async (toolName: string) => {
  installingTools.value = true
  installationProgress.value = []
  
  installationProgress.value.push({
    tool: toolName,
    status: 'pending',
    message: 'Updating...'
  })
  
  try {
    const result = await scanService.installTool(toolName, true)
    const progressIndex = installationProgress.value.findIndex(p => p.tool === toolName)
    if (progressIndex !== -1) {
      if (result.success) {
        installationProgress.value[progressIndex] = {
          tool: toolName,
          status: 'success',
          message: result.message || `Updated to ${result.version || 'latest version'}`
        }
      } else {
        installationProgress.value[progressIndex] = {
          tool: toolName,
          status: 'error',
          message: result.message || result.error || 'Update failed'
        }
      }
    }
    
    // Refresh tools status
    await checkTools()
  } catch (error) {
    const progressIndex = installationProgress.value.findIndex(p => p.tool === toolName)
    if (progressIndex !== -1) {
      installationProgress.value[progressIndex] = {
        tool: toolName,
        status: 'error',
        message: error instanceof Error ? error.message : 'Update failed'
      }
    }
  } finally {
    installingTools.value = false
    setTimeout(() => {
      installationProgress.value = []
    }, 5000)
  }
}

onMounted(() => {
  checkVersion()
  checkTools()
  checkOllama()
})
</script>

