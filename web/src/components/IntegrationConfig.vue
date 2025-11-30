<template>
  <div class="space-y-6">
    <!-- Integration-specific configuration -->
    <div v-if="integration.id === 'datadog'">
      <h4 class="font-semibold text-gray-900 mb-4">Configuration Datadog</h4>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">API Key</label>
          <input
            v-model="config.apiKey"
            type="password"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="dd-api-key-xxxxx"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Application Key</label>
          <input
            v-model="config.appKey"
            type="password"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="dd-app-key-xxxxx"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Site</label>
          <select
            v-model="config.site"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="datadoghq.com">US (datadoghq.com)</option>
            <option value="datadoghq.eu">EU (datadoghq.eu)</option>
            <option value="us3.datadoghq.com">US3 (us3.datadoghq.com)</option>
            <option value="us5.datadoghq.com">US5 (us5.datadoghq.com)</option>
          </select>
        </div>
      </div>
    </div>

    <div v-else-if="integration.id === 'slack'">
      <h4 class="font-semibold text-gray-900 mb-4">Configuration Slack</h4>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Webhook URL</label>
          <input
            v-model="config.webhookUrl"
            type="url"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="https://hooks.slack.com/services/..."
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Channel</label>
          <input
            v-model="config.channel"
            type="text"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="#security-alerts"
          />
        </div>
      </div>
    </div>

    <div v-else-if="integration.id === 'discord'">
      <h4 class="font-semibold text-gray-900 mb-4">Configuration Discord</h4>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Webhook URL</label>
          <input
            v-model="config.webhookUrl"
            type="url"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="https://discord.com/api/webhooks/..."
          />
        </div>
      </div>
    </div>

    <div v-else-if="integration.id === 's3' || integration.id === 'aws'">
      <h4 class="font-semibold text-gray-900 mb-4">Configuration AWS</h4>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Access Key ID</label>
          <input
            v-model="config.accessKeyId"
            type="text"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="AKIAIOSFODNN7EXAMPLE"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Secret Access Key</label>
          <input
            v-model="config.secretAccessKey"
            type="password"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
          />
        </div>
        <div v-if="integration.id === 's3'">
          <label class="block text-sm font-medium text-gray-700 mb-2">Bucket Name</label>
          <input
            v-model="config.bucketName"
            type="text"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="dso-scan-results"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Region</label>
          <input
            v-model="config.region"
            type="text"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="us-east-1"
          />
        </div>
      </div>
    </div>

    <div v-else-if="integration.id === 'azure'">
      <h4 class="font-semibold text-gray-900 mb-4">Configuration Azure</h4>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Tenant ID</label>
          <input
            v-model="config.tenantId"
            type="text"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Client ID</label>
          <input
            v-model="config.clientId"
            type="text"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Client Secret</label>
          <input
            v-model="config.clientSecret"
            type="password"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          />
        </div>
      </div>
    </div>

    <div v-else-if="integration.id === 'grafana'">
      <h4 class="font-semibold text-gray-900 mb-4">Configuration Grafana</h4>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">URL</label>
          <input
            v-model="config.url"
            type="url"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="https://grafana.example.com"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">API Key</label>
          <input
            v-model="config.apiKey"
            type="password"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="eyJrIjoi..."
          />
        </div>
      </div>
    </div>

    <div v-else-if="integration.id === 'prometheus'">
      <h4 class="font-semibold text-gray-900 mb-4">Configuration Prometheus</h4>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">URL</label>
          <input
            v-model="config.url"
            type="url"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="http://prometheus:9090"
          />
        </div>
      </div>
    </div>

    <!-- Test Connection -->
    <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
      <button
        @click="$emit('cancel')"
        class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
      >
        Annuler
      </button>
      <button
        @click="testConnection"
        class="px-4 py-2 text-emerald-700 bg-emerald-100 rounded-lg hover:bg-emerald-200 transition-colors"
        :disabled="testing"
      >
        {{ testing ? 'Test en cours...' : 'Tester la connexion' }}
      </button>
      <button
        @click="save"
        class="px-4 py-2 text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
      >
        Enregistrer
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { integrationService } from '../services/integrationService'

interface Props {
  integration: {
    id: string
    name: string
  }
}

const props = defineProps<Props>()
const emit = defineEmits(['save', 'cancel'])

const config = ref<any>({})
const testing = ref(false)

const testConnection = async () => {
  testing.value = true
  try {
    await integrationService.testIntegration(props.integration.id, config.value)
    alert('Connexion réussie!')
  } catch (error) {
    alert(`Erreur: ${error instanceof Error ? error.message : 'Connexion échouée'}`)
  } finally {
    testing.value = false
  }
}

const save = () => {
  emit('save', config.value)
}
</script>

