<script setup>
/**
 * Shared "copy to clipboard" button used across tools.
 *
 * Covers the two shapes every tool needs:
 *   - Default:   `btn btn-ghost` with a Copy/Check icon and optional label — the
 *                inline "Copy" action next to an output panel or list row.
 *   - iconOnly:  a bare icon with no button chrome, for hover-reveal rows
 *                (e.g. a list where the copy icon only appears on row hover).
 *
 * Feedback is two-layered: the icon flips to a checkmark for ~1.2s AND a toast
 * fires — so it's noticeable whether or not the user is looking at the button.
 */
import { ref } from 'vue'
import { Copy, Check } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'

const props = defineProps({
  text:            { type: String, default: '' },
  label:           { type: String, default: 'Copy' },
  labelClass:      { type: String, default: '' },
  successMessage:  { type: String, default: 'Copied to clipboard' },
  size:            { type: String, default: 'xs' }, // 'xs' | 'sm'
  iconOnly:        { type: Boolean, default: false },
})

const { show } = useToast()
const justCopied = ref(false)
let resetTimer

async function copy() {
  if (!props.text) return
  try {
    await navigator.clipboard.writeText(props.text)
  } catch {
    show('Couldn\'t copy — check clipboard permissions for this site.', 'warning', 3000)
    return
  }
  justCopied.value = true
  show(props.successMessage)
  clearTimeout(resetTimer)
  resetTimer = setTimeout(() => (justCopied.value = false), 1200)
}
</script>

<template>
  <button v-if="iconOnly" type="button" @click="copy" :disabled="!text">
    <Check v-if="justCopied" class="w-4 h-4 text-success" />
    <Copy v-else class="w-4 h-4" />
  </button>

  <button
    v-else
    type="button"
    @click="copy"
    :disabled="!text"
    class="btn btn-ghost gap-1.5"
    :class="size === 'sm' ? 'btn-sm' : 'btn-xs'"
  >
    <Check v-if="justCopied" class="w-3 h-3 text-success" />
    <Copy v-else class="w-3 h-3" />
    <span v-if="label" :class="labelClass">{{ label }}</span>
  </button>
</template>
