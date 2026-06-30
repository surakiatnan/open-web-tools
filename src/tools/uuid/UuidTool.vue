<script setup>
import { ref } from 'vue'
import { v1 as uuidv1, v4 as uuidv4, v7 as uuidv7 } from 'uuid'
import { RefreshCw, Copy, Trash2, CheckCheck } from 'lucide-vue-next'

const version     = ref('v4')
const count       = ref(1)
const format      = ref('default')
const uuids       = ref([])
const copiedIndex = ref(-1)
const copiedAll   = ref(false)

const versions = [
  { value: 'v1', label: 'v1 — Time-based'    },
  { value: 'v4', label: 'v4 — Random'         },
  { value: 'v7', label: 'v7 — Time-ordered'   },
]
const formats = [
  { value: 'default', label: 'Standard (lowercase)' },
  { value: 'upper',   label: 'UPPERCASE'             },
  { value: 'nodash',  label: 'No dashes'             },
]
const counts = [1, 5, 10, 25, 50, 100]

function makeOne() {
  let id = version.value === 'v1' ? uuidv1() : version.value === 'v7' ? uuidv7() : uuidv4()
  if (format.value === 'upper')  id = id.toUpperCase()
  if (format.value === 'nodash') id = id.replace(/-/g, '')
  return id
}

function generate() {
  uuids.value = Array.from({ length: count.value }, makeOne)
}

async function copyOne(idx) {
  await navigator.clipboard.writeText(uuids.value[idx])
  copiedIndex.value = idx
  setTimeout(() => (copiedIndex.value = -1), 1500)
}

async function copyAll() {
  await navigator.clipboard.writeText(uuids.value.join('\n'))
  copiedAll.value = true
  setTimeout(() => (copiedAll.value = false), 1500)
}

generate()
</script>

<template>
  <div class="max-w-2xl space-y-5">
    <!-- Controls -->
    <div class="grid grid-cols-3 gap-4">
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Version</legend>
        <select v-model="version" class="select w-full">
          <option v-for="v in versions" :key="v.value" :value="v.value">{{ v.label }}</option>
        </select>
      </fieldset>
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Count</legend>
        <select v-model.number="count" class="select w-full">
          <option v-for="c in counts" :key="c" :value="c">{{ c }}</option>
        </select>
      </fieldset>
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Format</legend>
        <select v-model="format" class="select w-full">
          <option v-for="f in formats" :key="f.value" :value="f.value">{{ f.label }}</option>
        </select>
      </fieldset>
    </div>

    <!-- Actions -->
    <div class="flex gap-2 flex-wrap">
      <button @click="generate" class="btn btn-primary gap-2">
        <RefreshCw class="w-4 h-4" /> Generate
      </button>
      <button v-if="uuids.length > 1" @click="copyAll" class="btn btn-outline gap-2">
        <CheckCheck class="w-4 h-4" />
        {{ copiedAll ? 'Copied all!' : `Copy all (${uuids.length})` }}
      </button>
      <button v-if="uuids.length" @click="uuids = []" class="btn btn-ghost btn-outline gap-2 ml-auto">
        <Trash2 class="w-4 h-4" /> Clear
      </button>
    </div>

    <!-- Results -->
    <div v-if="uuids.length" class="space-y-1.5">
      <div
        v-for="(id, i) in uuids"
        :key="i"
        class="group flex items-center justify-between bg-base-100 border border-base-300 rounded-btn px-4 py-2.5 hover:border-primary/40 transition-colors"
      >
        <code class="font-mono text-sm text-base-content select-all">{{ id }}</code>
        <button
          @click="copyOne(i)"
          class="shrink-0 ml-3 text-base-content/30 hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
          title="Copy"
        >
          <Copy class="w-4 h-4" />
        </button>
      </div>
      <p v-if="copiedIndex >= 0" class="text-xs text-primary text-right">Copied to clipboard</p>
    </div>
  </div>
</template>
