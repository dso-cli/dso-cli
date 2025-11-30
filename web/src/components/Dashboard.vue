<template>
  <div class="space-y-6">
    <!-- Welcome Section -->
    <div class="card bg-gradient-to-br from-emerald-500 to-blue-600 text-white">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-3xl font-bold mb-2">Welcome to DSO</h2>
          <p class="text-emerald-50 text-lg">Your senior DevSecOps engineer in your terminal</p>
        </div>
        <div class="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
          <svg class="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Quick Stats -->
    <div v-if="stats" class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
        <div class="text-3xl font-bold mb-1">{{ stats.total_scans || 0 }}</div>
        <div class="text-blue-100 text-sm">Total Scans</div>
      </div>
      <div class="card bg-gradient-to-br from-red-500 to-red-600 text-white">
        <div class="text-3xl font-bold mb-1">{{ stats.critical_count || 0 }}</div>
        <div class="text-red-100 text-sm">Critical Issues</div>
      </div>
      <div class="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
        <div class="text-3xl font-bold mb-1">{{ stats.high_count || 0 }}</div>
        <div class="text-orange-100 text-sm">High Issues</div>
      </div>
      <div class="card bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
        <div class="text-3xl font-bold mb-1">{{ formatDuration(stats.average_duration_ms) }}</div>
        <div class="text-emerald-100 text-sm">Avg Duration</div>
      </div>
    </div>

    <!-- Recent Scans -->
    <div class="card">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Recent Scans</h3>
        <button
          @click="$emit('new-scan')"
          class="btn btn-primary text-sm"
        >
          <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          New Scan
        </button>
      </div>
      <div v-if="recentScans.length === 0" class="text-center py-12 text-gray-500">
        <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="text-lg font-medium mb-2">No scans yet</p>
        <p class="text-sm">Start your first security scan to see results here</p>
      </div>
      <div v-else class="space-y-3">
        <div
          v-for="scan in recentScans"
          :key="scan.id"
          class="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-emerald-300 transition-colors cursor-pointer"
          @click="$emit('view-scan', scan.id)"
        >
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <span :class="[
                  'w-2 h-2 rounded-full',
                  scan.status === 'completed' ? 'bg-green-500' : 
                  scan.status === 'running' ? 'bg-yellow-500' : 'bg-red-500'
                ]"></span>
                <span class="font-semibold text-gray-900">{{ scan.scan_path }}</span>
                <span class="text-xs text-gray-500">{{ formatDate(scan.created_at) }}</span>
              </div>
              <div class="flex gap-4 text-sm text-gray-600">
                <span>🔴 {{ scan.critical_count }} Critical</span>
                <span>🟠 {{ scan.high_count }} High</span>
                <span>🟡 {{ scan.medium_count }} Medium</span>
                <span>🔵 {{ scan.low_count }} Low</span>
              </div>
            </div>
            <div class="text-right">
              <div class="text-sm font-semibold text-gray-900">{{ scan.total_findings }}</div>
              <div class="text-xs text-gray-500">findings</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <button
        @click="$emit('scan-local')"
        class="card hover:shadow-xl transition-all duration-200 text-left group"
      >
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
            <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <div>
            <h4 class="font-semibold text-gray-900 mb-1">Scan Local Project</h4>
            <p class="text-sm text-gray-600">Scan a local directory</p>
          </div>
        </div>
      </button>

      <button
        @click="$emit('scan-repo')"
        class="card hover:shadow-xl transition-all duration-200 text-left group"
      >
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <div>
            <h4 class="font-semibold text-gray-900 mb-1">Scan Repository</h4>
            <p class="text-sm text-gray-600">Connect to GitHub/GitLab</p>
          </div>
        </div>
      </button>

      <button
        @click="$emit('view-config')"
        class="card hover:shadow-xl transition-all duration-200 text-left group"
      >
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h4 class="font-semibold text-gray-900 mb-1">Configuration</h4>
            <p class="text-sm text-gray-600">Manage settings</p>
          </div>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabaseService } from '../services/supabaseService'
import type { Scan } from '../services/supabaseService'

defineEmits(['new-scan', 'scan-local', 'scan-repo', 'view-config', 'view-scan'])

const stats = ref<any>(null)
const recentScans = ref<Scan[]>([])

const formatDate = (date: string | undefined): string => {
  if (!date) return 'Unknown'
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDuration = (ms: number | null | undefined): string => {
  if (!ms) return '0s'
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

const loadData = async () => {
  if (!supabaseService.isConfigured()) return
  
  try {
    // Load statistics
    const statistics = await supabaseService.getScanStatistics(30)
    stats.value = statistics

    // Load recent scans
    const scans = await supabaseService.getScans()
    recentScans.value = scans.slice(0, 5)
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  }
}

onMounted(() => {
  loadData()
})
</script>

