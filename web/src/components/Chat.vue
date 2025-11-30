<template>
  <div class="flex flex-col h-full bg-gradient-to-br from-white via-emerald-50/30 to-blue-50/30 rounded-xl shadow-xl border border-slate-200/50 backdrop-blur-sm">
    <!-- Header -->
    <div class="flex items-center justify-between p-4 border-b border-slate-200/50 bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-emerald-500/10 backdrop-blur-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full flex items-center justify-center shadow-md">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div>
          <h3 class="font-semibold text-slate-900">Assistant IA DSO</h3>
          <p class="text-xs text-slate-600">Conseils et explications de sécurité</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <div :class="[
          'w-2 h-2 rounded-full',
          isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
        ]"></div>
        <span class="text-xs text-slate-600">{{ isConnected ? 'Connecté' : 'Déconnecté' }}</span>
      </div>
    </div>

    <!-- Messages -->
    <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-transparent via-slate-50/50 to-transparent">
      <!-- Welcome Message -->
      <div v-if="messages.length === 0" class="text-center py-8">
        <div class="w-16 h-16 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h4 class="text-lg font-semibold text-slate-900 mb-2">Bonjour ! Je suis votre assistant DSO</h4>
        <p class="text-sm text-slate-600 mb-6">Je peux vous aider à comprendre les vulnérabilités, proposer des solutions et donner des conseils de sécurité.</p>
        
        <!-- Quick Suggestions -->
        <div class="grid grid-cols-1 gap-2 max-w-md mx-auto">
          <button
            v-for="suggestion in quickSuggestions"
            :key="suggestion"
            @click="sendMessage(suggestion)"
            class="text-left px-4 py-3 bg-white rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all duration-200 text-sm text-slate-700"
          >
            <span class="font-medium">{{ suggestion }}</span>
          </button>
        </div>
      </div>

      <!-- Messages -->
      <div
        v-for="(message, index) in messages"
        :key="index"
        :class="[
          'flex gap-3',
          message.role === 'user' ? 'justify-end' : 'justify-start'
        ]"
      >
        <div v-if="message.role === 'assistant'" class="w-8 h-8 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        
        <div :class="[
          'max-w-[80%] rounded-2xl px-4 py-3 shadow-md transition-all duration-200',
          message.role === 'user'
            ? 'bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 text-white shadow-emerald-500/20'
            : 'bg-white/90 backdrop-blur-sm text-slate-900 border border-slate-200/50 shadow-slate-200/50'
        ]">
          <div 
            v-if="message.role === 'assistant'"
            class="text-sm prose prose-sm max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-strong:text-slate-900 prose-code:text-emerald-600 prose-code:bg-emerald-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-slate-100 prose-pre:border prose-pre:border-slate-200 prose-a:text-emerald-600 prose-a:no-underline hover:prose-a:underline"
            v-html="renderMarkdownInTemplate(message.content)"
          ></div>
          <div 
            v-else
            class="text-sm whitespace-pre-wrap"
          >{{ message.content }}</div>
          <div :class="[
            'text-xs mt-1',
            message.role === 'user' ? 'text-emerald-100' : 'text-slate-500'
          ]">
            {{ formatTime(message.timestamp) }}
          </div>
          
          <!-- Actions proposées -->
          <div v-if="message.role === 'assistant' && message.actions && message.actions.length > 0" class="mt-3 flex flex-wrap gap-2">
            <button
              v-for="(action, actionIndex) in message.actions"
              :key="actionIndex"
              @click="executeAction(action)"
              class="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-medium rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-1.5"
            >
              <svg v-if="action.icon === 'scan'" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <svg v-else-if="action.icon === 'fix'" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <svg v-else-if="action.icon === 'export'" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              {{ action.label }}
            </button>
          </div>
        </div>

        <div v-if="message.role === 'user'" class="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      </div>

      <!-- Typing Indicator -->
      <div v-if="isTyping" class="flex gap-3 justify-start">
        <div class="w-8 h-8 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div class="bg-white rounded-2xl px-4 py-3 border border-slate-200 shadow-sm">
          <div class="flex gap-1">
            <div class="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 0s"></div>
            <div class="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
            <div class="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Input Area -->
    <div class="p-4 border-t border-slate-200/50 bg-white/80 backdrop-blur-sm">
          <!-- Context Info -->
      <div v-if="scanContext" class="mb-3 p-3 bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-200/50 rounded-xl text-xs text-blue-800 shadow-sm">
        <div class="flex items-start gap-2">
          <svg class="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <span class="font-semibold text-blue-900">Contexte du scan:</span>
            <p class="text-blue-700 mt-1">{{ scanContext }}</p>
          </div>
        </div>
      </div>

      <!-- Suggestions -->
      <div v-if="suggestions.length > 0 && !inputText" class="mb-3 flex flex-wrap gap-2">
        <button
          v-for="suggestion in suggestions"
          :key="suggestion"
          @click="sendMessage(suggestion)"
          class="px-3 py-1.5 bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-700 rounded-lg text-xs font-medium transition-colors border border-slate-200 hover:border-emerald-300"
        >
          {{ suggestion }}
        </button>
      </div>

      <!-- Input -->
      <div class="flex gap-2">
        <div class="flex-1 relative">
            <textarea
            v-model="inputText"
            @keydown.enter.exact.prevent="handleEnter"
            @keydown.enter.shift.exact="inputText += '\n'"
            placeholder="Posez votre question ou demandez des conseils..."
            rows="1"
            class="w-full px-4 py-3 pr-12 border border-slate-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-400 resize-none transition-all bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md"
            :class="isTyping ? 'opacity-50 cursor-not-allowed' : 'hover:border-emerald-300'"
            :disabled="isTyping"
            ref="inputRef"
          ></textarea>
          <button
            @click="sendMessage(inputText)"
            :disabled="!inputText.trim() || isTyping"
            class="absolute right-2 bottom-2 p-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch, onMounted } from 'vue'
import { chatService } from '../services/chatService'
import { renderMarkdown, sanitizeInput, isInputSafe } from '../utils/markdown'

// Expose renderMarkdown for template
const renderMarkdownInTemplate = (content: string) => renderMarkdown(content)

interface ChatAction {
  label: string
  command: string
  icon?: string
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  actions?: ChatAction[]
}

const props = defineProps<{
  scanContext?: string
  findings?: any[]
}>()

const emit = defineEmits<{
  (e: 'action', action: ChatAction): void
  (e: 'navigate', view: string): void
}>()

const messages = ref<Message[]>([])
const inputText = ref('')
const isTyping = ref(false)
const isConnected = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLTextAreaElement | null>(null)

const quickSuggestions = [
  'Comment améliorer la sécurité de mon projet ?',
  'Explique-moi les vulnérabilités critiques',
  'Quelles sont les meilleures pratiques DevSecOps ?',
  'Comment corriger les problèmes détectés ?'
]

const suggestions = ref<string[]>([])

const formatTime = (date: Date): string => {
  return new Date(date).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const handleEnter = () => {
  if (inputText.value.trim() && !isTyping.value) {
    sendMessage(inputText.value)
  }
}

const sendMessage = async (text: string) => {
  if (!text.trim() || isTyping.value) return

  const userMessage: Message = {
    role: 'user',
    content: text.trim(),
    timestamp: new Date()
  }

  messages.value.push(userMessage)
  inputText.value = ''
  isTyping.value = true
  suggestions.value = []

  // Auto-resize textarea
  if (inputRef.value) {
    inputRef.value.style.height = 'auto'
  }

  scrollToBottom()

  try {
    const response = await chatService.sendMessage(text.trim(), {
      scanContext: props.scanContext,
      findings: props.findings
    })

    // Extract actions from response if available
    let actions: ChatAction[] = []
    let responseText = ''
    
    if (typeof response === 'object' && response !== null && 'response' in response) {
      responseText = response.response || ''
      if (response.actions && Array.isArray(response.actions)) {
        actions = response.actions.map((a: any) => ({
          label: a.label || 'Action',
          command: a.command || '',
          icon: getActionIcon(a.command || '')
        }))
      }
    } else {
      responseText = typeof response === 'string' ? response : String(response)
    }

    const assistantMessage: Message = {
      role: 'assistant',
      content: responseText,
      timestamp: new Date(),
      actions: actions.length > 0 ? actions : undefined
    }

    messages.value.push(assistantMessage)
    
    // Generate new suggestions based on response
    generateSuggestions(responseText)
    
    scrollToBottom()
  } catch (error) {
    const errorMessage: Message = {
      role: 'assistant',
      content: `Désolé, une erreur s'est produite: ${error instanceof Error ? error.message : 'Erreur inconnue'}. Veuillez réessayer.`,
      timestamp: new Date()
    }
    messages.value.push(errorMessage)
    scrollToBottom()
  } finally {
    isTyping.value = false
  }
}

const generateSuggestions = (response: string) => {
  // Generate contextual suggestions based on response
  const newSuggestions: string[] = []
  
  if (response.toLowerCase().includes('vulnérabilité') || response.toLowerCase().includes('vulnerability')) {
    newSuggestions.push('Comment corriger cette vulnérabilité ?')
    newSuggestions.push('Quel est l\'impact de cette vulnérabilité ?')
  }
  
  if (response.toLowerCase().includes('secret') || response.toLowerCase().includes('clé')) {
    newSuggestions.push('Comment gérer les secrets de manière sécurisée ?')
  }
  
  if (response.toLowerCase().includes('dépendance') || response.toLowerCase().includes('dependency')) {
    newSuggestions.push('Comment mettre à jour les dépendances ?')
  }
  
  if (newSuggestions.length === 0) {
    newSuggestions.push('Donne-moi plus de détails')
    newSuggestions.push('Quelles sont les prochaines étapes ?')
  }
  
  suggestions.value = newSuggestions.slice(0, 3)
}

const checkConnection = async () => {
  try {
    const status = await chatService.checkConnection()
    isConnected.value = status.connected
  } catch (error) {
    isConnected.value = false
  }
}

const getActionIcon = (command: string): string => {
  if (command.includes('scan')) return 'scan'
  if (command.includes('fix')) return 'fix'
  if (command.includes('export')) return 'export'
  return 'default'
}

const executeAction = async (action: ChatAction) => {
  // Emit action event to parent
  emit('action', action)
  
  // Add user message showing the action
  const actionMessage: Message = {
    role: 'user',
    content: `Exécution: ${action.label}`,
    timestamp: new Date()
  }
  messages.value.push(actionMessage)
  scrollToBottom()
  
  // Execute the action based on command
  try {
    if (action.command === 'scan') {
      emit('navigate', 'scan')
    } else if (action.command === 'fix') {
      // Trigger fix action
      emit('action', action)
    } else if (action.command === 'export') {
      // Trigger export action
      emit('action', action)
    }
  } catch (error) {
    const errorMessage: Message = {
      role: 'assistant',
      content: `Erreur lors de l'exécution de l'action: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
      timestamp: new Date()
    }
    messages.value.push(errorMessage)
    scrollToBottom()
  }
}

// Auto-resize textarea
watch(inputText, () => {
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.style.height = 'auto'
      inputRef.value.style.height = `${Math.min(inputRef.value.scrollHeight, 120)}px`
    }
  })
})

onMounted(() => {
  checkConnection()
  // Check connection every 30 seconds
  setInterval(checkConnection, 30000)
})
</script>

