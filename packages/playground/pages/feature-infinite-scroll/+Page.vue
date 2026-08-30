<script setup lang="ts">
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { inject, ref } from 'vue';

import ExampleContainer from '#/components/ExampleContainer.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';
import { useExampleScroll } from '#/lib/useExampleScroll';

import { html as highlightedCode } from './+Page.vue?highlight';

const items = ref(Array.from({ length: 50 }, (_, i) => ({ id: i, label: `Initial Item ${ i }` })));
const loading = ref(false);
const autoLoad = ref(true);
// The demo source is finite: once the limit is reached there is no more data,
// so the loading slot must not show (and nothing should be fetched).
const TOTAL_LIMIT = 500;
const hasMore = ref(true);
const {
  scrollDetails,
  onScroll,
} = useExampleScroll();

const debugMode = inject<Ref<boolean>>('debugMode', ref(false));

async function loadMore() {
  if (loading.value || !hasMore.value) {
    return;
  }

  loading.value = true;
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const start = items.value.length;
  if (start >= TOTAL_LIMIT) {
    hasMore.value = false;
    loading.value = false;
    return;
  }
  const newItems = Array.from({ length: Math.min(20, TOTAL_LIMIT - start) }, (_, i) => ({
    id: start + i,
    label: `Loaded Item ${ start + i }`,
  }));

  items.value = [ ...items.value, ...newItems ];
  loading.value = false;
}

async function onLoad(direction: 'vertical' | 'horizontal') {
  if (autoLoad.value && direction === 'vertical') {
    await loadMore();
  }
}
</script>

<template>
  <ExampleContainer :code="highlightedCode">
    <template #title>
      <span class="example-title example-title--group-1">Infinite Scroll</span>
    </template>

    <template #description>
      Demonstrates the <strong>load</strong> event and <strong>loading</strong> prop/slot. Currently showing {{ items.length.toLocaleString() }} items. When you reach the end of the list, more items are automatically fetched and appended. The demo source is capped at {{ TOTAL_LIMIT.toLocaleString() }} items — the loading slot only appears while auto-loading is on and there is still data to fetch.
    </template>

    <template #icon>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="example-icon example-icon--group-1"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
    </template>

    <template #subtitle>
      Automatic pagination with loading indicators
    </template>

    <template #controls>
      <ScrollStatus :scroll-details="scrollDetails" direction="vertical" />
    </template>

    <template #example-controls>
      <div class="flex flex-wrap gap-4 items-center">
        <label class="settings-item group">
          <span class="settings-label pe-4">Auto-loading</span>
          <input v-model="autoLoad" type="checkbox" class="toggle toggle-primary toggle-sm" />
        </label>

        <button class="btn btn-sm btn-soft btn-primary" :disabled="loading" @click="loadMore">Load More</button>
        <button class="btn btn-sm btn-soft btn-error" @click="items = []">Clear</button>
      </div>
    </template>

    <VirtualScroll
      :debug="debugMode"
      class="example-container"
      :items="items"
      :item-size="60"
      :loading="loading"
      :load-distance="300"
      aria-label="Infinite scrolling list"
      @load="onLoad"
      @scroll="onScroll"
    >
      <template #item="{ item, index }">
        <div class="example-vertical-item example-vertical-item--fixed">
          <span class="example-badge me-4">#{{ index }}</span>
          <span class="font-medium">{{ item.label }}</span>
        </div>
      </template>

      <template v-if="autoLoad && hasMore" #loading>
        <div class="p-8 flex flex-col items-center justify-center gap-4 bg-base-200 border-t border-base-300">
          <span class="loading loading-spinner loading-md text-primary" />
          <span class="text-xs font-bold small-caps tracking-widest opacity-70">Fetching more items...</span>
        </div>
      </template>
    </VirtualScroll>
  </ExampleContainer>
</template>
