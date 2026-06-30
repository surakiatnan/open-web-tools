<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { toolsById } from '@/tools/registry'
import { getIcon } from '@/utils/icons'

const route = useRoute()
const tool  = computed(() => toolsById[route.params.toolId])
</script>

<template>
  <div v-if="tool">
    <!-- Header -->
    <div class="border-b border-base-300 bg-base-100 px-6 py-4 flex items-center gap-3 sticky top-0 z-10">
      <div class="w-8 h-8 rounded-btn bg-primary/10 flex items-center justify-center shrink-0">
        <component :is="getIcon(tool.icon)" class="w-4.5 h-4.5 text-primary" />
      </div>
      <div>
        <h1 class="font-semibold text-base-content leading-tight">{{ tool.name }}</h1>
        <p class="text-xs text-base-content/50">{{ tool.description }}</p>
      </div>
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
