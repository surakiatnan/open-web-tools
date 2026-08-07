import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { useToast } from './composables/useToast'
import './assets/main.css'

createApp(App).use(router).mount('#app')

// Offline support. registerType is 'prompt' (see vite.config.js) — never force a
// reload out from under someone mid-edit in a tool; just let them know.
if ('serviceWorker' in navigator) {
  import('virtual:pwa-register').then(({ registerSW }) => {
    const { show } = useToast()
    registerSW({
      onNeedRefresh() {
        show('New version available — refresh the page to update.', 'info', 5000)
      },
      onOfflineReady() {
        show('Ready to work offline.', 'success', 3000)
      },
    })
  })
}
