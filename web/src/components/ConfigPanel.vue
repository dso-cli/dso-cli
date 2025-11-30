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
            'w-3 h-3 rounded-full',
            ollamaStatus.connected ? 'bg-green-500' : 'bg-red-500'
          ]"></div>
          <span class="text-sm text-gray-600">
            {{ ollamaStatus.connected ? 'Connected' : 'Not Connected' }}
          </span>
        </div>
        <div v-if="ollamaStatus.connected" class="text-sm text-gray-500">
          Model: {{ ollamaStatus.model || 'Not set' }}
        </div>
        <button
          @click="checkOllama"
          class="btn btn-secondary text-sm mt-2"
          :disabled="checkingOllama"
        >
          {{ checkingOllama ? 'Checking...' : 'Check Status' }}
        </button>
      </div>

      <!-- Tools Status -->
      <div>
        <h4 class="text-sm font-semibold text-gray-700 mb-3">Scan Tools</h4>
        <div class="space-y-2">
          <div
            v-for="tool in toolsStatus"
            :key="tool.name"
            class="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
          >
            <div class="flex items-center gap-2">
              <div :class="[
                'w-2 h-2 rounded-full',
                tool.installed ? 'bg-green-500' : 'bg-red-500'
              ]"></div>
              <span class="text-sm text-gray-700">{{ tool.name }}</span>
            </div>
            <span class="text-xs text-gray-500">{{ tool.version || 'Not installed' }}</span>
          </div>
        </div>
        <button
          @click="checkTools"
          class="btn btn-secondary text-sm mt-2"
          :disabled="checkingTools"
        >
          {{ checkingTools ? 'Checking...' : 'Refresh Status' }}
        </button>
      </div>

      <!-- DSO Version -->
      <div>
        <h4 class="text-sm font-semibold text-gray-700 mb-3">DSO CLI</h4>
        <div class="text-sm text-gray-600 mb-2">
          Version: <span class="font-mono">{{ dsoVersion || 'Unknown' }}</span>
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
import { ref, onMounted } from 'vue'
import { scanService } from '../services/scanService'

defineEmits(['close'])

const ollamaStatus = ref<{ connected: boolean; model?: string }>({ connected: false })
const toolsStatus = ref<Array<{ name: string; installed: boolean; version?: string }>>([])
const dsoVersion = ref<string>('')
const checkingOllama = ref(false)
const checkingTools = ref(false)
const checkingVersion = ref(false)

const checkOllama = async () => {
  checkingOllama.value = true
  try {
    const result = await scanService.checkOllama()
    ollamaStatus.value = {
      connected: result.connected,
      model: result.model
    }
    if (result.error && !result.connected) {
      console.warn('Ollama check error:', result.error)
    }
  } catch (error) {
    console.error('Error checking Ollama:', error)
    ollamaStatus.value = { connected: false }
  } finally {
    checkingOllama.value = false
  }
}

const checkTools = async () => {
  checkingTools.value = true
  try {
    const tools = await scanService.getToolsStatus()
    // Ensure all expected tools are present
    const expectedTools = ['Trivy', 'Grype', 'Gitleaks', 'TFSec']
    const toolMap = new Map(tools.map(t => [t.name, t]))
    
    toolsStatus.value = expectedTools.map(name => {
      const tool = toolMap.get(name)
      return tool || { name, installed: false, version: undefined }
    })
  } catch (error) {
    console.error('Error checking tools:', error)
    // Fallback to default tools list
    toolsStatus.value = [
      { name: 'Trivy', installed: false, version: undefined },
      { name: 'Grype', installed: false, version: undefined },
      { name: 'Gitleaks', installed: false, version: undefined },
      { name: 'TFSec', installed: false, version: undefined }
    ]
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

