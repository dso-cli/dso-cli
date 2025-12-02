<template>
  <div class="space-y-6">
    <div class="card p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Automatic Problem Resolution</h3>
      <p class="text-sm text-gray-600 mb-6">
        DSO uses AI (Ollama) to automatically diagnose and resolve encountered issues.
      </p>

      <!-- Active Issues -->
      <div v-if="activeIssues.length > 0" class="space-y-4 mb-6">
        <h4 class="font-medium text-gray-900">Active Issues</h4>
        <div
          v-for="issue in activeIssues"
          :key="issue.id"
          class="border border-gray-200 rounded-lg p-4"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-2 h-2 rounded-full" :class="getStatusColor(issue.status)"></div>
                <h5 class="font-semibold text-gray-900">{{ issue.title }}</h5>
                <span
                  class="text-xs px-2 py-1 rounded-full"
                  :class="getSeverityClass(issue.severity)"
                >
                  {{ issue.severity }}
                </span>
              </div>
              <p class="text-sm text-gray-600 mb-2">{{ issue.description }}</p>
              <div v-if="issue.solution" class="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div class="flex items-center justify-between mb-2">
                  <p class="text-sm font-medium text-emerald-900">Proposed solution:</p>
                  <div class="flex items-center gap-2">
                    <span v-if="issue.osInfo" class="text-xs px-2 py-1 bg-emerald-200 text-emerald-800 rounded-full">
                      {{ issue.osInfo.osName }}
                    </span>
                    <span v-if="issue.requiresSudo" class="text-xs px-2 py-1 bg-yellow-200 text-yellow-800 rounded-full">
                      ⚠️ Permissions required
                    </span>
                  </div>
                </div>
                <p class="text-sm text-emerald-800 mb-2">{{ issue.solution }}</p>
                <div v-if="issue.permissionNote" class="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                  <strong>Note:</strong> {{ issue.permissionNote }}
                </div>
                <div v-if="issue.commands && issue.commands.length > 0" class="mt-2">
                  <p class="text-xs font-medium text-emerald-900 mb-1">Commands to execute:</p>
                  <div class="space-y-1">
                    <div
                      v-for="(cmd, idx) in issue.commands"
                      :key="idx"
                      class="flex items-center gap-2"
                    >
                      <code class="flex-1 text-xs bg-emerald-100 text-emerald-900 p-2 rounded">
                        {{ cmd }}
                      </code>
                      <span
                        v-if="issue.requiresSudo && (cmd.includes('sudo') || cmd.includes('apt-get') || cmd.includes('yum') || cmd.includes('pacman'))"
                        class="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded"
                        title="This command requires administrator permissions"
                      >
                        🔒
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button
              v-if="issue.solution"
              @click="applySolution(issue)"
              class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm"
            >
              Apply solution
            </button>
            <button
              @click="diagnoseIssue(issue)"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              :disabled="diagnosing"
            >
              {{ diagnosing ? 'Diagnosing...' : 'Re-diagnose' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Issue History -->
      <div v-if="resolvedIssues.length > 0">
        <h4 class="font-medium text-gray-900 mb-4">Resolved Issues</h4>
        <div class="space-y-2">
          <div
            v-for="issue in resolvedIssues"
            :key="issue.id"
            class="border border-gray-200 rounded-lg p-3 bg-gray-50"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="font-medium text-gray-900">{{ issue.title }}</span>
              </div>
              <span class="text-xs text-gray-500">{{ formatDate(issue.resolvedAt) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- No Issues -->
      <div v-if="activeIssues.length === 0 && resolvedIssues.length === 0" class="text-center py-12">
        <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-lg font-medium text-gray-600 mb-2">No issues detected</p>
        <p class="text-sm text-gray-500">All services are functioning correctly</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { autofixService } from '../services/autofixService'

interface Issue {
  id: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'detected' | 'diagnosing' | 'solved' | 'resolved'
  solution?: string
  commands?: string[]
  resolvedAt?: Date
  requiresSudo?: boolean
  permissionNote?: string
  osInfo?: {
    platform: string
    osName: string
    osType: string
    packageManager: string
    shell: string
  }
}

const activeIssues = ref<Issue[]>([])
const resolvedIssues = ref<Issue[]>([])
const diagnosing = ref(false)

const getStatusColor = (status: string) => {
  switch (status) {
    case 'detected': return 'bg-yellow-500'
    case 'diagnosing': return 'bg-blue-500'
    case 'solved': return 'bg-green-500'
    default: return 'bg-gray-500'
  }
}

const getSeverityClass = (severity: string) => {
  switch (severity) {
    case 'critical': return 'bg-red-100 text-red-700'
    case 'high': return 'bg-orange-100 text-orange-700'
    case 'medium': return 'bg-yellow-100 text-yellow-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

const diagnoseIssue = async (issue: Issue) => {
  diagnosing.value = true
  try {
    const result = await autofixService.diagnoseIssue({
      title: issue.title,
      description: issue.description
    })
    
    issue.solution = result.solution
    issue.commands = result.commands
    issue.osInfo = result.osInfo
    issue.requiresSudo = result.requiresSudo
    issue.permissionNote = result.permissionNote
    issue.status = 'solved'
  } catch (error) {
    console.error('Error diagnosing issue:', error)
    issue.solution = `Error during diagnosis: ${error instanceof Error ? error.message : 'Unknown error'}`
  } finally {
    diagnosing.value = false
  }
}

const applySolution = async (issue: Issue) => {
  if (!issue.commands || issue.commands.length === 0) {
    alert('No commands to execute')
    return
  }
  
  try {
    const results = await autofixService.applySolution(issue.commands)
    const allSuccess = results.every(r => r.success)
    
    if (allSuccess) {
      // Move to resolved
      issue.status = 'resolved'
      issue.resolvedAt = new Date()
      resolvedIssues.value.push(issue)
      activeIssues.value = activeIssues.value.filter(i => i.id !== issue.id)
      alert('Solution applied successfully!')
    } else {
      const failed = results.filter(r => !r.success)
      alert(`Some commands failed: ${failed.map(f => f.command).join(', ')}`)
    }
  } catch (error) {
      alert(`Error during application: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

const formatDate = (date?: Date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const checkForIssues = async () => {
  try {
    const response = await fetch('/api/autofix/issues')
    if (response.ok) {
      const data = await response.json()
      if (data.issues && data.issues.length > 0) {
        activeIssues.value = data.issues.map((issue: any) => ({
          ...issue,
          status: issue.status || 'detected'
        }))
      }
    } else {
      // Fallback: check services and detect issues
      await detectServiceIssues()
    }
  } catch (error) {
    console.error('Failed to check for issues:', error)
    // Fallback: check services and detect issues
    await detectServiceIssues()
  }
}

const detectServiceIssues = async () => {
  try {
    const response = await fetch('/api/monitoring/services')
    if (response.ok) {
      const data = await response.json()
      const services = data.services || []
      
      // Detect issues from service status
      const issues: Issue[] = []
      services.forEach((service: any) => {
        if (service.status === 'down' || service.status === 'degraded') {
          issues.push({
            id: `issue-${service.name.toLowerCase().replace(/\s+/g, '-')}`,
            title: `${service.name} not accessible`,
            description: `The service ${service.name} is not responding correctly. Status: ${service.status}`,
            severity: service.status === 'down' ? 'critical' : 'high',
            status: 'detected'
          })
        }
      })
      
      if (issues.length > 0) {
        activeIssues.value = issues
      }
    }
  } catch (error) {
    console.error('Failed to detect service issues:', error)
  }
}

onMounted(async () => {
  await checkForIssues()
})
</script>

