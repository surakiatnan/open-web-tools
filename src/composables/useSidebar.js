import { ref } from 'vue'

// Singleton — shared between App and Sidebar without prop drilling
const _open = ref(false)

export function useSidebar() {
  return {
    open:   _open,
    toggle: () => { _open.value = !_open.value },
    close:  () => { _open.value = false },
  }
}
