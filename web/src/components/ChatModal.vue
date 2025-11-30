<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click.self="$emit('close')">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
      <Chat 
        :scan-context="scanContext"
        :findings="findings"
        class="flex-1"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import Chat from './Chat.vue'

defineProps<{
  scanContext?: string
  findings?: any[]
}>()

defineEmits(['close'])
</script>
