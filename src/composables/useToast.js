import { reactive } from 'vue'

// Singleton — shared queue rendered once by <ToastStack> in App.vue.
const toasts = reactive([])
let uid = 0

export function useToast() {
  function show(message, type = 'success', duration = 2000) {
    const id = ++uid
    toasts.push({ id, message, type })
    setTimeout(() => {
      const i = toasts.findIndex((t) => t.id === id)
      if (i !== -1) toasts.splice(i, 1)
    }, duration)
  }

  return { toasts, show }
}
