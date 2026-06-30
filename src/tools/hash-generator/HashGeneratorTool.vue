<script setup>
import { ref, watch } from 'vue'
import { Copy } from 'lucide-vue-next'

const input  = ref('')
const format = ref('hex')
const hashes = ref({})
const copied = ref('')

const ALGOS = ['SHA-1', 'SHA-256', 'SHA-512']

function toHex(buf) {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}
function toBase64(buf) {
  let binary = ''
  new Uint8Array(buf).forEach((b) => (binary += String.fromCharCode(b)))
  return btoa(binary)
}

async function compute(text) {
  if (!text) { hashes.value = {}; return }
  const encoded = new TextEncoder().encode(text)
  const results = {}
  for (const algo of ALGOS) {
    const buf = await crypto.subtle.digest(algo, encoded)
    results[algo] = { hex: toHex(buf), base64: toBase64(buf) }
  }
  hashes.value = results
}

watch(input, compute, { immediate: true })

async function copy(val) {
  await navigator.clipboard.writeText(val)
  copied.value = val
  setTimeout(() => (copied.value = ''), 1500)
}
</script>

<template>
  <div class="max-w-2xl space-y-5">
    <div class="space-y-1.5">
      <span class="text-sm font-medium text-base-content">Input text</span>
      <textarea
        v-model="input"
        placeholder="Type or paste text to hash…"
        class="textarea w-full text-sm resize-none min-h-28 leading-relaxed"
        spellcheck="false"
      />
    </div>

    <div class="join">
      <button @click="format = 'hex'"    class="btn btn-sm join-item" :class="format === 'hex'    ? 'btn-primary' : 'btn-ghost'">Hex</button>
      <button @click="format = 'base64'" class="btn btn-sm join-item" :class="format === 'base64' ? 'btn-primary' : 'btn-ghost'">Base64</button>
    </div>

    <div v-if="Object.keys(hashes).length" class="space-y-3">
      <div
        v-for="algo in ALGOS"
        :key="algo"
        class="bg-base-100 border border-base-300 rounded-box p-4 space-y-2"
      >
        <div class="flex items-center justify-between gap-2">
          <span class="font-mono text-xs font-semibold text-base-content/40 uppercase tracking-wider">{{ algo }}</span>
          <button @click="copy(hashes[algo][format])" class="btn btn-ghost btn-xs gap-1.5">
            <Copy class="w-3 h-3" />
            {{ copied === hashes[algo][format] ? 'Copied!' : 'Copy' }}
          </button>
        </div>
        <p class="font-mono text-xs text-base-content break-all leading-relaxed select-all">{{ hashes[algo][format] }}</p>
        <p class="text-xs text-base-content/30">{{ hashes[algo][format].length }} chars</p>
      </div>
    </div>

    <p v-else-if="!input" class="text-sm text-base-content/30">Enter text above to compute hashes.</p>
  </div>
</template>
