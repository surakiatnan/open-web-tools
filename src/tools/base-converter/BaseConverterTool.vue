<script setup>
import { ref } from 'vue'
import { Copy } from 'lucide-vue-next'

const BASES = [
  { key: 'dec', label: 'Decimal',     radix: 10, hint: '255',      pattern: /^-?[0-9]+$/ },
  { key: 'hex', label: 'Hexadecimal', radix: 16, hint: 'FF',       pattern: /^[0-9A-Fa-f]+$/ },
  { key: 'bin', label: 'Binary',      radix: 2,  hint: '11111111', pattern: /^[01]+$/ },
  { key: 'oct', label: 'Octal',       radix: 8,  hint: '377',      pattern: /^[0-7]+$/ },
]

const values = ref({ dec: '', hex: '', bin: '', oct: '' })
const error  = ref('')
const copied = ref('')
let updating = false

function fromBase(srcKey) {
  if (updating) return
  updating = true
  const src = BASES.find((b) => b.key === srcKey)
  const raw = values.value[srcKey].trim()
  if (!raw) {
    values.value = { dec: '', hex: '', bin: '', oct: '' }
    error.value  = ''
    updating = false
    return
  }
  if (!src.pattern.test(raw)) {
    error.value = `"${raw}" is not a valid ${src.label} number.`
    updating = false
    return
  }
  const n = parseInt(raw, src.radix)
  if (!Number.isFinite(n)) {
    error.value = `Value out of safe integer range.`
    updating = false
    return
  }
  error.value = ''
  BASES.forEach(({ key, radix }) => {
    if (key !== srcKey) {
      values.value[key] = n.toString(radix).toUpperCase()
    }
  })
  updating = false
}

async function copy(val) {
  await navigator.clipboard.writeText(val)
  copied.value = val
  setTimeout(() => (copied.value = ''), 1500)
}
</script>

<template>
  <div class="max-w-md space-y-5">
    <div v-for="b in BASES" :key="b.key" class="space-y-1.5">
      <div class="flex items-center justify-between">
        <label class="text-sm font-medium text-base-content">
          {{ b.label }}
          <span class="ml-1.5 text-xs text-base-content/30 font-mono">base {{ b.radix }}</span>
        </label>
        <button
          v-if="values[b.key]"
          @click="copy(values[b.key])"
          class="btn btn-ghost btn-xs gap-1"
        >
          <Copy class="w-3 h-3" />
          {{ copied === values[b.key] ? 'Copied!' : 'Copy' }}
        </button>
      </div>
      <input
        v-model="values[b.key]"
        @input="fromBase(b.key)"
        type="text"
        spellcheck="false"
        :placeholder="b.hint"
        class="input input-sm w-full font-mono tracking-wide uppercase"
      />
    </div>

    <p v-if="error" class="text-sm text-error">{{ error }}</p>

    <div class="text-xs text-base-content/30 pt-1">
      Edit any field — all other bases update instantly.
    </div>
  </div>
</template>
