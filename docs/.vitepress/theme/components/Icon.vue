<template>
  <span class="icon-wrapper" :style="{ width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }">
    <svg
      :width="size"
      :height="size"
      :viewBox="viewBox"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class="icon-svg"
    >
      <path
        v-for="(path, index) in paths"
        :key="index"
        :d="path"
        :fill="color"
        :stroke="stroke"
        :stroke-width="strokeWidth"
      />
    </svg>
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  size: {
    type: String,
    default: '24px'
  },
  color: {
    type: String,
    default: 'currentColor'
  },
  stroke: {
    type: String,
    default: 'none'
  },
  strokeWidth: {
    type: String,
    default: '0'
  }
})

// Icon paths mapping
const iconPaths = {
  'lock': { viewBox: '0 0 24 24', paths: ['M12 1C8.676 1 6 3.676 6 7v3h-1a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7c0-3.324-2.676-6-6-6zm0 2c2.276 0 4 1.724 4 4v3H8V7c0-2.276 1.724-4 4-4z'] },
  'brain': { viewBox: '0 0 24 24', paths: ['M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'], stroke: 'currentColor', strokeWidth: '1.5' },
  'zap': { viewBox: '0 0 24 24', paths: ['M13 2L3 14h9l-1 8 10-12h-9l1-8z'], stroke: 'currentColor', strokeWidth: '1.5' },
  'wrench': { viewBox: '0 0 24 24', paths: ['M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z'], stroke: 'currentColor', strokeWidth: '1.5' },
  'palette': { viewBox: '0 0 24 24', paths: ['M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c.55 0 1-.45 1-1v-4H9c-.55 0-1-.45-1-1s.45-1 1-1h4v-2c0-.55.45-1 1-1s1 .45 1 1v2h2c.55 0 1 .45 1 1s-.45 1-1 1h-2v2c0 .55.45 1 1 1s1-.45 1-1v-2c5.52 0 10-4.48 10-10S17.52 2 12 2z'], stroke: 'currentColor', strokeWidth: '1.5' },
  'eye': { viewBox: '0 0 24 24', paths: ['M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z'], stroke: 'currentColor', strokeWidth: '1.5' },
  'package': { viewBox: '0 0 24 24', paths: ['M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'], stroke: 'currentColor', strokeWidth: '1.5' }
}

const iconData = computed(() => {
  return iconPaths[props.name] || iconPaths['package']
})

const viewBox = computed(() => iconData.value.viewBox)
const paths = computed(() => iconData.value.paths)
const stroke = computed(() => props.stroke !== 'none' ? props.stroke : iconData.value.stroke)
const strokeWidth = computed(() => iconData.value.strokeWidth || props.strokeWidth)
</script>

<style scoped>
.icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
}

.icon-svg {
  display: block;
}
</style>

