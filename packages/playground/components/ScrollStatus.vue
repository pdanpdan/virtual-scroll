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
  <ul class="max-sm:w-full min-w-84 list bg-base-300 rounded-box shadow-md text-sm pointer-events-auto">
    <li class="list-row py-4 items-center">
      <div class="opacity-60 tracking-wide uppercase">Scroll Status</div>
      <div class="grid *:[grid-area:1/1]">
        <div v-if="scrollDetails?.isScrolling" class="status status-lg animate-ping" :class="fpsClass" />
        <div class="status status-lg" :class="fpsClass" />
      </div>
      <div />
      <div v-if="refreshRate" class="font-bold flex items-center gap-2">
        {{ currentFps }} / {{ refreshRate }} fps
      </div>
    </li>

    <li class="list-row py-1.5 items-center">
      <div class="opacity-60">Direction</div>
      <div />
      <div class="uppercase font-semibold">{{ direction || 'vertical' }}</div>
    </li>

    <li class="list-row py-1.5 items-center">
      <div class="opacity-60">Total Size (px)</div>
      <div />
      <div class="font-semibold">
        <template v-if="direction !== 'vertical'">
          {{ Math.round(scrollDetails?.totalSize.width || 0) }}
        </template>
        <template v-if="direction === 'both'">
          &times;
        </template>
        <template v-if="direction !== 'horizontal'">
          {{ Math.round(scrollDetails?.totalSize.height || 0) }}
        </template>
      </div>
    </li>

    <li class="list-row py-1.5 items-center">
      <div class="opacity-60">Viewport Size (px)</div>
      <div />
      <div class="font-semibold">
        <template v-if="direction !== 'vertical'">
          {{ Math.round(scrollDetails?.viewportSize.width || 0) }}
        </template>
        <template v-if="direction === 'both'">
          &times;
        </template>
        <template v-if="direction !== 'horizontal'">
          {{ Math.round(scrollDetails?.viewportSize.height || 0) }}
        </template>
      </div>
    </li>

    <li class="list-row py-1.5 items-center">
      <div class="opacity-60">Scroll Offset (px)</div>
      <div />
      <div class="font-semibold">
        <template v-if="direction !== 'vertical'">
          {{ Math.round(scrollDetails?.scrollOffset.x || 0) }}
        </template>
        <template v-if="direction === 'both'">
          &times;
        </template>
        <template v-if="direction !== 'horizontal'">
          {{ Math.round(scrollDetails?.scrollOffset.y || 0) }}
        </template>
      </div>
    </li>

    <li class="list-row py-1.5 items-center">
      <div class="opacity-60">Current Item #</div>
      <div />
      <div class="font-semibold">
        {{ scrollDetails?.currentIndex }}
        <template v-if="direction === 'both'">
          &times;
          {{ scrollDetails?.currentColIndex }}
        </template>
      </div>
    </li>

    <li class="list-row py-1.5 items-center">
      <div class="opacity-60">Rendered Range #</div>
      <div />
      <div class="font-semibold">
        {{ itemsRange.start }}:{{ itemsRange.end }}
        <template v-if="columnRange">
          &times;
          {{ columnRange.start }}:{{ columnRange.end }}
        </template>
      </div>
    </li>
  </ul>
</template>
