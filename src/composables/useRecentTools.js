import { ref } from 'vue'

const STORAGE_KEY = 'owt-recent-tools'
const MAX_RECENT = 5

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return Array.isArray(raw) ? raw : []
  } catch {
    return []
  }
}

// Singleton — visiting a tool anywhere in the app updates the list everyone reads.
const _recentIds = ref(load())

export function useRecentTools() {
  function track(id) {
    const next = [id, ..._recentIds.value.filter((x) => x !== id)].slice(0, MAX_RECENT)
    _recentIds.value = next
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  return { recentIds: _recentIds, track }
}
