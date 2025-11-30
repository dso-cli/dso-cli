<template>
  <div class="timeline-container">
    <div class="timeline-header">
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="text-lg font-semibold text-gray-900">Scan Timeline</h3>
      </div>
    </div>
    <div class="timeline-content">
      <div
        v-for="(step, index) in steps"
        :key="index"
        class="timeline-step"
        :class="{
          'step-completed': step.status === 'completed',
          'step-active': step.status === 'active',
          'step-pending': step.status === 'pending',
          'step-error': step.status === 'error'
        }"
      >
        <div class="timeline-marker">
          <div v-if="step.status === 'completed'" class="marker-completed">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div v-else-if="step.status === 'active'" class="marker-active">
            <div class="animate-pulse"></div>
          </div>
          <div v-else-if="step.status === 'error'" class="marker-error">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div v-else class="marker-pending"></div>
        </div>
        <div class="timeline-content-wrapper">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="font-semibold text-gray-900">{{ step.title }}</h4>
              <p class="text-sm text-gray-600 mt-1">{{ step.description }}</p>
            </div>
            <div v-if="step.duration" class="text-xs text-gray-500">
              {{ step.duration }}ms
            </div>
          </div>
          <div v-if="step.details" class="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
            {{ step.details }}
          </div>
          <div v-if="step.progress !== undefined" class="mt-2">
            <div class="w-full bg-gray-200 rounded-full h-1.5">
              <div
                class="h-1.5 rounded-full transition-all duration-300"
                :class="{
                  'bg-gradient-to-r from-emerald-500 to-blue-500': step.status === 'active',
                  'bg-emerald-500': step.status === 'completed',
                  'bg-red-500': step.status === 'error'
                }"
                :style="{ width: `${step.progress}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="steps.length === 0" class="timeline-empty">
        <p class="text-gray-400">No steps yet. Start a scan to see the timeline.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, type Ref } from 'vue'

export interface TimelineStep {
  id: string
  title: string
  description: string
  status: 'pending' | 'active' | 'completed' | 'error'
  duration?: number
  details?: string
  progress?: number
}

const steps: Ref<TimelineStep[]> = ref<TimelineStep[]>([])

const addStep = (step: Omit<TimelineStep, 'status'>): string => {
  const newStep: TimelineStep = {
    ...step,
    status: 'pending'
  }
  steps.value.push(newStep)
  return newStep.id
}

const startStep = (id: string): void => {
  const step = steps.value.find(s => s.id === id)
  if (step) {
    step.status = 'active'
    step.progress = 0
  }
}

const completeStep = (id: string, duration?: number, details?: string): void => {
  const step = steps.value.find(s => s.id === id)
  if (step) {
    step.status = 'completed'
    step.progress = 100
    if (duration !== undefined) {
      step.duration = duration
    }
    if (details) {
      step.details = details
    }
  }
}

const errorStep = (id: string, error: string): void => {
  const step = steps.value.find(s => s.id === id)
  if (step) {
    step.status = 'error'
    step.details = error
  }
}

const updateStepProgress = (id: string, progress: number): void => {
  const step = steps.value.find(s => s.id === id)
  if (step && step.status === 'active') {
    step.progress = Math.min(100, Math.max(0, progress))
  }
}

const clearSteps = (): void => {
  steps.value = []
}

defineExpose({
  addStep,
  startStep,
  completeStep,
  errorStep,
  updateStepProgress,
  clearSteps
})
</script>

<style scoped>
.timeline-container {
  @apply bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden;
}

.timeline-header {
  @apply bg-gray-50 border-b border-gray-200 px-4 py-3;
}

.timeline-content {
  @apply p-4 space-y-4;
}

.timeline-step {
  @apply flex gap-4 relative;
}

.timeline-step:not(:last-child)::after {
  content: '';
  @apply absolute left-4 top-8 w-0.5 bg-gray-200;
  height: calc(100% + 1rem);
}

.timeline-marker {
  @apply flex-shrink-0 relative z-10;
}

.marker-completed {
  @apply w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg;
}

.marker-active {
  @apply w-8 h-8 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg animate-pulse;
}

.marker-active > div {
  @apply w-4 h-4 bg-white rounded-full;
}

.marker-error {
  @apply w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg;
}

.marker-pending {
  @apply w-8 h-8 bg-gray-300 rounded-full border-2 border-gray-400;
}

.timeline-content-wrapper {
  @apply flex-1 pt-1;
}

.timeline-empty {
  @apply flex items-center justify-center h-32 text-center;
}

.step-completed .timeline-step:not(:last-child)::after {
  @apply bg-emerald-200;
}

.step-active .timeline-step:not(:last-child)::after {
  @apply bg-gradient-to-b from-emerald-300 to-blue-300;
}
</style>

