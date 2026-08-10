import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { useToast } from './composables/useToast'
import './assets/main.css'

createApp(App).use(router).mount('#app')

// Offline support. registerType is 'prompt' (see vite.config.js) — never force a
// reload out from under someone mid-edit in a tool; just let them know, with a
// Reload action that actually applies the update. (A toast alone used to be a
// no-op: the old service worker kept controlling the page indefinitely, which
// meant it kept serving an index.html pointing at JS/CSS hashes a later deploy
// had already deleted — a real 404'd-blank-page bug, not just a stale notice.)
if ('serviceWorker' in navigator) {
  import('virtual:pwa-register').then(({ registerSW }) => {
    const { show } = useToast()
    const updateSW = registerSW({
      onNeedRefresh() {
        show('New version available.', 'info', 15000, { label: 'Reload', onClick: () => updateSW(true) })
      },
      onOfflineReady() {
        show('Ready to work offline.', 'success', 3000)
      },
    })
  })
}
