<script setup lang="ts">
import type { ScrollAlignment, ScrollAlignmentOptions, ScrollDetails } from '@pdanpdan/virtual-scroll';
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { computed, inject, ref } from 'vue';

import ExampleContainer from '#/components/ExampleContainer.vue';
import ScrollControls from '#/components/ScrollControls.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';

import rawCode from './+Page.vue?raw';

const itemCount = ref(1000);
const itemSize = ref(50);
const bufferBefore = ref(5);
const bufferAfter = ref(5);
const stickyHeader = ref(false);
const stickyFooter = ref(false);

// Use a deterministic function for item size
// Pattern: base, base*2, base, base*2, ...
const itemSizeFn = computed(() => {
  const base = itemSize.value;
  return (_: unknown, index: number) => index % 2 === 0 ? base : base * 2;
});

const items = computed(() => Array.from({ length: itemCount.value }, (_, i) => ({
  id: i,
  text: `Dynamic Item ${ i } (Height: ${ itemSizeFn.value(null, i) }px)`,
})));

const virtualScrollRef = ref();
const scrollDetails = ref<ScrollDetails | null>(null);
const debugMode = inject<Ref<boolean>>('debugMode', ref(false));

function onScroll(details: ScrollDetails) {
  scrollDetails.value = details;
}

function handleScrollToIndex(row: number | null, col: number | null, align: ScrollAlignment | ScrollAlignmentOptions) {
  virtualScrollRef.value?.scrollToIndex(row, col, align);
}

function handleScrollToOffset(x: number | null, y: number | null) {
  virtualScrollRef.value?.scrollToOffset(x, y);
}
</script>

<template>
  <ExampleContainer :code="rawCode">
    <template #title>
      <span class="example-title example-title--group-1">Vertical Dynamic</span>
    </template>

    <template #description>
      Vertical scrolling with variable item heights for {{ itemCount.toLocaleString() }} items. Automatically measures item sizes using <strong>ResizeObserver</strong>. Even items are {{ itemSize }}px, odd items are {{ itemSize * 2 }}px.
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
        <path stroke-linecap="round" stroke-linejoin="round" d="M3.45 4.5h14.25M3.45 9h9.75M3.45 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.7 21 21.45 17.25" />
      </svg>
    </template>

    <template #subtitle>
      Vertical scrolling with variable item heights
    </template>

    <template #controls>
      <div class="flex flex-wrap gap-2 md:gap-4 items-start">
        <ScrollStatus :scroll-details="scrollDetails" direction="vertical" />

        <ScrollControls
          v-model:item-count="itemCount"
          v-model:item-size="itemSize"
          v-model:buffer-before="bufferBefore"
          v-model:buffer-after="bufferAfter"
          v-model:sticky-header="stickyHeader"
          v-model:sticky-footer="stickyFooter"
          direction="vertical"
          @scroll-to-index="handleScrollToIndex"
          @scroll-to-offset="handleScrollToOffset"
          @refresh="virtualScrollRef?.refresh()"
        />
      </div>
    </template>

    <VirtualScroll
      ref="virtualScrollRef"
      :debug="debugMode"
      class="example-container"
      :items="items"
      :buffer-before="bufferBefore"
      :buffer-after="bufferAfter"
      :sticky-header="stickyHeader"
      :sticky-footer="stickyFooter"
      @scroll="onScroll"
    >
      <template v-if="stickyHeader" #header>
        <div class="example-sticky-header">
          Sticky Header
        </div>
      </template>

      <template #item="{ item, index }">
        <div class="example-vertical-item py-4">
          <span class="example-badge me-8">#{{ index }}</span>
          <div class="font-bold" :style="{ minBlockSize: `${ itemSizeFn(null, index) }px` }">{{ item.text }}</div>
        </div>
      </template>

      <template v-if="stickyFooter" #footer>
        <div class="example-sticky-footer">
          Sticky Footer
        </div>
      </template>
    </VirtualScroll>
  </ExampleContainer>
</template>
