<script setup>
import { ref, watch, onMounted } from 'vue'
import QRCode from 'qrcode'
import { Download, Copy } from 'lucide-vue-next'

const input      = ref('https://example.com')
const size       = ref(256)
const fgColor    = ref('#000000')
const bgColor    = ref('#ffffff')
const errorLevel = ref('M')
const dataUrl    = ref('')
const error      = ref('')
const copied     = ref(false)

const errorLevels = [
  { value: 'L', label: 'L — Low (7%)'       },
  { value: 'M', label: 'M — Medium (15%)'   },
  { value: 'Q', label: 'Q — Quartile (25%)' },
  { value: 'H', label: 'H — High (30%)'     },
]
const sizes = [128, 192, 256, 384, 512]

async function generate() {
  if (!input.value.trim()) { dataUrl.value = ''; error.value = ''; return }
  try {
    error.value = ''
    dataUrl.value = await QRCode.toDataURL(input.value, {
      width: size.value,
      margin: 2,
      color: { dark: fgColor.value, light: bgColor.value },
      errorCorrectionLevel: errorLevel.value,
    })
  } catch (e) {
    error.value = e.message
  }
}

function download() {
  const a = document.createElement('a')
  a.download = 'qrcode.png'
  a.href = dataUrl.value
  a.click()
}

async function copyImage() {
  const res  = await fetch(dataUrl.value)
  const blob = await res.blob()
  await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })])
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}

watch([input, size, fgColor, bgColor, errorLevel], generate)
onMounted(generate)
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
    <!-- Controls -->
    <div class="space-y-5">
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Content</legend>
        <textarea
          v-model="input"
          rows="4"
          placeholder="Enter a URL or any text…"
          class="textarea w-full resize-none"
        />
      </fieldset>

      <div class="grid grid-cols-2 gap-4">
        <fieldset class="fieldset">
          <legend class="fieldset-legend">Size</legend>
          <select v-model.number="size" class="select w-full">
            <option v-for="s in sizes" :key="s" :value="s">{{ s }}×{{ s }}px</option>
          </select>
        </fieldset>
        <fieldset class="fieldset">
          <legend class="fieldset-legend">Error Correction</legend>
          <select v-model="errorLevel" class="select w-full">
            <option v-for="el in errorLevels" :key="el.value" :value="el.value">{{ el.label }}</option>
          </select>
        </fieldset>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <fieldset class="fieldset">
          <legend class="fieldset-legend">Foreground</legend>
          <label class="input flex items-center gap-2 cursor-pointer">
            <input type="color" v-model="fgColor" class="w-6 h-6 rounded border-0 bg-transparent p-0 cursor-pointer" />
            <span class="font-mono text-sm">{{ fgColor }}</span>
          </label>
        </fieldset>
        <fieldset class="fieldset">
          <legend class="fieldset-legend">Background</legend>
          <label class="input flex items-center gap-2 cursor-pointer">
            <input type="color" v-model="bgColor" class="w-6 h-6 rounded border-0 bg-transparent p-0 cursor-pointer" />
            <span class="font-mono text-sm">{{ bgColor }}</span>
          </label>
        </fieldset>
      </div>
    </div>

    <!-- Preview -->
    <div class="flex flex-col items-center gap-4">
      <div
        class="w-full flex items-center justify-center rounded-box border border-base-300 p-6 min-h-48"
        :style="{ background: bgColor }"
      >
        <img v-if="dataUrl" :src="dataUrl" :alt="`QR code for: ${input}`" class="max-w-full" />
        <p v-else-if="error" class="text-error text-sm text-center">{{ error }}</p>
        <p v-else class="text-base-content/40 text-sm">Enter content to generate a QR code</p>
      </div>

      <div v-if="dataUrl" class="flex gap-2 w-full">
        <button @click="download" class="btn btn-primary flex-1 gap-2">
          <Download class="w-4 h-4" />
          Download PNG
        </button>
        <button @click="copyImage" class="btn btn-outline gap-2">
          <Copy class="w-4 h-4" />
          {{ copied ? 'Copied!' : 'Copy' }}
        </button>
      </div>
    </div>
  </div>
</template>
