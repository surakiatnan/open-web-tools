import { ref, computed } from 'vue'

const STORAGE_KEY = 'owt-pwa-banner-dismissed'

// Already running as an installed app (standalone window) — iOS Safari uses
// `navigator.standalone` instead of the standard media query.
const isStandalone =
  window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true

const dismissed = ref(localStorage.getItem(STORAGE_KEY) === '1')

// Chrome/Edge fire this ~instantly if the PWA criteria are met; we stash it and
// replay it later via install(). Browsers without support (Safari, Firefox)
// just never fire it — canInstall stays false and the banner shows text-only.
const deferredPrompt = ref(null)
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  deferredPrompt.value = e
})
window.addEventListener('appinstalled', () => {
  deferredPrompt.value = null
  dismiss()
})

function dismiss() {
  dismissed.value = true
  localStorage.setItem(STORAGE_KEY, '1')
}

async function install() {
  if (!deferredPrompt.value) return
  deferredPrompt.value.prompt()
  await deferredPrompt.value.userChoice
  deferredPrompt.value = null
}

export function useInstallPrompt() {
  return {
    visible: computed(() => !dismissed.value && !isStandalone),
    canInstall: computed(() => !!deferredPrompt.value),
    dismiss,
    install,
  }
}
