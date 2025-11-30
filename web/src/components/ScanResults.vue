<template>
  <div class="space-y-6">
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="card bg-gradient-to-br from-red-500 to-red-600 text-white">
        <div class="text-4xl font-bold mb-2">{{ results.summary.critical }}</div>
        <div class="text-red-100">Critical</div>
      </div>
      <div class="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
        <div class="text-4xl font-bold mb-2">{{ results.summary.high }}</div>
        <div class="text-orange-100">High</div>
      </div>
      <div class="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
        <div class="text-4xl font-bold mb-2">{{ results.summary.medium }}</div>
        <div class="text-yellow-100">Medium</div>
      </div>
      <div class="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
        <div class="text-4xl font-bold mb-2">{{ results.summary.low }}</div>
        <div class="text-blue-100">Low</div>
      </div>
    </div>

    <!-- AI Analysis Summary -->
    <div v-if="analysis" class="card bg-blue-50 border-blue-200">
      <h3 class="text-lg font-semibold text-gray-900 mb-2">AI Analysis</h3>
      <p class="text-gray-700">{{ analysis.summary }}</p>
      <div v-if="analysis.businessImpact" class="mt-4 pt-4 border-t border-blue-200">
        <h4 class="font-medium text-gray-900 mb-2">Business Impact</h4>
        <p class="text-gray-700">{{ analysis.businessImpact }}</p>
      </div>
    </div>

    <!-- Top Fixes -->
    <div v-if="analysis?.topFixes && analysis.topFixes.length > 0" class="card">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Top Fixes</h3>
      <div class="space-y-3">
        <div
          v-for="(fix, index) in analysis.topFixes"
          :key="index"
          class="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer"
          @click="viewFix(fix)"
        >
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <h4 class="font-medium text-gray-900 mb-1">{{ fix.title }}</h4>
              <p class="text-sm text-gray-600 mb-2">{{ fix.description }}</p>
              <div class="flex items-center gap-2 text-sm text-gray-500">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>{{ fix.file }}:{{ fix.line }}</span>
              </div>
            </div>
            <button
              v-if="fix.command"
              @click.stop="executeFix(fix)"
              class="btn btn-primary text-sm"
            >
              Apply Fix
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Findings by Category -->
    <div class="card">
      <div class="mb-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div class="flex items-center gap-3">
          <h3 class="text-lg font-semibold text-gray-900">Security Findings</h3>
          <div class="flex gap-2">
            <button
              v-for="view in ['all', 'by-category', 'by-tool']"
              :key="view"
              @click="viewMode = view"
              :class="[
                'px-3 py-1 rounded-lg text-xs font-medium transition-all',
                viewMode === view
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              {{ view === 'all' ? 'All' : view === 'by-category' ? 'By Category' : 'By Tool' }}
            </button>
          </div>
        </div>
        <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            @click="exportResults('json')"
            class="btn btn-secondary text-sm whitespace-nowrap"
            title="Export as JSON"
          >
            <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export JSON
          </button>
          <button
            @click="exportResults('csv')"
            class="btn btn-secondary text-sm whitespace-nowrap"
            title="Export as CSV"
          >
            <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
          <div class="relative">
            <input
              v-model="searchText"
              type="text"
              placeholder="Search findings..."
              class="input pl-10"
            />
            <svg class="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <select
            v-model="selectedSeverities"
            multiple
            class="input"
            style="min-width: 200px;"
          >
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      <!-- View by Category -->
      <div v-if="viewMode === 'by-category'" class="space-y-6">
        <div v-for="(categoryFindings, category) in findingsByCategory" :key="category" v-show="categoryFindings.length > 0" class="border-b border-gray-200 pb-6 last:border-b-0">
          <div class="flex items-center justify-between mb-4">
            <h4 class="text-md font-semibold text-gray-900 flex items-center gap-2">
              <span class="text-lg">{{ getCategoryIcon(category) }}</span>
              {{ category }} ({{ categoryFindings.length }})
            </h4>
            <span :class="getCategoryBadgeClass(category)" class="text-xs">
              {{ getCategoryStats(categoryFindings) }}
            </span>
          </div>
          <div class="space-y-2">
            <div
              v-for="finding in (expandedCategory === category ? categoryFindings : categoryFindings.slice(0, 10))"
              :key="finding.id"
              class="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-emerald-300 transition-colors"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <span :class="getSeverityBadgeClass(finding.severity)" class="text-xs">
                      {{ finding.severity }}
                    </span>
                    <span class="text-xs text-gray-500 font-mono">{{ finding.tool }}</span>
                  </div>
                  <div class="text-sm font-medium text-gray-900 mb-1">{{ finding.title }}</div>
                  <div class="text-xs text-gray-600 mb-2 line-clamp-2">{{ finding.description }}</div>
                  <code class="text-xs bg-gray-100 px-2 py-1 rounded">{{ finding.file }}:{{ finding.line }}</code>
                </div>
                <div class="flex gap-2 ml-4">
                  <button
                    @click="viewFinding(finding)"
                    class="text-xs px-2 py-1 text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Details
                  </button>
                  <button
                    v-if="finding.fixable"
                    @click="autoFix(finding)"
                    class="text-xs px-2 py-1 text-green-600 hover:text-green-800 font-medium"
                  >
                    Fix
                  </button>
                </div>
              </div>
            </div>
            <button
              v-if="categoryFindings.length > 10 && expandedCategory !== category"
              @click="expandedCategory = category"
              class="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Show all {{ categoryFindings.length }} findings →
            </button>
            <button
              v-else-if="expandedCategory === category && categoryFindings.length > 10"
              @click="expandedCategory = null"
              class="text-sm text-gray-600 hover:text-gray-700 font-medium"
            >
              Show less
            </button>
          </div>
        </div>
      </div>

      <!-- View by Tool -->
      <div v-else-if="viewMode === 'by-tool'" class="space-y-6">
        <div v-for="(toolFindings, tool) in findingsByTool" :key="tool" class="border-b border-gray-200 pb-6 last:border-b-0">
          <div class="flex items-center justify-between mb-4">
            <h4 class="text-md font-semibold text-gray-900 flex items-center gap-2">
              <span class="text-emerald-600 font-mono text-sm bg-emerald-50 px-2 py-1 rounded">{{ tool }}</span>
              ({{ toolFindings.length }} findings)
            </h4>
            <div class="flex gap-2">
              <span v-for="sev in ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']" :key="sev" class="text-xs">
                <span :class="getSeverityBadgeClass(sev)" class="text-xs mr-1">
                  {{ toolFindings.filter(f => f.severity === sev).length }}
                </span>
              </span>
            </div>
          </div>
          <div class="space-y-2">
            <div
              v-for="finding in (expandedTool === tool ? toolFindings : toolFindings.slice(0, 10))"
              :key="finding.id"
              class="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-emerald-300 transition-colors"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <span :class="getSeverityBadgeClass(finding.severity)" class="text-xs">
                      {{ finding.severity }}
                    </span>
                    <span v-if="finding.type" class="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">{{ finding.type }}</span>
                  </div>
                  <div class="text-sm font-medium text-gray-900 mb-1">{{ finding.title }}</div>
                  <div class="text-xs text-gray-600 mb-2 line-clamp-2">{{ finding.description }}</div>
                  <code class="text-xs bg-gray-100 px-2 py-1 rounded">{{ finding.file }}:{{ finding.line }}</code>
                </div>
                <div class="flex gap-2 ml-4">
                  <button
                    @click="viewFinding(finding)"
                    class="text-xs px-2 py-1 text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Details
                  </button>
                  <button
                    v-if="finding.fixable"
                    @click="autoFix(finding)"
                    class="text-xs px-2 py-1 text-green-600 hover:text-green-800 font-medium"
                  >
                    Fix
                  </button>
                </div>
              </div>
            </div>
            <button
              v-if="toolFindings.length > 10 && expandedTool !== tool"
              @click="expandedTool = tool"
              class="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Show all {{ toolFindings.length }} findings →
            </button>
            <button
              v-else-if="expandedTool === tool && toolFindings.length > 10"
              @click="expandedTool = null"
              class="text-sm text-gray-600 hover:text-gray-700 font-medium"
            >
              Show less
            </button>
          </div>
        </div>
      </div>

      <!-- Default Table View -->
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" @click="sortBy('severity')">
                Severity
                <svg v-if="sortField === 'severity'" class="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="sortOrder === 1 ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'" />
                </svg>
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" @click="sortBy('title')">
                Title
                <svg v-if="sortField === 'title'" class="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="sortOrder === 1 ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'" />
                </svg>
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tool</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="finding in paginatedFindings"
              :key="finding.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getSeverityBadgeClass(finding.severity)">
                  {{ finding.severity }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm font-medium text-gray-900">{{ finding.title }}</div>
                <div class="text-sm text-gray-500">{{ finding.description }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span v-if="finding.type" class="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">{{ finding.type }}</span>
                <span v-else class="text-xs text-gray-400">-</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <code class="text-sm bg-gray-100 px-2 py-1 rounded">{{ finding.file }}:{{ finding.line }}</code>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                {{ finding.tool }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <button
                  @click="viewFinding(finding)"
                  class="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Details
                </button>
                <button
                  v-if="finding.fixable"
                  @click="autoFix(finding)"
                  class="ml-4 text-green-600 hover:text-green-800 font-medium"
                >
                  Auto Fix
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="mt-4 flex justify-between items-center">
        <div class="text-sm text-gray-700">
          Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ Math.min(currentPage * pageSize, filteredFindings.length) }} of {{ filteredFindings.length }} results
        </div>
        <div class="flex gap-2">
          <button
            @click="currentPage = Math.max(1, currentPage - 1)"
            :disabled="currentPage === 1"
            class="btn btn-secondary disabled:opacity-50"
          >
            Previous
          </button>
          <button
            @click="currentPage = Math.min(totalPages, currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="btn btn-secondary disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Finding Detail Modal -->
    <div
      v-if="showDetailDialog"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="showDetailDialog = false"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200">
          <div class="flex justify-between items-start">
            <h3 class="text-xl font-semibold text-gray-900">{{ selectedFinding?.title }}</h3>
            <button
              @click="showDetailDialog = false"
              class="text-gray-400 hover:text-gray-600"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div v-if="selectedFinding" class="p-6 space-y-4">
          <div>
            <span class="font-medium text-gray-700">Severity:</span>
            <span :class="getSeverityBadgeClass(selectedFinding.severity)" class="ml-2">
              {{ selectedFinding.severity }}
            </span>
          </div>
          <div>
            <span class="font-medium text-gray-700">File:</span>
            <code class="ml-2 bg-gray-100 px-2 py-1 rounded">{{ selectedFinding.file }}:{{ selectedFinding.line }}</code>
          </div>
          <div>
            <span class="font-medium text-gray-700">Tool:</span>
            <span class="ml-2 text-gray-600">{{ selectedFinding.tool }}</span>
          </div>
          <div>
            <span class="font-medium text-gray-700">Description:</span>
            <p class="mt-2 text-gray-600">{{ selectedFinding.description }}</p>
          </div>
          <div v-if="selectedFinding.fixable" class="pt-4 border-t border-gray-200">
            <button
              @click="autoFix(selectedFinding)"
              class="btn btn-primary"
            >
              <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Auto Fix
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { scanService } from '../services/scanService'
import type { ScanResults, AnalysisResult, Finding, TopFix } from '../types'

interface Props {
  results: ScanResults
  analysis: AnalysisResult | null
}

const props = defineProps<Props>()

const selectedSeverities = ref<string[]>([])
const searchText = ref<string>('')
const showDetailDialog = ref<boolean>(false)
const selectedFinding = ref<Finding | null>(null)
const sortField = ref<string>('severity')
const sortOrder = ref<number>(-1)
const viewMode = ref<'all' | 'by-category' | 'by-tool'>('all')
const expandedCategory = ref<string | null>(null)
const expandedTool = ref<string | null>(null)
const currentPage = ref<number>(1)
const pageSize = ref<number>(20)

// Categorize findings by type
const findingsByCategory = computed(() => {
  const categories: Record<string, Finding[]> = {
    'SAST': [],
    'SECRET': [],
    'DEPENDENCY': [],
    'IAC': [],
    'CONTAINER': [],
    'Other': []
  }
  
  props.results.findings?.forEach(finding => {
    const type = finding.type?.toUpperCase() || 'Other'
    if (categories[type]) {
      categories[type].push(finding)
    } else {
      categories['Other'].push(finding)
    }
  })
  
  // Sort each category by severity
  Object.keys(categories).forEach(cat => {
    categories[cat].sort((a, b) => {
      const severityOrder: Record<string, number> = { 'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 }
      return (severityOrder[a.severity] || 4) - (severityOrder[b.severity] || 4)
    })
  })
  
  return categories
})

// Group findings by tool
const findingsByTool = computed(() => {
  const tools: Record<string, Finding[]> = {}
  
  props.results.findings?.forEach(finding => {
    if (!tools[finding.tool]) {
      tools[finding.tool] = []
    }
    tools[finding.tool].push(finding)
  })
  
  // Sort each tool's findings by severity
  Object.keys(tools).forEach(tool => {
    tools[tool].sort((a, b) => {
      const severityOrder: Record<string, number> = { 'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 }
      return (severityOrder[a.severity] || 4) - (severityOrder[b.severity] || 4)
    })
  })
  
  return tools
})

const getCategoryIcon = (category: string): string => {
  const icons: Record<string, string> = {
    'SAST': '🔍',
    'SECRET': '🔐',
    'DEPENDENCY': '📦',
    'IAC': '🏗️',
    'CONTAINER': '🐳',
    'Other': '📋'
  }
  return icons[category] || '📋'
}

const getCategoryBadgeClass = (category: string): string => {
  const classes: Record<string, string> = {
    'SAST': 'badge badge-medium',
    'SECRET': 'badge badge-critical',
    'DEPENDENCY': 'badge badge-high',
    'IAC': 'badge badge-medium',
    'CONTAINER': 'badge badge-high',
    'Other': 'badge badge-low'
  }
  return classes[category] || 'badge badge-low'
}

const getCategoryStats = (findings: Finding[]): string => {
  const critical = findings.filter(f => f.severity === 'CRITICAL').length
  const high = findings.filter(f => f.severity === 'HIGH').length
  return `${critical}C ${high}H`
}

const showAllCategory = (category: string) => {
  expandedCategory.value = expandedCategory.value === category ? null : category
  viewMode.value = 'all'
}

const showAllTool = (tool: string) => {
  expandedTool.value = expandedTool.value === tool ? null : tool
  viewMode.value = 'all'
}

const filteredFindings = computed(() => {
  let findings = props.results.findings || []
  
  if (selectedSeverities.value.length > 0) {
    findings = findings.filter(f => 
      selectedSeverities.value.includes(f.severity)
    )
  }
  
  if (searchText.value) {
    const search = searchText.value.toLowerCase()
    findings = findings.filter(f => 
      f.title.toLowerCase().includes(search) ||
      f.description.toLowerCase().includes(search) ||
      f.file.toLowerCase().includes(search)
    )
  }
  
  // Sort
  findings = [...findings].sort((a, b) => {
    const aVal = a[sortField.value as keyof Finding]
    const bVal = b[sortField.value as keyof Finding]
    if (aVal < bVal) return sortOrder.value
    if (aVal > bVal) return -sortOrder.value
    return 0
  })
  
  return findings
})

const totalPages = computed(() => Math.ceil(filteredFindings.value.length / pageSize.value))

const paginatedFindings = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredFindings.value.slice(start, end)
})

const getSeverityBadgeClass = (severity: string): string => {
  const classes: Record<string, string> = {
    'CRITICAL': 'badge badge-critical',
    'HIGH': 'badge badge-high',
    'MEDIUM': 'badge badge-medium',
    'LOW': 'badge badge-low'
  }
  return classes[severity] || 'badge badge-medium'
}

const sortBy = (field: string): void => {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 1 ? -1 : 1
  } else {
    sortField.value = field
    sortOrder.value = -1
  }
  currentPage.value = 1
}

const viewFinding = (finding: Finding): void => {
  selectedFinding.value = finding
  showDetailDialog.value = true
}

const viewFix = (fix: TopFix): void => {
  const finding: Finding = {
    id: 'fix-' + fix.file + '-' + fix.line,
    title: fix.title,
    description: fix.description,
    file: fix.file,
    line: fix.line,
    severity: 'HIGH',
    tool: 'dso',
    fixable: true,
    exploitable: false
  }
  viewFinding(finding)
}

const executeFix = async (fix: TopFix): Promise<void> => {
  const confirmed = confirm(
    `Apply fix for:\n\n` +
    `${fix.title}\n` +
    `File: ${fix.file}:${fix.line}\n\n` +
    `This will modify your codebase. Continue?`
  )

  if (!confirmed) {
    return
  }

  emit('toast', 'loading', 'Applying fix', `Fixing ${fix.title}...`)

  try {
    await scanService.autoFix({
      id: 'fix-' + fix.file + '-' + fix.line,
      title: fix.title,
      description: fix.description,
      file: fix.file,
      line: fix.line,
      severity: 'HIGH',
      tool: 'dso',
      fixable: true,
      exploitable: false
    })
    emit('toast', 'success', 'Fix applied', `Successfully fixed ${fix.title}`)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    emit('toast', 'error', 'Fix failed', errorMessage)
  }
}

const emit = defineEmits<{
  toast: [type: 'success' | 'error' | 'info' | 'warning' | 'loading', title: string, message?: string]
}>()

const exportResults = async (format: 'json' | 'csv'): Promise<void> => {
  try {
    await scanService.exportResults(props.results, format)
    emit('toast', 'success', 'Export successful', `Results exported as ${format.toUpperCase()}`)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    emit('toast', 'error', 'Export failed', errorMessage)
  }
}

const autoFix = async (finding: Finding): Promise<void> => {
  if (!finding.fixable) {
    emit('toast', 'warning', 'Not fixable', 'This finding cannot be automatically fixed.')
    return
  }

  // Show confirmation dialog
  const confirmed = confirm(
    `Apply automatic fix for:\n\n` +
    `${finding.title}\n` +
    `File: ${finding.file}:${finding.line}\n\n` +
    `This will modify your codebase. Continue?`
  )

  if (!confirmed) {
    return
  }

  emit('toast', 'loading', 'Applying fix', `Fixing ${finding.title}...`)

  try {
    await scanService.autoFix(finding)
    
    // Save fix to Supabase if configured
    const { supabaseService } = await import('../services/supabaseService')
    if (supabaseService.isConfigured()) {
      try {
        const user = await supabaseService.getCurrentUser()
        if (user && props.results) {
          // Find the scan ID from context (would need to be passed as prop in real implementation)
          // For now, we'll just log it
          console.log('Fix applied, would save to Supabase')
        }
      } catch (err) {
        console.warn('Failed to save fix to Supabase:', err)
      }
    }
    
    emit('toast', 'success', 'Fix applied', `Successfully fixed ${finding.title}`)
    
    // Close dialog after successful fix
    showDetailDialog.value = false
    
    // Optionally refresh the scan results
    // You could trigger a re-scan here if needed
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    emit('toast', 'error', 'Fix failed', errorMessage)
  }
}
</script>
