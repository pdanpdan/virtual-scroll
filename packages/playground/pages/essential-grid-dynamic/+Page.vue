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
const itemSize = ref(80);
const columnCount = ref(100);
const columnWidth = ref(100);
const bufferBefore = ref(5);
const bufferAfter = ref(5);
const stickyHeader = ref(false);
const stickyFooter = ref(false);
const virtualScrollbar = ref(true);

// Use a deterministic function for item size
// Pattern: base, base*2, base, base*2, ...
const itemSizeFn = computed(() => {
  const base = itemSize.value;
  return (item: unknown, index: number) => index % 2 === 0 ? base : base * 2;
});

// Use a deterministic function for column width: first column 300px, others alternate 100/150
const columnWidthFn = computed(() => {
  const base = columnWidth.value;
  return (index: number) => {
    if (index === 0) {
      return base * 3;
    }
    return index % 2 === 0 ? base : Math.ceil(base * 1.5);
  };
});

// Rows render purely from their index: the items array is a sparse placeholder
// of the right length, so no per-row data is materialized even for 10M+ rows
// (only the visible window is ever accessed).
const items = computed(() => new Array(itemCount.value));

const stickyIndices = computed(() => {
  const indices: number[] = [];
  for (let i = 100; i < itemCount.value; i += 100) {
    indices.push(i);
  }
  return indices;
});

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
      <span class="example-title example-title--group-4">Grid Dynamic</span>
    </template>

    <template #description>
      Simultaneously virtualizes {{ itemCount.toLocaleString() }} rows and {{ columnCount.toLocaleString() }} columns. Uses <strong>querySelectorAll('[data-col-index]')</strong> to robustly detect column widths from any slot structure. Toggling buffers or resizing will re-measure automatically.
    </template>

    <template #icon>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="example-icon example-icon--group-4"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6.15a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
      </svg>
    </template>

    <template #subtitle>
      Bidirectional scrolling with automatic measurement
    </template>

    <template #controls>
      <ScrollStatus
        dom-count-selector=".example-container"
        :scroll-details="scrollDetails"
        direction="both"
        :column-range="virtualScrollRef?.columnRange"
      />
      <ScrollControls
        v-model:item-count="itemCount"
        v-model:item-size="itemSize"
        v-model:column-count="columnCount"
        v-model:column-width="columnWidth"
        v-model:buffer-before="bufferBefore"
        v-model:buffer-after="bufferAfter"
        v-model:sticky-header="stickyHeader"
        v-model:sticky-footer="stickyFooter"
        v-model:virtual-scrollbar="virtualScrollbar"
        direction="both"
        @scroll-to-index="handleScrollToIndex"
        @scroll-to-offset="handleScrollToOffset"
        @refresh="virtualScrollRef?.refresh()"
      />
    </template>

    <VirtualScroll
      ref="virtualScrollRef"
      :debug="debugMode"
      class="example-container"
      direction="both"
      :items="items"
      :column-count="columnCount"
      :default-item-size="120"
      :default-column-width="120"
      :buffer-before="bufferBefore"
      :buffer-after="bufferAfter"
      :sticky-header="stickyHeader"
      :sticky-footer="stickyFooter"
      :virtual-scrollbar="virtualScrollbar"
      :sticky-indices="stickyIndices"
      aria-label="Dynamic dimensions grid"
      @scroll="onScroll"
    >
      <template v-if="stickyHeader" #header>
        <div class="example-sticky-header">
          Grid Header
        </div>
      </template>

      <template #item="{ index, columnRange, isStickyActive, getCellAriaProps }">
        <div
          :key="`r_${ index }`"
          class="example-grid-row"
          :class="{ 'example-grid-row--sticky': isStickyActive }"
        >
          <div
            v-for="c in (columnRange.end - columnRange.start)"
            :key="`r_${ index }_c_${ columnRange.start + c - 1 }`"
            :data-col-index="columnRange.start + c - 1"
            class="example-grid-cell"
            :style=" {
              inlineSize: `${ columnWidthFn(columnRange.start + c - 1) }px`,
              blockSize: `${ itemSizeFn(null, index) }px`,
            } "
            v-bind="getCellAriaProps(columnRange.start + c - 1)"
          >
            <div class="example-badge mb-2">R{{ index }} &times; C{{ columnRange.start + c - 1 }}</div>
            <div class="opacity-40 tabular-nums">{{ columnWidthFn(columnRange.start + c - 1) }}px</div>
          </div>
        </div>
      </template>

      <template v-if="stickyFooter" #footer>
        <div class="example-sticky-footer">
          End of Grid
        </div>
      </template>
    </VirtualScroll>
  </ExampleContainer>
</template>
