<script setup>
import { ref, computed } from 'vue'
import { Copy, Download } from 'lucide-vue-next'

const input  = ref('')
const indent = ref('2')
const mode   = ref('prettify')
const copied = ref(false)

const result = computed(() => {
  if (!input.value.trim()) return { output: '', error: null }
  try {
    const parsed = JSON.parse(input.value)
    if (mode.value === 'minify') return { output: JSON.stringify(parsed), error: null }
    const spaces = indent.value === 'tab' ? '\t' : Number(indent.value)
    return { output: JSON.stringify(parsed, null, spaces), error: null }
  } catch (e) {
    return { output: '', error: e.message }
  }
})

async function copy() {
  if (!result.value.output) return
  await navigator.clipboard.writeText(result.value.output)
  copied.value = true
  setTimeout(() => (copied.value = false), 1500)
}

function download() {
  const blob = new Blob([result.value.output], { type: 'application/json' })
  const url  = URL.createObjectURL(blob)
  const a    = Object.assign(document.createElement('a'), { href: url, download: 'output.json' })
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="max-w-4xl space-y-4">
    <!-- Toolbar -->
    <div class="flex flex-wrap items-center gap-3">
      <div class="join">
        <button @click="mode = 'prettify'" class="btn btn-sm join-item" :class="mode === 'prettify' ? 'btn-primary' : 'btn-ghost'">Prettify</button>
        <button @click="mode = 'minify'"   class="btn btn-sm join-item" :class="mode === 'minify'   ? 'btn-primary' : 'btn-ghost'">Minify</button>
      </div>
      <div v-if="mode === 'prettify'" class="join">
        <button v-for="n in ['2','4','tab']" :key="n" @click="indent = n"
          class="btn btn-xs join-item"
          :class="indent === n ? 'btn-secondary' : 'btn-ghost'"
        >{{ n === 'tab' ? 'Tab' : n + ' sp' }}</button>
      </div>
    </div>

    <!-- I/O panels -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="space-y-1.5">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-base-content">Input</span>
          <button v-if="input" @click="input = ''" class="btn btn-ghost btn-xs text-error hover:text-error">Clear</button>
        </div>
        <textarea
          v-model="input"
          placeholder='{"key": "value"}'
          class="textarea w-full font-mono text-sm resize-none min-h-80 leading-relaxed"
          spellcheck="false"
        />
      </div>

      <div class="space-y-1.5">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-base-content">Output</span>
          <div class="flex gap-1">
            <button v-if="result.output" @click="copy" class="btn btn-ghost btn-xs gap-1.5">
              <Copy class="w-3 h-3" /> {{ copied ? 'Copied!' : 'Copy' }}
            </button>
            <button v-if="result.output" @click="download" class="btn btn-ghost btn-xs gap-1.5">
              <Download class="w-3 h-3" /> Save
            </button>
          </div>
        </div>
        <div
          class="w-full border rounded-box px-4 py-3 font-mono text-sm leading-relaxed min-h-80 overflow-auto whitespace-pre-wrap break-all"
          :class="result.error ? 'border-error bg-error/10 text-error' : 'border-base-300 bg-base-100 text-base-content'"
        >
          <span v-if="result.error">{{ result.error }}</span>
          <span v-else-if="result.output">{{ result.output }}</span>
          <span v-else class="text-base-content/30">Output will appear here…</span>
        </div>
      </div>
    </div>

    <!-- Stats bar -->
    <div v-if="input || result.output" class="flex gap-4 text-xs text-base-content/40 font-mono">
      <span>Input {{ input.length.toLocaleString() }} chars</span>
      <span v-if="result.output">→ Output {{ result.output.length.toLocaleString() }} chars</span>
      <span v-if="mode === 'minify' && result.output && input.length">
        ({{ Math.round((1 - result.output.length / input.length) * 100) }}% saved)
      </span>
    </div>
  </div>
</template>
