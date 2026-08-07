<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from 'lucide-vue-next'
import { useCommandPalette } from '@/composables/useCommandPalette'
import { useRecentTools } from '@/composables/useRecentTools'
import { tools, toolsById } from '@/tools/registry'
import { getIcon } from '@/utils/icons'

const { open, close } = useCommandPalette()
const { recentIds } = useRecentTools()
const router = useRouter()

const query = ref('')
const activeIndex = ref(0)
const inputEl = ref(null)

const results = computed(() => {
  const q = query.value.toLowerCase().trim()
  if (!q) {
    const recents = recentIds.value.map((id) => toolsById[id]).filter(Boolean)
    return recents.length ? recents : tools.slice(0, 8)
  }
  return tools.filter(
    (t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q),
  )
})

const listTitle = computed(() => (query.value ? 'Results' : recentIds.value.length ? 'Recent' : 'Suggested'))

watch(results, () => { activeIndex.value = 0 })

watch(open, async (isOpen) => {
  if (!isOpen) return
  query.value = ''
  activeIndex.value = 0
  await nextTick()
  inputEl.value?.focus()
})

function select(tool) {
  if (!tool) return
  router.push(`/${tool.id}`)
  close()
}

function onKeydown(e) {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    activeIndex.value = Math.min(activeIndex.value + 1, results.value.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    activeIndex.value = Math.max(activeIndex.value - 1, 0)
  } else if (e.key === 'Enter') {
    e.preventDefault()
    select(results.value[activeIndex.value])
  }
}
</script>

<template>
  <!--
    No <Transition> here deliberately: its content re-renders reactively (results/recent
    list reorders when a selection navigates), which can race a CSS leave-transition and
    leave the backdrop stuck in the DOM after `open` goes false. Correctness > fade-out.
  -->
  <div
    v-if="open"
    class="fixed inset-0 z-40 bg-black/60 flex items-start justify-center pt-20 sm:pt-24 px-4"
    @click.self="close"
    @keydown.escape="close"
  >
      <div class="w-full max-w-lg bg-base-100 border border-base-300 rounded-box shadow-2xl overflow-hidden">
        <label class="flex items-center gap-2 px-4 py-3 border-b border-base-300">
          <Search class="w-4 h-4 text-base-content/40 shrink-0" />
          <input
            ref="inputEl"
            v-model="query"
            @keydown="onKeydown"
            type="text"
            placeholder="Search tools…"
            class="grow bg-transparent outline-none text-sm"
            spellcheck="false"
          />
          <kbd class="kbd kbd-sm shrink-0">Esc</kbd>
        </label>

        <div class="max-h-80 overflow-y-auto p-2">
          <p class="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-base-content/40">{{ listTitle }}</p>

          <button
            v-for="(tool, i) in results"
            :key="tool.id"
            @click="select(tool)"
            @mouseenter="activeIndex = i"
            type="button"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-btn text-left transition-colors"
            :class="i === activeIndex ? 'bg-primary/10' : 'hover:bg-base-300/40'"
          >
            <component :is="getIcon(tool.icon)" class="w-4 h-4 text-primary shrink-0" />
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-base-content truncate">{{ tool.name }}</p>
              <p class="text-xs text-base-content/40 truncate">{{ tool.description }}</p>
            </div>
            <span class="badge badge-xs badge-outline shrink-0">{{ tool.category }}</span>
          </button>

          <p v-if="!results.length" class="text-center py-8 text-sm text-base-content/40">No tools match "{{ query }}"</p>
        </div>

        <div class="hidden sm:flex items-center gap-3 px-4 py-2 border-t border-base-300 text-xs text-base-content/30">
          <span class="flex items-center gap-1"><kbd class="kbd kbd-xs">↑</kbd><kbd class="kbd kbd-xs">↓</kbd> Navigate</span>
          <span class="flex items-center gap-1"><kbd class="kbd kbd-xs">Enter</kbd> Open</span>
        </div>
      </div>
    </div>
</template>
