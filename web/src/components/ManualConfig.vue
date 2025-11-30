<template>
  <div class="space-y-6">
    <div class="card p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Configuration Manuelle des Outils</h3>
      <p class="text-sm text-gray-600 mb-6">
        Certains outils nécessitent une configuration manuelle. Suivez les instructions ci-dessous.
      </p>

      <!-- Tool Configurations -->
      <div class="space-y-6">
        <div
          v-for="tool in tools"
          :key="tool.id"
          class="border border-gray-200 rounded-lg p-6"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h4 class="font-semibold text-gray-900">{{ tool.name }}</h4>
                <p class="text-sm text-gray-500">{{ tool.description }}</p>
              </div>
            </div>
            <span
              class="text-xs font-semibold px-2 py-1 rounded-full"
              :class="tool.configured ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'"
            >
              {{ tool.configured ? 'Configuré' : 'À configurer' }}
            </span>
          </div>

          <div v-if="!tool.configured" class="mt-4">
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <h5 class="font-medium text-yellow-900 mb-2">Instructions de configuration:</h5>
              <ol class="list-decimal list-inside space-y-2 text-sm text-yellow-800">
                <li v-for="(step, idx) in tool.steps" :key="idx">{{ step }}</li>
              </ol>
            </div>

            <div v-if="tool.configFile" class="mb-4">
              <h5 class="font-medium text-gray-900 mb-2">Fichier de configuration:</h5>
              <div class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                <pre class="text-xs"><code>{{ tool.configFile }}</code></pre>
              </div>
              <button
                @click="copyConfig(tool.configFile)"
                class="mt-2 text-sm text-emerald-600 hover:text-emerald-800 font-medium"
              >
                Copier la configuration
              </button>
            </div>

            <div v-if="tool.environmentVars && tool.environmentVars.length > 0" class="mb-4">
              <h5 class="font-medium text-gray-900 mb-2">Variables d'environnement:</h5>
              <div class="space-y-2">
                <div
                  v-for="env in tool.environmentVars"
                  :key="env.name"
                  class="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                >
                  <div>
                    <span class="font-mono text-sm text-gray-900">{{ env.name }}</span>
                    <p class="text-xs text-gray-600 mt-1">{{ env.description }}</p>
                  </div>
                  <code class="text-xs bg-gray-200 px-2 py-1 rounded">{{ env.value }}</code>
                </div>
              </div>
            </div>

            <button
              @click="markAsConfigured(tool)"
              class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Marquer comme configuré
            </button>
          </div>

          <div v-else class="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="text-sm font-medium text-green-900">Cet outil est correctement configuré</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Tool {
  id: string
  name: string
  description: string
  configured: boolean
  steps?: string[]
  configFile?: string
  environmentVars?: Array<{
    name: string
    description: string
    value: string
  }>
}

const tools = ref<Tool[]>([
  {
    id: 'trivy',
    name: 'Trivy',
    description: 'Scanner de vulnérabilités complet',
    configured: false,
    steps: [
      'Installer Trivy via brew ou le script d\'installation',
      'Vérifier que Trivy est dans le PATH: `trivy --version`',
      'Configurer les bases de données si nécessaire'
    ],
    environmentVars: [
      {
        name: 'TRIVY_CACHE_DIR',
        description: 'Répertoire de cache pour Trivy',
        value: '~/.cache/trivy'
      }
    ]
  },
  {
    id: 'gitleaks',
    name: 'Gitleaks',
    description: 'Détecteur de secrets',
    configured: false,
    steps: [
      'Installer Gitleaks',
      'Créer un fichier .gitleaksignore si nécessaire',
      'Configurer les règles personnalisées'
    ],
    configFile: `# .gitleaksignore
node_modules/
vendor/
*.log
dist/
build/`
  },
  {
    id: 'snyk',
    name: 'Snyk',
    description: 'Scanner de dépendances',
    configured: false,
    steps: [
      'Installer Snyk: `npm install -g snyk`',
      'S\'authentifier: `snyk auth`',
      'Configurer le token API si nécessaire'
    ],
    environmentVars: [
      {
        name: 'SNYK_TOKEN',
        description: 'Token d\'API Snyk',
        value: 'votre-token-ici'
      }
    ]
  }
])

const copyConfig = (config: string) => {
  navigator.clipboard.writeText(config)
  alert('Configuration copiée dans le presse-papiers!')
}

const markAsConfigured = (tool: Tool) => {
  tool.configured = true
  // TODO: Save to backend
}

onMounted(async () => {
  await loadToolConfigs()
})

const loadToolConfigs = async () => {
  // TODO: Load from API
}
</script>

