<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { Check } from '@/utils/icons'

// Caller owns the trigger's look (icon-only in the mobile bar, icon+label in the
// sidebar footer) via the `trigger` slot; this component owns the open state,
// outside-click/Escape handling, and the dropdown list itself.
defineProps({
  panelClass: { type: String, default: 'top-full right-0 mt-2' },
})

const { themeId, dark, themes, setTheme } = useTheme()
const open = ref(false)
const root = ref(null)

function onDocClick(e) {
  if (open.value && root.value && !root.value.contains(e.target)) open.value = false
}
function onKeydown(e) {
  if (e.key === 'Escape') open.value = false
}
onMounted(() => {
  document.addEventListener('click', onDocClick)
  document.addEventListener('keydown', onKeydown)
})
onUnmounted(() => {
  document.removeEventListener('click', onDocClick)
  document.removeEventListener('keydown', onKeydown)
})

function choose(id) {
  setTheme(id)
  open.value = false
}
</script>

<template>
  <div ref="root" class="relative inline-block">
    <slot name="trigger" :toggle="() => (open = !open)" :open="open" :dark="dark" />

    <div
      v-if="open"
      class="absolute z-50 w-48 rounded-btn border border-base-300 bg-base-100 shadow-lg py-1"
      :class="panelClass"
    >
      <button
        v-for="t in themes"
        :key="t.id"
        @click="choose(t.id)"
        type="button"
        class="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-base-200 transition-colors"
        :class="t.id === themeId ? 'text-base-content font-medium' : 'text-base-content/70'"
      >
        <span class="flex -space-x-1 shrink-0">
          <span
            v-for="c in t.colors"
            :key="c"
            class="w-2.5 h-2.5 rounded-full ring-1 ring-base-100"
            :style="{ background: c }"
          />
        </span>
        <span class="flex-1 text-left truncate">{{ t.label }}</span>
        <Check v-if="t.id === themeId" class="w-3.5 h-3.5 shrink-0 text-primary" />
      </button>
    </div>
  </div>
</template>
