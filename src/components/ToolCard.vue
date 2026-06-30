<script setup>
import { getIcon } from '@/utils/icons'

const props = defineProps({
  tool: { type: Object, required: true },
})

// Map category → DaisyUI badge variant
const categoryBadge = {
  Generator: 'badge-secondary',
  Converter: 'badge-accent',
  Formatter: 'badge-warning',
  Utility:   'badge-neutral',
}
</script>

<template>
  <router-link
    :to="`/${tool.id}`"
    class="group bg-base-100 border border-base-300 rounded-box p-3 sm:p-5 flex flex-col gap-2 sm:gap-3 hover:border-primary/50 hover:shadow-lg hover:shadow-base-200 transition-all duration-200"
  >
    <div class="flex items-start justify-between">
      <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-btn bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors shrink-0">
        <component :is="getIcon(tool.icon)" class="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
      </div>
      <span class="badge badge-xs sm:badge-sm badge-outline" :class="categoryBadge[tool.category] ?? 'badge-neutral'">
        {{ tool.category }}
      </span>
    </div>
    <div>
      <h3 class="font-semibold text-sm sm:text-base text-base-content group-hover:text-primary transition-colors leading-snug">
        {{ tool.name }}
      </h3>
      <p class="text-xs sm:text-sm text-base-content/60 mt-0.5 leading-snug">{{ tool.description }}</p>
    </div>
  </router-link>
</template>
