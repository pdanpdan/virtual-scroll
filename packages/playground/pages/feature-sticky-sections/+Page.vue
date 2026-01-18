<script setup lang="ts">
import type { ScrollDetails } from '@pdanpdan/virtual-scroll';
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { computed, inject, ref } from 'vue';

import ExampleContainer from '#/components/ExampleContainer.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';

import rawCode from './+Page.vue?raw';

const sectionCount = 20;
const itemsPerSection = 10;

const items = computed(() => {
  const result = [];
  for (let s = 0; s < sectionCount; s++) {
    // Header item
    result.push({ type: 'header', label: `Section ${ String.fromCharCode(65 + s) }` });
    // Data items
    for (let i = 0; i < itemsPerSection; i++) {
      result.push({ type: 'item', label: `Item ${ s }-${ i }` });
    }
  }
  return result;
});

const stickyIndices = computed(() => {
  const indices = [];
  for (let i = 0; i < items.value.length; i += (itemsPerSection + 1)) {
    indices.push(i);
  }
  return indices;
});

const scrollDetails = ref<ScrollDetails | null>(null);
const debugMode = inject<Ref<boolean>>('debugMode', ref(false));

function onScroll(details: ScrollDetails) {
  scrollDetails.value = details;
}
</script>

<template>
  <ExampleContainer :code="rawCode">
    <template #title>
      <span class="text-secondary font-bold uppercase opacity-90 pe-2 align-baseline">Sticky Sections</span>
    </template>

    <template #description>
      Demonstrates iOS-style sticky headers using the <strong>stickyIndices</strong> prop for {{ sectionCount }} sections with {{ itemsPerSection }} items each. When a new header scrolls up, it 'pushes' the previous sticky header out of the view.
    </template>

    <template #icon>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="size-12 p-2 rounded-xl bg-secondary text-secondary-content shadow-lg"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
      </svg>
    </template>

    <template #subtitle>
      Section headers with pushing effect
    </template>

    <template #controls>
      <div class="flex flex-wrap gap-2 md:gap-4 items-start">
        <ScrollStatus :scroll-details="scrollDetails" direction="vertical" />
      </div>
    </template>

    <VirtualScroll
      :debug="debugMode"
      class="bg-base-100"
      :items="items"
      :item-size="50"
      :sticky-indices="stickyIndices"
      @scroll="onScroll"
    >
      <template #item="{ item, isStickyActive }">
        <div
          v-if="item.type === 'header'"
          class="h-full flex items-center px-6 bg-base-300 border-b border-base-300 font-bold uppercase tracking-wider text-primary"
          :class="{ 'shadow-md': isStickyActive }"
        >
          {{ item.label }}
        </div>
        <div v-else class="h-full flex items-center px-8 border-b border-base-200 hover:bg-base-300 transition-colors">
          {{ item.label }}
        </div>
      </template>
    </VirtualScroll>
  </ExampleContainer>
</template>
