<script setup>
import { ref, onMounted } from 'vue'
import { useInstallPrompt } from '@/composables/useInstallPrompt'
import { Download, X } from 'lucide-vue-next'

const { visible, canInstall, dismiss, install } = useInstallPrompt()

// Small delay so this doesn't compete with the page's own first paint.
const ready = ref(false)
onMounted(() => setTimeout(() => (ready.value = true), 1500))
</script>

<template>
  <div
    v-if="visible && ready"
    class="fixed z-40 bottom-4 left-1/2 -translate-x-1/2 sm:left-auto sm:right-4 sm:translate-x-0
           w-[calc(100%-2rem)] sm:w-80 rounded-btn border border-base-300 bg-base-100 shadow-lg p-3.5 flex items-start gap-3"
    style="padding-bottom: max(0.875rem, env(safe-area-inset-bottom))"
  >
    <div class="w-8 h-8 rounded-btn bg-primary/10 flex items-center justify-center shrink-0">
      <Download class="w-4 h-4 text-primary" />
    </div>

    <div class="min-w-0 flex-1">
      <p class="text-sm font-medium text-base-content">Works offline</p>
      <p class="text-xs text-base-content/60 mt-0.5">Install Open Dev Kits for quick, offline access.</p>
      <div class="flex items-center gap-2 mt-2.5">
        <button v-if="canInstall" @click="install" class="btn btn-primary btn-xs">Install</button>
        <button @click="dismiss" class="btn btn-ghost btn-xs text-base-content/50">Not now</button>
      </div>
    </div>

    <button
      @click="dismiss"
      class="btn btn-ghost btn-xs btn-square shrink-0 text-base-content/40"
      aria-label="Dismiss"
    >
      <X class="w-3.5 h-3.5" />
    </button>
  </div>
</template>
