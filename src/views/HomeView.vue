<script setup>
import { ref, computed } from 'vue'
import { Search } from 'lucide-vue-next'
import ToolCard from '@/components/ToolCard.vue'
import { tools } from '@/tools/registry'

const query = ref('')

const filtered = computed(() => {
  const q = query.value.toLowerCase().trim()
  if (!q) return tools
  return tools.filter(
    (t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q),
  )
})
</script>

<template>
  <div class="max-w-5xl mx-auto px-6 py-10">
    <!-- Hero -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-base-content">Developer Tools</h1>
      <p class="text-base-content/60 mt-1.5">Free, open-source utilities. No ads, no paywall, no nonsense.</p>
    </div>

    <!-- Search -->
    <div class="relative mb-8 max-w-sm">
      <label class="input w-full flex items-center gap-2">
        <Search class="w-4 h-4 text-base-content/40 shrink-0" />
        <input
          v-model="query"
          type="search"
          placeholder="Filter tools…"
          class="grow bg-transparent outline-none text-sm"
        />
      </label>
    </div>

    <!-- Grid -->
    <div v-if="filtered.length" class="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      <ToolCard v-for="tool in filtered" :key="tool.id" :tool="tool" />
    </div>
    <div v-else class="text-center py-16 text-base-content/40">
      <p class="text-lg">No tools match "{{ query }}"</p>
    </div>

    <!-- Stats -->
    <div class="mt-10 pt-6 border-t border-base-300 flex gap-6 text-sm text-base-content/40">
      <span>{{ tools.length }} tools available</span>
      <a
        href="https://github.com/open-web-tools/open-web-tools/blob/main/CONTRIBUTING.md"
        target="_blank"
        rel="noopener"
        class="link link-hover hover:text-primary transition-colors"
      >
        Contribute a tool ↗
      </a>
    </div>
  </div>
</template>
