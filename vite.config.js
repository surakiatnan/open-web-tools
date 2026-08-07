import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      // manifest.json is already hand-authored and linked in index.html — don't regenerate it.
      manifest: false,
      // 'prompt' — never force a reload out from under someone mid-edit in a tool.
      // main.js decides what to do with onNeedRefresh (shows a toast, no auto-reload).
      registerType: 'prompt',
      // main.js registers the SW itself via `virtual:pwa-register` — don't auto-inject too.
      injectRegister: null,
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2}'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
