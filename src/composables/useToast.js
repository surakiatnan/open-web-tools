import { reactive } from 'vue'

// Singleton — shared queue rendered once by <ToastStack> in App.vue.
const toasts = reactive([])
let uid = 0

export function useToast() {
  // `action` is optional: { label, onClick } — renders a small button on the toast
  // (e.g. "Reload" for the update-available notice) instead of being purely informational.
  function show(message, type = 'success', duration = 2000, action = null) {
    const id = ++uid
    toasts.push({ id, message, type, action })
    setTimeout(() => {
      const i = toasts.findIndex((t) => t.id === id)
      if (i !== -1) toasts.splice(i, 1)
    }, duration)
  }

  return { toasts, show }
}
