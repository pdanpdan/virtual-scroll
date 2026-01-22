<script setup lang="ts">
import type { ScrollDetails } from '@pdanpdan/virtual-scroll';

import { computed, onMounted, onUnmounted } from 'vue';

import { currentFps, efficiency, refreshRate, startDetection, stopDetection } from '#/fps';

const props = defineProps<{
  scrollDetails: ScrollDetails | null;
  direction?: string;
  columnRange?: {
    start: number;
    end: number;
    padStart: number;
    padEnd: number;
  };
}>();

const itemsRange = computed(() => ({
  start: props.scrollDetails?.items[ 0 ]?.index ?? 0,
  end: props.scrollDetails?.items[ props.scrollDetails?.items.length - 1 ]?.index ?? 0,
}));

const fpsClass = computed(() => {
  const val = efficiency.value;
  if (val > 90) {
    return 'status-success';
  }
  return (val > 60) ? 'status-warning' : 'status-error';
});

onMounted(startDetection);
onUnmounted(stopDetection);
</script>

<template>
  <ul class="max-sm:w-full min-w-84 list bg-base-300 rounded-box shadow-soft text-sm pointer-events-auto">
    <li class="list-row py-4 items-center border-b border-base-content/5">
      <div class="font-bold text-xs small-caps tracking-widest opacity-50">Scroll Status</div>
      <div class="grid *:[grid-area:1/1]">
        <div v-if="scrollDetails?.isScrolling" class="status status-lg animate-ping" :class="fpsClass" />
        <div class="status status-lg" :class="fpsClass" />
      </div>
      <div />
      <div v-if="refreshRate" class="font-mono -mb-1 text-sm font-extrabold flex items-center gap-2 text-base-content/80">
        {{ currentFps }} / {{ refreshRate }} <span class="small-caps tracking-tighter opacity-50">fps</span>
      </div>
    </li>

    <li class="list-row py-2 items-center">
      <div class="text-xs font-bold small-caps opacity-40 tracking-wider">Direction</div>
      <div />
      <div class="small-caps font-extrabold text-primary tracking-widest text-xs">{{ direction || 'vertical' }}</div>
    </li>

    <li class="list-row py-2 items-center border-t border-base-content/5">
      <div class="text-xs font-bold small-caps opacity-40 tracking-wider">Current Item #</div>
      <div />
      <div class="inline-flex font-mono font-bold text-primary">
        {{ scrollDetails?.currentIndex }}
        <template v-if="direction === 'both'">
          <span class="opacity-50 mx-1">&times;</span>
          {{ scrollDetails?.currentColIndex }}
        </template>
      </div>
    </li>

    <li class="list-row py-2 items-center border-t border-base-content/5">
      <div class="text-xs font-bold small-caps opacity-40 tracking-wider">Rendered Range #</div>
      <div />
      <div class="inline-flex font-mono font-bold text-secondary">
        {{ itemsRange.start }}:{{ itemsRange.end }}
        <template v-if="columnRange">
          <span class="opacity-50 mx-1">&times;</span>
          {{ columnRange.start }}:{{ columnRange.end }}
        </template>
      </div>
    </li>

    <li class="list-row py-2 items-center border-t border-base-content/5">
      <div class="text-xs font-bold small-caps opacity-40 tracking-wider">Total Size (px)</div>
      <div />
      <div class="inline-flex font-mono font-bold text-base-content/70">
        <template v-if="direction !== 'vertical'">
          {{ Math.round(scrollDetails?.totalSize.width || 0) }}
        </template>
        <template v-if="direction === 'both'">
          <span class="opacity-50 mx-1">&times;</span>
        </template>
        <template v-if="direction !== 'horizontal'">
          {{ Math.round(scrollDetails?.totalSize.height || 0) }}
        </template>
      </div>
    </li>

    <li class="list-row py-2 items-center border-t border-base-content/5">
      <div class="text-xs font-bold small-caps opacity-40 tracking-wider">Viewport Size (px)</div>
      <div />
      <div class="inline-flex font-mono font-bold text-base-content/70">
        <template v-if="direction !== 'vertical'">
          {{ Math.round(scrollDetails?.viewportSize.width || 0) }}
        </template>
        <template v-if="direction === 'both'">
          <span class="opacity-50 mx-1">&times;</span>
        </template>
        <template v-if="direction !== 'horizontal'">
          {{ Math.round(scrollDetails?.viewportSize.height || 0) }}
        </template>
      </div>
    </li>

    <li class="list-row py-2 items-center border-t border-base-content/5">
      <div class="text-xs font-bold small-caps opacity-40 tracking-wider">Scroll Offset (px)</div>
      <div />
      <div class="inline-flex font-mono font-bold text-base-content/70">
        <template v-if="direction !== 'vertical'">
          {{ Math.round(scrollDetails?.scrollOffset.x || 0) }}
        </template>
        <template v-if="direction === 'both'">
          <span class="opacity-50 mx-1">&times;</span>
        </template>
        <template v-if="direction !== 'horizontal'">
          {{ Math.round(scrollDetails?.scrollOffset.y || 0) }}
        </template>
      </div>
    </li>
  </ul>
</template>
