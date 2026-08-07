<script setup>
import { reactive, ref, computed } from 'vue'

const pattern    = ref('')
const testString = ref('')

const FLAGS = [
  { key: 'g', label: 'g', title: 'Global — find all matches' },
  { key: 'i', label: 'i', title: 'Case-insensitive' },
  { key: 'm', label: 'm', title: 'Multiline — ^ and $ match line boundaries' },
  { key: 's', label: 's', title: 'Dotall — . matches newlines' },
  { key: 'u', label: 'u', title: 'Unicode' },
]
const flags = reactive({ g: true, i: false, m: false, s: false, u: false })
const flagsString = computed(() => FLAGS.filter((f) => flags[f.key]).map((f) => f.key).join(''))

const PRESETS = [
  { label: 'Email',   pattern: String.raw`[\w.+-]+@[\w-]+\.[\w.-]+` },
  { label: 'URL',     pattern: String.raw`https?:\/\/[^\s]+` },
  { label: 'IPv4',    pattern: String.raw`\b(?:\d{1,3}\.){3}\d{1,3}\b` },
  { label: 'Hex color', pattern: String.raw`#[0-9a-fA-F]{3,8}\b` },
]
function applyPreset(p) {
  pattern.value = p.pattern
}

const regexResult = computed(() => {
  if (!pattern.value) return { regex: null, error: null }
  try {
    return { regex: new RegExp(pattern.value, flagsString.value), error: null }
  } catch (e) {
    return { regex: null, error: e.message }
  }
})

const matches = computed(() => {
  const { regex } = regexResult.value
  if (!regex || !testString.value) return []
  // Always search globally so highlighting/match list work regardless of the "g" flag.
  const search = regex.global ? regex : new RegExp(regex.source, regex.flags + 'g')
  return [...testString.value.matchAll(search)]
})

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

const highlighted = computed(() => {
  const text = testString.value
  if (!text) return ''
  if (regexResult.value.error || !matches.value.length) return escapeHtml(text)

  let result = ''
  let last = 0
  for (const m of matches.value) {
    if (m.index == null) continue
    result += escapeHtml(text.slice(last, m.index))
    result += `<mark class="bg-primary/30 text-base-content rounded px-0.5">${escapeHtml(m[0]) || '&nbsp;'}</mark>`
    last = m.index + m[0].length
  }
  result += escapeHtml(text.slice(last))
  return result
})
</script>

<template>
  <div class="max-w-4xl space-y-5">
    <!-- Pattern -->
    <div class="space-y-1.5">
      <span class="text-sm font-medium text-base-content">Pattern</span>
      <label class="input w-full flex items-center gap-1 font-mono text-sm">
        <span class="text-base-content/40">/</span>
        <input
          v-model="pattern"
          type="text"
          placeholder="[\w.+-]+@[\w-]+\.[\w.-]+"
          class="grow bg-transparent outline-none"
          spellcheck="false"
        />
        <span class="text-base-content/40">/{{ flagsString }}</span>
      </label>
    </div>

    <!-- Flags + presets -->
    <div class="flex flex-wrap items-center gap-4">
      <div class="flex items-center gap-3">
        <label v-for="f in FLAGS" :key="f.key" class="flex items-center gap-1.5 cursor-pointer" :title="f.title">
          <input v-model="flags[f.key]" type="checkbox" class="checkbox checkbox-xs checkbox-primary" />
          <span class="text-xs font-mono text-base-content/70">{{ f.label }}</span>
        </label>
      </div>

      <div class="join">
        <button
          v-for="p in PRESETS"
          :key="p.label"
          @click="applyPreset(p)"
          class="btn btn-ghost btn-xs join-item"
        >
          {{ p.label }}
        </button>
      </div>
    </div>

    <p v-if="regexResult.error" class="text-xs text-error">{{ regexResult.error }}</p>

    <!-- Test string + highlighted preview -->
    <div class="space-y-1.5">
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-base-content">Test string</span>
        <button v-if="testString" @click="testString = ''" class="btn btn-ghost btn-xs text-error hover:text-error">Clear</button>
      </div>
      <textarea
        v-model="testString"
        rows="8"
        placeholder="Paste sample text to match against…"
        class="textarea w-full font-mono text-sm leading-relaxed resize-none"
        spellcheck="false"
      />
    </div>

    <div v-if="testString" class="space-y-1.5">
      <span class="text-sm font-medium text-base-content">Highlighted matches</span>
      <div
        class="w-full border border-base-300 rounded-box px-4 py-3 font-mono text-sm leading-relaxed min-h-24 whitespace-pre-wrap break-all bg-base-100"
        v-html="highlighted"
      />
    </div>

    <!-- Match list -->
    <div v-if="matches.length" class="space-y-2">
      <span class="text-sm font-medium text-base-content">{{ matches.length }} match{{ matches.length === 1 ? '' : 'es' }}</span>
      <div
        v-for="(m, i) in matches"
        :key="i"
        class="bg-base-100 border border-base-300 rounded-box p-3 space-y-1"
      >
        <div class="flex items-center justify-between gap-2">
          <span class="font-mono text-sm text-base-content select-all break-all">{{ m[0] || '(empty match)' }}</span>
          <span class="text-xs text-base-content/40 shrink-0">at index {{ m.index }}</span>
        </div>
        <div v-if="m.length > 1" class="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-base-content/60 font-mono">
          <span v-for="(g, gi) in m.slice(1)" :key="gi">
            Group {{ gi + 1 }}: <span class="text-base-content">{{ g ?? '(no match)' }}</span>
          </span>
        </div>
        <div v-if="m.groups" class="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-base-content/60 font-mono">
          <span v-for="(val, name) in m.groups" :key="name">
            {{ name }}: <span class="text-base-content">{{ val ?? '(no match)' }}</span>
          </span>
        </div>
      </div>
    </div>
    <p v-else-if="pattern && testString && !regexResult.error" class="text-sm text-base-content/30">No matches found.</p>
  </div>
</template>
