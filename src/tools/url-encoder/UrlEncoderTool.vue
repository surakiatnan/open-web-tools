<script setup>
import { ref, computed } from 'vue'
import { ArrowLeftRight } from 'lucide-vue-next'
import CopyButton from '@/components/CopyButton.vue'

const mode    = ref('encode') // 'encode' | 'decode'
const variant = ref('component') // 'component' (encodeURIComponent) | 'full' (encodeURI)
const input   = ref('')
const error   = ref('')

const result = computed(() => {
  if (!input.value) { error.value = ''; return '' }
  try {
    error.value = ''
    if (mode.value === 'encode') {
      return variant.value === 'component' ? encodeURIComponent(input.value) : encodeURI(input.value)
    }
    return variant.value === 'component' ? decodeURIComponent(input.value) : decodeURI(input.value)
  } catch {
    error.value = 'Malformed percent-encoding — check for stray "%" characters.'
    return ''
  }
})

function swap() {
  const prev = result.value
  mode.value = mode.value === 'encode' ? 'decode' : 'encode'
  input.value = prev
}

async function paste() {
  input.value = await navigator.clipboard.readText()
}

const inputLabel  = computed(() => mode.value === 'encode' ? 'Plain text' : 'Encoded URL')
const outputLabel = computed(() => mode.value === 'encode' ? 'Encoded URL' : 'Plain text')
</script>

<template>
  <div class="max-w-3xl space-y-5">
    <!-- Mode + variant toggle -->
    <div class="flex flex-wrap items-center gap-3">
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

      <div class="join">
        <button
          @click="variant = 'component'"
          class="btn btn-xs join-item"
          :class="variant === 'component' ? 'btn-secondary' : 'btn-ghost'"
          title="encodeURIComponent — escapes reserved characters like & ? = /"
        >
          Component
        </button>
        <button
          @click="variant = 'full'"
          class="btn btn-xs join-item"
          :class="variant === 'full' ? 'btn-secondary' : 'btn-ghost'"
          title="encodeURI — preserves URL structure characters like : / ? &"
        >
          Full URI
        </button>
      </div>

      <button v-if="result" @click="swap" class="btn btn-ghost btn-sm gap-2">
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
          rows="10"
          :placeholder="mode === 'encode' ? 'https://example.com/search?q=hello world' : 'https%3A%2F%2Fexample.com%2F%3Fq%3Dhello'"
          class="textarea w-full font-mono text-sm leading-relaxed resize-none"
          spellcheck="false"
        />
        <p class="text-xs text-base-content/40 text-right">{{ input.length }} chars</p>
      </div>

      <!-- Output -->
      <div class="space-y-1.5">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-base-content">{{ outputLabel }}</span>
          <CopyButton :text="result" />
        </div>
        <div
          class="w-full border rounded-box px-4 py-3 text-sm font-mono leading-relaxed min-h-52 break-all whitespace-pre-wrap"
          :class="
            error  ? 'border-error   bg-error/10   text-error'
          : result ? 'border-base-300 bg-base-100   text-base-content select-all'
                   : 'border-base-300 bg-base-100   text-base-content/30'
          "
        >
          <span v-if="error">{{ error }}</span>
          <span v-else-if="result">{{ result }}</span>
          <span v-else>Output will appear here…</span>
        </div>
        <p class="text-xs text-base-content/40 text-right">{{ result.length }} chars</p>
      </div>
    </div>
  </div>
</template>
