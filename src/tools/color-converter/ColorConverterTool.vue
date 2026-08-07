<script setup>
import { ref, computed, watch } from 'vue'
import CopyButton from '@/components/CopyButton.vue'

const input = ref('#7F9F80')
const alpha = ref(100) // percentage 0-100

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n))
}

function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360
  s = clamp(s, 0, 100) / 100
  l = clamp(l, 0, 100) / 100
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let rgb
  if (h < 60) rgb = [c, x, 0]
  else if (h < 120) rgb = [x, c, 0]
  else if (h < 180) rgb = [0, c, x]
  else if (h < 240) rgb = [0, x, c]
  else if (h < 300) rgb = [x, 0, c]
  else rgb = [c, 0, x]
  return {
    r: Math.round((rgb[0] + m) * 255),
    g: Math.round((rgb[1] + m) * 255),
    b: Math.round((rgb[2] + m) * 255),
  }
}

/** Parses HEX, rgb()/rgba(), and hsl()/hsla() strings into { r, g, b, a }. `a` is null when not specified. */
function parseColor(str) {
  const s = str.trim()
  if (!s) return null

  let m = s.match(/^#([0-9a-f]{3,8})$/i)
  if (m) {
    let h = m[1]
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join('')
    if (h.length !== 6 && h.length !== 8) return null
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
      a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : null,
    }
  }

  m = s.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/i)
  if (m) {
    return {
      r: clamp(Math.round(Number(m[1])), 0, 255),
      g: clamp(Math.round(Number(m[2])), 0, 255),
      b: clamp(Math.round(Number(m[3])), 0, 255),
      a: m[4] != null ? clamp(Number(m[4]), 0, 1) : null,
    }
  }

  m = s.match(/^hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*(?:,\s*([\d.]+)\s*)?\)$/i)
  if (m) {
    const { r, g, b } = hslToRgb(Number(m[1]), Number(m[2]), Number(m[3]))
    return { r, g, b, a: m[4] != null ? clamp(Number(m[4]), 0, 1) : null }
  }

  return null
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('')
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const l = (max + min) / 2
  let h = 0, s = 0
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

/** sRGB → OKLab → OKLCH, per Björn Ottosson's reference formulas. */
function rgbToOklch(r, g, b) {
  const toLinear = (c) => {
    c /= 255
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  }
  const R = toLinear(r), G = toLinear(g), B = toLinear(b)

  const l = 0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B
  const m = 0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B
  const s = 0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B

  const l_ = Math.cbrt(l), m_ = Math.cbrt(m), s_ = Math.cbrt(s)

  const L  = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_
  const a  = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_
  const b2 = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_

  const C = Math.sqrt(a * a + b2 * b2)
  let H = (Math.atan2(b2, a) * 180) / Math.PI
  if (H < 0) H += 360

  return { l: L * 100, c: C, h: H }
}

const parsed = computed(() => parseColor(input.value))
const valid  = computed(() => parsed.value !== null)

// If the pasted string carries its own alpha (rgba/hsla), sync the slider to it.
watch(parsed, (p) => {
  if (p && p.a != null) alpha.value = Math.round(p.a * 100)
})

const hexNoAlpha = computed(() => (valid.value ? rgbToHex(parsed.value.r, parsed.value.g, parsed.value.b) : '#000000'))
const alphaFrac   = computed(() => clamp(alpha.value, 0, 100) / 100)
const swatchColor = computed(() =>
  valid.value ? `rgba(${parsed.value.r}, ${parsed.value.g}, ${parsed.value.b}, ${alphaFrac.value})` : 'transparent',
)

function onPicker(e) {
  input.value = e.target.value
}

const rows = computed(() => {
  if (!valid.value) return []
  const { r, g, b } = parsed.value
  const hsl = rgbToHsl(r, g, b)
  const oklch = rgbToOklch(r, g, b)
  const a = alphaFrac.value

  return [
    { label: 'HEX',   value: a < 1 ? hexNoAlpha.value + Math.round(a * 255).toString(16).padStart(2, '0') : hexNoAlpha.value },
    { label: 'RGB',   value: `rgb(${r}, ${g}, ${b})` },
    { label: 'RGBA',  value: `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})` },
    { label: 'HSL',   value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
    { label: 'HSLA',  value: `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${a.toFixed(2)})` },
    { label: 'OKLCH', value: `oklch(${oklch.l.toFixed(1)}% ${oklch.c.toFixed(3)} ${oklch.h.toFixed(1)})` },
  ]
})
</script>

<template>
  <div class="max-w-2xl space-y-5">
    <!-- Input row: native picker + free-text field -->
    <div class="flex items-center gap-3">
      <input
        type="color"
        :value="hexNoAlpha"
        @input="onPicker"
        class="w-12 h-10 rounded-btn border border-base-300 cursor-pointer bg-transparent shrink-0"
        aria-label="Pick a color"
      />
      <input
        v-model="input"
        type="text"
        placeholder="#7F9F80, rgb(127, 159, 128), hsl(148, 20%, 56%)…"
        class="input flex-1 font-mono text-sm"
        spellcheck="false"
      />
    </div>

    <p v-if="!valid" class="text-xs text-error">Couldn't parse that color — try HEX, RGB, or HSL syntax.</p>

    <!-- Swatch preview -->
    <div class="rounded-box border border-base-300 overflow-hidden h-24 checker-bg">
      <div class="w-full h-full" :style="{ backgroundColor: swatchColor }" />
    </div>

    <!-- Alpha -->
    <div class="space-y-1.5">
      <div class="flex items-center justify-between text-xs text-base-content/60">
        <span>Alpha</span>
        <span class="font-mono">{{ alpha }}%</span>
      </div>
      <input v-model.number="alpha" type="range" min="0" max="100" class="range range-xs range-primary" />
    </div>

    <!-- Output rows -->
    <div v-if="valid" class="space-y-2">
      <div
        v-for="row in rows"
        :key="row.label"
        class="bg-base-100 border border-base-300 rounded-box px-4 py-2.5 flex items-center justify-between gap-3"
      >
        <div class="min-w-0">
          <p class="text-[11px] font-semibold text-base-content/40 uppercase tracking-wider">{{ row.label }}</p>
          <p class="font-mono text-sm text-base-content truncate select-all">{{ row.value }}</p>
        </div>
        <CopyButton :text="row.value" class="shrink-0" :success-message="`${row.label} copied`" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.checker-bg {
  background-image:
    linear-gradient(45deg, oklch(0% 0 0 / 0.15) 25%, transparent 25%),
    linear-gradient(-45deg, oklch(0% 0 0 / 0.15) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, oklch(0% 0 0 / 0.15) 75%),
    linear-gradient(-45deg, transparent 75%, oklch(0% 0 0 / 0.15) 75%);
  background-size: 16px 16px;
  background-position: 0 0, 0 8px, 8px -8px, -8px 0;
}
</style>
