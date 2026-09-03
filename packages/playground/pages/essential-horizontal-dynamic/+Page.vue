<script setup lang="ts">
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { computed, inject, ref } from 'vue';

import ExampleContainer from '#/components/ExampleContainer.vue';
import ScrollControls from '#/components/ScrollControls.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';
import { useExampleScroll } from '#/lib/useExampleScroll';

import { html as highlightedCode } from './+Page.vue?highlight';

const itemCount = ref(1000);
const baseItemSize = ref(150);
const bufferBefore = ref(20);
const bufferAfter = ref(20);
const virtualScrollbar = ref(true);

// Use a deterministic function for item size
// Pattern: base, base*2, base, base*2, ...
const itemSizeFn = computed(() => {
  const base = baseItemSize.value;
  return (item: unknown, index: number) => index % 2 === 0 ? base : base * 2;
});

// Items render purely from their index: the items array is a sparse placeholder
// of the right length, so no per-row data is materialized even for 10M+ rows
// (only the visible window is ever accessed).
const items = computed(() => new Array(itemCount.value));

const {
  virtualScrollRef,
  scrollDetails,
  onScroll,
  handleScrollToIndex,
  handleScrollToOffset,
} = useExampleScroll();

const debugMode = inject<Ref<boolean>>('debugMode', ref(false));
</script>

<template>
  <ExampleContainer :code="highlightedCode">
    <template #title>
      <span class="example-title example-title--group-3">Horizontal Dynamic</span>
    </template>

    <template #description>
      Horizontal scrolling with {{ itemCount.toLocaleString() }} items with different widths measured via <strong>ResizeObserver</strong>. Even items are {{ baseItemSize }}px, odd items are {{ baseItemSize * 2 }}px. Try resizing the container!
    </template>

    <template #icon>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="example-icon example-icon--group-3"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.25 21 21 17.25" class="-rotate-90 origin-center" />
      </svg>
    </template>

    <template #subtitle>
      Horizontal scrolling with variable item widths
    </template>

    <template #controls>
      <ScrollStatus
        dom-count-selector=".example-container"
        :scroll-details="scrollDetails"
        direction="horizontal"
      />

      <ScrollControls
        v-model:item-count="itemCount"
        v-model:item-size="baseItemSize"
        v-model:buffer-before="bufferBefore"
        v-model:buffer-after="bufferAfter"
        v-model:virtual-scrollbar="virtualScrollbar"
        direction="horizontal"
        @scroll-to-index="handleScrollToIndex"
        @scroll-to-offset="handleScrollToOffset"
        @refresh="virtualScrollRef?.refresh()"
      />
    </template>

    <VirtualScroll
      ref="virtualScrollRef"
      :debug="debugMode"
      class="example-container"
      direction="horizontal"
      :items="items"
      :buffer-before="bufferBefore"
      :buffer-after="bufferAfter"
      :virtual-scrollbar="virtualScrollbar"
      aria-label="Dynamic width horizontal list"
      @scroll="onScroll"
    >
      <template #item="{ index }">
        <div class="example-horizontal-item px-4">
          <span class="example-badge mb-4">#{{ index }}</span>
          <div class="font-bold text-sm mb-1" :style="{ inlineSize: `${ itemSizeFn(null, index) }px` }">
            Dynamic Item {{ index }}
          </div>
          <div class="text-xs small-caps tracking-widest opacity-50">Width: {{ itemSizeFn(null, index) }}px</div>
        </div>
      </template>
    </VirtualScroll>
  </ExampleContainer>
</template>
