<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Copy } from 'lucide-vue-next'

const now    = ref(Math.floor(Date.now() / 1000))
const copied = ref('')
let timer

onMounted(() => { timer = setInterval(() => { now.value = Math.floor(Date.now() / 1000) }, 1000) })
onUnmounted(() => clearInterval(timer))

// Epoch → Date
const epochIn = ref('')
const fromEpoch = computed(() => {
  const raw = epochIn.value.trim()
  if (!raw) return null
  const n = Number(raw)
  if (!Number.isFinite(n)) return null
  const ms = n > 1e11 ? n : n * 1000
  const d  = new Date(ms)
  if (isNaN(d)) return null
  return {
    utc:      d.toUTCString(),
    local:    d.toLocaleString(),
    iso:      d.toISOString(),
    relative: relativeTime(Math.floor(ms / 1000)),
    isMs:     n > 1e11,
  }
})

// Date → Epoch
const dateIn = ref('')
const fromDate = computed(() => {
  if (!dateIn.value) return null
  const d = new Date(dateIn.value)
  if (isNaN(d)) return null
  return { s: Math.floor(d / 1000), ms: d.getTime() }
})

function relativeTime(ts) {
  const diff = ts - now.value
  const abs  = Math.abs(diff)
  const past = diff < 0
  if (abs < 60)    return `${abs}s ${past ? 'ago' : 'from now'}`
  if (abs < 3600)  return `${Math.floor(abs / 60)}m ${past ? 'ago' : 'from now'}`
  if (abs < 86400) return `${Math.floor(abs / 3600)}h ${past ? 'ago' : 'from now'}`
  return `${Math.floor(abs / 86400)}d ${past ? 'ago' : 'from now'}`
}

async function copy(val) {
  await navigator.clipboard.writeText(String(val))
  copied.value = String(val)
  setTimeout(() => (copied.value = ''), 1500)
}
</script>

<template>
  <div class="max-w-lg space-y-6">

    <!-- Live clock -->
    <div class="bg-base-100 border border-base-300 rounded-box p-5">
      <p class="text-xs font-semibold uppercase tracking-wider text-base-content/40 mb-3">Current Unix Time</p>
      <div class="flex items-baseline gap-3 flex-wrap">
        <span class="font-mono text-3xl font-bold text-base-content tabular-nums">{{ now.toLocaleString() }}</span>
        <span class="text-sm text-base-content/40">seconds</span>
        <button @click="copy(now)" class="btn btn-ghost btn-xs gap-1.5 ml-auto">
          <Copy class="w-3 h-3" /> {{ copied === String(now) ? 'Copied!' : 'Copy' }}
        </button>
      </div>
      <p class="text-xs text-base-content/40 mt-2 font-mono">{{ new Date().toUTCString() }}</p>
    </div>

    <!-- Epoch → Date -->
    <section class="space-y-3">
      <p class="text-sm font-semibold text-base-content">Epoch → Date</p>
      <input
        v-model="epochIn"
        type="number"
        :placeholder="String(now)"
        class="input input-sm w-full font-mono"
      />
      <div v-if="fromEpoch" class="bg-base-100 border border-base-300 rounded-box overflow-hidden divide-y divide-base-300">
        <div
          v-for="[label, val] in [['UTC', fromEpoch.utc], ['Local', fromEpoch.local], ['ISO 8601', fromEpoch.iso], ['Relative', fromEpoch.relative]]"
          :key="label"
          class="flex items-center gap-3 px-4 py-2.5"
        >
          <span class="text-xs text-base-content/40 w-16 shrink-0">{{ label }}</span>
          <span class="font-mono text-xs text-base-content flex-1 truncate">{{ val }}</span>
          <button @click="copy(val)" class="btn btn-ghost btn-xs shrink-0"><Copy class="w-3 h-3" /></button>
        </div>
        <p class="px-4 py-1.5 text-xs text-base-content/30">Detected as {{ fromEpoch.isMs ? 'milliseconds' : 'seconds' }}</p>
      </div>
    </section>

    <!-- Date → Epoch -->
    <section class="space-y-3">
      <p class="text-sm font-semibold text-base-content">Date → Epoch</p>
      <input
        v-model="dateIn"
        type="datetime-local"
        class="input input-sm w-full font-mono"
      />
      <div v-if="fromDate" class="bg-base-100 border border-base-300 rounded-box overflow-hidden divide-y divide-base-300">
        <div
          v-for="[label, val] in [['Seconds', fromDate.s], ['Milliseconds', fromDate.ms]]"
          :key="label"
          class="flex items-center gap-3 px-4 py-2.5"
        >
          <span class="text-xs text-base-content/40 w-24 shrink-0">{{ label }}</span>
          <span class="font-mono text-xs text-base-content flex-1">{{ val.toLocaleString() }}</span>
          <button @click="copy(val)" class="btn btn-ghost btn-xs shrink-0"><Copy class="w-3 h-3" /></button>
        </div>
      </div>
    </section>

  </div>
</template>
