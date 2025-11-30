<template>
  <div class="repo-selector">
    <div class="card">
      <div class="mb-6">
        <h2 class="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-2">
          Connect to Repository
        </h2>
        <p class="text-slate-600">Connect to GitHub or GitLab to scan your repositories</p>
      </div>

      <!-- Provider Selection -->
      <div class="grid grid-cols-2 gap-4 mb-6">
        <button
          @click="selectProvider('github')"
          :class="[
            'p-6 rounded-xl border-2 transition-all duration-300',
            selectedProvider === 'github'
              ? 'border-emerald-500 bg-emerald-50 shadow-lg scale-105'
              : 'border-slate-200 hover:border-emerald-300 hover:shadow-md'
          ]"
        >
          <div class="flex flex-col items-center gap-3">
            <svg class="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <span class="font-semibold text-slate-700">GitHub</span>
          </div>
        </button>

        <button
          @click="selectProvider('gitlab')"
          :class="[
            'p-6 rounded-xl border-2 transition-all duration-300',
            selectedProvider === 'gitlab'
              ? 'border-emerald-500 bg-emerald-50 shadow-lg scale-105'
              : 'border-slate-200 hover:border-emerald-300 hover:shadow-md'
          ]"
        >
          <div class="flex flex-col items-center gap-3">
            <svg class="w-12 h-12" fill="#E24329" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
            </svg>
            <span class="font-semibold text-slate-700">GitLab</span>
          </div>
        </button>
      </div>

      <!-- Authentication with Personal Access Token -->
      <div v-if="selectedProvider" class="mb-6">
        <div v-if="!isAuthenticated" class="space-y-4">
          <div class="p-6 bg-gradient-to-br from-blue-50 to-emerald-50 border-2 border-blue-200 rounded-xl">
            <div class="mb-4">
              <h3 class="text-lg font-semibold text-slate-800 mb-2">
                Authenticate with Personal Access Token
              </h3>
              <p class="text-sm text-slate-600 mb-4">
                Create a Personal Access Token on {{ selectedProvider === 'github' ? 'GitHub' : 'GitLab' }} and paste it below.
              </p>
              
              <div class="mb-4 p-3 bg-white rounded-lg border border-slate-200">
                <div class="flex items-start gap-2 mb-2">
                  <svg class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div class="text-sm text-slate-700">
                    <p class="font-semibold mb-1">How to create a token:</p>
                    <ol class="list-decimal list-inside space-y-1 ml-2">
                      <li v-if="selectedProvider === 'github'">
                        Go to <a href="https://github.com/settings/tokens" target="_blank" class="text-emerald-600 hover:underline font-medium">GitHub Settings → Developer settings → Personal access tokens</a>
                      </li>
                      <li v-else>
                        Go to <a href="https://gitlab.com/-/user_settings/personal_access_tokens" target="_blank" class="text-emerald-600 hover:underline font-medium">GitLab Settings → Access Tokens</a>
                      </li>
                      <li>Click "Generate new token"</li>
                      <li v-if="selectedProvider === 'github'">Select scopes: <code class="bg-slate-100 px-1 rounded">repo</code> (for private repos) or <code class="bg-slate-100 px-1 rounded">public_repo</code> (for public only)</li>
                      <li v-else>Select scopes: <code class="bg-slate-100 px-1 rounded">read_api</code> and <code class="bg-slate-100 px-1 rounded">read_repository</code></li>
                      <li>Copy the token and paste it below</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
            
            <form @submit.prevent="authenticate" class="space-y-3">
              <!-- Hidden username field for accessibility -->
              <input
                type="text"
                name="username"
                autocomplete="username"
                value=""
                style="position: absolute; left: -9999px; width: 1px; height: 1px;"
                tabindex="-1"
                aria-hidden="true"
              />
              <div>
                <label for="token-input" class="block text-sm font-medium text-slate-700 mb-2">
                  Personal Access Token
                </label>
                <div class="relative">
                  <input
                    id="token-input"
                    v-model="tokenInput"
                    :type="showToken ? 'text' : 'password'"
                    :placeholder="`Enter your ${selectedProvider === 'github' ? 'GitHub' : 'GitLab'} token`"
                    class="input pr-10"
                    autocomplete="new-password"
                    name="token"
                    required
                    minlength="10"
                  />
                  <button
                    @click.prevent="showToken = !showToken"
                    type="button"
                    class="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    tabindex="-1"
                  >
                    <svg v-if="showToken" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <button
                type="submit"
                :disabled="!tokenInput || tokenInput.length < 10"
                class="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Authenticate
              </button>
            </form>
          </div>
        </div>

        <div v-else class="p-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p class="font-semibold text-emerald-800">Connected to {{ selectedProvider === 'github' ? 'GitHub' : 'GitLab' }}</p>
                <p class="text-sm text-emerald-600">{{ userInfo?.login || userInfo?.username || 'Authenticated' }}</p>
              </div>
            </div>
            <button
              @click="disconnect"
              class="text-sm text-red-600 hover:text-red-700 font-medium px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>

      <!-- Repository List -->
      <div v-if="isAuthenticated" class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-slate-800">Select Repository</h3>
          <button
            @click="refreshRepos"
            :disabled="loadingRepos"
            class="text-sm text-emerald-600 hover:text-emerald-700 font-medium disabled:opacity-50"
          >
            <svg class="w-4 h-4 inline mr-1" :class="{ 'animate-spin': loadingRepos }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        <!-- Search -->
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search repositories..."
            class="input pl-10"
          />
          <svg class="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <!-- Repository List -->
        <div class="max-h-96 overflow-y-auto space-y-2">
          <div v-if="loadingRepos" class="text-center py-8">
            <div class="w-12 h-12 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p class="text-slate-600">Loading repositories...</p>
          </div>

          <div v-else-if="filteredRepos.length === 0" class="text-center py-8 text-slate-500">
            <p>No repositories found</p>
          </div>

          <button
            v-for="repo in filteredRepos"
            :key="repo.id"
            @click="selectRepo(repo)"
            :class="[
              'w-full p-4 rounded-xl border-2 text-left transition-all duration-200',
              selectedRepo?.id === repo.id
                ? 'border-emerald-500 bg-emerald-50 shadow-md'
                : 'border-slate-200 hover:border-emerald-300 hover:shadow-sm'
            ]"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <svg class="w-5 h-5 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                  </svg>
                  <span class="font-semibold text-slate-800">{{ repo.name }}</span>
                  <span v-if="repo.private" class="badge badge-medium text-xs">Private</span>
                </div>
                <p v-if="repo.description" class="text-sm text-slate-600 mb-2 line-clamp-2">{{ repo.description }}</p>
                <div class="flex items-center gap-4 text-xs text-slate-500">
                  <span v-if="repo.language" class="flex items-center gap-1">
                    <span class="w-3 h-3 rounded-full bg-emerald-500"></span>
                    {{ repo.language }}
                  </span>
                  <span class="flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    {{ repo.stargazers_count || repo.star_count || 0 }} stars
                  </span>
                  <span class="flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Updated {{ formatDate(repo.updated_at) }}
                  </span>
                </div>
              </div>
              <svg v-if="selectedRepo?.id === repo.id" class="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </button>
        </div>

        <!-- Scan Button -->
        <button
          v-if="selectedRepo"
          @click="scanRepo"
          :disabled="scanning"
          class="btn btn-primary w-full mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg v-if="!scanning" class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <svg v-else class="w-5 h-5 inline mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ scanning ? 'Scanning...' : `Scan ${selectedRepo.name}` }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { repoService, tokenStorage } from '../services/repoService'

interface Repo {
  id: number
  name: string
  full_name?: string
  description?: string
  private: boolean
  language?: string
  stargazers_count?: number
  star_count?: number
  updated_at: string
  clone_url?: string
  ssh_url?: string
}

const emit = defineEmits(['scan', 'toast'])

const selectedProvider = ref<'github' | 'gitlab' | null>(null)
const isAuthenticated = ref<boolean>(false)
const userInfo = ref<any>(null)
const repos = ref<Repo[]>([])
const loadingRepos = ref<boolean>(false)
const searchQuery = ref<string>('')
const selectedRepo = ref<Repo | null>(null)
const scanning = ref<boolean>(false)
const tokenInput = ref<string>('')
const showToken = ref<boolean>(false)

const filteredRepos = computed(() => {
  if (!searchQuery.value) return repos.value
  const query = searchQuery.value.toLowerCase()
  return repos.value.filter(repo =>
    repo.name.toLowerCase().includes(query) ||
    repo.description?.toLowerCase().includes(query)
  )
})

const selectProvider = (provider: 'github' | 'gitlab') => {
  selectedProvider.value = provider
  selectedRepo.value = null
  // Check if already authenticated
  checkAuthStatus()
}

const authenticate = async () => {
  try {
    if (!selectedProvider.value || !tokenInput.value) return
    
    // Store token in sessionStorage
    tokenStorage.set(selectedProvider.value, tokenInput.value)
    
    // Authenticate with backend
    if (!selectedProvider.value) return
    const success = await repoService.authenticate(selectedProvider.value, tokenInput.value)
    
    if (success) {
      isAuthenticated.value = true
      tokenInput.value = '' // Clear token from input
      await checkAuthStatus()
      await loadRepos()
      emit('toast', 'success', 'Authenticated', `Successfully connected to ${selectedProvider.value}`)
    } else {
      tokenStorage.remove(selectedProvider.value)
      throw new Error('Authentication failed')
    }
  } catch (error) {
    if (selectedProvider.value) {
      tokenStorage.remove(selectedProvider.value)
    }
    emit('toast', 'error', 'Authentication failed', error instanceof Error ? error.message : 'Invalid token')
    tokenInput.value = '' // Clear on error
  }
}

const checkAuthStatus = async () => {
  if (!selectedProvider.value) return
  
  // Check if token exists in sessionStorage
  const storedToken = tokenStorage.get(selectedProvider.value)
  if (storedToken) {
    try {
      const status = await repoService.checkAuth(selectedProvider.value)
      isAuthenticated.value = status.authenticated
      userInfo.value = status.user
      if (status.authenticated) {
        loadRepos()
      } else {
        // Token invalid, remove it
        tokenStorage.remove(selectedProvider.value)
      }
    } catch (error) {
      isAuthenticated.value = false
      tokenStorage.remove(selectedProvider.value)
    }
  } else {
    isAuthenticated.value = false
  }
}

const disconnect = async () => {
  try {
    if (!selectedProvider.value) return
    await repoService.disconnect(selectedProvider.value)
    tokenStorage.remove(selectedProvider.value)
    isAuthenticated.value = false
    userInfo.value = null
    repos.value = []
    selectedRepo.value = null
    tokenInput.value = ''
    emit('toast', 'success', 'Disconnected', `Disconnected from ${selectedProvider.value}`)
  } catch (error) {
    emit('toast', 'error', 'Disconnect failed', error instanceof Error ? error.message : 'Unknown error')
  }
}

const loadRepos = async () => {
  if (!selectedProvider.value || !isAuthenticated.value) return
  
  loadingRepos.value = true
  try {
    if (!selectedProvider.value) return
    repos.value = await repoService.listRepos(selectedProvider.value)
  } catch (error) {
    emit('toast', 'error', 'Failed to load repositories', error instanceof Error ? error.message : 'Unknown error')
  } finally {
    loadingRepos.value = false
  }
}

const refreshRepos = () => {
  loadRepos()
}

const selectRepo = (repo: Repo) => {
  selectedRepo.value = repo
}

const scanRepo = async () => {
  if (!selectedRepo.value || !selectedProvider.value) return
  
  scanning.value = true
  try {
    emit('scan', {
      provider: selectedProvider.value,
      repo: selectedRepo.value
    })
  } catch (error) {
    emit('toast', 'error', 'Scan failed', error instanceof Error ? error.message : 'Unknown error')
  } finally {
    scanning.value = false
  }
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  if (days < 365) return `${Math.floor(days / 30)} months ago`
  return `${Math.floor(days / 365)} years ago`
}

onMounted(() => {
  // Check if already authenticated on mount
  if (selectedProvider.value) {
    checkAuthStatus()
  }
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

