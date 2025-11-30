<template>
  <div class="console-container">
    <div class="console-header">
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="text-lg font-semibold text-gray-900">Console Logs</h3>
        <span class="text-xs text-gray-500">({{ logs.length }} entries)</span>
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="clearLogs"
          class="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded hover:bg-gray-100 transition-colors"
        >
          Clear
        </button>
        <button
          @click="toggleAutoScroll"
          :class="[
            'text-sm px-3 py-1 rounded transition-colors',
            autoScroll ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          ]"
        >
          Auto-scroll: {{ autoScroll ? 'ON' : 'OFF' }}
        </button>
      </div>
    </div>
    <div ref="consoleContent" class="console-content">
      <div
        v-for="(log, index) in logs"
        :key="index"
        :class="[
          'console-entry',
          log.type === 'error' && 'log-error',
          log.type === 'warning' && 'log-warning',
          log.type === 'success' && 'log-success',
          log.type === 'info' && 'log-info'
        ]"
      >
        <span class="log-time">{{ formatTime(log.timestamp) }}</span>
        <span :class="['log-level', `level-${log.type}`]">{{ log.type.toUpperCase() }}</span>
        <span class="log-message">{{ log.message }}</span>
        <span v-if="log.details" class="log-details">{{ log.details }}</span>
      </div>
      <div v-if="logs.length === 0" class="console-empty">
        <p class="text-gray-400">No logs yet. Start a scan to see activity.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

export interface LogEntry {
  timestamp: Date
  type: 'info' | 'success' | 'warning' | 'error'
  message: string
  details?: string
}

const logs = ref<LogEntry[]>([])
const consoleContent = ref<HTMLElement | null>(null)
const autoScroll = ref<boolean>(true)

const addLog = (type: LogEntry['type'], message: string, details?: string): void => {
  logs.value.push({
    timestamp: new Date(),
    type,
    message,
    details
  })
  
  if (autoScroll.value) {
    nextTick(() => {
      scrollToBottom()
    })
  }
}

const clearLogs = (): void => {
  logs.value = []
  addLog('info', 'Console cleared')
}

const toggleAutoScroll = (): void => {
  autoScroll.value = !autoScroll.value
  if (autoScroll.value) {
    scrollToBottom()
  }
}

const scrollToBottom = (): void => {
  if (consoleContent.value) {
    consoleContent.value.scrollTop = consoleContent.value.scrollHeight
  }
}

const formatTime = (date: Date): string => {
  const time = date.toLocaleTimeString('fr-FR', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit'
  })
  const ms = date.getMilliseconds().toString().padStart(3, '0')
  return `${time}.${ms}`
}

watch(logs, () => {
  if (autoScroll.value) {
    nextTick(() => {
      scrollToBottom()
    })
  }
}, { deep: true })

defineExpose({
  addLog,
  clearLogs
})
</script>

<style scoped>
.console-container {
  @apply bg-gray-900 rounded-lg shadow-lg border border-gray-700 overflow-hidden;
  height: 400px;
  display: flex;
  flex-direction: column;
}

.console-header {
  @apply bg-gray-800 border-b border-gray-700 px-4 py-3 flex justify-between items-center;
}

.console-content {
  @apply flex-1 overflow-y-auto p-4 font-mono text-sm;
  background: #1e1e1e;
  color: #d4d4d4;
}

.console-entry {
  @apply flex items-start gap-3 py-1 hover:bg-gray-800/50 rounded px-2 transition-colors;
  line-height: 1.6;
}

.log-time {
  @apply text-gray-500 text-xs flex-shrink-0;
  min-width: 100px;
}

.log-level {
  @apply font-bold text-xs px-2 py-0.5 rounded flex-shrink-0;
  min-width: 60px;
  text-align: center;
}

.level-info {
  @apply bg-blue-900/50 text-blue-300;
}

.level-success {
  @apply bg-green-900/50 text-green-300;
}

.level-warning {
  @apply bg-yellow-900/50 text-yellow-300;
}

.level-error {
  @apply bg-red-900/50 text-red-300;
}

.log-message {
  @apply flex-1 text-gray-300;
}

.log-details {
  @apply text-gray-500 text-xs italic;
}

.console-empty {
  @apply flex items-center justify-center h-full text-center;
}

/* Scrollbar styling */
.console-content::-webkit-scrollbar {
  width: 8px;
}

.console-content::-webkit-scrollbar-track {
  @apply bg-gray-800;
}

.console-content::-webkit-scrollbar-thumb {
  @apply bg-gray-600 rounded;
}

.console-content::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-500;
}
</style>

