<template>
  <div
    class="rounded border border-gray-500/10 bg-shironezumi/3 p-2 dark:border-nalika-border dark:bg-nalika-surface"
  >
    <h2
      class="mb-3 text-sm font-bold tracking-wider text-gray-600 uppercase dark:text-nalika-text-muted"
    >
      {{ title }}
    </h2>
    <div v-if="items.length">
      <div
        class="flex items-end gap-4 border-b border-gray-300 pb-px dark:border-gray-600"
        :style="{ height: height + 'px' }"
      >
        <div
          v-for="bar in bars"
          :key="bar.label"
          class="flex h-full flex-1 flex-col items-center justify-end"
        >
          <div
            class="relative w-full shrink-0 rounded-t transition-all"
            :style="{ height: `${bar.barHeight}px`, background: color }"
          >
            <span
              v-if="bar.count"
              class="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-full font-mono text-xs text-gray-500 dark:text-nalika-text-muted"
            >
              {{ bar.count }}
            </span>
          </div>
        </div>
      </div>
      <div class="flex gap-4 pt-0.5">
        <div
          v-for="bar in bars"
          :key="bar.label"
          class="flex-1 text-center"
        >
          <span class="font-mono text-xs text-gray-600 dark:text-nalika-text-muted">
            {{ bar.label }}
          </span>
        </div>
      </div>
    </div>
    <p
      v-else
      class="py-4 text-center text-sm text-gray-400 dark:text-gray-500"
    >
      No data
    </p>
  </div>
</template>

<script setup>
const props = defineProps({
  title: { type: String, required: true },
  items: { type: Array, required: true },
  color: { type: String, required: true },
  height: { type: Number, default: 160 },
  barMax: { type: Number, default: 130 },
})

const bars = computed(() => {
  const counts = props.items.map(i => i.count)
  const maxCount = Math.max(...counts, 1)
  return props.items.map(i => ({
    ...i,
    barHeight: (i.count / maxCount) * props.barMax,
  }))
})
</script>
