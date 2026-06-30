<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { RefreshCw, Copy, Eye, EyeOff } from 'lucide-vue-next'

const password = ref('')
const copied   = ref(false)
const visible  = ref(false)

const config = reactive({
  length:    16,
  uppercase: true,
  lowercase: true,
  numbers:   true,
  symbols:   true,
})

const charSets = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers:   '0123456789',
  symbols:   '!@#$%^&*()_+-=[]{}|;:,.<>?',
}

function generate() {
  const pool = Object.entries(charSets)
    .filter(([key]) => config[key])
    .map(([, chars]) => chars)
    .join('')
  if (!pool) { password.value = ''; return }
  const bytes = new Uint32Array(config.length)
  crypto.getRandomValues(bytes)
  password.value = Array.from(bytes, (n) => pool[n % pool.length]).join('')
}

const strength = computed(() => {
  const p = password.value
  if (!p) return { score: 0, label: '', cls: '' }
  let score = 0
  if (p.length >= 8)  score++
  if (p.length >= 12) score++
  if (p.length >= 16) score++
  if (/[A-Z]/.test(p)) score++
  if (/[a-z]/.test(p)) score++
  if (/[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  const level = Math.min(4, Math.ceil(score / 1.75))
  const map = [
    null,
    { label: 'Weak',   cls: 'progress-error'   },
    { label: 'Fair',   cls: 'progress-warning'  },
    { label: 'Good',   cls: 'progress-info'     },
    { label: 'Strong', cls: 'progress-success'  },
  ]
  return { score: level, ...(map[level] ?? map[1]) }
})

async function copy() {
  if (!password.value) return
  await navigator.clipboard.writeText(password.value)
  copied.value = true
  setTimeout(() => (copied.value = false), 1500)
}

watch(config, generate, { deep: true })
generate()
</script>

<template>
  <div class="max-w-lg space-y-5">
    <!-- Password display -->
    <div class="bg-base-100 border border-base-300 rounded-box p-4 space-y-3">
      <div class="flex items-center gap-2">
        <code
          class="flex-1 font-mono text-lg text-base-content break-all leading-relaxed"
          :class="visible ? '' : 'tracking-widest'"
        >
          {{ visible ? password : password.replace(/./g, '•') }}
        </code>
        <button
          @click="visible = !visible"
          class="btn btn-ghost btn-sm btn-square text-base-content/40"
          :title="visible ? 'Hide' : 'Show'"
        >
          <EyeOff v-if="visible" class="w-4 h-4" />
          <Eye v-else class="w-4 h-4" />
        </button>
      </div>

      <!-- Strength -->
      <div v-if="password" class="space-y-1">
        <progress
          class="progress w-full h-1.5 transition-all duration-300"
          :class="strength.cls"
          :value="strength.score"
          max="4"
        />
        <div class="flex items-center justify-between text-xs">
          <span class="text-base-content/60 font-medium">{{ strength.label }}</span>
          <span class="text-base-content/40">{{ password.length }} chars</span>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex gap-2">
      <button @click="generate" class="btn btn-primary gap-2">
        <RefreshCw class="w-4 h-4" /> Generate
      </button>
      <button @click="copy" :disabled="!password" class="btn btn-outline gap-2">
        <Copy class="w-4 h-4" />
        {{ copied ? 'Copied!' : 'Copy' }}
      </button>
    </div>

    <!-- Config -->
    <div class="bg-base-100 border border-base-300 rounded-box p-4 space-y-5">
      <!-- Length -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-base-content">Length</span>
          <span class="text-sm font-mono font-semibold text-primary">{{ config.length }}</span>
        </div>
        <input
          v-model.number="config.length"
          type="range"
          min="4"
          max="128"
          class="range range-primary range-sm w-full"
        />
        <div class="flex justify-between text-xs text-base-content/40 mt-1">
          <span>4</span><span>128</span>
        </div>
      </div>

      <!-- Character sets -->
      <div class="space-y-2">
        <span class="text-sm font-medium text-base-content">Character sets</span>
        <div class="grid grid-cols-2 gap-2">
          <label
            v-for="[key, sample] in [['uppercase', 'A–Z'], ['lowercase', 'a–z'], ['numbers', '0–9'], ['symbols', '!@#…']]"
            :key="key"
            class="flex items-center gap-2.5 p-2.5 rounded-btn border cursor-pointer transition-colors"
            :class="config[key] ? 'border-primary/40 bg-primary/5' : 'border-base-300 hover:bg-base-300/40'"
          >
            <input type="checkbox" v-model="config[key]" class="checkbox checkbox-primary checkbox-sm" />
            <div>
              <p class="text-sm font-medium text-base-content capitalize">{{ key }}</p>
              <p class="text-xs text-base-content/50 font-mono">{{ sample }}</p>
            </div>
          </label>
        </div>
        <p v-if="!config.uppercase && !config.lowercase && !config.numbers && !config.symbols" class="text-xs text-error">
          Select at least one character set.
        </p>
      </div>
    </div>
  </div>
</template>
