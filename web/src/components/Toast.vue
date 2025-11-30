<template>
  <TransitionGroup
    name="toast"
    tag="div"
    class="fixed top-4 right-4 z-50 space-y-2 max-w-md"
  >
    <div
      v-for="toast in toasts"
      :key="toast.id"
      :class="[
        'toast',
        toast.type === 'success' && 'toast-success',
        toast.type === 'error' && 'toast-error',
        toast.type === 'info' && 'toast-info',
        toast.type === 'warning' && 'toast-warning',
        toast.type === 'loading' && 'toast-loading'
      ]"
    >
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0 mt-0.5">
          <svg v-if="toast.type === 'success'" class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <svg v-else-if="toast.type === 'error'" class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <svg v-else-if="toast.type === 'loading'" class="w-5 h-5 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <svg v-else class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900">{{ toast.title }}</p>
          <p v-if="toast.message" class="mt-1 text-sm text-gray-500">{{ toast.message }}</p>
        </div>
        <button
          v-if="toast.dismissible !== false"
          @click="removeToast(toast.id)"
          class="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div v-if="toast.progress !== undefined" class="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
        <div
          class="h-full bg-blue-600 transition-all duration-300"
          :style="{ width: `${toast.progress}%` }"
        ></div>
      </div>
    </div>
  </TransitionGroup>
</template>

<script setup lang="ts">
import { ref } from 'vue'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'info' | 'warning' | 'loading'
  title: string
  message?: string
  duration?: number
  dismissible?: boolean
  progress?: number
}

const toasts = ref<Toast[]>([])

let toastIdCounter = 0

const addToast = (toast: Omit<Toast, 'id'>): string => {
  const id = `toast-${++toastIdCounter}`
  const newToast: Toast = {
    id,
    duration: 5000,
    dismissible: true,
    ...toast
  }
  
  toasts.value.push(newToast)
  
  if (newToast.duration && newToast.duration > 0 && newToast.type !== 'loading') {
    setTimeout(() => {
      removeToast(id)
    }, newToast.duration)
  }
  
  return id
}

const removeToast = (id: string): void => {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

const updateToastProgress = (id: string, progress: number): void => {
  const toast = toasts.value.find(t => t.id === id)
  if (toast) {
    toast.progress = progress
  }
}

// Expose methods for parent components
defineExpose({
  addToast,
  removeToast,
  updateToastProgress
})
</script>

<style scoped>
.toast {
  @apply bg-white rounded-lg shadow-lg border p-4 min-w-[300px] max-w-md;
  animation: slideIn 0.3s ease-out;
}

.toast-success {
  @apply border-green-200 bg-green-50;
}

.toast-error {
  @apply border-red-200 bg-red-50;
}

.toast-info {
  @apply border-blue-200 bg-blue-50;
}

.toast-warning {
  @apply border-yellow-200 bg-yellow-50;
}

.toast-loading {
  @apply border-blue-200 bg-blue-50;
}

.toast-enter-active {
  animation: slideIn 0.3s ease-out;
}

.toast-leave-active {
  animation: slideOut 0.3s ease-in;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}
</style>

