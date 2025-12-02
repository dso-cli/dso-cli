<template>
  <aside :class="[
    'fixed left-0 top-0 h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white transition-all duration-300 z-50 shadow-2xl border-r border-slate-700/50',
    isOpen ? 'w-64' : 'w-20'
  ]">
    <!-- Logo and Toggle -->
    <div class="flex items-center justify-between p-4 border-b border-slate-700">
      <div v-if="isOpen" class="flex items-center gap-3">
        <div class="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div>
          <h1 class="text-lg font-bold">DSO</h1>
          <p class="text-xs text-slate-400">DevSecOps Oracle</p>
        </div>
      </div>
      <button
        @click="toggle"
        class="p-2 rounded-lg hover:bg-slate-700 transition-colors"
      >
        <svg v-if="isOpen" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto py-4">
      <div class="space-y-1 px-2">
        <button
          v-for="item in navItems"
          :key="item.id"
          @click="selectItem(item.id)"
          :class="[
            'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden',
            activeItem === item.id
              ? 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20'
              : 'text-slate-300 hover:bg-slate-700/50 hover:text-white hover:shadow-md'
          ]"
        >
          <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
          <span v-if="isOpen" class="font-medium">{{ item.label }}</span>
          <span v-if="item.badge && isOpen" class="ml-auto bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full">
            {{ item.badge }}
          </span>
        </button>
      </div>
    </nav>

    <!-- Footer -->
    <div class="p-4 border-t border-slate-700">
      <div v-if="isOpen" class="text-xs text-slate-400 text-center">
        <p>Version {{ version }}</p>
        <p class="mt-1">Powered by Ollama</p>
      </div>
      <div v-else class="flex justify-center">
        <div class="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
      </div>
    </div>
  </aside>

  <!-- Overlay for mobile -->
  <div
    v-if="isOpen"
    @click="close"
    class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
  ></div>
</template>

<script setup lang="ts">
import { ref, watch, defineEmits, defineProps, onMounted } from 'vue'
import { scanService } from '../services/scanService'

interface NavItem {
  id: string
  label: string
  icon: any
  badge?: string
}

const props = defineProps<{
  activeItem?: string
}>()

const emit = defineEmits(['select'])

const isOpen = ref(true)
const version = ref('0.1.0')

// SVG Icons as components
const DashboardIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  `
}

const ScanIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  `
}

const HistoryIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  `
}

const ChatIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  `
}

const ConfigIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  `
}

const RepoIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  `
}

const MonitoringIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  `
}

const IntegrationsIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  `
}

const AutoFixIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  `
}

const ManualConfigIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  `
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
  { id: 'scan', label: 'New Scan', icon: ScanIcon },
  { id: 'monitoring', label: 'Monitoring', icon: MonitoringIcon },
  { id: 'integrations', label: 'Integrations', icon: IntegrationsIcon },
  { id: 'history', label: 'History', icon: HistoryIcon },
  { id: 'chat', label: 'AI Assistant', icon: ChatIcon, badge: 'New' },
  { id: 'autofix', label: 'Auto Fix', icon: AutoFixIcon },
  { id: 'manual-config', label: 'Manual Config', icon: ManualConfigIcon },
  { id: 'repos', label: 'Repositories', icon: RepoIcon },
  { id: 'config', label: 'Configuration', icon: ConfigIcon }
]

const activeItem = ref(props.activeItem || 'dashboard')

const toggle = () => {
  isOpen.value = !isOpen.value
}

const close = () => {
  isOpen.value = false
}

const selectItem = (id: string) => {
  activeItem.value = id
  emit('select', id)
}

// Watch for external changes to activeItem
watch(() => props.activeItem, (newValue) => {
  if (newValue && newValue !== activeItem.value) {
    activeItem.value = newValue
  }
}, { immediate: true })

onMounted(async () => {
  try {
    const v = await scanService.getVersion()
    version.value = v
  } catch (error) {
    console.error('Failed to load version:', error)
  }
})
</script>
