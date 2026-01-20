<script setup lang="ts">
import type { ScrollDetails } from '@pdanpdan/virtual-scroll';
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { inject, ref } from 'vue';

import ExampleContainer from '#/components/ExampleContainer.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';

import rawCode from './+Page.vue?raw';

const items = ref(Array.from({ length: 50 }, (_, i) => ({ id: i, label: `Initial Item ${ i }` })));
const loading = ref(false);
const autoLoad = ref(true);
const scrollDetails = ref<ScrollDetails | null>(null);
const debugMode = inject<Ref<boolean>>('debugMode', ref(false));

async function loadMore() {
  if (loading.value) {
    return;
  }

  loading.value = true;
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const start = items.value.length;
  const newItems = Array.from({ length: 20 }, (_, i) => ({
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

function onScroll(details: ScrollDetails) {
  scrollDetails.value = details;
}
</script>

<template>
  <ExampleContainer :code="rawCode">
    <template #title>
      <span class="example-title example-title--group-1">Infinite Scroll</span>
    </template>

    <template #description>
      Demonstrates the <strong>load</strong> event and <strong>loading</strong> prop/slot. Currently showing {{ items.length.toLocaleString() }} items. When you reach the end of the list, more items are automatically fetched and appended.
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
      <div class="flex flex-wrap gap-2 md:gap-4 items-start">
        <ScrollStatus :scroll-details="scrollDetails" direction="vertical" />

        <div class="flex flex-col items-stretch gap-4 p-5 bg-base-300 rounded-box border border-base-content/5 shadow-md">
          <label class="settings-item group">
            <span class="settings-label">Auto-loading</span>
            <input v-model="autoLoad" type="checkbox" class="toggle toggle-primary toggle-sm" />
          </label>

          <div class="grid grid-cols-2 gap-2 mt-2">
            <button class="btn btn-sm btn-primary" :disabled="loading" @click="loadMore">Load More</button>
            <button class="btn btn-sm btn-error btn-soft" @click="items = []">Clear</button>
          </div>
        </div>
      </div>
    </template>

    <VirtualScroll
      :debug="debugMode"
      class="example-container"
      :items="items"
      :item-size="60"
      :loading="loading"
      :load-distance="300"
      @load="onLoad"
      @scroll="onScroll"
    >
      <template #item="{ item, index }">
        <div class="example-vertical-item example-vertical-item--fixed">
          <span class="example-badge mr-4">#{{ index }}</span>
          <span class="font-medium">{{ item.label }}</span>
        </div>
      </template>

      <template #loading>
        <div class="p-8 flex flex-col items-center justify-center gap-4 bg-base-200 border-t border-base-300">
          <span class="loading loading-spinner loading-md text-primary" />
          <span class="text-xs font-bold small-caps tracking-widest opacity-70">Fetching more items...</span>
        </div>
      </template>
    </VirtualScroll>
  </ExampleContainer>
</template>
