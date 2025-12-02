<template>
  <div class="space-y-6">
    <!-- KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        v-for="kpi in kpis"
        :key="kpi.id"
        class="card p-6 bg-gradient-to-br from-white to-slate-50 border border-slate-200 hover:shadow-lg transition-all"
      >
        <div class="flex items-center justify-between mb-4">
          <div class="p-3 rounded-lg" :class="kpi.bgColor">
            <component :is="kpi.icon" class="w-6 h-6" :class="kpi.iconColor" />
          </div>
          <span
            class="text-xs font-semibold px-2 py-1 rounded-full"
            :class="kpi.trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
          >
            {{ kpi.trend > 0 ? '↑' : '↓' }} {{ Math.abs(kpi.trend) }}%
          </span>
        </div>
        <h3 class="text-sm font-medium text-gray-600 mb-1">{{ kpi.label }}</h3>
        <p class="text-2xl font-bold text-gray-900">{{ kpi.value }}</p>
        <p class="text-xs text-gray-500 mt-1">{{ kpi.description }}</p>
      </div>
    </div>

    <!-- SLO Status -->
    <div class="card p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Service Level Objectives (SLO)</h3>
      <div class="space-y-4">
        <div
          v-for="slo in slos"
          :key="slo.id"
          class="border border-gray-200 rounded-lg p-4"
        >
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-3">
              <div class="w-3 h-3 rounded-full" :class="slo.status === 'healthy' ? 'bg-green-500' : slo.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'"></div>
              <span class="font-medium text-gray-900">{{ slo.name }}</span>
            </div>
            <span class="text-sm font-semibold" :class="slo.status === 'healthy' ? 'text-green-600' : slo.status === 'warning' ? 'text-yellow-600' : 'text-red-600'">
              {{ slo.current }}% / {{ slo.target }}%
            </span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              class="h-2 rounded-full transition-all duration-500"
              :class="slo.status === 'healthy' ? 'bg-green-500' : slo.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'"
              :style="{ width: `${Math.min((slo.current / slo.target) * 100, 100)}%` }"
            ></div>
          </div>
          <p class="text-xs text-gray-600">{{ slo.description }}</p>
        </div>
      </div>
    </div>

    <!-- Charts Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Service Status Over Time -->
      <div class="card p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Statut des Services (24h)</h3>
        <div class="h-64">
          <Line :data="serviceStatusData" :options="chartOptions" />
        </div>
      </div>

      <!-- Resource Usage -->
      <div class="card p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Utilisation des Ressources</h3>
        <div class="h-64">
          <Bar :data="resourceUsageData" :options="chartOptions" />
        </div>
      </div>

      <!-- Scan Activity -->
      <div class="card p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Activité des Scans</h3>
        <div class="h-64">
          <Doughnut :data="scanActivityData" :options="chartOptions" />
        </div>
      </div>

      <!-- Findings Trend -->
      <div class="card p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Tendance des Vulnérabilités</h3>
        <div class="h-64">
          <Line :data="findingsTrendData" :options="chartOptions" />
        </div>
      </div>
    </div>

    <!-- Service Health Table -->
    <div class="card p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Santé des Services</h3>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uptime</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Latence</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Erreurs</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="service in services" :key="service.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-3">
                  <div class="w-2 h-2 rounded-full" :class="service.status === 'healthy' ? 'bg-green-500' : service.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'"></div>
                  <span class="font-medium text-gray-900">{{ service.name }}</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-2 py-1 text-xs font-semibold rounded-full"
                  :class="service.status === 'healthy' ? 'bg-green-100 text-green-800' : service.status === 'degraded' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'"
                >
                  {{ service.status === 'healthy' ? 'Opérationnel' : service.status === 'degraded' ? 'Dégradé' : 'Hors service' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ service.uptime }}%</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ service.latency }}ms</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm" :class="service.errors > 0 ? 'text-red-600 font-semibold' : 'text-gray-600'">
                {{ service.errors }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <button
                  @click="diagnoseService(service)"
                  class="text-emerald-600 hover:text-emerald-800 font-medium"
                >
                  Diagnostiquer
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Line, Bar, Doughnut } from 'vue-chartjs'
import { monitoringService } from '../services/monitoringService'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

// Icon components - Used in template via component :is
// @ts-ignore - Used in template via kpi.icon
const UptimeIcon = {
  template: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>'
} as const

const ScansIcon = {
  template: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>'
} as const

const FindingsIcon = {
  template: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>'
} as const

const ResponseIcon = {
  template: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>'
} as const

interface KPI {
  id: string
  label: string
  value: string | number
  description: string
  trend: number
  bgColor: string
  iconColor: string
  icon: any
}

interface SLO {
  id: string
  name: string
  current: number
  target: number
  status: 'healthy' | 'warning' | 'critical'
  description: string
}

interface Service {
  id: string
  name: string
  status: 'healthy' | 'degraded' | 'down'
  uptime: number
  latency: number
  errors: number
}

const kpis = ref<KPI[]>([
  {
    id: 'uptime',
    label: 'Uptime Global',
    value: '99.9%',
    description: 'Sur les 30 derniers jours',
    trend: 0.1,
    bgColor: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
            icon: {
              template: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>'
            }
  },
  {
    id: 'scans',
    label: 'Scans Exécutés',
    value: 1247,
    description: 'Ce mois',
    trend: 12.5,
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
    icon: ScansIcon
  },
  {
    id: 'findings',
    label: 'Vulnérabilités',
    value: 342,
    description: 'Total actif',
    trend: -8.3,
    bgColor: 'bg-red-100',
    iconColor: 'text-red-600',
    icon: FindingsIcon
  },
  {
    id: 'response',
    label: 'Temps de Réponse',
    value: '145ms',
    description: 'Moyenne',
    trend: -5.2,
    bgColor: 'bg-purple-100',
    iconColor: 'text-purple-600',
    icon: ResponseIcon
  }
])

const slos = ref<SLO[]>([
  {
    id: 'availability',
    name: 'Disponibilité',
    current: 99.9,
    target: 99.5,
    status: 'healthy',
    description: 'Objectif: 99.5% de disponibilité'
  },
  {
    id: 'latency',
    name: 'Latence P95',
    current: 98,
    target: 95,
    status: 'healthy',
    description: 'Objectif: 95% des requêtes < 200ms'
  },
  {
    id: 'error-rate',
    name: 'Taux d\'Erreur',
    current: 0.05,
    target: 0.1,
    status: 'healthy',
    description: 'Objectif: < 0.1% d\'erreurs'
  }
])

interface ServiceWithId extends Service {
  id: string
}

const services = ref<ServiceWithId[]>([
  { id: '1', name: 'DSO CLI', status: 'healthy', uptime: 99.9, latency: 45, errors: 0 },
  { id: '2', name: 'Ollama', status: 'healthy', uptime: 99.8, latency: 120, errors: 0 },
  { id: '3', name: 'Trivy', status: 'degraded', uptime: 98.5, latency: 250, errors: 2 },
  { id: '4', name: 'Grype', status: 'healthy', uptime: 99.7, latency: 180, errors: 0 },
  { id: '5', name: 'Gitleaks', status: 'healthy', uptime: 99.9, latency: 95, errors: 0 }
])

const serviceStatusData = computed(() => ({
  labels: Array.from({ length: 24 }, (_, i) => `${i}h`),
  datasets: [
    {
      label: 'Services Opérationnels',
      data: Array.from({ length: 24 }, () => Math.floor(Math.random() * 3) + 3),
      borderColor: 'rgb(16, 185, 129)',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      fill: true,
      tension: 0.4
    }
  ]
}))

const resourceUsageData = computed(() => ({
  labels: ['CPU', 'Mémoire', 'Disque', 'Réseau'],
  datasets: [
    {
      label: 'Utilisation (%)',
      data: [45, 62, 38, 72],
      backgroundColor: [
        'rgba(16, 185, 129, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(236, 72, 153, 0.8)'
      ]
    }
  ]
}))

const scanActivityData = computed(() => ({
  labels: ['Réussis', 'Échoués', 'En cours'],
  datasets: [
    {
      data: [85, 10, 5],
      backgroundColor: [
        'rgba(16, 185, 129, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(251, 191, 36, 0.8)'
      ]
    }
  ]
}))

const findingsTrendData = computed(() => ({
  labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
  datasets: [
    {
      label: 'Critiques',
      data: [12, 15, 8, 10, 14, 9, 11],
      borderColor: 'rgb(239, 68, 68)',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      fill: true
    },
    {
      label: 'Élevées',
      data: [45, 52, 38, 42, 48, 40, 44],
      borderColor: 'rgb(251, 191, 36)',
      backgroundColor: 'rgba(251, 191, 36, 0.1)',
      fill: true
    },
    {
      label: 'Moyennes',
      data: [120, 135, 110, 125, 130, 115, 122],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const
    }
  }
}

const diagnoseService = async (service: Service) => {
  try {
    console.log('Diagnosing service:', service.name)
    
    // Call API endpoint for service diagnosis
    const response = await fetch('/api/monitoring/services/diagnose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serviceName: service.name, status: service.status })
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.diagnosis) {
        alert(`Diagnostic pour ${service.name}:\n\n${data.diagnosis}`)
      } else {
        alert(`Diagnostic en cours pour ${service.name}...`)
      }
    } else {
      throw new Error('Failed to diagnose service')
    }
  } catch (error) {
    console.error('Failed to diagnose service:', error)
    alert(`Erreur lors du diagnostic: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
  }
}

onMounted(async () => {
  // Load monitoring data
  await loadMonitoringData()
})

const loadMonitoringData = async () => {
  try {
    const [kpisData, slosData, servicesData] = await Promise.all([
      monitoringService.getKPIs(),
      monitoringService.getSLOs(),
      monitoringService.getServices()
    ])
    
    // Update KPIs
    kpis.value[0].value = kpisData.uptime.value
    kpis.value[0].trend = kpisData.uptime.trend
    kpis.value[1].value = kpisData.scans.value
    kpis.value[1].trend = kpisData.scans.trend
    kpis.value[2].value = kpisData.findings.value
    kpis.value[2].trend = kpisData.findings.trend
    kpis.value[3].value = kpisData.response.value
    kpis.value[3].trend = kpisData.response.trend
    
    // Update SLOs
    slos.value = slosData
    
    // Update services (add id if missing)
    services.value = servicesData.map((s, idx) => ({
      ...s,
      id: s.id || `service-${idx + 1}`
    }))
  } catch (error) {
    console.error('Failed to load monitoring data:', error)
  }
}
</script>

