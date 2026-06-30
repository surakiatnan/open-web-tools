<script setup>
import { ref, computed } from 'vue'
import { Copy, RefreshCw } from 'lucide-vue-next'

const WORDS = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum'.split(' ')

const CLASSIC = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'

const type     = ref('paragraphs')
const count    = ref(3)
const classic  = ref(true)
const seed     = ref(0)
const copied   = ref(false)

function rng(n) {
  // deterministic-ish shuffle from seed + index
  return WORDS[(seed.value * 31 + n * 17) % WORDS.length]
}
function word(n)     { return WORDS[Math.abs((seed.value * 13 + n * 7) % WORDS.length)] }
function sentence(i) {
  const len   = 8 + ((seed.value + i * 3) % 10)
  const words = Array.from({ length: len }, (_, j) => word(i * 20 + j))
  return words[0].charAt(0).toUpperCase() + words.slice(1).join(' ') + '.'
}
function paragraph(i) {
  const len = 4 + ((seed.value + i) % 4)
  return Array.from({ length: len }, (_, j) => sentence(i * 10 + j)).join(' ')
}

const output = computed(() => {
  void seed.value // track for reactivity
  if (type.value === 'words') {
    const words = Array.from({ length: count.value }, (_, i) => word(i))
    if (classic.value) words.splice(0, 5, 'Lorem', 'ipsum', 'dolor', 'sit', 'amet')
    return words.join(' ')
  }
  if (type.value === 'sentences') {
    const sents = Array.from({ length: count.value }, (_, i) => sentence(i))
    if (classic.value) sents[0] = CLASSIC
    return sents.join(' ')
  }
  const paras = Array.from({ length: count.value }, (_, i) => paragraph(i))
  if (classic.value) paras[0] = CLASSIC + ' ' + paras[0]
  return paras.join('\n\n')
})

function regenerate() { seed.value = (seed.value + 1) % 10000 }

async function copy() {
  await navigator.clipboard.writeText(output.value)
  copied.value = true
  setTimeout(() => (copied.value = false), 1500)
}
</script>

<template>
  <div class="max-w-2xl space-y-5">
    <!-- Controls -->
    <div class="flex flex-wrap gap-4 items-end">
      <div>
        <p class="text-xs text-base-content/50 mb-1.5">Type</p>
        <div class="join">
          <button
            v-for="t in ['paragraphs', 'sentences', 'words']"
            :key="t"
            @click="type = t"
            class="btn btn-sm join-item capitalize"
            :class="type === t ? 'btn-primary' : 'btn-ghost'"
          >{{ t }}</button>
        </div>
      </div>
      <div class="flex-1 min-w-36">
        <p class="text-xs text-base-content/50 mb-1.5">Count: <span class="font-mono font-semibold text-base-content">{{ count }}</span></p>
        <input v-model.number="count" type="range" min="1" max="20" class="range range-primary range-sm w-full" />
      </div>
    </div>

    <label class="flex items-center gap-2.5 cursor-pointer w-fit">
      <input v-model="classic" type="checkbox" class="checkbox checkbox-sm checkbox-primary" />
      <span class="text-sm text-base-content/70">Start with "Lorem ipsum dolor sit amet…"</span>
    </label>

    <!-- Output -->
    <div class="space-y-2">
      <div class="flex items-center justify-between flex-wrap gap-2">
        <span class="text-xs text-base-content/40 font-mono">
          {{ output.trim().split(/\s+/).length }} words · {{ output.length }} chars
        </span>
        <div class="flex gap-1.5">
          <button @click="regenerate" class="btn btn-ghost btn-xs gap-1.5">
            <RefreshCw class="w-3 h-3" /> Regenerate
          </button>
          <button @click="copy" class="btn btn-ghost btn-xs gap-1.5">
            <Copy class="w-3 h-3" /> {{ copied ? 'Copied!' : 'Copy' }}
          </button>
        </div>
      </div>
      <div class="bg-base-100 border border-base-300 rounded-box px-5 py-4 text-sm text-base-content leading-relaxed whitespace-pre-wrap select-all">
        {{ output }}
      </div>
    </div>
  </div>
</template>
