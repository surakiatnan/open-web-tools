<script setup>
import { ref, computed } from 'vue'
import { Copy, AlertCircle, CheckCircle2, Clock } from 'lucide-vue-next'

const token = ref('')

function b64urlDecode(str) {
  const base64 = str
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(str.length + (4 - (str.length % 4)) % 4, '=')
  try {
    return JSON.parse(atob(base64))
  } catch {
    return null
  }
}

const decoded = computed(() => {
  const t = token.value.trim()
  if (!t) return null
  const parts = t.split('.')
  if (parts.length !== 3) return { error: 'Not a valid JWT — expected 3 dot-separated parts.' }
  const header  = b64urlDecode(parts[0])
  const payload = b64urlDecode(parts[1])
  if (!header || !payload) return { error: 'Failed to decode token — parts may not be valid Base64url JSON.' }
  const now = Math.floor(Date.now() / 1000)
  const status = payload.exp && now > payload.exp ? 'expired'
               : payload.nbf && now < payload.nbf ? 'not-yet'
               : 'valid'
  return { header, payload, signature: parts[2], status }
})

function fmtTs(ts) {
  return ts ? new Date(ts * 1000).toLocaleString() : null
}

const copied = ref('')
async function copy(obj) {
  const val = JSON.stringify(obj, null, 2)
  await navigator.clipboard.writeText(val)
  copied.value = JSON.stringify(obj)
  setTimeout(() => (copied.value = ''), 1500)
}
</script>

<template>
  <div class="max-w-2xl space-y-4">
    <!-- Token input -->
    <div class="space-y-1.5">
      <span class="text-sm font-medium text-base-content">JWT Token</span>
      <textarea
        v-model="token"
        placeholder="Paste your JWT here — eyJhbGciOi..."
        class="textarea w-full font-mono text-xs resize-none min-h-24 leading-relaxed"
        spellcheck="false"
      />
    </div>

    <div v-if="decoded">
      <!-- Error -->
      <div v-if="decoded.error" class="alert alert-error text-sm gap-2">
        <AlertCircle class="w-4 h-4 shrink-0" />
        {{ decoded.error }}
      </div>

      <div v-else class="space-y-3">
        <!-- Status row -->
        <div class="flex items-center gap-2 flex-wrap">
          <CheckCircle2 v-if="decoded.status === 'valid'" class="w-4 h-4 text-success shrink-0" />
          <AlertCircle  v-else class="w-4 h-4 text-error shrink-0" />
          <span class="text-sm font-semibold" :class="decoded.status === 'valid' ? 'text-success' : 'text-error'">
            {{ decoded.status === 'valid' ? 'Valid' : decoded.status === 'expired' ? 'Expired' : 'Not yet valid' }}
          </span>
          <span class="badge badge-sm badge-outline font-mono">{{ decoded.header.alg }}</span>
          <span v-if="decoded.header.typ" class="badge badge-sm badge-outline font-mono">{{ decoded.header.typ }}</span>
        </div>

        <!-- Header -->
        <div class="bg-base-100 border border-base-300 rounded-box p-4 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold uppercase tracking-wider text-base-content/40">Header</span>
            <button @click="copy(decoded.header)" class="btn btn-ghost btn-xs gap-1">
              <Copy class="w-3 h-3" />
              {{ copied === JSON.stringify(decoded.header) ? 'Copied!' : 'Copy' }}
            </button>
          </div>
          <pre class="font-mono text-xs text-base-content overflow-x-auto leading-relaxed">{{ JSON.stringify(decoded.header, null, 2) }}</pre>
        </div>

        <!-- Payload -->
        <div class="bg-base-100 border border-base-300 rounded-box p-4 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold uppercase tracking-wider text-base-content/40">Payload</span>
            <button @click="copy(decoded.payload)" class="btn btn-ghost btn-xs gap-1">
              <Copy class="w-3 h-3" />
              {{ copied === JSON.stringify(decoded.payload) ? 'Copied!' : 'Copy' }}
            </button>
          </div>
          <pre class="font-mono text-xs text-base-content overflow-x-auto leading-relaxed">{{ JSON.stringify(decoded.payload, null, 2) }}</pre>
          <!-- Time claims -->
          <div
            v-if="decoded.payload.iat || decoded.payload.exp || decoded.payload.nbf"
            class="pt-2.5 border-t border-base-300 space-y-1.5"
          >
            <div v-if="decoded.payload.iat" class="flex items-center gap-2 text-xs text-base-content/50">
              <Clock class="w-3 h-3 shrink-0" />
              <span class="text-base-content/30 w-20 shrink-0">Issued</span>
              {{ fmtTs(decoded.payload.iat) }}
            </div>
            <div v-if="decoded.payload.exp" class="flex items-center gap-2 text-xs" :class="decoded.status === 'expired' ? 'text-error' : 'text-base-content/50'">
              <Clock class="w-3 h-3 shrink-0" />
              <span class="w-20 shrink-0 opacity-60">Expires</span>
              {{ fmtTs(decoded.payload.exp) }}
            </div>
            <div v-if="decoded.payload.nbf" class="flex items-center gap-2 text-xs text-base-content/50">
              <Clock class="w-3 h-3 shrink-0" />
              <span class="text-base-content/30 w-20 shrink-0">Not before</span>
              {{ fmtTs(decoded.payload.nbf) }}
            </div>
          </div>
        </div>

        <!-- Signature -->
        <div class="bg-base-100 border border-base-300 rounded-box p-4 space-y-1.5">
          <span class="text-xs font-semibold uppercase tracking-wider text-base-content/40">Signature</span>
          <p class="font-mono text-xs text-base-content/50 break-all">{{ decoded.signature }}</p>
          <p class="text-xs text-base-content/30">Verification requires the secret or public key and cannot be done in-browser.</p>
        </div>
      </div>
    </div>
  </div>
</template>
