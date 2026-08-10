import { ref, computed, watch } from 'vue'

const STORAGE_KEY = 'owt-theme'
const DEFAULT_ID = 'owt-dark'

// Two flavors, each with a dark + light variant. `pair` links each theme to its
// same-flavor counterpart in the other mode — used for the sidebar (always dark,
// see below) and for anything that wants a one-click mode flip that keeps the flavor.
export const THEMES = [
  { id: 'owt-dark',       label: 'Ocean Dark',  mode: 'dark',  pair: 'owt-light',      colors: ['#124076', '#7F9F80', '#FFC374'] },
  { id: 'owt-light',      label: 'Ocean Light', mode: 'light', pair: 'owt-dark',       colors: ['#124076', '#7F9F80', '#FFC374'] },
  { id: 'owt-dark-slate', label: 'Slate Dark',  mode: 'dark',  pair: 'owt-light-warm', colors: ['#B48CFF', '#4FD1C5', '#FF7A9C'] },
  { id: 'owt-light-warm', label: 'Warm Light',  mode: 'light', pair: 'owt-dark-slate', colors: ['#B4502F', '#4C7A4C', '#E0A94C'] },
]

function themeMeta(id) {
  return THEMES.find((t) => t.id === id)
}

const stored = localStorage.getItem(STORAGE_KEY)
const _themeId = ref(themeMeta(stored) ? stored : DEFAULT_ID)

// Apply immediately — avoids flash on page load
document.documentElement.setAttribute('data-theme', _themeId.value)

watch(_themeId, (id) => {
  document.documentElement.setAttribute('data-theme', id)
  localStorage.setItem(STORAGE_KEY, id)
})

export function useTheme() {
  const dark = computed(() => themeMeta(_themeId.value)?.mode === 'dark')

  // The sidebar is deliberately always dark (a fixed "ground floor" nav). When a
  // light theme is active, borrow its paired dark flavor so accents stay cohesive.
  const sidebarThemeId = computed(() => {
    const meta = themeMeta(_themeId.value)
    return meta?.mode === 'dark' ? meta.id : (meta?.pair ?? DEFAULT_ID)
  })

  function setTheme(id) {
    if (themeMeta(id)) _themeId.value = id
  }

  // Quick flip: switch mode, keep the same flavor (Ocean Dark <-> Ocean Light, etc).
  function toggle() {
    const pair = themeMeta(_themeId.value)?.pair
    if (pair) _themeId.value = pair
  }

  return { themeId: _themeId, dark, themes: THEMES, sidebarThemeId, setTheme, toggle }
}
