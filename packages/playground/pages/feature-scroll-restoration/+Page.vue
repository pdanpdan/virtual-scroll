<script setup lang="ts">
import type { ScrollDetails } from '@pdanpdan/virtual-scroll';
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { inject, ref } from 'vue';

import ExampleContainer from '#/components/ExampleContainer.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';

import rawCode from './+Page.vue?raw';

const items = ref(Array.from({ length: 50 }, (_, i) => ({ id: `orig-${ i }`, label: `Original Item ${ i }` })));
const prependCount = ref(0);
const restoreScrollOnPrepend = ref(true);
const scrollDetails = ref<ScrollDetails | null>(null);
const debugMode = inject<Ref<boolean>>('debugMode', ref(false));

function prependItems() {
  const count = 5;
  const newItems = Array.from({ length: count }, (_, i) => ({
    id: `prepended-${ prependCount.value + i }`,
    label: `Prepended Item ${ prependCount.value + i }`,
  }));

  items.value = [ ...newItems, ...items.value ];
  prependCount.value += count;
}

const appendCount = ref(0);
function appendItems() {
  const count = 5;
  const newItems = Array.from({ length: count }, (_, i) => ({
    id: `appended-${ appendCount.value + i }`,
    label: `Appended Item ${ appendCount.value + i }`,
  }));

  items.value = [ ...items.value, ...newItems ];
  appendCount.value += count;
}

function onScroll(details: ScrollDetails) {
  scrollDetails.value = details;
}
</script>

<template>
  <ExampleContainer :code="rawCode">
    <template #title>
      <span class="text-warning font-bold uppercase opacity-90 pe-2 align-baseline">Scroll Restoration</span>
    </template>

    <template #description>
      Demonstrates the <strong>restoreScrollOnPrepend</strong> prop. Currently showing {{ items.length.toLocaleString() }} items. When items are added to the beginning of the list, the scroll position is adjusted to keep the current view stable.
    </template>

    <template #icon>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="size-12 p-2 rounded-xl bg-warning text-warning-content shadow-lg"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" class="rotate-180 origin-center" />
      </svg>
    </template>

    <template #subtitle>
      Maintain scroll position when prepending items
    </template>

    <template #controls>
      <div class="flex flex-wrap gap-2 md:gap-4 items-start">
        <ScrollStatus :scroll-details="scrollDetails" direction="vertical" />

        <div class="flex flex-col items-stretch gap-4 p-4 bg-base-300 rounded-box border border-base-300">
          <label class="flex items-center gap-2 cursor-pointer">
            <span class="text-sm font-medium">Restore Scroll on Prepend</span>
            <input v-model="restoreScrollOnPrepend" type="checkbox" class="toggle toggle-primary toggle-sm" />
          </label>

          <button class="btn btn-sm btn-soft btn-primary" @click="prependItems">Prepend 5 Items</button>
          <button class="btn btn-sm btn-soft btn-primary" @click="appendItems">Append 5 Items</button>
          <button class="btn btn-sm btn-soft btn-error" @click="items = []">Clear</button>
        </div>
      </div>
    </template>

    <VirtualScroll
      :debug="debugMode"
      class="bg-base-100"
      :items="items"
      :item-size="60"
      :restore-scroll-on-prepend="restoreScrollOnPrepend"
      @scroll="onScroll"
    >
      <template #item="{ item, index }">
        <div class="h-full flex items-center px-6 border-b border-base-200 hover:bg-base-300 transition-colors">
          <span class="badge badge-neutral mr-4">#{{ index }}</span>
          <span class="font-medium">{{ item.label }}</span>
        </div>
      </template>
    </VirtualScroll>
  </ExampleContainer>
</template>
