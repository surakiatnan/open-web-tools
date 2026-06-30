<script setup>
import AppSidebar from '@/components/AppSidebar.vue'
import { useTheme } from '@/composables/useTheme'
import { useSidebar } from '@/composables/useSidebar'
import { Menu } from '@/utils/icons'

useTheme()
const { open, toggle, close } = useSidebar()
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
      <!-- Mobile top bar -->
      <header class="lg:hidden shrink-0 flex items-center gap-3 px-4 py-3 bg-base-100 border-b border-base-300">
        <button @click="toggle" class="btn btn-ghost btn-sm btn-square" aria-label="Toggle sidebar">
          <Menu class="w-5 h-5" />
        </button>
        <span class="font-semibold text-sm text-base-content">Open Dev Kits</span>
      </header>

      <main class="flex-1 overflow-y-auto">
        <router-view />
      </main>
    </div>
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
