<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Intégrations</h2>
        <p class="text-gray-600 mt-1">Connectez DSO à vos outils de monitoring et de communication</p>
      </div>
      <button
        @click="showAddIntegration = true"
        class="btn btn-primary flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Ajouter une intégration
      </button>
    </div>

    <!-- Integration Categories -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="integration in integrations"
        :key="integration.id"
        class="card p-6 hover:shadow-lg transition-all cursor-pointer"
        @click="configureIntegration(integration)"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
              <img
                v-if="integration.logo"
                :src="integration.logo"
                :alt="integration.name"
                class="w-8 h-8"
              />
              <svg v-else class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">{{ integration.name }}</h3>
              <p class="text-sm text-gray-500">{{ integration.category }}</p>
            </div>
          </div>
          <div
            class="w-3 h-3 rounded-full"
            :class="integration.connected ? 'bg-green-500' : 'bg-gray-300'"
          ></div>
        </div>
        <p class="text-sm text-gray-600 mb-4">{{ integration.description }}</p>
        <div class="flex items-center justify-between">
          <span
            class="text-xs font-semibold px-2 py-1 rounded-full"
            :class="integration.connected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'"
          >
            {{ integration.connected ? 'Connecté' : 'Non connecté' }}
          </span>
          <button
            @click.stop="integration.connected ? disconnectIntegration(integration) : configureIntegration(integration)"
            class="text-sm font-medium text-emerald-600 hover:text-emerald-800"
          >
            {{ integration.connected ? 'Déconnecter' : 'Configurer' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Configuration Modal -->
    <div
      v-if="showAddIntegration || selectedIntegration"
      class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      @click.self="closeModal"
    >
      <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-bold text-gray-900">
              {{ selectedIntegration ? `Configurer ${selectedIntegration.name}` : 'Nouvelle Intégration' }}
            </h3>
            <button
              @click="closeModal"
              class="text-gray-400 hover:text-gray-600"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div class="p-6">
          <IntegrationConfig
            v-if="selectedIntegration"
            :integration="selectedIntegration"
            @save="handleSaveIntegration"
            @cancel="closeModal"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import IntegrationConfig from './IntegrationConfig.vue'
import { integrationService } from '../services/integrationService'

interface Integration {
  id: string
  name: string
  category: string
  description: string
  connected: boolean
  logo?: string
  config?: any
}

const integrations = ref<Integration[]>([
  {
    id: 'datadog',
    name: 'Datadog',
    category: 'Monitoring',
    description: 'Intégration avec Datadog pour le monitoring des services et métriques',
    connected: false,
    logo: 'https://www.svgrepo.com/show/354428/datadog.svg'
  },
  {
    id: 'incident-io',
    name: 'Incident.io',
    category: 'Incident Management',
    description: 'Gestion des incidents et alertes de sécurité',
    connected: false,
    logo: 'https://www.svgrepo.com/show/448221/incident.svg'
  },
  {
    id: 'slack',
    name: 'Slack',
    category: 'Communication',
    description: 'Notifications et alertes dans Slack',
    connected: false,
    logo: 'https://www.svgrepo.com/show/303299/slack-icon-logo.svg'
  },
  {
    id: 'discord',
    name: 'Discord',
    category: 'Communication',
    description: 'Notifications et alertes dans Discord',
    connected: false,
    logo: 'https://www.svgrepo.com/show/353728/discord-icon.svg'
  },
  {
    id: 's3',
    name: 'AWS S3',
    category: 'Storage',
    description: 'Stockage des résultats de scan dans S3',
    connected: false,
    logo: 'https://www.svgrepo.com/show/331348/aws-s3.svg'
  },
  {
    id: 'azure',
    name: 'Azure',
    category: 'Cloud',
    description: 'Intégration avec Azure pour le stockage et les services cloud',
    connected: false,
    logo: 'https://www.svgrepo.com/show/303181/azure-1-logo.svg'
  },
  {
    id: 'aws',
    name: 'AWS',
    category: 'Cloud',
    description: 'Intégration avec AWS pour les services cloud',
    connected: false,
    logo: 'https://www.svgrepo.com/show/303251/aws-logo.svg'
  },
  {
    id: 'grafana',
    name: 'Grafana',
    category: 'Monitoring',
    description: 'Visualisation des métriques et dashboards',
    connected: false,
    logo: 'https://www.svgrepo.com/show/303430/grafana-logo.svg'
  },
  {
    id: 'prometheus',
    name: 'Prometheus',
    category: 'Monitoring',
    description: 'Collecte et stockage des métriques',
    connected: false,
    logo: 'https://www.svgrepo.com/show/354428/prometheus.svg'
  },
  {
    id: 'froggy-git',
    name: 'Froggy Git',
    category: 'Version Control',
    description: 'Intégration avec Froggy Git pour la gestion de code',
    connected: false,
    logo: 'https://www.svgrepo.com/show/452091/git.svg'
  }
])

const showAddIntegration = ref(false)
const selectedIntegration = ref<Integration | null>(null)

const configureIntegration = (integration: Integration) => {
  selectedIntegration.value = integration
  showAddIntegration.value = false
}

const disconnectIntegration = async (integration: Integration) => {
  try {
    await integrationService.disconnectIntegration(integration.id)
    integration.connected = false
    integration.config = undefined
  } catch (error) {
    console.error('Failed to disconnect integration:', error)
    alert(`Erreur lors de la déconnexion: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
  }
}

const handleSaveIntegration = async (config: any) => {
  if (selectedIntegration.value) {
    selectedIntegration.value.connected = true
    selectedIntegration.value.config = config
  }
  closeModal()
}

const closeModal = () => {
  showAddIntegration.value = false
  selectedIntegration.value = null
}

onMounted(async () => {
  await loadIntegrations()
})

const loadIntegrations = async () => {
  try {
    const loaded = await integrationService.getIntegrations()
    // Merge with default integrations
    loaded.forEach(loadedInt => {
      const existing = integrations.value.find(i => i.id === loadedInt.id)
      if (existing) {
        existing.connected = loadedInt.connected
        existing.config = loadedInt.config
      }
    })
  } catch (error) {
    console.error('Failed to load integrations:', error)
  }
}
</script>

