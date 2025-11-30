<template>
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="$emit('close')">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden">
      <!-- Header -->
      <div class="bg-gradient-to-r from-emerald-600 to-blue-600 text-white p-6 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <h3 class="text-xl font-bold">Assistant DSO</h3>
            <p class="text-sm text-emerald-100">Posez vos questions sur la sécurité</p>
          </div>
        </div>
        <button
          @click="$emit('close')"
          class="p-2 hover:bg-white/20 rounded-lg transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Messages -->
      <div ref="messagesContainer" class="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-slate-50 to-white">
        <!-- Welcome Message -->
        <div v-if="messages.length === 0" class="text-center py-12">
          <div class="w-20 h-20 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg class="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h4 class="text-xl font-bold text-gray-900 mb-2">Bonjour ! 👋</h4>
          <p class="text-gray-600 mb-6">Je suis votre assistant DevSecOps. Comment puis-je vous aider ?</p>
          
          <!-- Quick Suggestions -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
            <button
              v-for="suggestion in quickSuggestions"
              :key="suggestion"
              @click="sendMessage(suggestion)"
              class="p-4 bg-white rounded-xl border-2 border-slate-200 hover:border-emerald-500 hover:shadow-lg transition-all duration-200 text-left group"
            >
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                  <svg class="w-4 h-4 text-emerald-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span class="text-sm font-medium text-gray-700 group-hover:text-emerald-600 transition-colors">{{ suggestion }}</span>
              </div>
            </button>
          </div>
        </div>

        <!-- Chat Messages -->
        <div
          v-for="(message, index) in messages"
          :key="index"
          :class="[
            'flex gap-3',
            message.role === 'user' ? 'justify-end' : 'justify-start'
          ]"
        >
          <div
            :class="[
              'max-w-[80%] rounded-2xl px-4 py-3 shadow-sm',
              message.role === 'user'
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white'
                : 'bg-white border border-slate-200 text-gray-800'
            ]"
          >
            <div class="flex items-start gap-2">
              <div v-if="message.role === 'assistant'" class="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div class="flex-1">
                <p class="text-sm whitespace-pre-wrap">{{ message.content }}</p>
                <div v-if="message.actions && message.actions.length > 0" class="mt-3 space-y-2">
                  <button
                    v-for="(action, idx) in message.actions"
                    :key="idx"
                    @click="executeAction(action)"
                    class="block w-full text-left px-3 py-2 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-sm font-medium text-emerald-700 transition-colors"
                  >
                    {{ action.label }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Typing Indicator -->
        <div v-if="isTyping" class="flex gap-3 justify-start">
          <div class="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
            <div class="flex gap-1">
              <div class="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style="animation-delay: 0s"></div>
              <div class="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
              <div class="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Input -->
      <div class="p-4 border-t border-slate-200 bg-white">
        <form @submit.prevent="handleSend" class="flex gap-3">
          <div class="flex-1 relative">
            <input
              v-model="inputMessage"
              type="text"
              placeholder="Posez votre question..."
              class="w-full px-4 py-3 pr-12 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
              :disabled="isTyping"
            />
            <button
              type="button"
              @click="showSuggestions = !showSuggestions"
              class="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 hover:bg-slate-100 rounded-lg transition-colors"
              title="Suggestions"
            >
              <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
            </button>
          </div>
          <button
            type="submit"
            :disabled="!inputMessage.trim() || isTyping"
            class="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl font-medium hover:from-emerald-700 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
          >
            <svg v-if="!isTyping" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            <svg v-else class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </button>
        </form>

        <!-- Contextual Suggestions -->
        <div v-if="showSuggestions" class="mt-3 flex flex-wrap gap-2">
          <button
            v-for="suggestion in contextualSuggestions"
            :key="suggestion"
            @click="sendMessage(suggestion)"
            class="px-3 py-1.5 text-xs bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-700 rounded-lg transition-colors"
          >
            {{ suggestion }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import { chatService } from '../services/chatService'

defineEmits(['close'])

interface Message {
  role: 'user' | 'assistant'
  content: string
  actions?: Array<{ label: string; command: string }>
}

const messages = ref<Message[]>([])
const inputMessage = ref('')
const isTyping = ref(false)
const showSuggestions = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)

const quickSuggestions = [
  'Comment interpréter les résultats du scan ?',
  'Quelles sont les vulnérabilités critiques ?',
  'Comment corriger cette vulnérabilité ?',
  'Explique-moi ce problème de sécurité'
]

const contextualSuggestions = ref([
  'Scanner mon projet',
  'Voir les résultats',
  'Appliquer les correctifs',
  'Exporter les résultats'
])

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const sendMessage = async (text: string) => {
  if (!text.trim() || isTyping.value) return

  const userMessage: Message = {
    role: 'user',
    content: text
  }
  messages.value.push(userMessage)
  inputMessage.value = ''
  isTyping.value = true
  showSuggestions.value = false
  scrollToBottom()

  try {
    const response = await chatService.sendMessage(text, messages.value.slice(0, -1))
    
    const assistantMessage: Message = {
      role: 'assistant',
      content: response.content,
      actions: response.actions
    }
    messages.value.push(assistantMessage)
    
    // Update contextual suggestions based on response
    if (response.suggestions) {
      contextualSuggestions.value = response.suggestions
    }
  } catch (error) {
    const errorMessage: Message = {
      role: 'assistant',
      content: `Désolé, une erreur s'est produite : ${error instanceof Error ? error.message : 'Erreur inconnue'}. Veuillez réessayer.`
    }
    messages.value.push(errorMessage)
  } finally {
    isTyping.value = false
    scrollToBottom()
  }
}

const handleSend = () => {
  sendMessage(inputMessage.value)
}

const executeAction = async (action: { label: string; command: string }) => {
  // Execute the suggested action
  const actionMessage: Message = {
    role: 'user',
    content: `Exécuter : ${action.label}`
  }
  messages.value.push(actionMessage)
  
  try {
    const response = await chatService.executeAction(action.command)
    const resultMessage: Message = {
      role: 'assistant',
      content: response.message || `Action "${action.label}" exécutée avec succès.`
    }
    messages.value.push(resultMessage)
  } catch (error) {
    const errorMessage: Message = {
      role: 'assistant',
      content: `Erreur lors de l'exécution : ${error instanceof Error ? error.message : 'Erreur inconnue'}`
    }
    messages.value.push(errorMessage)
  }
  
  scrollToBottom()
}

watch(messages, () => {
  scrollToBottom()
}, { deep: true })
</script>

