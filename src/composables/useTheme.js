import { ref, watch } from 'vue'

const STORAGE_KEY = 'owt-theme'
const DARK  = 'owt-dark'
const LIGHT = 'owt-light'

const stored = localStorage.getItem(STORAGE_KEY)
const _dark  = ref(stored === null ? true : stored === DARK)

// Apply immediately — avoids flash on page load
document.documentElement.setAttribute('data-theme', _dark.value ? DARK : LIGHT)

watch(_dark, (isDark) => {
  document.documentElement.setAttribute('data-theme', isDark ? DARK : LIGHT)
  localStorage.setItem(STORAGE_KEY, isDark ? DARK : LIGHT)
})

export function useTheme() {
  return {
    dark: _dark,
    toggle: () => { _dark.value = !_dark.value },
  }
}
