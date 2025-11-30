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
                <span :class="[
                  'text-xs font-mono',
                  tool.installed ? 'text-green-700' : 'text-gray-500'
                ]">
                  {{ tool.installed ? (tool.version || '✓') : '✗' }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <button
          @click="checkTools"
          class="btn btn-secondary text-sm mt-4 w-full"
          :disabled="checkingTools"
        >
          <span v-if="checkingTools" class="flex items-center justify-center gap-2">
            <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Checking...
          </span>
          <span v-else>Refresh Status</span>
        </button>
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

onMounted(() => {
  checkVersion()
  checkTools()
  checkOllama()
})
</script>

