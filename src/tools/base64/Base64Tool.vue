<script setup>
import { ref, computed } from 'vue'
import { ArrowLeftRight, Copy } from 'lucide-vue-next'

const mode   = ref('encode') // 'encode' | 'decode'
const input  = ref('')
const copied = ref(false)
const error  = ref('')

function encodeUtf8(str) {
  const bytes = new TextEncoder().encode(str)
  let binary = ''
  bytes.forEach((b) => (binary += String.fromCharCode(b)))
  return btoa(binary)
}

function decodeUtf8(b64) {
  try {
    const binary = atob(b64)
    const bytes  = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    return new TextDecoder().decode(bytes)
  } catch {
    throw new Error('Invalid Base64 string')
  }
}

const output = computed(() => {
  if (!input.value.trim()) { error.value = ''; return '' }
  try {
    error.value = ''
    return mode.value === 'encode' ? encodeUtf8(input.value) : decodeUtf8(input.value.trim())
  } catch (e) {
    error.value = e.message
    return ''
  }
})

function swap() {
  const prev = output.value
  mode.value = mode.value === 'encode' ? 'decode' : 'encode'
  input.value = prev
}

async function copy() {
  if (!output.value) return
  await navigator.clipboard.writeText(output.value)
  copied.value = true
  setTimeout(() => (copied.value = false), 1500)
}

async function paste() {
  input.value = await navigator.clipboard.readText()
}

const inputLabel  = computed(() => mode.value === 'encode' ? 'Plain text' : 'Base64')
const outputLabel = computed(() => mode.value === 'encode' ? 'Base64'     : 'Plain text')
</script>

<template>
  <div class="max-w-3xl space-y-5">
    <!-- Mode toggle -->
    <div class="flex items-center gap-3">
      <div class="join">
        <button
          @click="mode = 'encode'"
          class="btn btn-sm join-item"
          :class="mode === 'encode' ? 'btn-primary' : 'btn-ghost'"
        >
          Encode
        </button>
        <button
          @click="mode = 'decode'"
          class="btn btn-sm join-item"
          :class="mode === 'decode' ? 'btn-primary' : 'btn-ghost'"
        >
          Decode
        </button>
      </div>

      <button v-if="output" @click="swap" class="btn btn-ghost btn-sm gap-2">
        <ArrowLeftRight class="w-4 h-4" /> Swap
      </button>
    </div>

    <!-- I/O panels -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Input -->
      <div class="space-y-1.5">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-base-content">{{ inputLabel }}</span>
          <div class="flex gap-1.5">
            <button @click="paste" class="btn btn-ghost btn-xs">Paste</button>
            <button v-if="input" @click="input = ''" class="btn btn-ghost btn-xs text-error hover:text-error">Clear</button>
          </div>
        </div>
        <textarea
          v-model="input"
          rows="14"
          :placeholder="mode === 'encode' ? 'Enter text to encode…' : 'Enter Base64 to decode…'"
          class="textarea w-full font-mono text-sm leading-relaxed resize-none"
          spellcheck="false"
        />
        <p class="text-xs text-base-content/40 text-right">{{ input.length }} chars</p>
      </div>

      <!-- Output -->
      <div class="space-y-1.5">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-base-content">{{ outputLabel }}</span>
          <button
            v-if="output"
            @click="copy"
            class="btn btn-ghost btn-xs gap-1.5"
          >
            <Copy class="w-3 h-3" />
            {{ copied ? 'Copied!' : 'Copy' }}
          </button>
        </div>
        <div
          class="w-full border rounded-box px-4 py-3 text-sm font-mono leading-relaxed min-h-52 break-all whitespace-pre-wrap"
          :class="
            error  ? 'border-error   bg-error/10   text-error'
          : output ? 'border-base-300 bg-base-100   text-base-content select-all'
                   : 'border-base-300 bg-base-100   text-base-content/30'
          "
        >
          <span v-if="error">{{ error }}</span>
          <span v-else-if="output">{{ output }}</span>
          <span v-else>Output will appear here…</span>
        </div>
        <p class="text-xs text-base-content/40 text-right">{{ output.length }} chars</p>
      </div>
    </div>
  </div>
</template>
