<script setup>
import { ref, computed } from 'vue'
import CopyButton from '@/components/CopyButton.vue'

const original         = ref('')
const changed          = ref('')
const ignoreCase       = ref(false)
const ignoreWhitespace = ref(false)

const MAX_CELLS = 4_000_000 // guard against O(n·m) DP freezing the tab on huge inputs

function normalize(line) {
  let l = line
  if (ignoreWhitespace.value) l = l.trim().replace(/\s+/g, ' ')
  if (ignoreCase.value) l = l.toLowerCase()
  return l
}

/** Classic LCS-based line diff. Returns rows of { type: 'equal'|'add'|'remove', a?, b? }. */
function diffLines(linesA, linesB) {
  const n = linesA.length, m = linesB.length
  const na = linesA.map(normalize), nb = linesB.map(normalize)

  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0))
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = na[i] === nb[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
    }
  }

  const rows = []
  let i = 0, j = 0
  while (i < n && j < m) {
    if (na[i] === nb[j]) { rows.push({ type: 'equal', a: linesA[i], b: linesB[j] }); i++; j++ }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { rows.push({ type: 'remove', a: linesA[i] }); i++ }
    else { rows.push({ type: 'add', b: linesB[j] }); j++ }
  }
  while (i < n) { rows.push({ type: 'remove', a: linesA[i] }); i++ }
  while (j < m) { rows.push({ type: 'add', b: linesB[j] }); j++ }
  return rows
}

const diff = computed(() => {
  if (!original.value && !changed.value) return { rows: [], tooLarge: false }
  const linesA = original.value.split('\n')
  const linesB = changed.value.split('\n')
  if (linesA.length * linesB.length > MAX_CELLS) return { rows: [], tooLarge: true }
  return { rows: diffLines(linesA, linesB), tooLarge: false }
})

const stats = computed(() =>
  diff.value.rows.reduce(
    (acc, r) => {
      if (r.type === 'add') acc.added++
      if (r.type === 'remove') acc.removed++
      return acc
    },
    { added: 0, removed: 0 },
  ),
)

const rowClass = {
  add:    'bg-success/10 text-success border-l-2 border-success',
  remove: 'bg-error/10 text-error border-l-2 border-error',
  equal:  'text-base-content/70 border-l-2 border-transparent',
}
const rowPrefix = { add: '+', remove: '−', equal: ' ' }

const diffText = computed(() =>
  diff.value.rows.map((r) => `${rowPrefix[r.type]} ${r.type === 'add' ? r.b : r.a}`).join('\n'),
)
</script>

<template>
  <div class="max-w-4xl space-y-5">
    <!-- I/O panels -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="space-y-1.5">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-base-content">Original</span>
          <button v-if="original" @click="original = ''" class="btn btn-ghost btn-xs text-error hover:text-error">Clear</button>
        </div>
        <textarea
          v-model="original"
          rows="10"
          placeholder="Paste the original text…"
          class="textarea w-full font-mono text-sm leading-relaxed resize-none"
          spellcheck="false"
        />
      </div>

      <div class="space-y-1.5">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-base-content">Changed</span>
          <button v-if="changed" @click="changed = ''" class="btn btn-ghost btn-xs text-error hover:text-error">Clear</button>
        </div>
        <textarea
          v-model="changed"
          rows="10"
          placeholder="Paste the changed text…"
          class="textarea w-full font-mono text-sm leading-relaxed resize-none"
          spellcheck="false"
        />
      </div>
    </div>

    <!-- Options -->
    <div class="flex flex-wrap items-center gap-4 text-sm">
      <label class="flex items-center gap-1.5 cursor-pointer">
        <input v-model="ignoreCase" type="checkbox" class="checkbox checkbox-xs checkbox-primary" />
        <span class="text-base-content/70">Ignore case</span>
      </label>
      <label class="flex items-center gap-1.5 cursor-pointer">
        <input v-model="ignoreWhitespace" type="checkbox" class="checkbox checkbox-xs checkbox-primary" />
        <span class="text-base-content/70">Ignore whitespace</span>
      </label>
    </div>

    <p v-if="diff.tooLarge" class="text-sm text-warning">Input is too large to diff line-by-line — try shorter text.</p>

    <template v-else-if="original || changed">
      <!-- Stats + copy -->
      <div class="flex items-center justify-between">
        <div class="flex gap-4 text-xs font-mono">
          <span class="text-success">+{{ stats.added }}</span>
          <span class="text-error">−{{ stats.removed }}</span>
        </div>
        <CopyButton v-if="diff.rows.length" :text="diffText" label="Copy diff" success-message="Diff copied" />
      </div>

      <!-- Unified diff view -->
      <div class="border border-base-300 rounded-box overflow-hidden font-mono text-sm divide-y divide-base-300/50">
        <div
          v-for="(row, i) in diff.rows"
          :key="i"
          class="px-3 py-0.5 whitespace-pre-wrap break-all"
          :class="rowClass[row.type]"
        >
          <span class="select-none opacity-50 mr-2">{{ rowPrefix[row.type] }}</span>{{ row.type === 'add' ? row.b : row.a }}
        </div>
      </div>
    </template>
  </div>
</template>
