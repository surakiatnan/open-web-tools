<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Download } from 'lucide-vue-next'
import CopyButton from '@/components/CopyButton.vue'

const now = ref(Math.floor(Date.now() / 1000))
let timer

onMounted(() => { timer = setInterval(() => { now.value = Math.floor(Date.now() / 1000) }, 1000) })
onUnmounted(() => clearInterval(timer))

// ── Timezone + custom format — shared by both single and batch epoch→date ──
const FALLBACK_ZONES = [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'America/Sao_Paulo',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Moscow', 'Africa/Cairo', 'Africa/Johannesburg',
  'Asia/Dubai', 'Asia/Kolkata', 'Asia/Karachi', 'Asia/Dhaka', 'Asia/Bangkok', 'Asia/Jakarta', 'Asia/Shanghai',
  'Asia/Hong_Kong', 'Asia/Singapore', 'Asia/Tokyo', 'Asia/Seoul', 'Australia/Sydney', 'Australia/Perth',
  'Pacific/Auckland',
]

const localZoneName = Intl.DateTimeFormat().resolvedOptions().timeZone

const zones = computed(() => {
  let list
  try {
    list = typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('timeZone') : FALLBACK_ZONES
  } catch {
    list = FALLBACK_ZONES
  }
  return [...new Set(list)].sort()
})

const timezone = ref('local')
const format = ref('YYYY-MM-DD HH:mm:ss')
const FORMAT_PRESETS = ['YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD', 'ddd, DD MMM YYYY HH:mm:ss Z', 'hh:mm:ss A']

function tzOption(tz) {
  return tz === 'local' ? undefined : tz
}

function pad(n, len = 2) {
  return String(n).padStart(len, '0')
}

function numericParts(date, tz) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: tzOption(tz),
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
    }).formatToParts(date).map((p) => [p.type, p.value]),
  )
  // Some locales render midnight as "24" with hour12:false — normalize to 00.
  return { ...parts, hour: parts.hour === '24' ? '00' : parts.hour }
}

function namedParts(date, tz) {
  const get = (parts, type) => parts.find((p) => p.type === type)?.value ?? ''
  const short = new Intl.DateTimeFormat('en-US', { timeZone: tzOption(tz), month: 'short', weekday: 'short' }).formatToParts(date)
  const long = new Intl.DateTimeFormat('en-US', { timeZone: tzOption(tz), month: 'long', weekday: 'long' }).formatToParts(date)
  return {
    monthShort: get(short, 'month'), weekdayShort: get(short, 'weekday'),
    monthLong: get(long, 'month'), weekdayLong: get(long, 'weekday'),
  }
}

function offsetOf(date, tz) {
  try {
    const raw = new Intl.DateTimeFormat('en-US', { timeZone: tzOption(tz), timeZoneName: 'longOffset' })
      .formatToParts(date).find((p) => p.type === 'timeZoneName')?.value ?? 'GMT'
    return raw.match(/GMT([+-]\d{2}:\d{2})?/)?.[1] ?? '+00:00'
  } catch {
    return '+00:00'
  }
}

// Ordered longest-token-first so e.g. `YYYY` matches before `YY`, `MMMM` before `MMM`/`MM`/`M`.
const TOKEN_RE = /YYYY|MMMM|dddd|SSS|MMM|ddd|YY|MM|DD|HH|hh|mm|ss|M|D|H|h|m|s|A|a|Z/g

function formatInTimeZone(date, tz, pattern) {
  const n = numericParts(date, tz)
  const names = namedParts(date, tz)
  const hour24 = Number(n.hour)
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12
  const ampm = hour24 < 12 ? 'AM' : 'PM'
  const ms = pad(date.getMilliseconds(), 3)

  return pattern.replace(TOKEN_RE, (token) => {
    switch (token) {
      case 'YYYY': return n.year
      case 'YY': return n.year.slice(-2)
      case 'MMMM': return names.monthLong
      case 'MMM': return names.monthShort
      case 'MM': return n.month
      case 'M': return String(Number(n.month))
      case 'DD': return n.day
      case 'D': return String(Number(n.day))
      case 'dddd': return names.weekdayLong
      case 'ddd': return names.weekdayShort
      case 'HH': return n.hour
      case 'H': return String(hour24)
      case 'hh': return pad(hour12)
      case 'h': return String(hour12)
      case 'mm': return n.minute
      case 'm': return String(Number(n.minute))
      case 'ss': return n.second
      case 's': return String(Number(n.second))
      case 'SSS': return ms
      case 'A': return ampm
      case 'a': return ampm.toLowerCase()
      case 'Z': return offsetOf(date, tz)
      default: return token
    }
  })
}

function parseEpoch(raw) {
  // `<input type="number">` v-model can hand back a number (empty string when
  // cleared) rather than always a string — coerce before trimming.
  const trimmed = String(raw ?? '').trim()
  if (!trimmed) return null
  const n = Number(trimmed)
  if (!Number.isFinite(n)) return null
  return n > 1e11 ? n : n * 1000 // ms vs s heuristic
}

// ── Single: Epoch → Date ──
const epochIn = ref('')
const fromEpoch = computed(() => {
  const ms = parseEpoch(epochIn.value)
  if (ms === null) return null
  const d = new Date(ms)
  if (isNaN(d)) return null
  return {
    utc: d.toUTCString(),
    local: d.toLocaleString(),
    iso: d.toISOString(),
    formatted: formatInTimeZone(d, timezone.value, format.value),
    relative: relativeTime(Math.floor(ms / 1000)),
    isMs: Number(String(epochIn.value ?? '').trim()) > 1e11,
  }
})

// ── Batch: many epochs → dates ──
const mode = ref('single') // 'single' | 'batch'
const batchIn = ref('')
const batchResults = computed(() => {
  return batchIn.value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const ms = parseEpoch(line)
      if (ms === null || isNaN(new Date(ms))) return { input: line, error: true }
      return { input: line, formatted: formatInTimeZone(new Date(ms), timezone.value, format.value) }
    })
})
const batchOutput = computed(() =>
  batchResults.value.map((r) => (r.error ? `${r.input}\t(invalid)` : `${r.input}\t${r.formatted}`)).join('\n'),
)

function downloadBatch() {
  const blob = new Blob([batchOutput.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = Object.assign(document.createElement('a'), { href: url, download: 'timestamps.txt' })
  a.click()
  URL.revokeObjectURL(url)
}

// ── Date → Epoch ──
const dateIn = ref('')
const fromDate = computed(() => {
  if (!dateIn.value) return null
  const d = new Date(dateIn.value)
  if (isNaN(d)) return null
  return { s: Math.floor(d / 1000), ms: d.getTime() }
})

function relativeTime(ts) {
  const diff = ts - now.value
  const abs = Math.abs(diff)
  const past = diff < 0
  if (abs < 60) return `${abs}s ${past ? 'ago' : 'from now'}`
  if (abs < 3600) return `${Math.floor(abs / 60)}m ${past ? 'ago' : 'from now'}`
  if (abs < 86400) return `${Math.floor(abs / 3600)}h ${past ? 'ago' : 'from now'}`
  return `${Math.floor(abs / 86400)}d ${past ? 'ago' : 'from now'}`
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
        <CopyButton :text="String(now)" class="ml-auto" />
      </div>
      <p class="text-xs text-base-content/40 mt-2 font-mono">{{ new Date().toUTCString() }}</p>
    </div>

    <!-- Epoch → Date -->
    <section class="space-y-3">
      <div class="flex items-center justify-between">
        <p class="text-sm font-semibold text-base-content">Epoch → Date</p>
        <div class="join">
          <button @click="mode = 'single'" class="btn btn-xs join-item" :class="mode === 'single' ? 'btn-primary' : 'btn-ghost'">Single</button>
          <button @click="mode = 'batch'" class="btn btn-xs join-item" :class="mode === 'batch' ? 'btn-primary' : 'btn-ghost'">Batch</button>
        </div>
      </div>

      <!-- Timezone + format controls — shared by single & batch -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <select v-model="timezone" class="select select-sm font-mono w-full">
          <option value="local">Local ({{ localZoneName }})</option>
          <option value="UTC">UTC</option>
          <option v-for="z in zones" :key="z" :value="z">{{ z }}</option>
        </select>
        <input v-model="format" type="text" spellcheck="false" class="input input-sm font-mono w-full" placeholder="YYYY-MM-DD HH:mm:ss" />
      </div>
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="p in FORMAT_PRESETS"
          :key="p"
          @click="format = p"
          class="btn btn-ghost btn-xs font-mono text-base-content/50"
          :class="{ 'text-primary': format === p }"
        >{{ p }}</button>
      </div>
      <p class="text-xs text-base-content/30 font-mono">YYYY MM DD · HH mm ss SSS · ddd dddd MMM MMMM · A Z</p>

      <!-- Single -->
      <template v-if="mode === 'single'">
        <input
          v-model="epochIn"
          type="number"
          :placeholder="String(now)"
          class="input input-sm w-full font-mono"
        />
        <div v-if="fromEpoch" class="bg-base-100 border border-base-300 rounded-box overflow-hidden divide-y divide-base-300">
          <div
            v-for="[label, val] in [['Formatted', fromEpoch.formatted], ['UTC', fromEpoch.utc], ['Local', fromEpoch.local], ['ISO 8601', fromEpoch.iso], ['Relative', fromEpoch.relative]]"
            :key="label"
            class="flex items-center gap-3 px-4 py-2.5"
          >
            <span class="text-xs text-base-content/40 w-16 shrink-0">{{ label }}</span>
            <span class="font-mono text-xs text-base-content flex-1 truncate">{{ val }}</span>
            <CopyButton :text="String(val)" label="" class="shrink-0" />
          </div>
          <p class="px-4 py-1.5 text-xs text-base-content/30">Detected as {{ fromEpoch.isMs ? 'milliseconds' : 'seconds' }}</p>
        </div>
      </template>

      <!-- Batch -->
      <template v-else>
        <textarea
          v-model="batchIn"
          rows="5"
          placeholder="1700000000&#10;1700003600&#10;1700007200"
          class="textarea w-full font-mono text-sm resize-none leading-relaxed"
          spellcheck="false"
        />
        <div v-if="batchResults.length" class="space-y-1.5">
          <div class="flex items-center justify-between">
            <span class="text-xs text-base-content/40">{{ batchResults.length }} timestamp{{ batchResults.length === 1 ? '' : 's' }}</span>
            <div class="flex gap-1">
              <CopyButton :text="batchOutput" label="Copy all" />
              <button @click="downloadBatch" class="btn btn-ghost btn-xs gap-1.5">
                <Download class="w-3 h-3" /> Save
              </button>
            </div>
          </div>
          <div class="bg-base-100 border border-base-300 rounded-box overflow-hidden divide-y divide-base-300 max-h-80 overflow-y-auto">
            <div v-for="(r, i) in batchResults" :key="i" class="flex items-center gap-3 px-4 py-2 text-xs">
              <span class="font-mono text-base-content/40 flex-1 truncate">{{ r.input }}</span>
              <span v-if="r.error" class="font-mono text-error">invalid</span>
              <template v-else>
                <span class="font-mono text-base-content flex-1 truncate">{{ r.formatted }}</span>
                <CopyButton :text="r.formatted" label="" class="shrink-0" />
              </template>
            </div>
          </div>
        </div>
      </template>
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
          <CopyButton :text="String(val)" label="" class="shrink-0" />
        </div>
      </div>
    </section>

  </div>
</template>
