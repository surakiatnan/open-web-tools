import { ref } from 'vue'

// Singleton — toggled by the Ctrl/Cmd+K listener in App.vue, rendered by <CommandPalette>.
const _open = ref(false)

export function useCommandPalette() {
  return {
    open:   _open,
    show:   () => { _open.value = true },
    close:  () => { _open.value = false },
    toggle: () => { _open.value = !_open.value },
  }
}
