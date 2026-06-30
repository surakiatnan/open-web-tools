<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Search, X } from 'lucide-vue-next'
import { Moon, Sun } from '@/utils/icons'
import { toolsByCategory } from '@/tools/registry'
import { getIcon } from '@/utils/icons'
import { useTheme } from '@/composables/useTheme'
import { useSidebar } from '@/composables/useSidebar'

const route = useRoute()
const query = ref('')
const { dark, toggle } = useTheme()
const { open, close } = useSidebar()

const filteredByCategory = computed(() => {
  const q = query.value.toLowerCase().trim()
  if (!q) return toolsByCategory
  const result = {}
  for (const [cat, list] of Object.entries(toolsByCategory)) {
    const matched = list.filter(
      (t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q),
    )
    if (matched.length) result[cat] = matched
  }
  return result
})

const isActive = (id) => route.params.toolId === id

// Auto-close drawer when route changes (handles all navigation on mobile)
watch(() => route.fullPath, close)
</script>

<template>
  <!--
    Mobile  (<lg): fixed drawer, slides in/out from the left (z-30 over backdrop z-20).
    Desktop (lg+): relative inline sidebar, always visible, transform reset.
  -->
  <aside
    data-theme="owt-dark"
    class="fixed inset-y-0 left-0 z-30
           lg:relative lg:z-auto lg:translate-x-0
           w-64 shrink-0 bg-neutral flex flex-col h-screen
           border-r border-base-300
           transition-transform duration-300 ease-in-out"
    :class="open ? 'translate-x-0' : '-translate-x-full'"
  >
    <!-- Logo + mobile close button -->
    <div class="px-4 py-5 border-b border-base-300 flex items-center justify-between gap-2">
      <router-link to="/" class="flex items-center gap-2.5 group min-w-0">
        <div class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0 group-hover:opacity-90 transition-opacity">
          <svg viewBox="0 0 20 20" fill="none" class="w-4.5 h-4.5">
            <path d="M4 10l3-3 3 3-3 3-3-3zM10 6l3 3-3 3-3-3 3-3zM10 14l3-3 3 3-3 3-3-3z" fill="currentColor" class="text-primary-content" fill-opacity="0.9"/>
          </svg>
        </div>
        <div class="min-w-0">
          <p class="text-base-content font-semibold text-sm leading-tight truncate">Open Web Tools</p>
          <p class="text-base-content/50 text-xs">Free for developers</p>
        </div>
      </router-link>
      <!-- Visible on mobile only -->
      <button
        @click="close"
        class="lg:hidden btn btn-ghost btn-sm btn-square shrink-0 text-base-content/60"
        aria-label="Close sidebar"
      >
        <X class="w-4 h-4" />
      </button>
    </div>

    <!-- Search -->
    <div class="px-3 pt-3 pb-2">
      <label class="input input-sm w-full flex items-center gap-2">
        <Search class="w-3.5 h-3.5 text-base-content/40 shrink-0" />
        <input
          v-model="query"
          type="search"
          placeholder="Search tools…"
          class="grow bg-transparent outline-none text-sm placeholder:text-base-content/30"
        />
        <button v-if="query" @click="query = ''" class="text-base-content/40 hover:text-base-content/70">
          <X class="w-3 h-3" />
        </button>
      </label>
    </div>

    <!-- Nav -->
    <nav class="flex-1 overflow-y-auto px-2 pb-3">
      <div v-if="!Object.keys(filteredByCategory).length" class="py-8 text-center text-base-content/40 text-sm">
        No tools match "{{ query }}"
      </div>

      <ul v-for="(list, category) in filteredByCategory" :key="category" class="menu p-0 gap-0.5 mt-2">
        <li class="menu-title text-xs text-base-content/40 uppercase tracking-wider px-2 pt-2 pb-0.5">
          {{ category }}
        </li>
        <li v-for="tool in list" :key="tool.id">
          <router-link
            :to="`/${tool.id}`"
            class="gap-2.5 text-sm rounded-lg"
            :class="isActive(tool.id) ? 'active font-medium' : 'text-base-content/70 hover:text-base-content'"
          >
            <component :is="getIcon(tool.icon)" class="w-4 h-4 shrink-0" />
            {{ tool.name }}
          </router-link>
        </li>
      </ul>
    </nav>

    <!-- Footer -->
    <div class="px-3 py-3 border-t border-base-300 flex items-center justify-between">
      <button
        @click="toggle"
        class="btn btn-ghost btn-xs gap-1.5 text-base-content/60 hover:text-base-content"
        :title="dark ? 'Switch to light' : 'Switch to dark'"
      >
        <Sun v-if="dark" class="w-3.5 h-3.5" />
        <Moon v-else class="w-3.5 h-3.5" />
        <span>{{ dark ? 'Light' : 'Dark' }}</span>
      </button>

      <a
        href="https://github.com/open-web-tools/open-web-tools"
        target="_blank"
        rel="noopener"
        class="text-xs text-base-content/40 hover:text-base-content/70 transition-colors"
      >
        GitHub ↗
      </a>
    </div>
  </aside>
</template>
