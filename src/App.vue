<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from '@/components/AppSidebar.vue'
import ToastStack from '@/components/ToastStack.vue'
import { useTheme } from '@/composables/useTheme'
import { useSidebar } from '@/composables/useSidebar'
import { toolsById } from '@/tools/registry'
import { getIcon, Menu, Moon, Sun } from '@/utils/icons'

const route = useRoute()
const { dark, toggle: toggleTheme } = useTheme()
const { open, toggle, close } = useSidebar()

// Mobile top bar shows the current tool instead of a static app name.
const currentTool = computed(() => toolsById[route.params.toolId])
</script>

<template>
  <div class="flex h-screen bg-base-200 overflow-hidden">

    <!-- Backdrop: mobile only, tap to close sidebar -->
    <Transition name="fade">
      <div
        v-if="open"
        @click="close"
        class="fixed inset-0 bg-black/60 z-20 lg:hidden"
      />
    </Transition>

    <AppSidebar />

    <!-- Content column: top bar (mobile) + scrollable main -->
    <div class="flex flex-col flex-1 min-w-0 overflow-hidden">
      <!-- Mobile top bar: tool-aware title + quick theme toggle. Safe-area padding for notched phones. -->
      <header
        class="lg:hidden shrink-0 flex items-center gap-2 px-4 py-3 bg-base-100 border-b border-base-300"
        style="padding-top: max(0.75rem, env(safe-area-inset-top))"
      >
        <button @click="toggle" class="btn btn-ghost btn-sm btn-square shrink-0" aria-label="Toggle sidebar">
          <Menu class="w-5 h-5" />
        </button>
        <div class="flex items-center gap-2 min-w-0 flex-1">
          <component v-if="currentTool" :is="getIcon(currentTool.icon)" class="w-4 h-4 text-primary shrink-0" />
          <span class="font-semibold text-sm text-base-content truncate">
            {{ currentTool ? currentTool.name : 'Open Dev Kits' }}
          </span>
        </div>
        <button
          @click="toggleTheme"
          class="btn btn-ghost btn-sm btn-square shrink-0"
          :aria-label="dark ? 'Switch to light theme' : 'Switch to dark theme'"
        >
          <Sun v-if="dark" class="w-4 h-4" />
          <Moon v-else class="w-4 h-4" />
        </button>
      </header>

      <main class="flex-1 overflow-y-auto">
        <router-view />
      </main>
    </div>

    <ToastStack />
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
