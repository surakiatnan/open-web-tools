<script setup>
import { CheckCircle2, Info, AlertTriangle } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'

const { toasts } = useToast()

const ICONS = { success: CheckCircle2, info: Info, warning: AlertTriangle }
const ALERT_CLASS = { success: 'alert-success', info: 'alert-info', warning: 'alert-warning' }
</script>

<template>
  <!-- Bottom-center on mobile (thumb zone, avoids the sidebar), bottom-right on desktop -->
  <div class="toast toast-bottom toast-center sm:toast-end z-50 px-4 pb-[env(safe-area-inset-bottom)]">
    <TransitionGroup name="toast">
      <div
        v-for="t in toasts"
        :key="t.id"
        class="alert py-2 px-3 text-sm shadow-lg gap-2"
        :class="ALERT_CLASS[t.type] ?? 'alert-info'"
      >
        <component :is="ICONS[t.type] ?? Info" class="w-4 h-4 shrink-0" />
        <span>{{ t.message }}</span>
        <button v-if="t.action" @click="t.action.onClick" class="btn btn-xs btn-ghost">
          {{ t.action.label }}
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>
