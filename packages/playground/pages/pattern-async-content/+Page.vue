<script setup lang="ts">
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { computed, inject, onMounted, ref } from 'vue';

import ExampleContainer from '#/components/ExampleContainer.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';
import { useExampleScroll } from '#/lib/useExampleScroll';

import { html as highlightedCode } from './+Page.vue?highlight';
import AsyncRow from './AsyncRow.vue';
import { clearPostsCache, feedStats } from './post-feed';

// Items are plain ids: each visible row mounts a component that "fetches"
// simulated content (see AsyncRow.vue). Heights are dynamic and measured by
// ResizeObserver as content arrives; the per-post cache lives in the module,
// never in the recycled row DOM.

const COUNT_OPTIONS = [ 10_000, 50_000, 100_000 ];
const LATENCY_OPTIONS = [
  { label: 'Snappy', min: 40, max: 120 },
  { label: 'Normal', min: 120, max: 800 },
  { label: 'Slow', min: 800, max: 2500 },
];

const itemCount = ref(50_000);

// Live stats only exist client-side: while mounting/SSR the status line must
// show zeros so the server-rendered markup matches hydration exactly.
const mounted = ref(false);
const displayStats = computed(() => (mounted.value ? feedStats : { cached: 0, fetched: 0 }));
onMounted(() => {
  mounted.value = true;
});
const latency = ref(LATENCY_OPTIONS[ 1 ]!);
const cacheVersion = ref(0);

function clearCache() {
  clearPostsCache();
  cacheVersion.value++;
}

const items = computed(() => new Array(itemCount.value));
const latencyLabel = computed(() => `${ latency.value.min }–${ latency.value.max } ms`);

const {
  virtualScrollRef,
  scrollDetails,
  onScroll,
} = useExampleScroll();

const debugMode = inject<Ref<boolean>>('debugMode', ref(false));
</script>

<template>
  <ExampleContainer :code="highlightedCode">
    <template #title>
      <span class="example-title example-title--group-7">Async Content</span>
    </template>

    <template #description>
      Items are just ids: each visible row mounts a component that fetches simulated content. Revisiting a row reads from an in-memory cache, row heights are measured automatically as content arrives, and clearing the cache refetches what is on screen.
    </template>

    <template #icon>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="example-icon example-icon--group-7"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M12 17.25h8.25" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 15.75 9 18l2.25-2.25" />
      </svg>
    </template>

    <template #subtitle>
      Async content inside recycled, measured rows
    </template>

    <template #controls>
      <ScrollStatus
        :scroll-details="scrollDetails"
        direction="vertical"
        dom-count-selector=".example-container"
      />
    </template>

    <template #example-controls>
      <div class="flex flex-wrap gap-2 items-center">
        <label class="flex items-center gap-2 text-xs">
          <span class="small-caps font-bold tracking-widest opacity-60">Rows</span>
          <select v-model="itemCount" class="select select-sm">
            <option v-for="count in COUNT_OPTIONS" :key="count" :value="count">{{ count.toLocaleString() }}</option>
          </select>
        </label>

        <label class="flex items-center gap-2 text-xs">
          <span class="small-caps font-bold tracking-widest opacity-60">Network</span>
          <select v-model="latency" class="select select-sm">
            <option v-for="option in LATENCY_OPTIONS" :key="option.label" :value="option">{{ option.label }} ({{ option.min }}–{{ option.max }} ms)</option>
          </select>
        </label>

        <button class="btn btn-sm btn-soft" @click="clearCache">Clear cache</button>

        <div class="text-xs opacity-60 ms-auto">
          cached {{ displayStats.cached.toLocaleString() }} · fetched {{ displayStats.fetched.toLocaleString() }} · latency {{ latencyLabel }}
        </div>
      </div>
    </template>

    <VirtualScroll
      ref="virtualScrollRef"
      :debug="debugMode"
      class="example-container"
      :items="items"
      :buffer-before="4"
      :buffer-after="4"
      virtual-scrollbar
      aria-label="Async content feed list"
      @scroll="onScroll"
    >
      <template #item="{ index }">
        <div class="border-b border-base-content/5">
          <AsyncRow :id="index" :latency-min="latency.min" :latency-max="latency.max" :version="cacheVersion" />
        </div>
      </template>
    </VirtualScroll>
  </ExampleContainer>
</template>
