<script setup>
import { computed, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { toolsById } from '@/tools/registry'
import { getIcon } from '@/utils/icons'
import CopyButton from '@/components/CopyButton.vue'

const route = useRoute()
const tool  = computed(() => toolsById[route.params.toolId])

// Per-tool browser tab title — helps when several tools are open in different tabs.
watchEffect(() => {
  document.title = tool.value ? `${tool.value.name} — Open Dev Kits` : 'Tool not found — Open Dev Kits'
})

const toolUrl = computed(() => window.location.href)
</script>

<template>
  <div v-if="tool">
    <!-- Header: desktop only — the mobile top bar already shows the tool name/icon -->
    <div class="hidden lg:flex border-b border-base-300 bg-base-100 px-6 py-4 items-center gap-3 sticky top-0 z-10">
      <div class="w-8 h-8 rounded-btn bg-primary/10 flex items-center justify-center shrink-0">
        <component :is="getIcon(tool.icon)" class="w-4.5 h-4.5 text-primary" />
      </div>
      <div class="min-w-0">
        <h1 class="font-semibold text-base-content leading-tight">{{ tool.name }}</h1>
        <p class="text-xs text-base-content/50">{{ tool.description }}</p>
      </div>
      <CopyButton
        :text="toolUrl"
        label="Copy link"
        success-message="Link copied"
        class="ml-auto shrink-0"
      />
    </div>

    <!-- Tool body -->
    <div class="p-6">
      <component :is="tool.component" />
    </div>
  </div>

  <!-- 404 -->
  <div v-else class="flex flex-col items-center justify-center h-full text-center py-24 gap-3">
    <p class="text-5xl">🔧</p>
    <h2 class="text-xl font-semibold text-base-content">Tool not found</h2>
    <p class="text-base-content/50 text-sm">No tool with ID "{{ route.params.toolId }}" exists.</p>
    <router-link to="/" class="btn btn-primary btn-sm mt-2">← Back to all tools</router-link>
  </div>
</template>
