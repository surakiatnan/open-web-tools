<script setup>
import { ref, computed } from 'vue'
import { Copy, Trash2, ClipboardPaste } from 'lucide-vue-next'

const text   = ref('')
const copied = ref(false)

const stats = computed(() => {
  const t = text.value
  return {
    characters:    t.length,
    withoutSpaces: t.replace(/\s/g, '').length,
    words:         t.trim() ? t.trim().split(/\s+/).length : 0,
    lines:         t ? t.split('\n').length : 0,
    sentences:     (t.match(/[^.!?]*[.!?]+/g) ?? []).length,
    paragraphs:    t.trim() ? t.trim().split(/\n\s*\n+/).length : 0,
  }
})

const actions = [
  {
    group: 'Case',
    items: [
      { label: 'UPPERCASE',     fn: (t) => t.toUpperCase() },
      { label: 'lowercase',     fn: (t) => t.toLowerCase() },
      { label: 'Title Case',    fn: (t) => t.replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase()) },
      { label: 'Sentence case', fn: (t) => t.replace(/(^\s*\w|[.!?]\s+\w)/g, (m) => m.toUpperCase()) },
      { label: 'camelCase',     fn: (t) => t.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()) },
      { label: 'snake_case',    fn: (t) => t.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') },
      { label: 'kebab-case',    fn: (t) => t.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') },
    ],
  },
  {
    group: 'Clean',
    items: [
      { label: 'Trim whitespace',     fn: (t) => t.trim() },
      { label: 'Remove extra spaces', fn: (t) => t.replace(/[ \t]+/g, ' ').replace(/\n /g, '\n') },
      { label: 'Remove blank lines',  fn: (t) => t.replace(/^\s*\n/gm, '') },
      { label: 'Collapse newlines',   fn: (t) => t.replace(/\n{2,}/g, '\n') },
      { label: 'Strip HTML tags',     fn: (t) => t.replace(/<[^>]*>/g, '') },
    ],
  },
  {
    group: 'Lines',
    items: [
      { label: 'Sort A → Z',    fn: (t) => t.split('\n').sort((a, b) => a.localeCompare(b)).join('\n') },
      { label: 'Sort Z → A',    fn: (t) => t.split('\n').sort((a, b) => b.localeCompare(a)).join('\n') },
      { label: 'Reverse lines', fn: (t) => t.split('\n').reverse().join('\n') },
      { label: 'Deduplicate',   fn: (t) => [...new Set(t.split('\n'))].join('\n') },
      { label: 'Shuffle lines', fn: (t) => t.split('\n').sort(() => Math.random() - 0.5).join('\n') },
    ],
  },
  {
    group: 'Transform',
    items: [
      { label: 'Reverse text',     fn: (t) => t.split('').reverse().join('') },
      { label: 'URL encode',       fn: (t) => encodeURIComponent(t) },
      { label: 'URL decode',       fn: (t) => { try { return decodeURIComponent(t) } catch { return t } } },
      { label: 'Add line numbers', fn: (t) => t.split('\n').map((l, i) => `${i + 1}. ${l}`).join('\n') },
    ],
  },
]

function apply(fn) { text.value = fn(text.value) }

async function copy() {
  await navigator.clipboard.writeText(text.value)
  copied.value = true
  setTimeout(() => (copied.value = false), 1500)
}

async function paste() {
  text.value = await navigator.clipboard.readText()
}
</script>

<template>
  <div class="max-w-5xl space-y-4">

    <!-- ── Stats ─────────────────────────────────────────────────────────── -->
    <!--  2 cols on mobile → 3 on sm → all 6 in one row on md+              -->
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
      <div
        v-for="[key, val] in Object.entries(stats)"
        :key="key"
        class="bg-base-100 border border-base-300 rounded-btn py-2.5 px-3 text-center"
      >
        <p class="text-base font-bold text-base-content leading-none">{{ val.toLocaleString() }}</p>
        <p class="text-xs text-base-content/50 capitalize mt-0.5 truncate">
          {{ key.replace(/([A-Z])/g, ' $1').trim() }}
        </p>
      </div>
    </div>

    <!-- ── Body: stack on mobile, 3-col grid on lg+ ──────────────────────── -->
    <!--
      Mobile order: [actions chips] → [editor]   (actions first so they're easy to tap)
      Desktop order: [editor 2/3]   → [actions 1/3] (classic sidebar)
    -->
    <div class="flex flex-col lg:grid lg:grid-cols-3 gap-4 lg:gap-6 lg:items-start">

      <!-- ── Editor ── order-2 on mobile, order-1 on desktop ─────────────── -->
      <div class="order-2 lg:order-1 lg:col-span-2 flex flex-col gap-2">

        <!-- Toolbar: icon-only on xs, icon+label on sm+ -->
        <div class="flex items-center justify-between gap-2">
          <span class="text-sm font-medium text-base-content">Text</span>
          <div class="flex gap-0.5">
            <button @click="paste" class="btn btn-ghost btn-xs gap-1.5">
              <ClipboardPaste class="w-3.5 h-3.5" />
              <span class="hidden sm:inline">Paste</span>
            </button>
            <button @click="copy" :disabled="!text" class="btn btn-ghost btn-xs gap-1.5">
              <Copy class="w-3.5 h-3.5" />
              <span class="hidden sm:inline">{{ copied ? 'Copied!' : 'Copy' }}</span>
            </button>
            <button
              @click="text = ''"
              :disabled="!text"
              class="btn btn-ghost btn-xs gap-1.5 text-error hover:text-error"
            >
              <Trash2 class="w-3.5 h-3.5" />
              <span class="hidden sm:inline">Clear</span>
            </button>
          </div>
        </div>

        <!--
          Textarea:
            mobile  → min-h-[10rem]  (~8 visible lines, user can scroll)
            desktop → min-h-[32rem]  (~20 lines, matches action panel height)
        -->
        <textarea
          v-model="text"
          placeholder="Paste or type your text here…"
          class="textarea w-full font-mono text-sm leading-relaxed resize-none min-h-40 lg:min-h-[32rem]"
          spellcheck="false"
        />
      </div>

      <!-- ── Actions ── order-1 on mobile (above textarea), order-2 on desktop -->
      <div class="order-1 lg:order-2 space-y-3 lg:overflow-y-auto lg:max-h-[38rem]">
        <div v-for="group in actions" :key="group.group">
          <p class="text-xs font-semibold uppercase tracking-wider text-base-content/40 mb-1.5">
            {{ group.group }}
          </p>

          <!--
            Mobile: chips in a horizontally scrollable row.
            The inline style hides the scrollbar cross-browser without extra utilities.
          -->
          <div
            class="flex gap-1.5 overflow-x-auto pb-1 lg:hidden"
            style="scrollbar-width: none; -webkit-overflow-scrolling: touch"
          >
            <button
              v-for="action in group.items"
              :key="action.label"
              @click="apply(action.fn)"
              :disabled="!text"
              class="btn btn-xs btn-outline shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {{ action.label }}
            </button>
          </div>

          <!-- Desktop: vertical DaisyUI menu list -->
          <ul class="hidden lg:flex flex-col menu p-0 gap-0.5">
            <li v-for="action in group.items" :key="action.label">
              <button
                @click="apply(action.fn)"
                :disabled="!text"
                class="text-sm text-left justify-start disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {{ action.label }}
              </button>
            </li>
          </ul>
        </div>
      </div>

    </div>
  </div>
</template>
