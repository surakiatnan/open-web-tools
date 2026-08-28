<script setup>
import { ref, computed } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { Download } from 'lucide-vue-next'
import CopyButton from '@/components/CopyButton.vue'

marked.setOptions({ gfm: true, breaks: false })

const SAMPLE = `# Hello Markdown

Write **Markdown** on the left, see it rendered on the right.

- Supports \`inline code\`, [links](https://example.com), and lists
- GitHub-flavored tables and fenced code blocks

| Feature | Supported |
| --- | --- |
| Tables | ✅ |
| Code blocks | ✅ |

\`\`\`js
console.log('fenced code blocks too')
\`\`\`

> Blockquotes work as well.
`

const input = ref('')
const view = ref('preview') // 'preview' | 'html'

// Sanitized after parsing — this renders via v-html, so untrusted markup
// (e.g. a pasted <script> tag) must not survive into the DOM.
const html = computed(() => (input.value.trim() ? DOMPurify.sanitize(marked.parse(input.value)) : ''))

function loadSample() {
  input.value = SAMPLE
}

function download() {
  const blob = new Blob([html.value], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = Object.assign(document.createElement('a'), { href: url, download: 'output.html' })
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="max-w-5xl space-y-4">
    <!-- Toolbar -->
    <div class="flex flex-wrap items-center gap-3">
      <div class="join">
        <button @click="view = 'preview'" class="btn btn-sm join-item" :class="view === 'preview' ? 'btn-primary' : 'btn-ghost'">Preview</button>
        <button @click="view = 'html'" class="btn btn-sm join-item" :class="view === 'html' ? 'btn-primary' : 'btn-ghost'">HTML</button>
      </div>
      <button v-if="!input" @click="loadSample" class="btn btn-ghost btn-xs text-base-content/50">Load sample</button>
    </div>

    <!-- I/O panels -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="space-y-1.5">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-base-content">Markdown</span>
          <button v-if="input" @click="input = ''" class="btn btn-ghost btn-xs text-error hover:text-error">Clear</button>
        </div>
        <textarea
          v-model="input"
          placeholder="# Write some Markdown…"
          class="textarea w-full font-mono text-sm resize-none min-h-96 leading-relaxed"
          spellcheck="false"
        />
      </div>

      <div class="space-y-1.5">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-base-content">{{ view === 'preview' ? 'Preview' : 'HTML output' }}</span>
          <div class="flex gap-1">
            <CopyButton :text="html" success-message="HTML copied" />
            <button v-if="html" @click="download" class="btn btn-ghost btn-xs gap-1.5">
              <Download class="w-3 h-3" /> Save
            </button>
          </div>
        </div>

        <div
          v-if="view === 'preview'"
          class="md-preview w-full border border-base-300 rounded-box px-4 py-3 min-h-96 max-h-[32rem] overflow-auto bg-base-100"
        >
          <div v-if="html" v-html="html" />
          <span v-else class="text-base-content/30 text-sm">Preview will appear here…</span>
        </div>

        <div
          v-else
          class="w-full border border-base-300 rounded-box px-4 py-3 font-mono text-sm leading-relaxed min-h-96 max-h-[32rem] overflow-auto whitespace-pre-wrap break-all bg-base-100 text-base-content"
        >
          <span v-if="html">{{ html }}</span>
          <span v-else class="text-base-content/30">HTML will appear here…</span>
        </div>
      </div>
    </div>

    <div v-if="input" class="text-xs text-base-content/40 font-mono">
      {{ input.length.toLocaleString() }} chars
    </div>
  </div>
</template>

<style scoped>
/* Minimal prose styling for the rendered preview — the project has no
   typography plugin, and rendered markdown comes in via v-html (needs :deep). */
.md-preview :deep(h1) { font-size: 1.5rem; font-weight: 700; margin: 0.6em 0 0.4em; }
.md-preview :deep(h2) { font-size: 1.25rem; font-weight: 700; margin: 0.6em 0 0.4em; }
.md-preview :deep(h3) { font-size: 1.1rem; font-weight: 600; margin: 0.6em 0 0.3em; }
.md-preview :deep(h4),
.md-preview :deep(h5),
.md-preview :deep(h6) { font-weight: 600; margin: 0.5em 0 0.3em; }
.md-preview :deep(p) { margin: 0.5em 0; line-height: 1.6; }
.md-preview :deep(ul),
.md-preview :deep(ol) { margin: 0.5em 0; padding-left: 1.5em; }
.md-preview :deep(ul) { list-style: disc; }
.md-preview :deep(ol) { list-style: decimal; }
.md-preview :deep(li) { margin: 0.2em 0; }
.md-preview :deep(a) { color: var(--color-primary); text-decoration: underline; }
.md-preview :deep(code) {
  background: color-mix(in oklab, var(--color-base-content) 8%, transparent);
  padding: 0.1em 0.35em;
  border-radius: 0.3em;
  font-size: 0.875em;
}
.md-preview :deep(pre) {
  background: color-mix(in oklab, var(--color-base-content) 6%, transparent);
  padding: 0.75em 1em;
  border-radius: 0.5em;
  overflow-x: auto;
  margin: 0.6em 0;
}
.md-preview :deep(pre code) { background: none; padding: 0; }
.md-preview :deep(blockquote) {
  border-left: 3px solid var(--color-primary);
  padding-left: 1em;
  margin: 0.6em 0;
  color: color-mix(in oklab, var(--color-base-content) 70%, transparent);
}
.md-preview :deep(hr) { border: none; border-top: 1px solid var(--color-base-300); margin: 1em 0; }
.md-preview :deep(table) { border-collapse: collapse; width: 100%; margin: 0.6em 0; font-size: 0.9em; }
.md-preview :deep(th),
.md-preview :deep(td) { border: 1px solid var(--color-base-300); padding: 0.4em 0.6em; text-align: left; }
.md-preview :deep(th) { background: color-mix(in oklab, var(--color-base-content) 6%, transparent); font-weight: 600; }
.md-preview :deep(img) { max-width: 100%; border-radius: 0.4em; }
.md-preview :deep(strong) { font-weight: 700; }
.md-preview :deep(em) { font-style: italic; }
</style>
