<script setup>
import { ref, computed } from 'vue'
import { Plus, X } from 'lucide-vue-next'
import CopyButton from '@/components/CopyButton.vue'

const ALIGNS = ['none', 'left', 'center', 'right']

const headers = ref(['Column 1', 'Column 2', 'Column 3'])
const aligns = ref(['none', 'none', 'none'])
const rows = ref([
  ['', '', ''],
  ['', '', ''],
])

function addColumn() {
  headers.value.push(`Column ${headers.value.length + 1}`)
  aligns.value.push('none')
  rows.value.forEach((r) => r.push(''))
}

function removeColumn(i) {
  if (headers.value.length <= 1) return
  headers.value.splice(i, 1)
  aligns.value.splice(i, 1)
  rows.value.forEach((r) => r.splice(i, 1))
}

function cycleAlign(i) {
  aligns.value[i] = ALIGNS[(ALIGNS.indexOf(aligns.value[i]) + 1) % ALIGNS.length]
}

function addRow() {
  rows.value.push(headers.value.map(() => ''))
}

function removeRow(i) {
  if (rows.value.length <= 1) return
  rows.value.splice(i, 1)
}

// Markdown table cells can't contain a raw `|` or newline without breaking the
// grid — escape/convert rather than silently producing broken output.
function escapeCell(text) {
  return String(text).replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>')
}

function alignMarker(align, width) {
  if (align === 'left') return ':' + '-'.repeat(width - 1)
  if (align === 'right') return '-'.repeat(width - 1) + ':'
  if (align === 'center') return ':' + '-'.repeat(Math.max(width - 2, 1)) + ':'
  return '-'.repeat(width)
}

const markdown = computed(() => {
  const escapedHeaders = headers.value.map(escapeCell)
  const escapedRows = rows.value.map((r) => r.map(escapeCell))

  // Pad every column to its widest cell so the raw Markdown source also reads
  // cleanly in a plain text editor, not just once rendered.
  const widths = escapedHeaders.map((h, i) =>
    Math.max(3, h.length, ...escapedRows.map((r) => r[i].length)),
  )

  const headerLine = `| ${escapedHeaders.map((h, i) => h.padEnd(widths[i])).join(' | ')} |`
  const sepLine = `| ${aligns.value.map((a, i) => alignMarker(a, widths[i])).join(' | ')} |`
  const bodyLines = escapedRows.map(
    (r) => `| ${r.map((c, i) => c.padEnd(widths[i])).join(' | ')} |`,
  )

  return [headerLine, sepLine, ...bodyLines].join('\n')
})

function reset() {
  headers.value = ['Column 1', 'Column 2', 'Column 3']
  aligns.value = ['none', 'none', 'none']
  rows.value = [
    ['', '', ''],
    ['', '', ''],
  ]
}
</script>

<template>
  <div class="max-w-4xl space-y-4">
    <!-- Toolbar -->
    <div class="flex flex-wrap items-center gap-2">
      <button @click="addColumn" class="btn btn-ghost btn-xs gap-1"><Plus class="w-3 h-3" /> Column</button>
      <button @click="addRow" class="btn btn-ghost btn-xs gap-1"><Plus class="w-3 h-3" /> Row</button>
      <button @click="reset" class="btn btn-ghost btn-xs text-base-content/50 ml-auto">Reset</button>
    </div>

    <!-- Editor -->
    <div class="overflow-x-auto border border-base-300 rounded-box p-3">
      <div class="inline-grid gap-1.5" :style="{ gridTemplateColumns: `repeat(${headers.length}, minmax(9rem, 1fr)) auto` }">
        <!-- Header row -->
        <template v-for="(h, i) in headers" :key="`h-${i}`">
          <div class="space-y-1">
            <input v-model="headers[i]" class="input input-sm w-full font-medium" placeholder="Header" />
            <button
              @click="cycleAlign(i)"
              class="btn btn-ghost btn-xs w-full font-mono text-base-content/50 justify-start"
              title="Click to cycle column alignment"
            >
              {{ aligns[i] === 'none' ? '—' : aligns[i] === 'left' ? '⟸' : aligns[i] === 'center' ? '⟺' : '⟹' }}
              <span class="capitalize">{{ aligns[i] }}</span>
            </button>
          </div>
        </template>
        <button
          @click="removeColumn(headers.length - 1)"
          :disabled="headers.length <= 1"
          class="btn btn-ghost btn-xs btn-square self-start"
          title="Remove last column"
        >
          <X class="w-3.5 h-3.5" />
        </button>

        <!-- Body rows -->
        <template v-for="(row, r) in rows" :key="`r-${r}`">
          <input
            v-for="(_, c) in row"
            :key="`c-${r}-${c}`"
            v-model="rows[r][c]"
            class="input input-sm w-full"
            placeholder="Cell"
          />
          <button @click="removeRow(r)" :disabled="rows.length <= 1" class="btn btn-ghost btn-xs btn-square" title="Remove row">
            <X class="w-3.5 h-3.5" />
          </button>
        </template>
      </div>
    </div>

    <!-- Output -->
    <div class="space-y-1.5">
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-base-content">Markdown</span>
        <CopyButton :text="markdown" success-message="Table copied" />
      </div>
      <div
        class="w-full border border-base-300 rounded-box px-4 py-3 font-mono text-sm leading-relaxed overflow-auto whitespace-pre bg-base-100 text-base-content"
      >{{ markdown }}</div>
    </div>
  </div>
</template>
