<template>
  <div class="card">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">Scan Options</h3>
    
    <div class="space-y-4">
      <!-- Scan Path -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Scan Path
        </label>
        <div class="flex gap-2">
          <input
            v-model="localPath"
            type="text"
            placeholder="Enter path or leave empty for current directory"
            class="input flex-1"
          />
          <button
            @click="browsePath"
            class="btn btn-secondary whitespace-nowrap"
          >
            <svg class="w-5 h-5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            Browse
          </button>
        </div>
        <p class="text-xs text-gray-500 mt-1">
          Leave empty to scan current directory (.)
        </p>
      </div>

      <!-- Scan Format -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Output Format
        </label>
        <div class="flex gap-3">
          <label class="flex items-center">
            <input
              v-model="format"
              type="radio"
              value="text"
              class="mr-2"
            />
            <span>Text</span>
          </label>
          <label class="flex items-center">
            <input
              v-model="format"
              type="radio"
              value="json"
              class="mr-2"
            />
            <span>JSON</span>
          </label>
        </div>
      </div>

      <!-- Verbose Mode -->
      <div>
        <label class="flex items-center">
          <input
            v-model="verbose"
            type="checkbox"
            class="mr-2"
          />
          <span class="text-sm font-medium text-gray-700">Verbose Mode</span>
        </label>
        <p class="text-xs text-gray-500 mt-1">
          Show detailed information during scan
        </p>
      </div>

      <!-- Exclude Patterns -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Additional Exclusions (optional)
        </label>
        <input
          v-model="excludePatterns"
          type="text"
          placeholder="e.g., test/, *.log, custom-dir/"
          class="input"
        />
        <p class="text-xs text-gray-500 mt-1">
          Comma-separated patterns. Default exclusions (node_modules, vendor, etc.) are always applied.
        </p>
      </div>
    </div>

    <div class="mt-6 flex gap-3">
      <button
        @click="applyOptions"
        class="btn btn-primary flex-1"
      >
        Apply & Start Scan
      </button>
      <button
        @click="resetOptions"
        class="btn btn-secondary"
      >
        Reset
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits } from 'vue'

const emit = defineEmits(['scan'])

const localPath = ref<string>('.')
const format = ref<'text' | 'json'>('text')
const verbose = ref<boolean>(false)
const excludePatterns = ref<string>('')

const browsePath = () => {
  // In a real implementation, this would open a file browser
  // For now, we'll use a prompt
  const path = prompt('Enter the path to scan:', localPath.value)
  if (path !== null) {
    localPath.value = path || '.'
  }
}

const applyOptions = () => {
  emit('scan', {
    path: localPath.value || '.',
    format: format.value,
    verbose: verbose.value,
    exclude: excludePatterns.value
  })
}

const resetOptions = () => {
  localPath.value = '.'
  format.value = 'text'
  verbose.value = false
  excludePatterns.value = ''
}
</script>

