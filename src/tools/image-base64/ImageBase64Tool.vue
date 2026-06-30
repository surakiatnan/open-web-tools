<script setup>
import { ref } from 'vue'
import { ImageUp, Copy, X } from 'lucide-vue-next'

const dragging   = ref(false)
const dataUri    = ref('')
const base64Only = ref('')
const meta       = ref(null)
const mode       = ref('datauri')
const copied     = ref(false)

function loadFile(file) {
  if (!file || !file.type.startsWith('image/')) return
  meta.value = { name: file.name, type: file.type, origSize: file.size }
  const reader = new FileReader()
  reader.onload = (e) => {
    dataUri.value    = e.target.result
    base64Only.value = e.target.result.split(',')[1]
  }
  reader.readAsDataURL(file)
}

function onDrop(e) {
  dragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) loadFile(file)
}

function onPick(e) {
  const file = e.target.files?.[0]
  if (file) loadFile(file)
  e.target.value = ''
}

function clear() {
  dataUri.value    = ''
  base64Only.value = ''
  meta.value       = null
}

function fmt(bytes) {
  if (bytes < 1024)        return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1024 / 1024).toFixed(2) + ' MB'
}

async function copy() {
  const val = mode.value === 'datauri' ? dataUri.value : base64Only.value
  await navigator.clipboard.writeText(val)
  copied.value = true
  setTimeout(() => (copied.value = false), 1500)
}
</script>

<template>
  <div class="max-w-2xl space-y-4">

    <!-- Drop zone (shown when no image loaded) -->
    <label
      v-if="!dataUri"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="onDrop"
      class="flex flex-col items-center gap-3 border-2 border-dashed rounded-box p-10 text-center cursor-pointer transition-colors"
      :class="dragging ? 'border-primary bg-primary/5' : 'border-base-300 hover:border-primary/40 hover:bg-base-100'"
    >
      <input type="file" accept="image/*" class="hidden" @change="onPick" />
      <ImageUp class="w-10 h-10 text-base-content/25" />
      <div>
        <p class="text-sm text-base-content/60">Drop an image here or <span class="text-primary font-medium">browse</span></p>
        <p class="text-xs text-base-content/30 mt-1">PNG · JPG · GIF · SVG · WebP</p>
      </div>
    </label>

    <!-- Result (shown once an image is loaded) -->
    <div v-else class="space-y-4">
      <!-- Preview card -->
      <div class="bg-base-100 border border-base-300 rounded-box p-4 flex gap-4 items-start flex-wrap">
        <img :src="dataUri" class="w-20 h-20 object-contain rounded-btn bg-base-200 shrink-0" />
        <div class="flex-1 min-w-0 space-y-1">
          <p class="font-medium text-base-content truncate text-sm">{{ meta.name }}</p>
          <p class="text-xs text-base-content/50 font-mono">{{ meta.type }}</p>
          <div class="flex gap-4 text-xs text-base-content/40 font-mono flex-wrap">
            <span>Original: {{ fmt(meta.origSize) }}</span>
            <span>Data URI: {{ fmt(dataUri.length) }}</span>
          </div>
        </div>
        <button @click="clear" class="btn btn-ghost btn-xs btn-square shrink-0" title="Remove">
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Mode + Copy -->
      <div class="flex items-center justify-between flex-wrap gap-3">
        <div class="join">
          <button @click="mode = 'datauri'" class="btn btn-sm join-item" :class="mode === 'datauri' ? 'btn-primary' : 'btn-ghost'">Full data URI</button>
          <button @click="mode = 'base64'"  class="btn btn-sm join-item" :class="mode === 'base64'  ? 'btn-primary' : 'btn-ghost'">Base64 only</button>
        </div>
        <button @click="copy" class="btn btn-outline btn-sm gap-2">
          <Copy class="w-4 h-4" />
          {{ copied ? 'Copied!' : 'Copy output' }}
        </button>
      </div>

      <!-- Output preview -->
      <div class="bg-base-100 border border-base-300 rounded-box px-4 py-3 font-mono text-xs text-base-content/60 break-all max-h-40 overflow-y-auto select-all leading-relaxed">
        {{ mode === 'datauri' ? dataUri : base64Only }}
      </div>

      <!-- Replace -->
      <label class="btn btn-ghost btn-sm gap-2 cursor-pointer w-fit">
        <input type="file" accept="image/*" class="hidden" @change="onPick" />
        <ImageUp class="w-4 h-4" /> Load another image
      </label>
    </div>
  </div>
</template>
